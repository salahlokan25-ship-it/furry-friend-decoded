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
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAuth } from "google-auth-library";

// Defensive init with logs so startup never crashes
try {
  if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
    console.log("ffmpeg path set");
  } else {
    console.warn("ffmpeg-static not found");
  }

// Compose a list of existing video clips (no Ken Burns) with crossfades
async function composeVideoClipsWithCrossfades({ clipPaths, outPath, secondsPerClip, fadeSec = 0.4 }) {
  if (!Array.isArray(clipPaths) || clipPaths.length === 0) throw new Error("clipPaths required");
  if (clipPaths.length === 1) return clipPaths[0];
  const dir = dirname(outPath);
  let current = clipPaths[0];
  for (let i = 1; i < clipPaths.length; i++) {
    const next = clipPaths[i];
    const tmpOut = join(dir, `xfclip_${i}.mp4`);
    await crossfadeTwo({ aPath: current, bPath: next, outputPath: tmpOut, secondsPerClip, fadeSec });
    current = tmpOut;
  }
  return current;
}

function getAuth() {
  if (!googleAuth) {
    googleAuth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  }
  return googleAuth;
}
  if (ffprobeStatic?.path) {
    ffmpeg.setFfprobePath(ffprobeStatic.path);
    console.log("ffprobe path set:", ffprobeStatic.path);
  } else {
    console.warn("ffprobe-static path missing");
  }
} catch (e) {
  console.warn("FFmpeg init warning:", e?.message || e);
}

const app = express();
app.use(express.json({ limit: "60mb" }));
// Basic CORS for browser calls from the app
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Lazy clients to avoid startup failures if ADC or APIs are not yet ready
let ttsClient = null;
let vertexAI = null;
let aiStudioClient = null;
let googleAuth = null;
function getTTS() {
  if (!ttsClient) ttsClient = new textToSpeech.TextToSpeechClient();
  return ttsClient;
}
function getVertex() {
  if (!vertexAI) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || "petparadise-476315";
    vertexAI = new VertexAI({ project: projectId, location: process.env.VERTEX_LOCATION || "us-central1" });
  }
  return vertexAI;
}

function getAIStudio() {
  if (!aiStudioClient) {
    const key = process.env.GOOGLE_AI_STUDIO_API_KEY;
    if (key) aiStudioClient = new GoogleGenerativeAI(key);
  }
  return aiStudioClient;
}

async function generateStoryWithVertex({ count, petName = "Luna" }) {
  const model = getVertex().getGenerativeModel({ model: process.env.VERTEX_TEXT_MODEL || "gemini-1.5-flash-001" });
  const prompt = `Write a short, warm, emotional weekly pet memory story for a ${petName}. Keep it 1-2 sentences. Reference that we have ${count} captured moments (photos), and use a soft, loving tone with an emoji or two. Avoid lists; make it a narrative.`;
  const res = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: prompt }] }
    ]
  });
  const text = res?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "This week was full of cuddles and gentle joy.";
  return text;
}

async function generateStoryWithAIStudio({ count, petName = "Luna" }) {
  const client = getAIStudio();
  if (!client) throw new Error("AI Studio key missing");
  const model = client.getGenerativeModel({ model: process.env.AI_STUDIO_MODEL || "gemini-1.5-flash-001" });
  const prompt = `Write a short, warm, emotional weekly pet memory story for a ${petName}. Keep it 1-2 sentences. Reference that we have ${count} captured moments (photos), and use a soft, loving tone with an emoji or two. Avoid lists; make it a narrative.`;
  const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
  const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "This week was full of cuddles and gentle joy.";
  return text;
}

function ensureTmp() {
  const dir = fs.mkdtempSync(join(os.tmpdir(), "memories-"));
  return dir;
}

async function writeDataUrlToFile(dataUrl, outPath) {
  if (typeof dataUrl !== "string") throw new Error("Invalid data URL: not a string");
  const matches = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!matches) throw new Error("Invalid data URL format");
  const base64 = matches[2];
  if (!base64) throw new Error("Invalid data URL: missing base64 data");
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

// Create a Ken Burns clip from a single image
function createKenBurnsClip({ imagePath, outputPath, seconds, w = 480, h = 480, fr = 24, zoomEnd = 1.12 }) {
  return new Promise((resolve, reject) => {
    const totalFrames = Math.max(1, Math.floor(seconds * fr));
    const zoomInc = (zoomEnd - 1) / totalFrames;
    const vf = [
      // fill 480x480 while preserving aspect, then crop center
      `scale=${w}:${h}:force_original_aspect_ratio=increase`,
      `crop=${w}:${h}`,
      // gentle zoom from 1.0 to zoomEnd across frames
      `zoompan=z='min(1+on*${zoomInc.toFixed(6)},${zoomEnd})':d=${totalFrames}:s=${w}x${h}`,
      `fps=${fr}`
    ].join(",");

    ffmpeg()
      .input(imagePath)
      .inputOptions(["-loop", "1"]) // loop single image
      .videoFilters(vf)
      .videoCodec("libx264")
      .size(`${w}x${h}`)
      .outputOptions(["-t", String(seconds), "-pix_fmt", "yuv420p", "-movflags", "+faststart"])
      .format("mp4")
      .on("stderr", (line) => { try { console.log("ffmpeg(kenburns)", String(line)); } catch {} })
      .on("end", () => resolve(outputPath))
      .on("error", (e) => reject(e))
      .save(outputPath);
  });
}

// Crossfade two clips into one. Assumes same fps/size and no audio.
function crossfadeTwo({ aPath, bPath, outputPath, secondsPerClip, fadeSec = 0.4 }) {
  return new Promise((resolve, reject) => {
    const offset = Math.max(0.1, secondsPerClip - fadeSec);
    const filter = `[0:v][1:v]xfade=transition=fade:duration=${fadeSec}:offset=${offset}[v]`;
    ffmpeg()
      .input(aPath)
      .input(bPath)
      .complexFilter(filter)
      .outputOptions(["-map", "[v]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart"])
      .format("mp4")
      .on("stderr", (line) => { try { console.log("ffmpeg(xfade)", String(line)); } catch {} })
      .on("end", () => resolve(outputPath))
      .on("error", (e) => reject(e))
      .save(outputPath);
  });
}

async function composeKenBurnsWithCrossfades({ imagePaths, outPath, secondsPerImage, w = 480, h = 480, fr = 24, fadeSec = 0.4 }) {
  // 1) Create per-image clips
  const dir = dirname(outPath);
  const clips = [];
  for (let i = 0; i < imagePaths.length; i++) {
    const clipPath = join(dir, `kb_${i}.mp4`);
    await createKenBurnsClip({ imagePath: imagePaths[i], outputPath: clipPath, seconds: secondsPerImage, w, h, fr });
    clips.push(clipPath);
  }
  // 2) If single, return it
  if (clips.length === 1) return clips[0];
  // 3) Reduce with crossfade
  let current = clips[0];
  for (let i = 1; i < clips.length; i++) {
    const next = clips[i];
    const tmpOut = join(dir, `xf_${i}.mp4`);
    await crossfadeTwo({ aPath: current, bPath: next, outputPath: tmpOut, secondsPerClip: secondsPerImage, fadeSec });
    current = tmpOut;
  }
  // 4) Move/return final
  return current;
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
  const [response] = await getTTS().synthesizeSpeech(request);
  await fs.promises.writeFile(outPath, response.audioContent, { encoding: "binary" });
}

// Generate a silent audio track (WAV) for the given duration
function generateSilentAudio(seconds, outPath) {
  return new Promise((resolve, reject) => {
    try {
      const dur = Math.max(1, Math.floor(seconds));
      ffmpeg()
        .input("anullsrc=r=44100:cl=mono")
        .inputOptions(["-f lavfi"])
        .audioChannels(1)
        .audioFrequency(44100)
        .duration(dur)
        .format("wav")
        .save(outPath)
        .on("end", resolve)
        .on("error", reject);
    } catch (e) {
      reject(e);
    }
  });
}

function buildConcatFile(imagePaths, concatPath, perImageSeconds = 3) {
  const lines = [];
  for (let i = 0; i < imagePaths.length; i++) {
    const p = imagePaths[i];
    if (!p) continue;
    lines.push(`file '${p.replace(/'/g, "'\\''")}'`);
    lines.push(`duration ${perImageSeconds}`);
  }
  // Repeat last file to set duration
  const last = imagePaths[imagePaths.length - 1];
  if (last) lines.push(`file '${last.replace(/'/g, "'\\''")}'`);
  fs.writeFileSync(concatPath, lines.join("\n"));
}

function composeVideoFromImages({ concatListPath, outputPath, w = 480, h = 480, fr = 24 }) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatListPath)
      .inputOptions(["-f concat", "-safe 0"])
      .videoCodec("libx264")
      .size(`${w}x${h}`)
      .videoFilters(`fps=${fr},scale=${w}:${h}:flags=lanczos,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2`)
      .outputOptions(["-pix_fmt", "yuv420p", "-movflags", "+faststart"])
      .format("mp4")
      .on("stderr", (line) => { try { console.log("ffmpeg(video)", String(line)); } catch {} })
      .on("end", () => resolve(outputPath))
      .on("error", (e) => reject(e))
      .save(outputPath);
  });
}

function muxAudio({ videoPath, narrationPath, musicPath, outputPath }) {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg(videoPath)
      .input(narrationPath);
    if (musicPath) cmd.input(musicPath);

    const filter = musicPath
      ? "[1:a]volume=1[voice];[2:a]volume=0.25[music];[voice][music]amix=inputs=2:duration=shortest[a]"
      : "[1:a]volume=1[a]";

    cmd
      .complexFilter(filter)
      .outputOptions(["-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-shortest"])
      .format("mp4")
      .on("stderr", (line) => { try { console.log("ffmpeg(mux)", String(line)); } catch {} })
      .on("end", () => resolve(outputPath))
      .on("error", (e) => reject(e))
      .save(outputPath);
  });
}

app.get("/", (_, res) => res.json({ ok: true }));

app.post("/compose", async (req, res) => {
  try {
    const clen = typeof req.headers?.["content-length"] === "string" ? Number(req.headers["content-length"]) : undefined;
    console.log("/compose begin", { contentLength: clen });
  } catch {}

  try {
    const { images, story, musicUrl, petName, generateStory, maxDurationSeconds, useVeo, visualPrompt } = req.body || {};
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "images[] required" });
    }
    const tmp = ensureTmp();
    const maxDur = Math.max(5, Math.min(60, Number(maxDurationSeconds) || 20));
    const perImageSeconds = Math.max(1, Math.floor((maxDur) / Math.max(1, images.length)));

    // Download or decode images
    const imgPaths = [];
    for (let i = 0; i < images.length; i++) {
      const out = join(tmp, `img_${i}.jpg`);
      try {
        if (typeof images[i] === "string" && images[i].startsWith("data:")) {
          await writeDataUrlToFile(images[i], out);
        } else {
          await fetchToFile(images[i], out);
        }
        imgPaths.push(out);
      } catch (e) {
        console.warn("image fetch failed, skipping", i, e?.message || e);
      }
    }
    if (imgPaths.length === 0) {
      return res.status(400).json({ error: "no valid images" });
    }

    // Build slideshow: prefer Veo per-image clips if requested, else Ken Burns
    const videoOnly = join(tmp, "slideshow.mp4");
    let composedPath = videoOnly;
    let motionSeconds = perImageSeconds;
    if (useVeo) {
      try {
        const clips = [];
        for (let i = 0; i < imgPaths.length; i++) {
          const p = visualPrompt && String(visualPrompt).trim().length > 0 ? `${visualPrompt}` : `Create a gentle, warm short motion clip inspired by this pet moment.`;
          const clipOut = join(tmp, `veo_${i}.mp4`);
          try {
            // Note: current Veo text-only; include image context in prompt implicitly
            await createVeoClip({ prompt: p, seconds: motionSeconds, outPath: clipOut, aspectRatio: "1:1", resolution: "480p" });
            clips.push(clipOut);
          } catch (perErr) {
            console.warn("Veo per-image failed, using Ken Burns for index", i, perErr?.message || perErr);
            const kbPath = join(tmp, `kb_fallback_${i}.mp4`);
            await createKenBurnsClip({ imagePath: imgPaths[i], outputPath: kbPath, seconds: motionSeconds, w: 480, h: 480, fr: 24 });
            clips.push(kbPath);
          }
        }
        // Crossfade pre-made video clips
        const cf = await composeVideoClipsWithCrossfades({ clipPaths: clips, outPath: videoOnly, secondsPerClip: motionSeconds, fadeSec: 0.4 });
        composedPath = cf;
      } catch (veoErr) {
        console.warn("Veo failed, falling back to Ken Burns:", veoErr?.message || veoErr);
        const kbResult = await composeKenBurnsWithCrossfades({ imagePaths: imgPaths, outPath: videoOnly, secondsPerImage: perImageSeconds, w: 480, h: 480, fr: 24, fadeSec: 0.4 });
        composedPath = kbResult;
      }
    } else {
      const kbResult = await composeKenBurnsWithCrossfades({ imagePaths: imgPaths, outPath: videoOnly, secondsPerImage: perImageSeconds, w: 480, h: 480, fr: 24, fadeSec: 0.4 });
      composedPath = kbResult;
    }
    if (composedPath !== videoOnly) await fs.promises.copyFile(composedPath, videoOnly);

    // Story: use provided, or generate via Vertex AI / AI Studio if requested/absent
    let storyText = story;
    if (!storyText || generateStory) {
      try {
        storyText = await generateStoryWithVertex({ count: imgPaths.length, petName });
      } catch (e) {
        console.warn("Vertex story generation failed:", e?.message || e);
        try {
          storyText = await generateStoryWithAIStudio({ count: imgPaths.length, petName });
        } catch (e2) {
          console.warn("AI Studio story generation failed:", e2?.message || e2);
          storyText = "This week was full of cuddles, playful moments, and peaceful naps.";
        }
      }
    }

    // Narration (with silent fallback)
    let narrPath = join(tmp, "narration.mp3");
    try {
      await synthesizeTTS(storyText, narrPath);
    } catch (e) {
      console.warn("TTS failed, generating silent narration:", e?.message || e);
      narrPath = join(tmp, "narration.wav");
      const estSeconds = Math.max(5, Math.min(maxDur, imgPaths.length * perImageSeconds));
      await generateSilentAudio(estSeconds, narrPath);
    }

    // Optional background music (best-effort)
    let bgmPath = null;
    if (musicUrl) {
      try {
        bgmPath = join(tmp, "bgm.mp3");
        await fetchToFile(musicUrl, bgmPath);
      } catch (e) {
        console.warn("music fetch failed, continuing without bgm:", e?.message || e);
        bgmPath = null;
      }
    }

    // Mux and stream result
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

app.post("/tts", async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: "text required" });
    const tmp = ensureTmp();
    const out = join(tmp, "narration.mp3");
    await synthesizeTTS(String(text), out);
    res.setHeader("content-type", "audio/mpeg");
    fs.createReadStream(out).pipe(res);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

app.post("/photo-to-video", async (req, res) => {
  try {
    const { images, perImageSeconds = 2 } = req.body || {};
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
    const sec = Math.max(1, Number(perImageSeconds) || 2);
    const videoOnly = join(tmp, "slideshow.mp4");
    const kbResult = await composeKenBurnsWithCrossfades({ imagePaths: imgPaths, outPath: videoOnly, secondsPerImage: sec, w: 480, h: 480, fr: 24, fadeSec: 0.4 });
    if (kbResult !== videoOnly) {
      await fs.promises.copyFile(kbResult, videoOnly);
    }
    res.setHeader("content-type", "video/mp4");
    fs.createReadStream(videoOnly).pipe(res);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`memories-composer listening on ${port} (NODE_ENV=${process.env.NODE_ENV})`));
