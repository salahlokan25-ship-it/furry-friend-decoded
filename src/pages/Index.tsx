import { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Sparkles, 
  Heart, 
  PawPrint,
  Users,
  Star,
  Bell,
  Activity,
  Mic,
  Eye,
  Brain,
  Shield,
  Dna,
  Stethoscope,
  BarChart3,
  Globe,
  Video,
  CheckCircle,
  ArrowRight,
  Sparkle,
  Bot,
  Cpu,
  ScanLine,
  X,
  Loader2,
  Smartphone,
  Wifi,
  Battery,
  Signal,
  User,
  MapPin,
  Utensils,
  Stethoscope as StethoscopeIcon,
  MessageCircle,
  Gift,
  Home,
  Image,
  Calendar,
  TrendingUp,
  Zap,
  Target,
  Plus,
  Share2,
  ThumbsUp,
  Navigation,
  Filter,
  Settings,
  Menu,
  ChevronRight,
  ExternalLink,
  Play,
  Pause,
  Clock,
  MapPin as MapPinIcon,
  Cloud,
  GraduationCap,
  Trophy,
  MessageCircle as MessageCircleIcon,
  Gift as GiftIcon,
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon,
  Star as StarIcon,
  Zap as ZapIcon,
  Target as TargetIcon,
  Calendar as CalendarIcon,
  Bell as BellIcon,
  Activity as ActivityIcon,
  Sun,
  Moon,
  Wind,
  Thermometer,
  Plus as PlusIcon,
  Share2 as Share2Icon,
  ThumbsUp as ThumbsUpIcon,
  Navigation as NavigationIcon,
  Filter as FilterIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  ChevronRight as ChevronRightIcon,
  ExternalLink as ExternalLinkIcon,
  Mic as MicIcon,
  Eye as EyeIcon,
  Brain as BrainIcon,
  Shield as ShieldIcon,
  Dna as DnaIcon,
  Stethoscope as StethoscopeIcon2,
  BarChart3 as BarChart3Icon,
  Globe as GlobeIcon,
  Video as VideoIcon,
  AlertTriangle,
  CheckCircle as CheckCircleIcon,
  ArrowRight as ArrowRightIcon,
  Sparkle as SparkleIcon,
  Wand2,
  Bot as BotIcon,
  Cpu as CpuIcon,
  ScanLine as ScanLineIcon,
  Smartphone as SmartphoneIcon,
  Wifi as WifiIcon,
  Battery as BatteryIcon,
  Signal as SignalIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type MoodType = "Happy" | "Playful" | "Calm" | "Stressed";

interface MoodResult {
  mood: MoodType;
  confidence: number;
  advice: string;
  color: string;
}

interface MoodHistory {
  id: string;
  mood: MoodType;
  time: string;
  emoji: string;
  color: string;
}

interface IndexProps {
  onNavigate?: (tab: string) => void;
}

const Index = ({ onNavigate }: IndexProps) => {
  // AI PetMood Live State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodResult, setMoodResult] = useState<MoodResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);

  // Mood History State
  const [moodHistory] = useState<MoodHistory[]>([
    { id: "1", mood: "Happy", time: "2h ago", emoji: "😊", color: "bg-yellow-400" },
    { id: "2", mood: "Playful", time: "5h ago", emoji: "🎾", color: "bg-green-400" },
    { id: "3", mood: "Calm", time: "1d ago", emoji: "😌", color: "bg-blue-400" },
    { id: "4", mood: "Happy", time: "2d ago", emoji: "😊", color: "bg-yellow-400" }
  ]);

  // Paw Box State
  const [pawBoxOpened, setPawBoxOpened] = useState(false);
  const [dailyReward, setDailyReward] = useState<string | null>(null);
  const [aiSurprise, setAiSurprise] = useState<any>(null);

  // Modal State
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // AI Results State
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Mobile UI State
  const [currentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

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
    setShowAdvice(false);

    // Enhanced AI analysis simulation
    setTimeout(() => {
      const moods: MoodType[] = ["Happy", "Playful", "Calm", "Stressed"];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      
      // More sophisticated AI advice based on mood
      const adviceMap = {
        "Happy": [
          "Your pet looks absolutely joyful! 🎉 Perfect time for play or training!",
          "Such a happy expression! 🥰 Consider rewarding this positive mood!",
          "Pure happiness detected! 🌟 Your pet is in great spirits today!"
        ],
        "Playful": [
          "Your pet is ready to play! 🎾 Try some interactive toys or games!",
          "Playful energy detected! 🏃‍♂️ Perfect time for exercise and fun!",
          "Ready for action! 🎯 Your pet wants to engage and have fun!"
        ],
        "Calm": [
          "Your pet is in a peaceful state 🧘‍♀️ Great for relaxation time!",
          "Calm and content! 😌 Perfect for gentle petting or quiet activities!",
          "Serene mood detected! 🌸 Your pet is relaxed and comfortable!"
        ],
        "Stressed": [
          "Your pet seems anxious 😰 Consider a quiet, safe environment!",
          "Stress detected! 🤗 Try calming activities like gentle petting!",
          "Your pet needs comfort! 💙 Consider reducing noise and stimulation!"
        ]
      };
      
      const adviceOptions = adviceMap[randomMood];
      const randomAdvice = adviceOptions[Math.floor(Math.random() * adviceOptions.length)];
      
      setMoodResult({
        mood: randomMood,
        confidence: Math.floor(Math.random() * 25) + 75, // 75-100% confidence
        advice: randomAdvice,
        color: randomMood === "Happy" ? "bg-yellow-400" : 
               randomMood === "Playful" ? "bg-green-400" :
               randomMood === "Calm" ? "bg-blue-400" : "bg-red-400"
      });
      setIsAnalyzing(false);
      setShowAdvice(true);
      toast.success(`AI Analysis Complete! ${randomMood} mood detected with ${Math.floor(Math.random() * 25) + 75}% confidence! 🎉`);
    }, 2500);
  };

  const generateAISurprise = () => {
    const surpriseTypes = [
      {
        type: "recipe",
        title: "🍖 AI-Generated Pet Recipe",
        emoji: "🍖",
        content: {
          recipeName: "Healthy Chicken & Sweet Potato Delight",
          ingredients: ["Chicken breast (1 cup)", "Sweet potato (1/2 cup)", "Carrots (1/4 cup)", "Green beans (1/4 cup)"],
          instructions: [
            "Boil chicken breast until cooked through",
            "Steam sweet potato and carrots until tender",
            "Blanch green beans for 2 minutes",
            "Mix all ingredients and let cool",
            "Serve in small portions"
          ],
          benefits: "High protein, low fat, rich in vitamins A & C"
        }
      },
      {
        type: "activity",
        title: "🎾 AI Pet Activity Challenge",
        emoji: "🎾",
        content: {
          activityName: "Hide & Seek Treasure Hunt",
          description: "Create a fun treasure hunt for your pet using treats and toys",
          steps: [
            "Hide treats in 3-5 different locations",
            "Use your pet's favorite toys as markers",
            "Start with easy hiding spots",
            "Give verbal cues to help them find treats",
            "Celebrate each successful find!"
          ],
          duration: "15-20 minutes",
          benefits: "Mental stimulation, bonding time, exercise"
        }
      },
      {
        type: "tip",
        title: "💡 AI Pet Care Tip",
        emoji: "💡",
        content: {
          tipCategory: "Daily Wellness",
          tipTitle: "The 5-Minute Pet Check",
          description: "A quick daily routine to monitor your pet's health",
          checklist: [
            "Check eyes for discharge or redness",
            "Examine ears for odor or debris",
            "Feel for lumps or bumps on body",
            "Check paws for cuts or foreign objects",
            "Monitor eating and drinking habits"
          ],
          frequency: "Daily",
          importance: "Early detection of health issues"
        }
      },
      {
        type: "training",
        title: "🐶 AI Training Exercise",
        emoji: "🐶",
        content: {
          exerciseName: "Focus & Attention Training",
          description: "Teach your pet to maintain eye contact and attention",
          steps: [
            "Hold a treat near your face",
            "Say 'Look' or 'Watch me'",
            "Wait for eye contact (even briefly)",
            "Immediately reward with treat",
            "Gradually increase duration of eye contact"
          ],
          difficulty: "Beginner",
          duration: "5-10 minutes daily",
          benefits: "Improves focus, strengthens bond, builds trust"
        }
      },
      {
        type: "wellness",
        title: "🌟 AI Wellness Insight",
        emoji: "🌟",
        content: {
          insightTitle: "Understanding Pet Body Language",
          description: "Learn to read your pet's emotional state",
          signals: [
            "Relaxed ears = Content and calm",
            "Tail wagging = Excited or happy",
            "Yawning = Stress or tiredness",
            "Licking lips = Anxiety or submission",
            "Avoiding eye contact = Fear or discomfort"
          ],
          application: "Better communication with your pet",
          benefit: "Stronger bond and happier pet"
        }
      }
    ];
    
    return surpriseTypes[Math.floor(Math.random() * surpriseTypes.length)];
  };

  const openPawBox = () => {
    // Generate AI surprise
    const surprise = generateAISurprise();
    setAiSurprise(surprise);
    setPawBoxOpened(true);
    
    toast.success("AI Surprise Generated! 🎉", {
      description: `Your personalized ${surprise.title} is ready!`,
      duration: 3000
    });
  };

  const handleQuickAction = (action: string) => {
    setActiveModal(action);
    setFormData({});
  };

  const handleFormSubmit = async (action: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      setActiveModal(null);
      
      // Create detailed AI report based on action and form data
      const newResult = {
        id: Date.now().toString(),
        type: action,
        timestamp: new Date().toLocaleTimeString(),
        petName: formData.petName || 'Your Pet',
        data: formData,
        report: generateAIReport(action, formData)
      };
      
      // Add to results array
      setAiResults(prev => [newResult, ...prev.slice(0, 4)]); // Keep only latest 5 results
      setShowResults(true);
      
      // Show success toast
      toast.success("AI Report Generated! 📊", {
        description: "Your personalized plan is now available below!",
        duration: 3000
      });
    }, 3000);
  };

  const generateAIReport = (action: string, data: any) => {
    const reports = {
      feed: {
        title: "🍖 Personalized Feeding Plan",
        summary: `Nutritional analysis for ${data.petName || 'your pet'}`,
        recommendations: [
          `Feed ${data.mealsPerDay || 2} meals per day`,
          `Recommended portion size: ${data.age === 'puppy' ? 'Small portions' : data.age === 'senior' ? 'Reduced portions' : 'Standard portions'}`,
          `Best feeding times: ${data.mealsPerDay === '1' ? 'Morning' : data.mealsPerDay === '2' ? 'Morning & Evening' : 'Every 4-6 hours'}`,
          data.dietaryNeeds ? `Special considerations: ${data.dietaryNeeds}` : 'No special dietary restrictions noted'
        ],
        nextSteps: [
          "Monitor your pet's weight weekly",
          "Adjust portions based on activity level",
          "Schedule regular vet checkups",
          "Keep fresh water available at all times"
        ]
      },
      health: {
        title: "🩺 Health Assessment Report",
        summary: `Health analysis for ${data.petName || 'your pet'}`,
        recommendations: [
          `Urgency Level: ${data.urgency || 'Routine'} care recommended`,
          data.symptoms ? `Symptoms noted: ${data.symptoms}` : 'No concerning symptoms reported',
          data.behavior ? `Behavior changes: ${data.behavior}` : 'No significant behavior changes',
          "Continue monitoring your pet's daily activities"
        ],
        nextSteps: [
          data.urgency === 'urgent' ? "Schedule vet appointment within 24-48 hours" : "Schedule routine checkup within 1-2 weeks",
          "Monitor symptoms daily",
          "Keep detailed health journal",
          "Maintain regular exercise routine"
        ]
      },
      training: {
        title: "🐶 Training Program Plan",
        summary: `Customized training plan for ${data.petName || 'your pet'}`,
        recommendations: [
          `Focus Area: ${data.trainingGoals || 'Basic Obedience'}`,
          `Difficulty Level: ${data.difficulty || 'Beginner'} appropriate exercises`,
          data.issues ? `Addressing: ${data.issues}` : 'Building foundation skills',
          "Training sessions: 15-20 minutes, 2-3 times daily"
        ],
        nextSteps: [
          "Start with basic commands (sit, stay, come)",
          "Use positive reinforcement techniques",
          "Practice in distraction-free environment",
          "Gradually increase difficulty and distractions"
        ]
      },
      social: {
        title: "🌍 Social Network Plan",
        summary: `Socialization strategy for ${data.petName || 'your pet'}`,
        recommendations: [
          `Pet Type: ${data.petType || 'Dog'} socialization focus`,
          `Social Level: ${data.socialLevel || 'Moderate'} interaction approach`,
          data.interests ? `Activities: ${data.interests}` : 'General socialization activities',
          "Start with controlled, positive interactions"
        ],
        nextSteps: [
          "Find local pet meetup groups",
          "Schedule playdates with compatible pets",
          "Visit dog parks during off-peak hours",
          "Consider professional socialization classes"
        ]
      },
      vet: {
        title: "📍 Veterinarian Recommendations",
        summary: `Vet finder results for ${data.petName || 'your pet'}`,
        recommendations: [
          `Location: ${data.location || 'Your area'}`,
          `Specialty: ${data.specialty || 'General Care'} veterinarians`,
          `Urgency: ${data.urgency || 'Routine'} appointment needed`,
          "Found 3-5 qualified veterinarians in your area"
        ],
        nextSteps: [
          "Contact top-rated vet for availability",
          "Schedule appointment based on urgency",
          "Prepare questions about your pet's health",
          "Bring vaccination records to appointment"
        ]
      }
    };
    
    return reports[action as keyof typeof reports] || {
      title: "AI Analysis Complete",
      summary: "Analysis completed successfully",
      recommendations: ["Continue monitoring your pet"],
      nextSteps: ["Follow up as needed"]
    };
  };

  const closeModal = () => {
    setActiveModal(null);
    setFormData({});
    setIsProcessing(false);
  };

  const handleNavigation = (tab: string) => {
    const navigationMessages = {
      home: "Welcome to your AI-powered pet dashboard! 🏠",
      camera: "AI Camera activated! 📸 Ready to capture and analyze pet moments!",
      community: "Connecting to Pet Community! 🌍 Finding nearby pet friends and activities!",
      profile: "Opening your Pet Profile! 👤 Managing your pet's AI-powered data and preferences!"
    };
    
    const message = navigationMessages[tab as keyof typeof navigationMessages] || "Navigating... 🚀";
    toast.success(message, {
      description: "AI features are ready to assist you!",
      duration: 2000
    });
    
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 relative overflow-hidden">
      {/* AI Quick Action Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-slate-800">
                {activeModal === 'feed' && '🍖 AI Feed Planner'}
                {activeModal === 'health' && '🩺 AI Health Check'}
                {activeModal === 'training' && '🐶 AI Training Coach'}
                {activeModal === 'social' && '🌍 Pet Social Network'}
                {activeModal === 'vet' && '📍 AI Vet Finder'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {activeModal === 'feed' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="petName">Pet Name</Label>
                    <Input
                      id="petName"
                      placeholder="Enter your pet's name"
                      value={formData.petName || ''}
                      onChange={(e) => setFormData({...formData, petName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Select onValueChange={(value) => setFormData({...formData, age: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="puppy">Puppy (0-1 year)</SelectItem>
                        <SelectItem value="young">Young (1-3 years)</SelectItem>
                        <SelectItem value="adult">Adult (3-7 years)</SelectItem>
                        <SelectItem value="senior">Senior (7+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="breed">Breed</Label>
                    <Input
                      id="breed"
                      placeholder="Enter breed (e.g., Golden Retriever)"
                      value={formData.breed || ''}
                      onChange={(e) => setFormData({...formData, breed: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mealsPerDay">Meals per Day</Label>
                    <Select onValueChange={(value) => setFormData({...formData, mealsPerDay: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 meal per day</SelectItem>
                        <SelectItem value="2">2 meals per day</SelectItem>
                        <SelectItem value="3">3 meals per day</SelectItem>
                        <SelectItem value="4">4+ meals per day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dietaryNeeds">Dietary Needs</Label>
                    <Textarea
                      id="dietaryNeeds"
                      placeholder="Any allergies, preferences, or special dietary requirements?"
                      value={formData.dietaryNeeds || ''}
                      onChange={(e) => setFormData({...formData, dietaryNeeds: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {activeModal === 'health' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="petName">Pet Name</Label>
                    <Input
                      id="petName"
                      placeholder="Enter your pet's name"
                      value={formData.petName || ''}
                      onChange={(e) => setFormData({...formData, petName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="symptoms">Current Symptoms</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Describe any symptoms or concerns (e.g., lethargy, loss of appetite, coughing)"
                      value={formData.symptoms || ''}
                      onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select onValueChange={(value) => setFormData({...formData, urgency: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine Check</SelectItem>
                        <SelectItem value="mild">Mild Concern</SelectItem>
                        <SelectItem value="moderate">Moderate Concern</SelectItem>
                        <SelectItem value="urgent">Urgent - See Vet Soon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="behavior">Recent Behavior Changes</Label>
                    <Textarea
                      id="behavior"
                      placeholder="Any changes in behavior, eating habits, or activity level?"
                      value={formData.behavior || ''}
                      onChange={(e) => setFormData({...formData, behavior: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {activeModal === 'training' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="petName">Pet Name</Label>
                    <Input
                      id="petName"
                      placeholder="Enter your pet's name"
                      value={formData.petName || ''}
                      onChange={(e) => setFormData({...formData, petName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="trainingGoals">Training Goals</Label>
                    <Select onValueChange={(value) => setFormData({...formData, trainingGoals: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select training goals" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic Obedience</SelectItem>
                        <SelectItem value="house">House Training</SelectItem>
                        <SelectItem value="social">Socialization</SelectItem>
                        <SelectItem value="advanced">Advanced Commands</SelectItem>
                        <SelectItem value="behavior">Behavior Issues</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select onValueChange={(value) => setFormData({...formData, difficulty: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="issues">Specific Issues</Label>
                    <Textarea
                      id="issues"
                      placeholder="Any specific behavioral issues or challenges you're facing?"
                      value={formData.issues || ''}
                      onChange={(e) => setFormData({...formData, issues: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {activeModal === 'social' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="petName">Pet Name</Label>
                    <Input
                      id="petName"
                      placeholder="Enter your pet's name"
                      value={formData.petName || ''}
                      onChange={(e) => setFormData({...formData, petName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="petType">Pet Type</Label>
                    <Select onValueChange={(value) => setFormData({...formData, petType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="rabbit">Rabbit</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="socialLevel">Social Level</Label>
                    <Select onValueChange={(value) => setFormData({...formData, socialLevel: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="How social is your pet?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="very-social">Very Social</SelectItem>
                        <SelectItem value="moderate">Moderately Social</SelectItem>
                        <SelectItem value="shy">Shy/Cautious</SelectItem>
                        <SelectItem value="selective">Selective</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="interests">Pet Interests</Label>
                    <Textarea
                      id="interests"
                      placeholder="What activities does your pet enjoy? (e.g., fetch, swimming, hiking)"
                      value={formData.interests || ''}
                      onChange={(e) => setFormData({...formData, interests: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {activeModal === 'vet' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="petName">Pet Name</Label>
                    <Input
                      id="petName"
                      placeholder="Enter your pet's name"
                      value={formData.petName || ''}
                      onChange={(e) => setFormData({...formData, petName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter your city or zip code"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Specialty Needed</Label>
                    <Select onValueChange={(value) => setFormData({...formData, specialty: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Care</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="dental">Dental</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="orthopedic">Orthopedic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="urgency">Urgency</Label>
                    <Select onValueChange={(value) => setFormData({...formData, urgency: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine Visit</SelectItem>
                        <SelectItem value="soon">Need Soon</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleFormSubmit(activeModal)}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      AI Processing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Generate AI Plan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Paw Icons */}
      <div className="absolute top-20 left-4 text-orange-300 animate-bounce-slow text-2xl">🐾</div>
      <div className="absolute top-40 right-6 text-orange-300 animate-bounce-slow text-xl" style={{ animationDelay: '1s' }}>🐾</div>
      <div className="absolute bottom-40 left-8 text-orange-300 animate-bounce-slow text-lg" style={{ animationDelay: '2s' }}>🐾</div>
      <div className="absolute bottom-20 right-4 text-orange-300 animate-bounce-slow text-xl" style={{ animationDelay: '0.5s' }}>🐾</div>

      {/* Mobile Status Bar */}
      <div className="bg-black text-white text-xs px-4 py-1 flex justify-between items-center">
        <span className="font-semibold">{currentTime}</span>
        <div className="flex items-center gap-1">
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <Battery className="w-4 h-3" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 pb-20 max-w-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <img 
              src="/petparadise-logo.png" 
              alt="PetParadise Logo" 
              className="w-12 h-12 rounded-xl shadow-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                PetParadise
              </h1>
              <p className="text-orange-600 text-xs font-medium">AI Pet Companion</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-orange-600 font-medium">AI Active</span>
            </div>
          </div>
        </div>

        {/* AI PetMood Live */}
        <Card className="mb-6 border-2 border-orange-300 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white animate-slide-up rounded-2xl">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 animate-pulse">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI PetMood Live</h3>
              <p className="text-white/90 text-sm">Scan your pet's face & sounds</p>
            </div>
            
            {!previewUrl ? (
              <div className="text-center">
                <label className="cursor-pointer">
                  <div 
                    className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-white/30 hover:border-white/50 transition-all"
                    onClick={() => document.getElementById('mood-scan-input')?.click()}
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <Button 
                    size="lg"
                    onClick={() => document.getElementById('mood-scan-input')?.click()}
                    className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full px-6 py-3 border-2 border-orange-200"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Scan Mood
                  </Button>
                  <input
                    id="mood-scan-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm">
                  <img 
                    src={previewUrl} 
                    alt="Pet preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/300x300/FF6B5A/FFFFFF?text=Pet+Photo";
                    }}
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-3"></div>
                      <div className="text-white text-sm font-semibold">AI Analyzing...</div>
                      <div className="text-white/80 text-xs mt-1">Detecting emotions & patterns</div>
                    </div>
                  )}
                  {!isAnalyzing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm"
                        onClick={() => document.getElementById('mood-scan-input')?.click()}
                        className="bg-white text-orange-600 hover:bg-orange-50"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Scan Again
                      </Button>
                    </div>
                  )}
                </div>
                
                {moodResult && !isAnalyzing && (
                  <div className="space-y-3">
                    <div className={`${moodResult.color} p-4 rounded-2xl text-white text-center animate-bounce`}>
                      <div className="text-3xl mb-2">
                        {moodResult.mood === "Happy" ? "😊" : 
                         moodResult.mood === "Playful" ? "🎾" :
                         moodResult.mood === "Calm" ? "😌" : "😰"}
                      </div>
                      <p className="font-bold text-lg">{moodResult.mood}</p>
                      <p className="text-sm opacity-90">{moodResult.confidence}% confidence</p>
                    </div>
                    <Button 
                      onClick={() => {
                        setPreviewUrl(null);
                        setMoodResult(null);
                        setShowAdvice(false);
                      }}
                      size="sm"
                      variant="outline"
                      className="w-full border-white text-white hover:bg-white/20"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      New Scan
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Advice Card */}
        {showAdvice && moodResult && (
          <Card className="mb-6 border-2 border-green-300 shadow-xl bg-gradient-to-r from-green-500 to-green-600 text-white animate-slide-up rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">AI Advice</h4>
                  <p className="text-white/90 text-sm">{moodResult.advice}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Quick Actions */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            AI Quick Actions
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[
              { id: "feed", title: "Feed Planner", emoji: "🍖", color: "from-orange-500 to-yellow-500" },
              { id: "health", title: "Health Check", emoji: "🩺", color: "from-green-500 to-emerald-500" },
              { id: "training", title: "Training Chat", emoji: "🐶", color: "from-blue-500 to-indigo-500" },
              { id: "social", title: "Pet Social Feed", emoji: "🌍", color: "from-purple-500 to-pink-500" },
              { id: "vet", title: "Vet Finder", emoji: "📍", color: "from-slate-600 to-slate-700" }
            ].map((action) => (
              <Card 
                key={action.id}
                className="border-2 border-orange-200 shadow-lg bg-white hover:shadow-xl hover:border-orange-400 transition-all duration-300 hover:scale-105 min-w-[120px] animate-slide-up rounded-2xl"
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mx-auto mb-3 text-2xl shadow-md`}>
                    {action.emoji}
                  </div>
                  <h4 className="font-semibold text-slate-800 text-xs mb-2">{action.title}</h4>
                  <Button 
                    onClick={() => handleQuickAction(action.id)}
                    size="sm" 
                    className={`w-full bg-gradient-to-r ${action.color} hover:opacity-90 text-white font-semibold transition-all duration-300 hover:scale-105 text-xs h-7 rounded-full shadow-md border-2 border-white/20`}
                  >
                    Try Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Results Section */}
        {showResults && aiResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-orange-600" />
              AI Reports & Plans
            </h3>
            <div className="space-y-4">
              {aiResults.map((result) => (
                <Card key={result.id} className="border-2 border-orange-200 shadow-xl bg-white hover:shadow-xl hover:border-orange-400 transition-all duration-300 animate-slide-up rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-2xl p-4">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{result.report.title}</span>
                      </div>
                      <div className="text-xs opacity-80">
                        {result.timestamp}
                      </div>
                    </CardTitle>
                    <p className="text-sm opacity-90 mt-1">{result.report.summary}</p>
                  </CardHeader>
                  <CardContent className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
                    <div className="space-y-4">
                      {/* Recommendations */}
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {result.report.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-orange-500 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Next Steps */}
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-blue-600" />
                          Next Steps
                        </h4>
                        <ul className="space-y-1">
                          {result.report.nextSteps.map((step: string, index: number) => (
                            <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs"
                        >
                          Save Plan
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                          Share Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* AI Mood History */}
        <Card className="mb-6 border-2 border-purple-200 shadow-xl bg-white hover:shadow-xl hover:border-purple-400 transition-all duration-300 hover:scale-105 animate-slide-up rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-2xl p-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <BarChart3 className="w-5 h-5" />
              AI Mood History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {moodHistory.map((mood) => (
                <div key={mood.id} className="flex flex-col items-center min-w-[80px] p-2 rounded-lg bg-white/80 hover:bg-white transition-all duration-300 border border-purple-200">
                  <div className={`w-12 h-12 rounded-full ${mood.color} flex items-center justify-center mb-2 text-xl shadow-md`}>
                    {mood.emoji}
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{mood.mood}</p>
                  <p className="text-xs text-slate-600">{mood.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Surprise Paw Box */}
        <Card className="mb-6 border-2 border-yellow-200 shadow-xl bg-white hover:shadow-xl hover:border-yellow-400 transition-all duration-300 hover:scale-105 animate-slide-up rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-2xl p-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Gift className="w-5 h-5" />
              Daily Surprise Paw Box
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                <Gift className="w-8 h-8 text-white" />
              </div>
              {!pawBoxOpened ? (
                <Button 
                  onClick={openPawBox}
                  size="lg"
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full border-2 border-yellow-300"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Open Paw Box 🎁
                  <Sparkle className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <div className="space-y-4">
                  {aiSurprise && (
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 border-2 border-yellow-300 shadow-lg">
                      <div className="text-center mb-3">
                        <div className="text-3xl mb-2">{aiSurprise.emoji}</div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1">{aiSurprise.title}</h4>
                      </div>
                      
                      {/* Recipe Surprise */}
                      {aiSurprise.type === 'recipe' && (
                        <div className="space-y-3">
                          <div className="text-center">
                            <h5 className="font-semibold text-slate-800 text-xs mb-1">{aiSurprise.content.recipeName}</h5>
                            <p className="text-xs text-slate-600 mb-2">{aiSurprise.content.benefits}</p>
                          </div>
                          <div>
                            <h6 className="font-semibold text-slate-800 text-xs mb-1">Ingredients:</h6>
                            <ul className="text-xs text-slate-700 space-y-1">
                              {aiSurprise.content.ingredients.map((ingredient: string, index: number) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-orange-500 mt-0.5">•</span>
                                  <span>{ingredient}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-semibold text-slate-800 text-xs mb-1">Instructions:</h6>
                            <ol className="text-xs text-slate-700 space-y-1">
                              {aiSurprise.content.instructions.map((instruction: string, index: number) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-orange-500 mt-0.5">{index + 1}.</span>
                                  <span>{instruction}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      )}
                      
                      {/* Activity Surprise */}
                      {aiSurprise.type === 'activity' && (
                        <div className="space-y-3">
                          <div className="text-center">
                            <h5 className="font-semibold text-slate-800 text-xs mb-1">{aiSurprise.content.activityName}</h5>
                            <p className="text-xs text-slate-600 mb-2">{aiSurprise.content.description}</p>
                          </div>
                          <div>
                            <h6 className="font-semibold text-slate-800 text-xs mb-1">Steps:</h6>
                            <ol className="text-xs text-slate-700 space-y-1">
                              {aiSurprise.content.steps.map((step: string, index: number) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-orange-500 mt-0.5">{index + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Duration: {aiSurprise.content.duration}</span>
                            <span>Benefits: {aiSurprise.content.benefits}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Tip Surprise */}
                      {aiSurprise.type === 'tip' && (
                        <div className="space-y-3">
                          <div className="text-center">
                            <h5 className="font-semibold text-slate-800 text-xs mb-1">{aiSurprise.content.tipTitle}</h5>
                            <p className="text-xs text-slate-600 mb-2">{aiSurprise.content.description}</p>
                          </div>
                          <div>
                            <h6 className="font-semibold text-slate-800 text-xs mb-1">Daily Checklist:</h6>
                            <ul className="text-xs text-slate-700 space-y-1">
                              {aiSurprise.content.checklist.map((item: string, index: number) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-orange-500 mt-0.5">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-center text-xs text-slate-600">
                            <span className="font-semibold">Frequency:</span> {aiSurprise.content.frequency} | 
                            <span className="font-semibold ml-1">Importance:</span> {aiSurprise.content.importance}
                          </div>
                        </div>
                      )}
                      
                      {/* Training Surprise */}
                      {aiSurprise.type === 'training' && (
                        <div className="space-y-3">
                          <div className="text-center">
                            <h5 className="font-semibold text-slate-800 text-xs mb-1">{aiSurprise.content.exerciseName}</h5>
                            <p className="text-xs text-slate-600 mb-2">{aiSurprise.content.description}</p>
                          </div>
                          <div>
                            <h6 className="font-semibold text-slate-800 text-xs mb-1">Training Steps:</h6>
                            <ol className="text-xs text-slate-700 space-y-1">
                              {aiSurprise.content.steps.map((step: string, index: number) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-orange-500 mt-0.5">{index + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>Difficulty: {aiSurprise.content.difficulty}</span>
                            <span>Duration: {aiSurprise.content.duration}</span>
                          </div>
                          <div className="text-center text-xs text-slate-600">
                            <span className="font-semibold">Benefits:</span> {aiSurprise.content.benefits}
                          </div>
                        </div>
                      )}
                      
                      {/* Wellness Surprise */}
                      {aiSurprise.type === 'wellness' && (
                        <div className="space-y-3">
                          <div className="text-center">
                            <h5 className="font-semibold text-slate-800 text-xs mb-1">{aiSurprise.content.insightTitle}</h5>
                            <p className="text-xs text-slate-600 mb-2">{aiSurprise.content.description}</p>
                          </div>
                          <div>
                            <h6 className="font-semibold text-slate-800 text-xs mb-1">Body Language Signals:</h6>
                            <ul className="text-xs text-slate-700 space-y-1">
                              {aiSurprise.content.signals.map((signal: string, index: number) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-orange-500 mt-0.5">•</span>
                                  <span>{signal}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-center text-xs text-slate-600">
                            <span className="font-semibold">Application:</span> {aiSurprise.content.application} | 
                            <span className="font-semibold ml-1">Benefit:</span> {aiSurprise.content.benefit}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setPawBoxOpened(false);
                        setAiSurprise(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-xs"
                    >
                      Get Another Surprise
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs border-yellow-300 text-orange-600 hover:bg-yellow-50"
                    >
                      Save This Surprise
                    </Button>
                  </div>
                  
                  <p className="text-xs text-orange-600 font-semibold text-center">Come back tomorrow for another AI surprise! ✨</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-200 shadow-2xl">
          <div className="flex justify-around py-3">
            {[
              { id: "home", label: "Home", icon: Home, active: true },
              { id: "camera", label: "Camera", icon: Camera },
              { id: "community", label: "Community", icon: Users },
              { id: "profile", label: "Profile", icon: User }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleNavigation(tab.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300 border-2 ${
                  tab.active 
                    ? 'bg-orange-500 text-white border-orange-500 shadow-lg' 
                    : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50 border-transparent hover:border-orange-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-xs font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;