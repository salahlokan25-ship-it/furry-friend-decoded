import { useState } from "react";
import { Upload, Camera, TrendingUp, Sparkles, Activity, AlertTriangle, Heart, Zap, Utensils, Droplets, Moon, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import PetPlayAnimation from "@/components/PetPlayAnimation";

type MoodType = "happy" | "anxious" | "hungry" | "tired" | "playful" | "neutral";

interface MoodResult {
  mood: MoodType;
  confidence: number;
  advice: string;
  details: string;
}

const moodEmojis: Record<MoodType, string> = {
  happy: "😊",
  anxious: "😰",
  hungry: "🍖",
  tired: "😴",
  playful: "🎾",
  neutral: "😐"
};

const moodColors: Record<MoodType, string> = {
  happy: "bg-yellow-100 border-yellow-400 text-yellow-800",
  anxious: "bg-purple-100 border-purple-400 text-purple-800",
  hungry: "bg-orange-100 border-orange-400 text-orange-800",
  tired: "bg-blue-100 border-blue-400 text-blue-800",
  playful: "bg-green-100 border-green-400 text-green-800",
  neutral: "bg-gray-100 border-gray-400 text-gray-800"
};

// Mock data for daily mood tracker
const mockMoodData = [
  { day: "Mon", score: 8 },
  { day: "Tue", score: 6 },
  { day: "Wed", score: 9 },
  { day: "Thu", score: 5 },
  { day: "Fri", score: 7 },
  { day: "Sat", score: 9 },
  { day: "Sun", score: 8 }
];

// Health metrics data
const healthMetrics = [
  { metric: 'Energy', value: 85, fullMark: 100 },
  { metric: 'Appetite', value: 70, fullMark: 100 },
  { metric: 'Hydration', value: 90, fullMark: 100 },
  { metric: 'Activity', value: 65, fullMark: 100 },
  { metric: 'Mood', value: 80, fullMark: 100 }
];

const healthAlerts = [
  {
    id: 1,
    severity: "warning",
    title: "Energy dropped 20% this week",
    description: "Rocky's energy dropped 20% this week. Could be heat-related — increase hydration.",
    icon: Zap,
    color: "text-orange-600"
  }
];

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodResult, setMoodResult] = useState<MoodResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [petName, setPetName] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [bedtimeStory, setBedtimeStory] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image or video file");
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Start analysis
    setIsAnalyzing(true);
    setMoodResult(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // Call the mood detection edge function
        const { data, error } = await supabase.functions.invoke('pet-mood-detection', {
          body: { 
            image: base64,
            fileType: file.type
          }
        });

        if (error) throw error;

        setMoodResult(data);
        toast.success("Mood analysis complete!");
      };
    } catch (error) {
      console.error("Error analyzing mood:", error);
      toast.error("Failed to analyze pet mood. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateStory = async () => {
    if (!petName.trim() || !petBreed.trim()) {
      toast.error("Please enter your pet's name and breed");
      return;
    }

    setIsGeneratingStory(true);
    setBedtimeStory(null);

    try {
      const { data, error } = await supabase.functions.invoke('pet-bedtime-story', {
        body: { 
          petName: petName.trim(),
          breed: petBreed.trim()
        }
      });

      if (error) throw error;

      setBedtimeStory(data.story);
      toast.success("Bedtime story created! 🌙");
    } catch (error) {
      console.error("Error generating story:", error);
      toast.error("Failed to generate bedtime story. Please try again.");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handlePlayStory = () => {
    if (!bedtimeStory) return;

    const utterance = new SpeechSynthesisUtterance(bedtimeStory);
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      toast.error("Failed to play audio");
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlayingAudio(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-pet-beige/20 to-pet-orange/10 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-pet-orange" />
            <h1 className="text-4xl font-bold text-pet-orange">Pet Mood Detector</h1>
          </div>
          <p className="text-muted-foreground">
            Upload a photo or video to understand your pet's emotions
          </p>
        </div>

        {/* Pet Animation */}
        <div className="mb-8">
          <PetPlayAnimation />
        </div>

        {/* Smart Health Radar */}
        <Card className="mb-8 border-2 border-pet-orange/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-pet-orange" />
              Smart Health Radar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Health Alerts */}
            {healthAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 flex gap-3 animate-fade-in"
              >
                <AlertTriangle className={`w-5 h-5 ${alert.color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{alert.title}</p>
                  <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                </div>
              </div>
            ))}

            {/* Health Radar Chart */}
            <div className="bg-white/50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={healthMetrics}>
                  <PolarGrid stroke="#f59e0b40" />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fill: '#f59e0b', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]}
                    tick={{ fill: '#f59e0b80', fontSize: 10 }}
                  />
                  <Radar 
                    name="Health" 
                    dataKey="value" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Individual Health Metrics */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-pet-orange" />
                Health Metrics
              </h3>
              {healthMetrics.map((metric) => (
                <div key={metric.metric} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{metric.metric}</span>
                    <span className="text-pet-orange font-semibold">{metric.value}%</span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              ))}
            </div>

            {/* Quick Health Tips */}
            <div className="bg-pet-orange/10 rounded-lg p-4 border border-pet-orange/20">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pet-orange" />
                AI Vet Tips
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Monitor water intake - aim for 8+ hours of activity daily</li>
                <li>• Consider indoor play during peak heat hours</li>
                <li>• Check for signs of dehydration (dry nose, lethargy)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="mb-8 border-2 border-pet-orange/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              {previewUrl ? (
                <div className="relative w-full max-w-md">
                  <img 
                    src={previewUrl} 
                    alt="Pet preview" 
                    className="w-full h-64 object-cover rounded-lg border-2 border-pet-orange/30"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setPreviewUrl(null);
                      setMoodResult(null);
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isAnalyzing}
                  />
                  <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-pet-orange/40 rounded-lg hover:border-pet-orange transition-colors bg-white/50">
                    <Upload className="w-16 h-16 text-pet-orange/60 mb-4" />
                    <p className="text-lg font-semibold text-pet-orange mb-2">
                      Upload Photo or Video
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click to browse or drag and drop
                    </p>
                  </div>
                </label>
              )}

              {isAnalyzing && (
                <div className="flex items-center gap-2 text-pet-orange">
                  <div className="w-5 h-5 border-2 border-pet-orange border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">Analyzing your pet's mood...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mood Result */}
        {moodResult && (
          <Card className={`mb-8 border-2 ${moodColors[moodResult.mood]} shadow-lg animate-fade-in`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <span className="text-4xl">{moodEmojis[moodResult.mood]}</span>
                <span className="capitalize">{moodResult.mood}</span>
                <span className="text-sm font-normal ml-auto">
                  {Math.round(moodResult.confidence * 100)}% confident
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/60 rounded-lg p-4">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  What we noticed:
                </p>
                <p className="text-sm">{moodResult.details}</p>
              </div>
              <div className="bg-white/60 rounded-lg p-4">
                <p className="font-semibold mb-2">💡 Suggestion:</p>
                <p className="text-sm">{moodResult.advice}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Mood Tracker */}
        <Card className="mb-8 border-2 border-pet-orange/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pet-orange" />
              Daily Mood Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockMoodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f59e0b20" />
                <XAxis 
                  dataKey="day" 
                  stroke="#f59e0b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#f59e0b"
                  domain={[0, 10]}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '2px solid #f59e0b40',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Track your pet's happiness over time 📊
            </p>
          </CardContent>
        </Card>

        {/* Dream Journal */}
        <Card className="border-2 border-purple-400/30 shadow-lg bg-gradient-to-br from-purple-50/50 to-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Moon className="w-6 h-6" />
              Dream Journal - AI Bedtime Stories
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate a personalized bedtime story for your pet 🌙
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="petName">Pet Name</Label>
                <Input
                  id="petName"
                  placeholder="e.g., Bella"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  disabled={isGeneratingStory}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="petBreed">Breed</Label>
                <Input
                  id="petBreed"
                  placeholder="e.g., Golden Retriever"
                  value={petBreed}
                  onChange={(e) => setPetBreed(e.target.value)}
                  disabled={isGeneratingStory}
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateStory}
              disabled={isGeneratingStory || !petName.trim() || !petBreed.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isGeneratingStory ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating magical story...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Bedtime Story
                </>
              )}
            </Button>

            {bedtimeStory && (
              <div className="animate-fade-in space-y-4">
                <div className="bg-white/70 rounded-lg p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-purple-700 flex items-center gap-2">
                      <Moon className="w-5 h-5" />
                      Tonight's Bedtime Story
                    </h3>
                    {!isPlayingAudio ? (
                      <Button
                        onClick={handlePlayStory}
                        variant="outline"
                        size="sm"
                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Play Story
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStopAudio}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Stop
                      </Button>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {bedtimeStory}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  💤 Perfect for bonding before bed • Generate a new story anytime
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
