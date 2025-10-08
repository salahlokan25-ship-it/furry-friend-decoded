import { useState } from "react";
import { Upload, Camera, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodResult, setMoodResult] = useState<MoodResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
        <Card className="border-2 border-pet-orange/20 shadow-lg">
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
      </div>
    </div>
  );
};

export default Index;
