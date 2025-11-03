import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Image as ImageIcon, Play, Wand2 } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { supabase } from "@/integrations/supabase/client";

type GenStep = "idle" | "story" | "image" | "video";

const MemoriesPage = () => {
  const [prompt, setPrompt] = useState("");
  const [step, setStep] = useState<GenStep>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [story, setStory] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isFFmpegReady, setIsFFmpegReady] = useState(false);

  const canMakeVideo = useMemo(() => story && imageUrl, [story, imageUrl]);

  useEffect(() => {
    // Warm-up animation pulse control via step
  }, [step]);

  async function ensureFFmpeg() {
    if (ffmpegRef.current) return ffmpegRef.current;
    const ffmpeg = new FFmpeg();
    const coreBase = "https://unpkg.com/@ffmpeg/core@0.12.6/dist";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${coreBase}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${coreBase}/ffmpeg-core.wasm`, "application/wasm"),
    });
    ffmpegRef.current = ffmpeg;
    setIsFFmpegReady(true);
    return ffmpeg;
  }

  function requireOpenAIKey(): string {
    const key = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
    if (key && key.trim()) return key.trim();
    throw new Error("OpenAI API key not configured. Set VITE_OPENAI_API_KEY in .env and restart.");
  }

  async function generateStory() {
    try {
      setErrorMsg(null);
      setStep("story");
      const content = prompt.trim() || "A cozy weekly memory about my pet's sweetest moments.";
      const { data, error } = await supabase.functions.invoke('generate-memory-story', {
        body: { prompt: content }
      });
      if (error) throw new Error(error.message);
      if (!data?.story) throw new Error("No story returned");
      setStory(data.story);
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to generate story");
    } finally {
      setStep("idle");
    }
  }

  async function generateImage() {
    try {
      setErrorMsg(null);
      setStep("image");
      const basePrompt = prompt.trim() || "adorable pet memory, soft lighting, cozy, cinematic, 4k";
      const { data, error } = await supabase.functions.invoke('generate-memory-image', {
        body: { prompt: basePrompt }
      });
      if (error) throw new Error(error.message);
      if (!data?.imageUrl) throw new Error("No image URL returned");
      // Convert base64 to blob URL for display
      const base64Data = data.imageUrl;
      if (base64Data.startsWith('data:image')) {
        const blob = await (await fetch(base64Data)).blob();
        const objectUrl = URL.createObjectURL(blob);
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        setImageUrl(objectUrl);
      } else {
        setImageUrl(base64Data);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to generate image");
    } finally {
      setStep("idle");
    }
  }


  async function generateVideoVeo3() {
    try {
      setErrorMsg(null);
      setStep("video");
      if (!canMakeVideo) throw new Error("Generate story and image first");
      
      const videoPrompt = story || prompt.trim() || "A heartwarming pet memory video";
      
      const { data, error } = await supabase.functions.invoke('generate-video-veo3', {
        body: { 
          prompt: videoPrompt,
          imageUrl: imageUrl
        }
      });
      
      if (error) throw new Error(error.message);
      if (!data?.videoUrl) throw new Error("No video URL returned");
      
      // Convert base64 to blob URL for display
      const base64Data = data.videoUrl;
      if (base64Data.startsWith('data:video')) {
        const blob = await (await fetch(base64Data)).blob();
        const objectUrl = URL.createObjectURL(blob);
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setVideoUrl(objectUrl);
      } else {
        setVideoUrl(base64Data);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to generate video");
    } finally {
      setStep("idle");
    }
  }

  async function makeVideo5s() {
    try {
      setErrorMsg(null);
      setStep("video");
      if (!story || !imageUrl) throw new Error("Generate story and image first");
      const ffmpeg = await ensureFFmpeg();
      // fetch assets
      const imgBlob = await (await fetch(imageUrl!)).blob();
      await ffmpeg.writeFile("bg.jpg", await fetchFile(imgBlob));
      await ffmpeg.exec([
        "-loop", "1",
        "-t", "5",
        "-i", "bg.jpg",
        "-vf", "scale=720:-2,format=yuv420p",
        "-c:v", "libvpx-vp9",
        "-shortest",
        "out.webm",
      ]);
      const data = await ffmpeg.readFile("out.webm");
      const bytes = data as Uint8Array;
      const ab = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(ab).set(bytes);
      const webmBlob = new Blob([ab], { type: "video/webm" });
      const url = URL.createObjectURL(webmBlob);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      setVideoUrl(url);
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to create video");
    } finally {
      setStep("idle");
    }
  }

  const pulsing = useMemo(() => (step !== "idle" ? "animate-pulse" : ""), [step]);

  return (
    <div className="min-h-screen pb-28 bg-gradient-to-br from-white via-orange-50/50 to-white">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        <div className="flex items-center justify-center gap-3">
          <div className={`w-9 h-9 rounded-full bg-orange-500/90 flex items-center justify-center text-white ${pulsing}`}>
            <span>🎬</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            AI Story Memories
          </h1>
        </div>

        <Card className="border-orange-200/60">
          <CardContent className="p-4 space-y-4">
            

            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the vibe for your pet memory (e.g., Cozy autumn walk with my corgi at dusk)"
                className="w-full h-24 rounded-md border p-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={generateStory} disabled={step!=="idle"}>
                <Wand2 className="mr-2" size={16}/> Generate Story
              </Button>
              <Button variant="outline" onClick={generateImage} disabled={step!=="idle"}>
                <ImageIcon className="mr-2" size={16}/> Generate Image
              </Button>
            </div>

            <Button variant="coral" onClick={generateVideoVeo3} disabled={step!=="idle" || !canMakeVideo} className="w-full">
              Generate Video (Veo 3)
            </Button>

            {errorMsg && (
              <div className="text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-md p-3">{errorMsg}</div>
            )}

            {story && (
              <div className="rounded-xl p-4 bg-white shadow-sm border border-orange-100">
                <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-line">{story}</p>
              </div>
            )}

            {imageUrl && (
              <div className="rounded-xl overflow-hidden border">
                <img src={imageUrl} alt="generated" className="w-full h-auto"/>
              </div>
            )}

            {videoUrl && (
              <div className="space-y-2">
                <video src={videoUrl} controls className="w-full rounded-lg border" />
                <a href={videoUrl} download="memory.mp4">
                  <Button variant="outline" size="sm"><Download className="mr-1" size={16}/>Download</Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
};

export default MemoriesPage;
