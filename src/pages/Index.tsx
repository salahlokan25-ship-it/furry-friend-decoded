import { useState, useRef, useEffect } from "react";
import { Upload, Camera, Sparkles, Volume2, Music, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PetPlayAnimation from "@/components/PetPlayAnimation";

type MoodType = "happy" | "sad" | "tired" | "excited" | "anxious" | "playful" | "neutral";

interface MoodResult {
  mood: MoodType;
  confidence: number;
  advice: string;
  details: string;
}

const moodEmojis: Record<MoodType, string> = {
  happy: "😊",
  sad: "😢",
  tired: "😴",
  excited: "🤩",
  anxious: "😰",
  playful: "🎾",
  neutral: "😐"
};

const moodColors: Record<MoodType, string> = {
  happy: "from-yellow-400 to-orange-400",
  sad: "from-blue-400 to-indigo-400",
  tired: "from-purple-400 to-blue-400",
  excited: "from-pink-400 to-red-400",
  anxious: "from-orange-400 to-red-400",
  playful: "from-green-400 to-teal-400",
  neutral: "from-gray-400 to-slate-400"
};

// Music playlists for different moods
const moodMusic: Record<MoodType, string> = {
  happy: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  sad: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  tired: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  excited: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  anxious: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  playful: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  neutral: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
};

const moodMusicNames: Record<MoodType, string> = {
  happy: "Upbeat Paws Playlist 🎵",
  sad: "Gentle Comfort Melodies 🎶",
  tired: "Sleepy Time Lullabies 💤",
  excited: "High Energy Playtime Mix 🎉",
  anxious: "Calming Zen Sounds 🧘",
  playful: "Fun & Games Tunes 🎮",
  neutral: "Peaceful Background Music 🌿"
};

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodResult, setMoodResult] = useState<MoodResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
    
    audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    audioRef.current.addEventListener('pause', () => setIsPlaying(false));
    audioRef.current.addEventListener('play', () => setIsPlaying(true));
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Start analysis
    setIsAnalyzing(true);
    setMoodResult(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // Get current session for authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("Please sign in to use mood detection");
          setIsAnalyzing(false);
          return;
        }
        
        // Call the mood detection edge function
        const { data, error } = await supabase.functions.invoke('pet-mood-detection', {
          body: { 
            image: base64,
            fileType: file.type
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (error) throw error;

        setMoodResult(data);
        toast.success("Mood detected! 🎉");
        
        // Auto-play music after 1 second
        setTimeout(() => {
          if (audioRef.current && data.mood && moodMusic[data.mood as MoodType]) {
            audioRef.current.src = moodMusic[data.mood as MoodType];
            audioRef.current.play().catch(err => {
              console.error("Error playing audio:", err);
              toast.error("Click the play button to start music");
            });
          }
        }, 1000);
      };
    } catch (error) {
      console.error("Error analyzing mood:", error);
      toast.error("Failed to analyze pet mood. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current || !moodResult) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        toast.error("Failed to play music");
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera className="w-12 h-12 text-primary animate-bounce" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Pet Mood Scanner
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            📸 Scan your pet's face with AI to detect their mood and get personalized care advice
          </p>
        </div>

        {/* Pet Animation */}
        <div className="mb-12">
          <PetPlayAnimation />
        </div>

        {/* Upload Section */}
        <Card className="border-2 border-primary/20 shadow-2xl mb-8 overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${moodResult ? moodColors[moodResult.mood] : 'from-purple-500 to-pink-500'}`} />
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              {moodResult ? "Mood Detected!" : "Upload Your Pet's Photo"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Preview */}
            {previewUrl && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border-4 border-primary/20 shadow-lg">
                <img 
                  src={previewUrl} 
                  alt="Pet preview" 
                  className="w-full h-full object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-xl font-semibold">Analyzing mood...</p>
                      <p className="text-sm mt-2">AI is reading your pet's emotions 🤖</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload Button */}
            {!isAnalyzing && (
              <div className="flex flex-col items-center gap-4">
                <label className="cursor-pointer group">
                  <div className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-2xl hover:scale-105 ${
                    previewUrl 
                      ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  }`}>
                    <Camera className="w-6 h-6" />
                    {previewUrl ? "Scan Another Pet" : "Scan Your Pet's Face"}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {!previewUrl && (
                  <p className="text-sm text-muted-foreground text-center">
                    Upload a clear photo of your pet's face for best results
                  </p>
                )}
              </div>
            )}

            {/* Mood Result */}
            {moodResult && !isAnalyzing && (
              <div className="space-y-6 animate-fade-in">
                {/* Mood Display */}
                <div className={`bg-gradient-to-br ${moodColors[moodResult.mood]} p-8 rounded-2xl text-white text-center shadow-2xl`}>
                  <div className="text-8xl mb-4">{moodEmojis[moodResult.mood]}</div>
                  <h3 className="text-3xl font-bold mb-2 capitalize">
                    {moodResult.mood}
                  </h3>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                    <p className="text-sm font-semibold">
                      {Math.round(moodResult.confidence * 100)}% Confidence
                    </p>
                  </div>
                </div>

                {/* AI Insights */}
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="w-5 h-5 text-primary" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">What We Observed:</h4>
                      <p className="text-base leading-relaxed">{moodResult.details}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">💡 Care Advice:</h4>
                      <p className="text-base leading-relaxed font-medium text-primary">
                        {moodResult.advice}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Pet Music Mode */}
                <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Music className="w-5 h-5 text-purple-600" />
                      Pet Music Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white/70 rounded-lg p-4 border-2 border-purple-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Volume2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-purple-900">Now Playing</p>
                          <p className="text-xs text-muted-foreground">{moodMusicNames[moodResult.mood]}</p>
                        </div>
                      </div>
                      
                      <Button
                        onClick={toggleMusic}
                        className={`w-full ${
                          isPlaying 
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600' 
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        }`}
                        size="lg"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-5 h-5 mr-2" />
                            Pause Music
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Play Calming Music
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="bg-purple-100 rounded-lg p-4 border border-purple-300">
                      <p className="text-sm text-purple-900 leading-relaxed">
                        <span className="font-semibold">🎵 Music matched to mood:</span> Based on your pet's {moodResult.mood} mood, 
                        we've selected {moodResult.mood === "tired" ? "calming lullabies" : moodResult.mood === "excited" ? "high-energy tunes" : "soothing melodies"} to enhance their emotional state.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Example Text */}
                <div className="text-center p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-yellow-300 shadow-lg">
                  <p className="text-lg font-semibold text-orange-900">
                    Example: "Luna looks {moodResult.mood} — {moodResult.mood === "tired" ? "time for a calm playlist!" : moodResult.mood === "excited" ? "let's play together!" : "perfect time for some care!"}"
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        {!moodResult && (
          <Card className="border-2 border-primary/10 bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold mb-1">Upload Photo</h4>
                  <p className="text-sm text-muted-foreground">Take or upload a clear photo of your pet's face</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold mb-1">AI Analysis</h4>
                  <p className="text-sm text-muted-foreground">Our AI scans facial expressions, body language, and energy levels</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold mb-1">Get Results</h4>
                  <p className="text-sm text-muted-foreground">Receive mood detection, care advice, and auto-play calming music</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
