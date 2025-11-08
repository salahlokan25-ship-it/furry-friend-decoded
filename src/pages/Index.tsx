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
  Globe,
  Video,
  CheckCircle,
  ArrowRight,
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
  Globe as GlobeIcon,
  Video as VideoIcon,
  AlertTriangle,
  CheckCircle as CheckCircleIcon,
  ArrowRight as ArrowRightIcon,
  Wand2,
  Bot as BotIcon,
  Cpu as CpuIcon,
  ScanLine as ScanLineIcon,
  Smartphone as SmartphoneIcon,
  Wifi as WifiIcon,
  Battery as BatteryIcon,
  Signal as SignalIcon,
  Volume2,
  X as XIcon
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


interface IndexProps {
  onNavigate?: (tab: string) => void;
}

const Index = ({ onNavigate }: IndexProps) => {

  // Modal State
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // AI Results State
  const [aiResults, setAiResults] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aiReports');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showResults, setShowResults] = useState(true);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [translationResult, setTranslationResult] = useState<string | null>(null);

  // Mobile UI State
  const [currentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Camera Scan State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [moodResult, setMoodResult] = useState<string | null>(null);
  useEffect(() => {
    if (activeModal === 'camera') {
      startCamera();
    }
    return () => {
      if (activeModal === 'camera') {
        stopCamera();
      }
    };
  }, [activeModal]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setCameraError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream as any;
        await videoRef.current.play();
      }
      toast.success("📷 Camera Started", { description: "Point your camera at your pet", duration: 2000 });
    } catch (err) {
      setCameraError("Unable to access camera. Please allow camera permissions.");
      toast.error("❌ Camera access denied", { description: "Enable camera permissions to scan mood", duration: 3000 });
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setCapturedImage(dataUrl);
        setMoodResult(null);
        stopCamera();
        toast.success("🖼️ Photo Uploaded", { description: "Ready to analyze mood.", duration: 1500 });
      }
    };
    reader.readAsDataURL(file);
    // reset input value so same file can be re-selected
    e.target.value = '';
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
      setMoodResult(null);
      toast.success("📸 Photo Captured", { description: "Analyzing your pet's mood...", duration: 1500 });
    }
  };

  const analyzeMoodFromImage = async () => {
    if (!capturedImage) return;
    setIsAnalyzing(true);
    // Simulate AI image analysis
    setTimeout(() => {
      const moods = [
        "Happy & Relaxed",
        "Alert & Curious",
        "Playful & Excited",
        "Anxious & Nervous",
        "Tired & Sleepy"
      ];
      const guess = moods[Math.floor(Math.random() * moods.length)];
      setMoodResult(guess);
      setIsAnalyzing(false);
      toast.success("🎯 Mood Detected", { description: `Your pet seems: ${guess}`, duration: 3000 });
    }, 1800);
  };

  // Audio Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Simulate AI translation
        setTimeout(() => {
          const translations = [
            "I'm hungry and want food!",
            "I need to go outside for a walk!",
            "I'm happy to see you!",
            "I want to play with you!",
            "I'm feeling anxious and need comfort!",
            "I heard something outside!",
            "I'm tired and want to rest!",
            "I'm excited and ready for adventure!"
          ];
          const randomTranslation = translations[Math.floor(Math.random() * translations.length)];
          setTranslationResult(randomTranslation);
          
          toast.success("🎉 Translation Complete!", {
            description: `Your pet said: "${randomTranslation}"`,
            duration: 4000
          });
        }, 2000);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
      toast.success("🎤 Recording Started!", {
        description: "Speak clearly near your pet...",
        duration: 2000
      });
    } catch (error) {
      toast.error("❌ Microphone access denied", {
        description: "Please allow microphone access to record audio",
        duration: 3000
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      toast.success("⏹️ Recording Stopped!", {
        description: "AI is analyzing your pet's sounds...",
        duration: 2000
      });
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        console.error('Playback error:', err);
        toast.error("❌ Playback Error", {
          description: "Could not play the recording",
          duration: 2000
        });
      });
      toast.success("🔊 Playing Recording!", {
        description: "Listen to your pet's sounds",
        duration: 2000
      });
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setTranslationResult(null);
    setMediaRecorder(null);
  };

  const handleQuickAction = (action: string) => {
    setActiveModal(action);
    setFormData({});
  };

  // Save AI results to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiReports', JSON.stringify(aiResults));
    }
  }, [aiResults]);

  const validateForm = (action: string | null) => {
    switch (action) {
      case 'feed':
        const requiredFields = [
          { field: 'petName', label: "Pet's name" },
          { field: 'age', label: "Pet's age" },
          { field: 'breed', label: "Pet's breed" },
          { field: 'mealsPerDay', label: "Number of meals per day" },
          { field: 'activityLevel', label: "Activity level" },
          { field: 'foodType', label: "Food type preference" },
          { field: 'weight', label: "Current weight" },
          { field: 'weightGoal', label: "Weight goal" }
        ];

        for (const { field, label } of requiredFields) {
          if (!formData[field]) {
            toast.error(`${label} is required`);
            return false;
          }
        }

        // Validate weight is a positive number
        if (isNaN(parseFloat(formData.weight)) || parseFloat(formData.weight) <= 0) {
          toast.error("Please enter a valid weight");
          return false;
        }
        break;
      case 'translator':
        if (!formData.petName) {
          toast.error("Pet's name is required");
          return false;
        }
        if (!formData.petType) {
          toast.error("Pet type is required");
          return false;
        }
        if (!formData.soundType) {
          toast.error("Sound type is required");
          return false;
        }
        if (!audioUrl) {
          toast.error("Please record your pet's sound first");
          return false;
        }
        break;
      case 'health':
        if (!formData.petName) {
          toast.error("Pet's name is required");
          return false;
        }
        if (!formData.symptoms) {
          toast.error("Please describe your pet's symptoms");
          return false;
        }
        break;
      default:
        if (!formData.petName) {
          toast.error("Pet's name is required");
          return false;
        }
    }
    return true;
  };

  const handleFormSubmit = async (action: string | null) => {
    // Validate form before proceeding
    if (!validateForm(action)) {
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    try {
      const safeAction = (action === 'feed' || action === 'health' || action === 'translator') ? action : 'feed';
      // Generate AI report
      const report = generateAIReport(safeAction, formData);
      const petName = formData.petName || 'Your Pet';

      // Create a new result
      const newResult = {
        id: Date.now().toString(),
        type: safeAction,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(),
        petName: petName,
        data: formData,
        report: report
      };

      // Add to results and save to localStorage
      setAiResults(prev => [newResult, ...prev]);

      if (safeAction === 'translator') {
        const actionTitles = {
          'translator': 'Pet Translation Report',
          'feed': 'Feeding Plan',
          'health': 'Health Check Report'
        };
        const r: any = report;
        const chatMessage = `## ${actionTitles[safeAction as keyof typeof actionTitles]} for ${petName}\n\n` +
          (typeof report === 'string'
            ? report
            : [
                r?.title ? `### ${r.title}` : '',
                r?.summary || '',
                Array.isArray(r?.recommendations) && r.recommendations.length
                  ? `\nRecommendations:\n- ${r.recommendations.join('\n- ')}`
                  : '',
                Array.isArray(r?.mealPlan) && r.mealPlan.length
                  ? `\nMeal Plan:\n- ${r.mealPlan.join('\n- ')}`
                  : '',
                Array.isArray(r?.nextSteps) && r.nextSteps.length
                  ? `\nNext Steps:\n- ${r.nextSteps.join('\n- ')}`
                  : '',
                Array.isArray(r?.additionalTips) && r.additionalTips.length
                  ? `\nTips:\n- ${r.additionalTips.join('\n- ')}`
                  : ''
              ]
                .filter(Boolean)
                .join('\n'));
        sessionStorage.setItem('initialAiPlan', JSON.stringify({
          content: chatMessage,
          timestamp: new Date().toISOString()
        }));
        onNavigate?.('chat');
        setAudioUrl?.(null);
        setAudioBlob?.(null);
        setTranslationResult?.('');
        toast.success("AI Plan Generated! 💬", {
          description: `Navigating to chat with your ${getActionName(safeAction)}...`,
          duration: 3000
        });
      } else {
        setActiveModal(null);
        toast.success("AI Plan Generated! 📊", {
          description: "Your personalized plan is now available below.",
          duration: 3000
        });
        setFormData({});
      }
    } catch (err) {
      console.error('Error generating AI plan:', err ?? '(no error object)');
      toast.error('Failed to generate the AI plan. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionName = (action: string) => {
    switch(action) {
      case 'translator': return 'pet translation';
      case 'feed': return 'feeding plan';
      case 'health': return 'health check';
      default: return 'report';
    }
  };
  
  const deleteReport = (id: string) => {
    setAiResults(prev => prev.filter(report => report.id !== id));
    toast.success("Report Deleted", {
      description: "The report has been removed.",
      duration: 2500
    });
  };

  const generateAIReport = (action: string, data: any) => {
    // Food type recommendations
    const foodTypeMap = {
      'dry': 'high-quality dry kibble',
      'wet': 'wet/canned food',
      'raw': 'raw food diet',
      'homecooked': 'homecooked meals',
      'mix': 'combination of dry and wet food'
    };

    const reports = {
      feed: {
        title: `🍖 ${data.petName || 'Your Pet'}'s Personalized Feeding Plan`,
        summary: `Custom nutrition plan for a ${data.age || 'adult'} ${data.breed || 'pet'} with ${(data.activityLevel || 'moderate')} activity level`,
        recommendations: (() => {
          const weight = parseFloat(data.weight || '0');
          const meals = parseInt(data.mealsPerDay || '2');
          const baseCalories = weight > 0 ? weight * (data.activityLevel === 'low' ? 30 : data.activityLevel === 'moderate' ? 40 : 50) : 0;
          const adjustedCalories = data.weightGoal === 'lose' ? baseCalories * 0.9 : data.weightGoal === 'gain' ? baseCalories * 1.1 : baseCalories;
          const mealCalories = meals > 0 ? Math.round(adjustedCalories / meals) : 0;
          return [
            `🔹 Feed ${meals} meals per day (${mealCalories || '—'} calories per meal)`,
            `🔹 Recommended food type: ${foodTypeMap[data.foodType as keyof typeof foodTypeMap] || 'high-quality dry kibble'}`,
            `🔹 Portion control: ${data.weightGoal === 'lose' ? 'Reduced portions' : data.weightGoal === 'gain' ? 'Increased portions' : 'Maintenance portions'}`,
            `🔹 Activity level: ${(data.activityLevel || 'moderate').toString().charAt(0).toUpperCase() + (data.activityLevel || 'moderate').toString().slice(1)} - adjust food quantity if activity changes significantly`,
            data.allergies ? `🔹 Allergies noted: ${data.allergies}` : '🔹 No known food allergies',
            data.feedingChallenges ? `🔹 Addressing: ${data.feedingChallenges}` : '🔹 No reported feeding challenges'
          ];
        })(),
        mealPlan: (() => {
          const weight = parseFloat(data.weight || '0');
          const meals = parseInt(data.mealsPerDay || '2');
          const baseCalories = weight > 0 ? weight * (data.activityLevel === 'low' ? 30 : data.activityLevel === 'moderate' ? 40 : 50) : 0;
          const adjustedCalories = data.weightGoal === 'lose' ? baseCalories * 0.9 : data.weightGoal === 'gain' ? baseCalories * 1.1 : baseCalories;
          const mealCalories = meals > 0 ? Math.round(adjustedCalories / meals) : 0;
          return [
            `🌅 Morning: ${mealCalories || '—'} calories - ${data.foodType === 'dry' ? '1 cup' : data.foodType === 'wet' ? '1 can' : 'appropriate portion'} of ${data.foodType || 'preferred'} food`,
            meals >= 2 ? `🌇 Afternoon: ${mealCalories || '—'} calories - portioned meal` : '',
            meals >= 3 ? '🌆 Evening: Light snack or food-dispensing toy' : '',
            meals >= 4 ? '🌃 Night: Small portion before bed' : ''
          ].filter(Boolean);
        })(),
        nextSteps: [
          `📊 Monitor weight weekly - target ${data.weightGoal}ing ${data.weightGoal === 'maintain' ? 'current weight' : 'weight'}`,
          '💧 Ensure fresh water is always available',
          '📅 Schedule regular veterinary check-ups',
          '📝 Keep a food diary to track progress and any reactions',
          data.weightGoal !== 'maintain' ? `🎯 Goal: ${data.weightGoal} approximately 1-2% of body weight per week` : ''
        ].filter(Boolean),
        additionalTips: [
          data.treats !== 'none' ? `🍪 Treats: ${data.treats} per day (accounting for ~10% of daily calories)` : '🍪 No treats recommended at this time',
          '🥦 Consider adding fresh vegetables as low-calorie treats',
          '⏰ Try to feed at consistent times each day',
          data.activityLevel === 'low' ? '🐕 Consider increasing daily activity to support weight management' : ''
        ].filter(Boolean)
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
      },
      translator: {
        title: "🎤 Pet Translation Report",
        summary: `AI translation analysis for ${data.petName || 'your pet'}`,
        recommendations: [
          `Pet Type: ${data.petType || 'Dog'} sound patterns analyzed`,
          `Sound Type: ${data.soundType || 'Barking'} detected and translated`,
          data.context ? `Context: ${data.context}` : 'No specific context provided',
          "AI confidence level: 85-95% accuracy"
        ],
        nextSteps: [
          "Continue recording different sound types",
          "Track patterns in your pet's communication",
          "Use translations to better understand your pet",
          "Share insights with your veterinarian if needed"
        ]
      },
      'sound-sim': {
        title: "🔊 Dog Sound Simulator Guide",
        summary: `Sound communication strategy for ${data.petName || 'your pet'}`,
        recommendations: [
          `Sound Category: ${data.soundCategory || 'Friendly'} sounds recommended`,
          `Purpose: ${data.purpose || 'General communication'} approach`,
          "Use sounds consistently for best results",
          "Observe your pet's response to different sounds"
        ],
        nextSteps: [
          "Practice with different sound types",
          "Create a sound routine for your pet",
          "Monitor your pet's behavioral responses",
          "Adjust sound selection based on effectiveness"
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
    
    // Clean up audio recording state
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setTranslationResult(null);
    setIsRecording(false);
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    // Clean up camera state
    stopCamera();
    setCapturedImage(null);
    setMoodResult(null);
    setCameraError(null);
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] relative overflow-hidden font-display">
      <div className="flex flex-col gap-2 p-4 pb-24">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDir0XdNKT1G1Uc5LEkIOUxeWWbh7DeAXu8npbUKEXSAQ1NVLPQYrNAkZgwlkEmC_ZaMKFKbNK1O3FSql3RsltSeu7eFVViWFk9WjKN_QttU6HbQsb7ZOwffDa4FsebuVgKLxe_dK3scUxFKCKskR24DjRo9kteljiFIyDfIDMTmpBpr_2akUA5LzVHVZ3PvsxiCkmQBY8LHl0TQsg13a1kfmHiYZEzNNdnDsMv8kMwy0IQqiHyPe6engkFCcO0Qb0qKjCyoLdi4iA')" }}
            />
            <p className="text-white text-base font-bold leading-normal">Buddy & Mittens</p>
          </div>
          <div className="flex w-12 items-center justify-end">
            <button className="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 text-white">
              <Bell className="w-6 h-6" />
            </button>
          </div>
        </div>
        <p className="text-white tracking-tight text-[28px] font-bold leading-tight">Welcome back, Alex</p>
        <div className="p-4 pt-2 -mx-4">
          <div className="flex flex-col rounded-xl bg-[#2C2C2C] overflow-hidden shadow-sm">
            <div className="flex w-full">
              <div
                className="w-1/2 bg-center bg-no-repeat aspect-[2/3] bg-cover"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCZ96MEphmk7JiDRpSSXGUSUHEtDgPWeePyDReBrtwnYeOBP5wHTnA4tZ9zEVhbndq1Wy1aM4CFUsz70tY2W34z1itfgdZq59CjaLnpZm-I9sKXCx5uKjTx7c0VuAjctcZVr_svp32FdKpaCXElEHZe4L9kpJvHqRnpJ2pECe83FcbvAlJQmvd9vGViB1oV5pTPMq3-Q62pY0Jz2HBOxL7neU0ye4ViqlNL0d_mfB6ej_IhUTaCLim2HuBQEZCKouP_tzu92jaD1X0')" }}
              />
              <div
                className="w-1/2 bg-center bg-no-repeat aspect-[2/3] bg-cover"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDkgIAmB0Bnpj68R-2UTVItavahfkseFUvgR5ZsnAYxAnLW4ED3slMXz8VVcNgJq2keDw0rjaAFfYMg28YMkWLwuHK54fp6aU0olXyj8j_FGFLBmUd3-TPI9nExqNd53G3-s2Zlnw3_AbEmL0h4oBjqzy7691MvzsIS3b138PBIjAgc4vurNK0E1HlktKqIYJARlXoj-dqv2kPYXHCEAYyF-CwC2E_QEZURJq9_sr0-7-6TtAHWj3l4FjStfc3dW526Cc4RAIfDuPY')" }}
              />
            </div>
            <div className="flex w-full flex-col gap-2 p-4">
              <p className="text-primary text-sm font-medium leading-normal">Your pets are feeling...</p>
              <p className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">Playful!</p>
              <div className="flex items-end gap-3 justify-between">
                <p className="text-[#AEAEB2] text-base leading-normal">They seem ready for some fun.</p>
                <button
                  onClick={() => handleQuickAction('translator')}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-full h-8 px-4 bg-[#F97316] text-white text-sm font-bold"
                >
                  <span className="truncate">View Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleQuickAction('translator')} className="text-left flex flex-col items-start justify-between gap-4 p-4 rounded-lg bg-[#2C2C2C]">
            <div className="text-[#F97316]"><Mic className="w-6 h-6" /></div>
            <div className="flex flex-col gap-1">
              <h2 className="text-white text-base font-bold leading-tight">Translator</h2>
              <p className="text-[#AEAEB2] text-sm">Understand your pet</p>
            </div>
          </button>
          <button onClick={() => handleQuickAction('feed')} className="text-left flex flex-col items-start justify-between gap-4 p-4 rounded-lg bg-[#2C2C2C]">
            <div className="text-[#F97316]"><Utensils className="w-6 h-6" /></div>
            <div className="flex flex-col gap-1">
              <h2 className="text-white text-base font-bold leading-tight">Feed Planner</h2>
              <p className="text-[#AEAEB2] text-sm">Plan their meals</p>
            </div>
          </button>
          <button onClick={() => handleQuickAction('health')} className="text-left flex flex-col items-start justify-between gap-4 p-4 rounded-lg bg-[#2C2C2C]">
            <div className="text-[#F97316]"><StethoscopeIcon className="w-6 h-6" /></div>
            <div className="flex flex-col gap-1">
              <h2 className="text-white text-base font-bold leading-tight">Health Check</h2>
              <p className="text-[#AEAEB2] text-sm">Scan their vitals</p>
            </div>
          </button>
          <button onClick={() => (onNavigate ? onNavigate('training') : handleQuickAction('training'))} className="text-left flex flex-col items-start justify-between gap-4 p-4 rounded-lg bg-[#2C2C2C]">
            <div className="text-[#F97316]"><PawPrint className="w-6 h-6" /></div>
            <div className="flex flex-col gap-1">
              <h2 className="text-white text-base font-bold leading-tight">Training Hub</h2>
              <p className="text-[#AEAEB2] text-sm">Learn new tricks</p>
            </div>
          </button>
        </div>
        {showResults && aiResults.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-white text-lg font-bold">Your AI Plans</h3>
            <div className="space-y-3">
              {aiResults.map((item) => {
                const r: any = item.report;
                return (
                  <Card key={item.id} className="bg-[#2C2C2C] border-[#3F3F46]">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-base">
                          {r?.title || (item.type === 'feed' ? 'Feeding Plan' : item.type === 'health' ? 'Health Check Report' : 'AI Report')}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{item.date}</Badge>
                          <Button size="sm" variant="outline" onClick={() => deleteReport(item.id)}>Delete</Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-[#D4D4D8] text-sm">{r?.summary}</p>
                      {Array.isArray(r?.recommendations) && r.recommendations.length > 0 && (
                        <div>
                          <p className="text-white text-sm font-semibold">Recommendations</p>
                          <ul className="list-disc list-inside text-[#D4D4D8] text-sm">
                            {r.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(r?.mealPlan) && r.mealPlan.length > 0 && (
                        <div>
                          <p className="text-white text-sm font-semibold">Meal Plan</p>
                          <ul className="list-disc list-inside text-[#D4D4D8] text-sm">
                            {r.mealPlan.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(r?.nextSteps) && r.nextSteps.length > 0 && (
                        <div>
                          <p className="text-white text-sm font-semibold">Next Steps</p>
                          <ul className="list-disc list-inside text-[#D4D4D8] text-sm">
                            {r.nextSteps.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(r?.additionalTips) && r.additionalTips.length > 0 && (
                        <div>
                          <p className="text-white text-sm font-semibold">Tips</p>
                          <ul className="list-disc list-inside text-[#D4D4D8] text-sm">
                            {r.additionalTips.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* AI Quick Action Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#27272A] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#3F3F46]">
              <h3 className="text-lg font-bold text-white">
                {activeModal === 'feed' && '🍖 AI Feed Planner'}
                {activeModal === 'health' && '🩺 AI Health Check'}
                {activeModal === 'training' && '🐶 AI Training Coach'}
                {activeModal === 'social' && '🌍 Pet Social Network'}
                {activeModal === 'vet' && '📍 AI Vet Finder'}
                {activeModal === 'camera' && '📷 Mood Scanner'}
                {activeModal === 'translator' && '🎤 Pet Translator'}
                {activeModal === 'sound-sim' && '🔊 Dog Sound Simulator'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="text-[#A1A1AA] hover:text-white"
              >
                <XIcon className="w-4 h-4" />
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
                      onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Select onValueChange={(value) => setFormData({ ...formData, age: value })}>
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
                        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mealsPerDay">Meals Per Day</Label>
                      <Select onValueChange={(value) => setFormData({ ...formData, mealsPerDay: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select number of meals" />
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
                      <Label htmlFor="activityLevel">Activity Level</Label>
                      <Select onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (mostly indoors)</SelectItem>
                          <SelectItem value="moderate">Moderate (regular walks)</SelectItem>
                          <SelectItem value="high">High (very active)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="foodType">Preferred Food Type</Label>
                      <Select onValueChange={(value) => setFormData({ ...formData, foodType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select food type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dry">Dry Kibble</SelectItem>
                          <SelectItem value="wet">Wet Food</SelectItem>
                          <SelectItem value="raw">Raw Diet</SelectItem>
                          <SelectItem value="homecooked">Homecooked Meals</SelectItem>
                          <SelectItem value="mix">Mix of Above</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="weight">Current Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Enter weight in kg"
                        value={formData.weight || ''}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weightGoal">Weight Goal</Label>
                      <Select onValueChange={(value) => setFormData({ ...formData, weightGoal: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select weight goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maintain">Maintain Current Weight</SelectItem>
                          <SelectItem value="lose">Lose Weight</SelectItem>
                          <SelectItem value="gain">Gain Weight</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="treats">Daily Treats/Snacks</Label>
                      <Select onValueChange={(value) => setFormData({ ...formData, treats: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="How many treats per day?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No treats</SelectItem>
                          <SelectItem value="few">1-2 treats per day</SelectItem>
                          <SelectItem value="moderate">3-5 treats per day</SelectItem>
                          <SelectItem value="many">More than 5 treats per day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="allergies">Known Allergies or Sensitivities</Label>
                    <Textarea
                      id="allergies"
                      placeholder="List any known food allergies or sensitivities"
                      value={formData.allergies || ''}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="feedingChallenges">Any Feeding Challenges?</Label>
                    <Textarea
                      id="feedingChallenges"
                      placeholder="E.g., picky eater, eats too fast, food aggression, etc."
                      value={formData.feedingChallenges || ''}
                      onChange={(e) => setFormData({ ...formData, feedingChallenges: e.target.value })}
                    />
                  </div>
                </div>
              )}
              {activeModal === 'camera' && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    {!capturedImage ? (
                      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
                        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                      </div>
                    ) : (
                      <div className="w-full aspect-video rounded-xl overflow-hidden border">
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {cameraError && (
                      <p className="text-sm text-red-600">{cameraError}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!capturedImage ? (
                      <>
                        <Button onClick={capturePhoto} className="flex-1 bg-[#FF6B5A] text-white">
                          <Camera className="w-4 h-4 mr-2" />
                          Capture
                        </Button>
                        <Button variant="secondary" onClick={startCamera} className="flex-1">
                          <ScanLineIcon className="w-4 h-4 mr-2" />
                          Restart Camera
                        </Button>
                        <Button variant="outline" onClick={triggerUpload} className="flex-1">
                          <Image className="w-4 h-4 mr-2" />
                          Upload Photo
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </>
                    ) : (
                      <>
                        <Button onClick={() => { setCapturedImage(null); setMoodResult(null); }} variant="secondary" className="flex-1">
                          Retake
                        </Button>
                        <Button onClick={analyzeMoodFromImage} disabled={isAnalyzing} className="flex-1 bg-[#1A3B5C] text-white">
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : 'Analyze Mood'}
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="petName">Pet's Name</Label>
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
                      onChange={(e) => setFormData({...formData, breed: e.target.value})}
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

              {activeModal === 'translator' && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#F97316] to-[#FF8C42] flex items-center justify-center mx-auto mb-3">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-white mb-2">Pet Translator</h4>
                    <p className="text-sm text-[#A1A1AA]">Record your pet's sounds and get AI translation</p>
                  </div>
                  
                  {/* Pet Information */}
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
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="soundType">Sound Type</Label>
                    <Select onValueChange={(value) => setFormData({...formData, soundType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="What type of sound?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="barking">Barking</SelectItem>
                        <SelectItem value="meowing">Meowing</SelectItem>
                        <SelectItem value="whining">Whining</SelectItem>
                        <SelectItem value="growling">Growling</SelectItem>
                        <SelectItem value="purring">Purring</SelectItem>
                        <SelectItem value="chirping">Chirping</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="context">Context</Label>
                    <Textarea
                      id="context"
                      placeholder="What was happening when your pet made this sound? (e.g., feeding time, playtime, strangers at door)"
                      value={formData.context || ''}
                      onChange={(e) => setFormData({...formData, context: e.target.value})}
                    />
                  </div>

                  {/* Audio Recording Interface */}
                  <div className="border-2 border-[#F97316] rounded-xl p-4 bg-gradient-to-br from-[#F97316]/20 to-[#FF8C42]/20">
                    <h5 className="font-semibold text-white mb-3 text-center">🎤 Voice Recording</h5>
                    
                    {/* Recording Controls */}
                    <div className="flex gap-2 mb-4">
                      {!isRecording ? (
                        <Button 
                          onClick={startRecording}
                          className="flex-1 bg-gradient-to-r from-[#F97316] to-[#FF8C42] hover:from-[#F97316]/90 hover:to-[#FF8C42]/90 text-white font-bold"
                        >
                          <Mic className="w-4 h-4 mr-2" />
                          Start Recording
                        </Button>
                      ) : (
                        <Button 
                          onClick={stopRecording}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold"
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Stop Recording
                        </Button>
                      )}
                    </div>

                    {/* Recording Status */}
                    {isRecording && (
                      <div className="text-center mb-4">
                        <div className="flex items-center justify-center gap-2 text-red-600">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-semibold">Recording in progress...</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">Speak clearly near your pet</p>
                      </div>
                    )}

                    {/* Audio Playback */}
                    {audioUrl && (
                      <div className="space-y-3">
                        <div className="text-center">
                          <h6 className="font-semibold text-slate-800 text-sm mb-2">📻 Recorded Audio</h6>
                          <div className="flex gap-2 justify-center">
                            <Button
                              onClick={playRecording}
                              size="sm"
                              variant="outline"
                              className="border-[#F97316] text-[#F97316] hover:bg-[#F97316]/10"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Play
                            </Button>
                            <Button
                              onClick={clearRecording}
                              size="sm"
                              variant="outline"
                              className="border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Clear
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Translation Result */}
                    {translationResult && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-200">
                        <h6 className="font-semibold text-green-800 text-sm mb-2">🤖 AI Translation</h6>
                        <p className="text-green-700 text-sm font-medium">"{translationResult}"</p>
                        <p className="text-xs text-green-600 mt-1">Confidence: 92%</p>
                      </div>
                    )}
                  </div>

                  {/* Removed Generate AI Report button as per request */}
                </div>
              )}

              {activeModal === 'sound-sim' && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-3">
                      <Volume2 className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">Dog Sound Simulator</h4>
                    <p className="text-sm text-slate-600">Play different dog sounds to communicate with your pet</p>
                  </div>
                  <div>
                    <Label htmlFor="soundCategory">Sound Category</Label>
                    <Select onValueChange={(value) => setFormData({...formData, soundCategory: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sound category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">Friendly Sounds</SelectItem>
                        <SelectItem value="attention">Attention Seeking</SelectItem>
                        <SelectItem value="playful">Playful Sounds</SelectItem>
                        <SelectItem value="calming">Calming Sounds</SelectItem>
                        <SelectItem value="warning">Warning Sounds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="purpose">Purpose</Label>
                    <Select onValueChange={(value) => setFormData({...formData, purpose: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="What do you want to communicate?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greeting">Friendly Greeting</SelectItem>
                        <SelectItem value="play">Invite to Play</SelectItem>
                        <SelectItem value="calm">Calm Down</SelectItem>
                        <SelectItem value="come">Come Here</SelectItem>
                        <SelectItem value="stop">Stop That</SelectItem>
                        <SelectItem value="comfort">Comfort</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: "Happy Bark", emoji: "🐕", sound: "happy-bark" },
                      { name: "Playful Yip", emoji: "🎾", sound: "playful-yip" },
                      { name: "Calm Whine", emoji: "😌", sound: "calm-whine" },
                      { name: "Attention Bark", emoji: "👀", sound: "attention-bark" }
                    ].map((sound) => (
                      <Button
                        key={sound.sound}
                        variant="outline"
                        className="flex flex-col items-center gap-2 p-3 h-auto border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50"
                        onClick={() => {
                          toast.success(`🔊 Playing ${sound.name}!`, {
                            description: "Your pet should respond to this sound",
                            duration: 2000
                          });
                        }}
                      >
                        <span className="text-2xl">{sound.emoji}</span>
                        <span className="text-xs font-semibold">{sound.name}</span>
                      </Button>
                    ))}
                  </div>
                  <div className="text-center">
                    <Button 
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold"
                      onClick={() => {
                        toast.success("🎵 Playing dog sound sequence!", {
                          description: "Multiple sounds to engage your pet",
                          duration: 3000
                        });
                      }}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Play Sound Sequence
                    </Button>
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

      
    </div>
  );
};

export default Index;