import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Image as ImageIcon, Play, Wand2, Video, ArrowLeft, Sparkles } from "lucide-react";
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

  const canMakeVideo = useMemo(() => !!imageUrl, [imageUrl]);

  const inspirationGallery = [
    {
      title: "Beach Day",
      style: "Photorealistic",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWH8eUCBKnWsoiZDFdu92uD9RIE9YCkPN8GddEb_-bxBHF2zxKNpq02h6Au0tuPfI0eM6eM-9ECcY37pKgKlxiUDebHE-O9yJIAybrqtH0uEZixFe-q0eqs_0xLBIf5TmBmN6MbITlt4giyYh_jb5Mqru-iz42tmXNikEYx2xW3JVPsG9qc85vkpucQDTzXcb_AgSbuCPoD5q42JdBUQTcRrpemBNVJtR7w-kIuc2NGFVb8FL7vBEJfNzmuau_67oRiSGuUu8r3wc"
    },
    {
      title: "Painted Paws",
      style: "Oil Painting",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOUhXIr4nsb0lHTVFwuwqdTUaUtCTbgt5j2nAj6ooMZzbJvaZB3wr8P-90ekTNu6JbLuO2GMuFtALyjED-RpKe8ybpJCq4qeiPH8VYjw-7akH90rLoj6hZ2a_MyW0I15CeHFKFnixTcdOa4eTpAYF8ekyikghIvTrHn8K4LZVyY7G-XTYaUiUO6DpxYo78iA3ikfrPK79dmh4LxJDG6xuELNqA0QWtlF34uWgzvqI8kdIQfnW2SdeUyJ25VtWjVXZAkQTyzVTFg1s"
    },
    {
      title: "Pixel Pet",
      style: "Pixel Art",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXo4RDp2iu14Pi2txpMECdM17IeCYPwwH5yML_nRwAPm6aUDFRK973m2CM0fS3RvV-VMfA1QcuCn95BEG8eXr5uf0k6YuKk5CAOnrdlMWaJGL_3cfQv73fyuz1qhpV4eIzrfCzKl7z-B5_HjK-txcb2LUhwGZAZCzYHhZaqTcHSHPLdm5V1zcyr38vpTbPKpObUez38L7qY54XEI5qyCUWB13Z1b6v9wTbaTknlSlUqFqypcxqHqWW3JnjzwDxJLreHrIeEq1T924"
    },
    {
      title: "Toon Time",
      style: "Cartoon",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn-DZMUphpCaz4PzaPfoHErFcjg6DZ8xZp_C-FXXl0Y_kb_hWAjdoqh_XrpLw15rzdPYBekYv1iG0qDE8yoRlvT6a8Ok-0pkBLPEuAkotnQ1jlgr3UH7O3rgzxHGyee36gQ2TuTreUBaxpJIz9alvLeoG0JyPvCz8SQv3e3BlA25SFM5r5VBHbvLyeaPl_ttxatq89L0OWF3dhRAQswhtVcQb4lSh5OmKxfYzkdgu7SX6cla3K3Ri4d5QbfYV68SDdN8jvU4lbuz4"
    }
  ];

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
      
      const videoPrompt = (story || prompt.trim() || "Create a cohesive 5-second cinematic pet memory video");
      
      const { data, error } = await supabase.functions.invoke('generate-video-veo3', {
        body: { 
          prompt: videoPrompt,
          imageUrl: imageUrl,
          duration: 5
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

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background overflow-x-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 flex items-center bg-background/80 backdrop-blur-sm p-4 pb-3">
        <h1 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Create a New Memory
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col px-4 pt-2 pb-6">
        {/* Memory Prompt Card */}
        <div className="flex w-full flex-col gap-4 rounded-lg bg-card p-4 shadow-sm">
          <label className="flex flex-col">
            <p className="text-card-foreground text-base font-medium leading-normal pb-2">
              Memory Prompt
            </p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-foreground focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-background min-h-36 placeholder:text-muted-foreground p-4 text-base font-normal leading-normal"
              placeholder="Describe a funny, sweet, or adventurous memory with Luna..."
            />
          </label>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
            {errorMsg}
          </div>
        )}

        {/* Generated Story */}
        {story && (
          <div className="mt-4 rounded-xl p-4 bg-card shadow-sm border border-border">
            <h3 className="text-card-foreground font-semibold mb-2">Your Story</h3>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{story}</p>
          </div>
        )}

        {/* Generated Image */}
        {imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden border border-border">
            <img src={imageUrl} alt="generated memory" className="w-full h-auto"/>
          </div>
        )}

        {/* Generated Video */}
        {videoUrl && (
          <div className="mt-4 space-y-2">
            <video src={videoUrl} controls className="w-full rounded-lg border border-border" />
            <a href={videoUrl} download="memory.mp4">
              <Button variant="outline" size="sm" className="w-full">
                <Download className="mr-2" size={16}/>Download Video
              </Button>
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button 
            onClick={generateStory}
            disabled={step !== "idle"}
            className="flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full h-14 px-6 bg-primary text-primary-foreground text-base font-bold leading-normal tracking-[0.015em] shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            <span>{step === "story" ? "Generating..." : "Generate Story"}</span>
          </button>
          <button 
            onClick={generateImage}
            disabled={step !== "idle"}
            className="flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full h-14 px-6 bg-primary text-primary-foreground text-base font-bold leading-normal tracking-[0.015em] shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5" />
            <span>{step === "image" ? "Generating..." : "Generate Image"}</span>
          </button>
        </div>

        {/* Inspiration Gallery */}
        <section className="mt-8">
          <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] pb-3">
            Inspiration Gallery
          </h2>
          <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4">
            <div className="flex items-stretch gap-4">
              {inspirationGallery.map((item, index) => (
                <div key={index} className="flex h-full w-40 flex-col gap-2 rounded-lg">
                  <div 
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
                    style={{ backgroundImage: `url('${item.imageUrl}')` }}
                  />
                  <div>
                    <p className="text-foreground text-sm font-medium leading-normal">
                      {item.title}
                    </p>
                    <p className="text-muted-foreground text-xs font-normal leading-normal">
                      {item.style}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MemoriesPage;
