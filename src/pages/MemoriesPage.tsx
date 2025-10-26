import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Download } from "lucide-react";

const MemoriesPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [story, setStory] = useState<string | null>(null);
  const [pawCycle, setPawCycle] = useState(0);
  const [albumPhotos, setAlbumPhotos] = useState<Array<{ id: string; url: string; petType: "cat" | "dog"; timestamp: string }>>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [generatedManifest, setGeneratedManifest] = useState<{ story: string; images: string[] } | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const composerUrl = (import.meta as any).env.VITE_MEMORIES_COMPOSER_URL as string | undefined;

  useEffect(() => {
    if (!isGenerating) return;
    const id = setInterval(() => setPawCycle((c) => (c + 1) % 3), 400);
    return () => clearInterval(id);
  }, [isGenerating]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("petparadise-album-photos");
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{ id: string; url: string; petType: "cat" | "dog"; timestamp: string }>;
        setAlbumPhotos(parsed);
      }
    } catch {}
  }, []);

  const previewGlow = useMemo(
    () => (
      "relative aspect-square rounded-2xl bg-gradient-to-br from-orange-50 to-white " +
      "shadow-lg border border-orange-200 overflow-hidden " +
      (isGenerating ? "animate-pulse" : "")
    ),
    [isGenerating]
  );

  const handleGenerate = async () => {
    if (isGenerating) return;
    if (selectedIds.length === 0 && albumPhotos.length > 0) {
      setPickerOpen(true);
      return;
    }
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1400));
    const chosen = albumPhotos.filter(p => selectedIds.includes(p.id)).map(p => p.url);
    const count = chosen.length;
    const txt = count > 0
      ? `This week, Luna’s happiest moments were captured in ${count} memories. She played, rested, and shared gentle cuddles — each frame full of warmth 💕.`
      : "This week, Luna played 4 times, slept peacefully for 18 hours, and met 2 new friends 💕.";
    setStory(txt);
    setGeneratedManifest({ story: txt, images: chosen });
    // If Cloud Run composer configured, render full video with Google TTS there
    if (composerUrl && chosen.length > 0) {
      try {
        setVideoLoading(true);
        const resp = await fetch(`${composerUrl}/compose`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            images: chosen,
            // request Vertex AI generation on the server
            generateStory: true,
            petName: "Luna",
            // you can remove story to force generation; keeping as hint
            story: txt,
            musicUrl: "https://cdn.pixabay.com/download/audio/2021/10/26/audio_b4f2e2c1b2.mp3?filename=calm-ambient-113288.mp3"
          })
        });
        if (!resp.ok) throw new Error(`compose failed: ${resp.status}`);
        const blob = await resp.blob();
        const obj = URL.createObjectURL(blob);
        setVideoUrl(obj);
      } catch (e) {
        // Fallback: try client TTS only
        try {
          setAudioLoading(true);
          const url = await generateTTS(txt);
          setAudioUrl(url);
        } catch {}
      } finally {
        setVideoLoading(false);
        setIsGenerating(false);
      }
    } else {
      // No composer; do client TTS if configured
      try {
        setAudioLoading(true);
        const url = await generateTTS(txt);
        setAudioUrl(url);
      } catch {
        // ignore
      } finally {
        setAudioLoading(false);
        setIsGenerating(false);
      }
    }
  };

  const togglePick = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const confirmSelectionAndGenerate = async () => {
    setPickerOpen(false);
    await handleGenerate();
  };

  const downloadMemory = () => {
    const payload = generatedManifest ?? { story: story ?? "", images: albumPhotos.filter(p => selectedIds.includes(p.id)).map(p => p.url) };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weekly-memory.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  async function generateTTS(text: string): Promise<string> {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
    const voiceId = (import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined) || "21m00Tcm4TlvDq8ikWAM"; // Rachel default
    if (!apiKey) throw new Error("Missing VITE_ELEVENLABS_API_KEY");
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=0&output_format=mp3_44100_128`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.8 },
      }),
    });
    if (!res.ok) throw new Error(`TTS failed: ${res.status}`);
    const buf = await res.arrayBuffer();
    const blob = new Blob([buf], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  }

  return (
    <>
    <div className="min-h-screen pb-28 bg-gradient-to-br from-white via-orange-50/50 to-white">
      <div className="max-w-md mx-auto px-4 pt-6 space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div
            className={
              "w-8 h-8 rounded-full bg-orange-500/90 flex items-center justify-center text-white " +
              (isGenerating ? "animate-bounce" : "animate-none")
            }
          >
            <span className={pawCycle === 0 ? "opacity-100" : "opacity-40"}>🐾</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            PetLife AI Memories
          </h1>
        </div>

        <Card className="border-orange-200/60">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className={previewGlow}>
                {selectedIds.length > 0 && (
                  <img src={albumPhotos.find(p => p.id === selectedIds[0])?.url} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    className="w-16 h-16 rounded-full bg-white/90 text-orange-600 shadow-xl flex items-center justify-center active:scale-95 transition-transform"
                    aria-label="Play Weekly Story"
                  >
                    <Play className="w-7 h-7" />
                  </button>
                </div>
                <div className="absolute -top-4 -left-6 w-24 h-24 bg-orange-200/40 rounded-full blur-2xl" />
                <div className="absolute -bottom-6 -right-8 w-28 h-28 bg-orange-300/30 rounded-full blur-2xl" />
              </div>

              <div
                className={
                  "rounded-xl p-4 bg-white shadow-sm border border-orange-100 transition-all " +
                  (isGenerating ? "scale-[1.01] shadow-md" : "")
                }
              >
                <p className="text-sm leading-relaxed text-gray-700">
                  {story ?? "Your weekly story will appear here with a warm, emotional tone."}
                </p>
                {videoUrl && (
                  <div className="mt-3">
                    <video controls className="w-full rounded-lg" src={videoUrl} />
                    {videoLoading && <div className="text-xs text-orange-600 mt-1">Rendering video...</div>}
                  </div>
                )}
                {!videoUrl && (audioUrl || audioLoading) && (
                  <div className="mt-3">
                    <audio controls className="w-full" src={audioUrl ?? undefined} />
                    {audioLoading && <div className="text-xs text-orange-600 mt-1">Generating narration...</div>}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-center">
                <Button
                  size="lg"
                  className={
                    "rounded-full px-6 py-6 text-base bg-orange-500 hover:bg-orange-600 " +
                    (isGenerating ? "opacity-70" : "")
                  }
                  disabled={isGenerating}
                  onClick={handleGenerate}
                >
                  {isGenerating ? "Creating..." : "Create My Weekly Memory 🎞️"}
                </Button>
              </div>

              <div className="pt-1 flex items-center justify-center text-orange-600 gap-3">
                <button onClick={downloadMemory} className="p-3 rounded-full bg-orange-50 hover:bg-orange-100 shadow-sm active:scale-95 transition" aria-label="Download Memory Manifest">
                  <Download className="w-5 h-5" />
                </button>
                {videoUrl && (
                  <a href={videoUrl} download="weekly-memory.mp4" className="p-3 rounded-full bg-orange-50 hover:bg-orange-100 shadow-sm active:scale-95 transition" aria-label="Download Video">
                    <Download className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-28 bg-gradient-to-t from-orange-100/90 to-transparent">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-6 left-6 text-2xl animate-bounce">🐾</div>
          <div className="absolute bottom-10 left-24 text-xl animate-pulse">🐾</div>
          <div className="absolute bottom-8 left-40 text-2xl animate-bounce" style={{ animationDelay: "150ms" }}>🐾</div>
          <div className="absolute bottom-6 right-10 text-xl animate-pulse" style={{ animationDelay: "300ms" }}>🐾</div>
        </div>
      </div>
    </div>

    <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select photos for this week</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
          {albumPhotos.map((p) => {
            const active = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePick(p.id)}
                className={`relative aspect-square rounded-lg overflow-hidden ${active ? "ring-2 ring-orange-500" : ""}`}
              >
                <img src={p.url} alt="pick" className="w-full h-full object-cover" />
                {active && <div className="absolute inset-0 bg-orange-500/20" />}
              </button>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setPickerOpen(false)}>Cancel</Button>
          <Button onClick={confirmSelectionAndGenerate}>Use Selected</Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default MemoriesPage;
