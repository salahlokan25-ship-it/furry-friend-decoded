import { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Sparkles, 
  Volume2, 
  Music, 
  Play, 
  Pause, 
  Clock, 
  MapPin, 
  Heart, 
  Cloud, 
  Utensils, 
  GraduationCap, 
  Trophy, 
  MessageCircle, 
  Gift, 
  PawPrint,
  TrendingUp,
  Users,
  Star,
  Zap,
  Target,
  Calendar,
  Bell,
  Activity,
  Sun,
  Moon,
  Wind,
  Thermometer,
  Plus,
  Share2,
  ThumbsUp,
  Navigation,
  Filter,
  Settings,
  Menu,
  ChevronRight,
  ExternalLink,
  Mic,
  Eye,
  Brain,
  Shield,
  Dna,
  Stethoscope,
  BarChart3,
  Globe,
  Video,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Sparkle,
  Wand2,
  Bot,
  Cpu,
  ScanLine,
  Smartphone,
  Wifi,
  Battery,
  Signal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

interface PetProfile {
  name: string;
  breed: string;
  age: number;
  activityLevel: string;
  allergies: string[];
}

interface WeatherData {
  temperature: number;
  condition: string;
  advice: string;
}

interface SocialMoment {
  id: string;
  petName: string;
  image: string;
  likes: number;
  description: string;
  isPetOfDay: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  prize: string;
  deadline: string;
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

interface IndexProps {
  onNavigate?: (tab: string) => void;
}

const Index = ({ onNavigate }: IndexProps) => {
  // Pet Mood Scanner State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodResult, setMoodResult] = useState<MoodResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Daily Dashboard State
  const [petProfile] = useState<PetProfile>({
    name: "Luna",
    breed: "Golden Retriever",
    age: 2,
    activityLevel: "high",
    allergies: ["chicken"]
  });

  const [weatherData] = useState<WeatherData>({
    temperature: 75,
    condition: "sunny",
    advice: "Perfect weather for a walk! Don't forget water for Luna."
  });

  const [walkProgress, setWalkProgress] = useState(65);
  const [feedingReminder] = useState("Next meal in 2 hours");

  // Social Moments State
  const [socialMoments, setSocialMoments] = useState<SocialMoment[]>([
    {
      id: "1",
      petName: "Max",
      image: "/api/placeholder/300/200",
      likes: 42,
      description: "Max showing off his new trick! 🎾",
      isPetOfDay: true
    },
    {
      id: "2",
      petName: "Bella",
      image: "/api/placeholder/300/200",
      likes: 28,
      description: "Bella's morning yoga session 🧘‍♀️",
      isPetOfDay: false
    }
  ]);

  // Pet Challenge State
  const [weeklyChallenge] = useState<Challenge>({
    id: "1",
    title: "Best Sit Pose",
    description: "Show us your pet's perfect sit! Upload photos and vote for the best pose.",
    participants: 156,
    prize: "Premium pet treats + $50 gift card",
    deadline: "3 days left"
  });

  // Paw Box State
  const [pawBoxOpened, setPawBoxOpened] = useState(false);
  const [dailyReward, setDailyReward] = useState<string | null>(null);

  // Food Recommender State
  const [foodRecommendation, setFoodRecommendation] = useState<string | null>(null);

  // Mobile UI State
  const [currentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
    
    audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    audioRef.current.addEventListener('pause', () => setIsPlaying(false));
    audioRef.current.addEventListener('play', () => setIsPlaying(true));
    
    // Generate daily food recommendation
    generateFoodRecommendation();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const generateFoodRecommendation = () => {
    const recommendations = [
      `For ${petProfile.name} (${petProfile.breed}, ${petProfile.age} years), try 120g salmon-based kibble tonight.`,
      `Perfect portion: 100g turkey & sweet potato blend for ${petProfile.name}'s ${petProfile.activityLevel} activity level.`,
      `Recommendation: 150g lamb & rice formula - great for ${petProfile.name}'s sensitive stomach.`,
      `Try 110g chicken-free kibble tonight - perfect for ${petProfile.name}'s dietary needs.`
    ];
    setFoodRecommendation(recommendations[Math.floor(Math.random() * recommendations.length)]);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setIsAnalyzing(true);
    setMoodResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("Please sign in to use mood detection");
          setIsAnalyzing(false);
          return;
        }
        
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

  const openPawBox = () => {
    const rewards = [
      "🎁 10% off premium treats",
      "💡 Daily tip: Regular exercise keeps pets happy!",
      "🏆 Unlock 'Pet Care Expert' badge",
      "🎵 Free calming music playlist",
      "📸 AR filter pack unlocked!"
    ];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    setDailyReward(randomReward);
    setPawBoxOpened(true);
    toast.success("Paw Box opened! Check your reward below! 🎉");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Button Handlers - All Clickable
  const handleSetReminder = () => {
    toast.success("Feeding reminder set! 🔔");
  };

  const handleWalkProgress = () => {
    const newProgress = Math.min(walkProgress + 10, 100);
    setWalkProgress(newProgress);
    toast.success(`Walk progress updated! ${newProgress}% complete 🚶‍♂️`);
  };

  const handleChatbotChat = () => {
    if (onNavigate) {
      onNavigate("chat");
      toast.success("Opening AI Pet Whisperer... 🎤");
    } else {
      toast.success("Opening AI Pet Whisperer... 🎤");
    }
  };

  const handleViewFullMenu = () => {
    toast.success("Opening Smart Nutrition AI... 🍖");
  };

  const handleSetFoodReminder = () => {
    toast.success("Food reminder set! ⏰");
  };

  const handleTrainerQuestion = (question: string) => {
    if (onNavigate) {
      onNavigate("training");
      toast.success(`Opening Pet Trainer AI for: "${question}" 🧠`);
    } else {
      toast.success(`Getting AI advice for: "${question}" 🧠`);
    }
  };

  const handleChallengeUpload = () => {
    if (onNavigate) {
      onNavigate("album");
      toast.success("Opening camera for challenge photo... 📸");
    } else {
      toast.success("Opening camera for challenge photo... 📸");
    }
  };

  const handleSocialReact = (momentId: string) => {
    setSocialMoments(prev => prev.map(moment => 
      moment.id === momentId 
        ? { ...moment, likes: moment.likes + 1 }
        : moment
    ));
    toast.success("Reacted with paw! 🐾💖");
  };

  const handleSocialShare = (momentId: string) => {
    toast.success("Shared to your feed! 📤");
  };

  const handleViewMap = () => {
    toast.success("Opening Nearby Pet Map... 🗺️");
  };

  const handleFindWalkFriends = () => {
    toast.success("Finding walk friends nearby... 👥");
  };

  const handleOpenCamera = () => {
    if (onNavigate) {
      onNavigate("album");
      toast.success("Opening camera with AR filters... 📸");
    } else {
      toast.success("Opening camera with AR filters... 📸");
    }
  };

  const handleAIFeature = (featureId: string) => {
    const features = {
      healthvision: "Starting AI Health Scan... 👁️",
      nutrition: "Generating Smart Meal Plan... 🧠",
      petverse: "Entering Petverse... 🌍",
      timeline: "Generating Pet Life Timeline... 📊",
      dna: "Starting DNA Analysis... 🧬",
      guardian: "Enabling Guardian Angel Monitoring... 🛡️"
    };
    toast.success(features[featureId as keyof typeof features] || "Opening AI feature... 🤖");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Mobile Status Bar */}
      <div className="bg-black text-white text-xs px-4 py-1 flex justify-between items-center md:hidden">
        <span className="font-semibold">{currentTime}</span>
        <div className="flex items-center gap-1">
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <Battery className="w-4 h-3" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-md md:max-w-7xl">
        
        {/* Mobile Header */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/petparadise-logo.png" 
              alt="PetParadise Logo" 
              className="w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-bounce-slow"
            />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">
            PetParadise
          </h1>
          <p className="text-orange-600 text-sm md:text-lg font-medium">Your AI-powered pet companion 🐕🐱</p>
        </div>

        {/* AI Pet Whisperer - Main Feature */}
        <Card className="mb-6 border-0 shadow-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white animate-slide-up">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
                <Mic className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-lg md:text-2xl text-white mb-2">
                  🎤 AI Pet Whisperer
                </h3>
                <p className="text-orange-100 text-sm md:text-lg">
                  Talk with your pet! Real-time emotion-to-voice translator. Record sounds and get instant translations like "I'm hungry!" ✨
                </p>
              </div>
              <Button 
                onClick={handleChatbotChat}
                size="lg" 
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full md:w-auto"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Translating
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          
          {/* Daily Dashboard */}
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg p-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4" />
                📊 Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-xs text-gray-700">{feedingReminder}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-orange-600" />
                  <div className="flex-1">
                    <Progress value={walkProgress} className="h-1" />
                    <span className="text-xs text-gray-600">{walkProgress}%</span>
                  </div>
                </div>
                <Button 
                  onClick={handleSetReminder}
                  size="sm" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs h-7"
                >
                  <Bell className="w-3 h-3 mr-1" />
                  Set Reminder
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mood Scanner */}
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg p-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Camera className="w-4 h-4" />
                📸 Mood Scan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 bg-gradient-to-br from-purple-50 to-pink-50">
              {!previewUrl ? (
                <div className="text-center">
                  <label className="cursor-pointer">
                    <div className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-xs">
                      <Camera className="w-3 h-3" />
                      📸 Scan
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                    <img 
                      src={previewUrl} 
                      alt="Pet preview" 
                      className="w-full h-full object-cover"
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {moodResult && !isAnalyzing && (
                    <div className={`bg-gradient-to-r ${moodColors[moodResult.mood]} p-2 rounded-lg text-white text-center`}>
                      <div className="text-lg animate-bounce">{moodEmojis[moodResult.mood]}</div>
                      <p className="text-xs font-semibold capitalize">{moodResult.mood}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Features - Mobile Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { id: "healthvision", title: "HealthVision", emoji: "👁️", color: "from-green-500 to-emerald-500", handler: () => handleAIFeature("healthvision") },
            { id: "nutrition", title: "Nutrition AI", emoji: "🧠", color: "from-orange-500 to-yellow-500", handler: () => handleAIFeature("nutrition") },
            { id: "petverse", title: "Petverse", emoji: "🌍", color: "from-blue-500 to-indigo-500", handler: () => handleAIFeature("petverse") },
            { id: "timeline", title: "Life Timeline", emoji: "📊", color: "from-pink-500 to-rose-500", handler: () => handleAIFeature("timeline") },
            { id: "dna", title: "DNA Predictor", emoji: "🧬", color: "from-teal-500 to-cyan-500", handler: () => handleAIFeature("dna") },
            { id: "guardian", title: "Guardian Angel", emoji: "🛡️", color: "from-red-500 to-pink-500", handler: () => handleAIFeature("guardian") }
          ].map((feature, index) => (
            <Card 
              key={feature.id} 
              className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className={`bg-gradient-to-r ${feature.color} text-white rounded-t-lg p-3`}>
                <CardTitle className="flex items-center gap-1 text-xs">
                  {feature.emoji} {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <Button 
                  onClick={feature.handler}
                  size="sm" 
                  className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 text-white font-semibold transition-all duration-300 hover:scale-105 text-xs h-8`}
                >
                  <Sparkle className="w-3 h-3 mr-1" />
                  Try AI
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Paw Box - Mobile Optimized */}
        <Card className="mb-6 border-0 shadow-xl bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg p-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gift className="w-5 h-5" />
              🎁 Daily Paw Box
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                <Gift className="w-8 h-8 text-white" />
              </div>
              {!pawBoxOpened ? (
                <Button 
                  onClick={openPawBox}
                  size="lg"
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Open Daily Gift
                  <Sparkle className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-3 border border-yellow-300 shadow-lg">
                    <p className="font-bold text-orange-800 text-sm mb-1">🎉 You received:</p>
                    <p className="text-orange-700 text-sm">{dailyReward}</p>
                  </div>
                  <p className="text-xs text-orange-600 font-semibold">Come back tomorrow for another surprise! ✨</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Feed - Mobile Optimized */}
        <Card className="mb-6 border-0 shadow-xl bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-lg p-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              🐾 Pet Social Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-gradient-to-br from-pink-50 to-rose-50">
            <div className="space-y-3">
              {socialMoments.map((moment) => (
                <div key={moment.id} className="bg-white rounded-lg p-3 border border-pink-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center animate-pulse">
                      <PawPrint className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-pink-800 text-sm">{moment.petName}</h4>
                        {moment.isPetOfDay && (
                          <Badge className="bg-yellow-100 text-yellow-800 px-2 py-0 text-xs animate-pulse">
                            <Star className="w-3 h-3 mr-1" />
                            Pet of Day
                          </Badge>
                        )}
                      </div>
                      <p className="text-pink-700 text-xs">{moment.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-pink-600" />
                      <span className="text-pink-700 text-xs font-bold">{moment.likes}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleSocialReact(moment.id)}
                      size="sm" 
                      variant="outline" 
                      className="border-pink-300 text-pink-700 hover:bg-pink-50 text-xs h-7 flex-1 transition-all duration-300 hover:scale-105"
                    >
                      <PawPrint className="w-3 h-3 mr-1" />
                      React 🐾💖
                    </Button>
                    <Button 
                      onClick={() => handleSocialShare(moment.id)}
                      size="sm" 
                      variant="outline" 
                      className="border-pink-300 text-pink-700 hover:bg-pink-50 text-xs h-7 flex-1 transition-all duration-300 hover:scale-105"
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Challenge - Mobile Optimized */}
        <Card className="mb-6 border-0 shadow-xl bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg p-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5" />
              🏆 Weekly Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <h4 className="font-semibold text-indigo-800 text-sm">{weeklyChallenge.title}</h4>
                <Badge className="bg-indigo-100 text-indigo-800 px-2 py-0 text-xs animate-pulse">
                  {weeklyChallenge.deadline}
                </Badge>
              </div>
              <p className="text-indigo-700 text-xs mb-3">{weeklyChallenge.description}</p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-indigo-600" />
                  <span className="text-indigo-700 text-xs font-semibold">{weeklyChallenge.participants} participants</span>
                </div>
                <div className="flex items-center gap-1">
                  <Gift className="w-3 h-3 text-indigo-600" />
                  <span className="text-indigo-700 text-xs font-semibold">$50 prize</span>
                </div>
              </div>
              <Button 
                onClick={handleChallengeUpload}
                size="lg" 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Camera className="w-5 h-5 mr-2" />
                Upload Photo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pet Animation - Mobile Optimized */}
        <div className="text-center animate-fade-in">
          <PetPlayAnimation />
        </div>
      </div>
    </div>
  );
};

export default Index;