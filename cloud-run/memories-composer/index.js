import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import os from "os";
import fetch from "node-fetch";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import textToSpeech from "@google-cloud/text-to-speech";
import { VertexAI } from "@google-cloud/vertexai";

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const app = express();
app.use(express.json({ limit: "20mb" }));
// Basic CORS for browser calls from the app
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const ttsClient = new textToSpeech.TextToSpeechClient();
const vertexAI = new VertexAI({ project: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT, location: process.env.VERTEX_LOCATION || "us-central1" });

async function generateStoryWithVertex({ count, petName = "Luna" }) {
  const model = vertexAI.getGenerativeModel({ model: process.env.VERTEX_TEXT_MODEL || "text-bison" });
  const prompt = `Write a short, warm, emotional weekly pet memory story for a ${petName}. Keep it 1-2 sentences. Reference that we have ${count} captured moments (photos), and use a soft, loving tone with an emoji or two. Avoid lists; make it a narrative.`;
  const res = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: prompt }] }
    ]
  });
  const text = res?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "This week was full of cuddles and gentle joy.";
  return text;
}

function ensureTmp() {
  const dir = fs.mkdtempSync(join(os.tmpdir(), "memories-"));
  return dir;
}

async function writeDataUrlToFile(dataUrl, outPath) {
  const matches = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!matches) throw new Error("Invalid data URL");
  const base64 = matches[2];
  const buf = Buffer.from(base64, "base64");
  await fs.promises.writeFile(outPath, buf);
}

async function fetchToFile(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const fileStream = fs.createWriteStream(outPath);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
}

async function synthesizeTTS(text, outPath) {
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  const elevenVoice = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Rachel
  if (elevenKey) {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoice}/stream?optimize_streaming_latency=0&output_format=mp3_44100_128`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": elevenKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.8 },
      }),
    });
    if (!res.ok) throw new Error(`ElevenLabs TTS failed: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.promises.writeFile(outPath, buf);
    return;
  }
  // Fallback to Google Cloud TTS
  const request = {
    input: { text },
    voice: { languageCode: "en-US", ssmlGender: "FEMALE" },
    audioConfig: { audioEncoding: "MP3", speakingRate: 1.0 },
  };
  const [response] = await ttsClient.synthesizeSpeech(request);
  await fs.promises.writeFile(outPath, response.audioContent, { encoding: "binary" });
}

function buildConcatFile(imagePaths, concatPath, perImageSeconds = 3) {
  const lines = [];
  for (let i = 0; i < imagePaths.length; i++) {
    lines.push(`file '${imagePaths[i].replace(/'/g, "'\\''")}'`);
    if (i < imagePaths.length - 1) {
      lines.push(`duration ${perImageSeconds}`);
    }
  }
  // Repeat last file to set duration
  lines.push(`file '${imagePaths[imagePaths.length - 1].replace(/'/g, "'\\''")}'`);
  fs.writeFileSync(concatPath, lines.join("\n"));
}

function composeVideoFromImages({ concatListPath, outputPath, w = 720, h = 720, fr = 30 }) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatListPath)
      .inputOptions(["-f concat", "-safe 0"])
      .inputFPS(1)
      .complexFilter([`scale=${w}:${h}:force_original_aspect_ratio=cover,format=yuv420p`])
      .videoCodec("libx264")
      .outputOptions([`-r ${fr}`, "-pix_fmt yuv420p", "-movflags +faststart"])
      .save(outputPath)
      .on("end", resolve)
      .on("error", reject);
  });
}

function muxAudio({ videoPath, narrationPath, musicPath, outputPath }) {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg(videoPath)
      .input(narrationPath);
    if (musicPath) cmd.input(musicPath);

    const filter = musicPath
      ? [
          // lower music volume and mix with narration
          {
            filter: "adelay",
            options: "0|0",
            inputs: "1:a",
            outputs: "narr",
          },
          {
            filter: "volume",
            options: "0.2",
            inputs: "2:a",
            outputs: "bgm",
          },
          {
            filter: "amix",
            options: "inputs=2:duration=first:dropout_transition=2",
            inputs: ["narr", "bgm"],
            outputs: "mix",
          },
        ]
      : [];

    if (filter.length > 0) cmd.complexFilter(filter, ["mix"]).outputOptions(["-map 0:v", "-map [mix]", "-c:v copy", "-c:a aac", "-b:a 192k"]);
    else cmd.outputOptions(["-map 0:v", "-map 1:a", "-c:v copy", "-c:a aac", "-b:a 192k"]);

    cmd
      .save(outputPath)
      .on("end", resolve)
      .on("error", reject);
  });
}

app.post("/compose", async (req, res) => {
  try {
    const { images, story, musicUrl, petName, generateStory } = req.body || {};
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "images[] required" });
    }
    const tmp = ensureTmp();
    const imgPaths = [];
    for (let i = 0; i < images.length; i++) {
      const out = join(tmp, `img_${i}.jpg`);
      if (typeof images[i] === "string" && images[i].startsWith("data:")) {
        await writeDataUrlToFile(images[i], out);
      } else {
        await fetchToFile(images[i], out);
      }
      imgPaths.push(out);
    }

    const concatList = join(tmp, "images.txt");
    buildConcatFile(imgPaths, concatList, 3);

    const videoOnly = join(tmp, "slideshow.mp4");
    await composeVideoFromImages({ concatListPath: concatList, outputPath: videoOnly });

    // Story: use provided, or generate via Vertex AI if requested/absent
    let storyText = story;
    if (!storyText || generateStory) {
      try {
        storyText = await generateStoryWithVertex({ count: images.length, petName });
      } catch (e) {
        storyText = "This week was full of cuddles, playful moments, and peaceful naps.";
      }
    }

    const narrPath = join(tmp, "narration.mp3");
    await synthesizeTTS(storyText, narrPath);

    let bgmPath = null;
    if (musicUrl) {
      bgmPath = join(tmp, "bgm.mp3");
      await fetchToFile(musicUrl, bgmPath);
    }

    const finalPath = join(tmp, "memory.mp4");
    await muxAudio({ videoPath: videoOnly, narrationPath: narrPath, musicPath: bgmPath, outputPath: finalPath });

    res.setHeader("content-type", "video/mp4");
    res.setHeader("cache-control", "no-store");
    const stream = fs.createReadStream(finalPath);
    stream.pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e?.message || e) });
  }
});

app.get("/health", (_, res) => res.json({ ok: true }));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`memories-composer listening on ${port}`));
