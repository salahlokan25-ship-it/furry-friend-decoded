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
  Stethoscope as StethoscopeIcon2,
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
  Signal as SignalIcon,
  Volume2
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
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

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
        const blob = new Blob(chunks, { type: 'audio/wav' });
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
      audio.play();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-[#0c1426] dark:via-[#0c1426] dark:to-[#0c1426] relative overflow-hidden font-[Poppins,sans-serif]">
      {/* AI Quick Action Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#182c50] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
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
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
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
                              Analyzing
                            </>
                          ) : (
                            <>
                              <Brain className="w-4 h-4 mr-2" />
                              Analyze
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                  {moodResult && (
                    <div className="rounded-xl border p-4">
                      <h4 className="font-semibold mb-1">Detected Mood</h4>
                      <p className="text-sm text-foreground">{moodResult}</p>
                    </div>
                  )}
                </div>
              )}
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

              {activeModal === 'translator' && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-3">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">Pet Translator</h4>
                    <p className="text-sm text-slate-600">Record your pet's sounds and get AI translation</p>
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
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="rabbit">Rabbit</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                  <div className="border-2 border-pink-200 rounded-xl p-4 bg-gradient-to-br from-pink-50 to-rose-50">
                    <h5 className="font-semibold text-slate-800 mb-3 text-center">🎤 Voice Recording</h5>
                    
                    {/* Recording Controls */}
                    <div className="flex gap-2 mb-4">
                      {!isRecording ? (
                        <Button 
                          onClick={startRecording}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold"
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
                              className="border-pink-300 text-pink-600 hover:bg-pink-50"
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

                  {/* Submit Button */}
                  <div className="text-center">
                    <Button 
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold"
                      onClick={() => handleFormSubmit('translator')}
                      disabled={!audioUrl}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Generate AI Report
                    </Button>
                  </div>
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


      <div className="container mx-auto px-0 py-0 pb-28 max-w-md">
        
        {/* Header */}
        <header className="p-4 flex items-center justify-between bg-white dark:bg-[#0c1426]">
          <div className="flex items-center space-x-3">
            <img alt="Pet Paradise app logo" className="w-12 h-12 rounded-xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGMsrlcvL6ppCdiRlD3TBAeseSzdf8SGJIzXESXU8EwSvNEBOYRSSt-2FIVlT6rTwt7xkYNItXycZ1ehgZFev-8N8NC8tPx-Gmpg7I7tKU1A9LkQpnugmxO9T6iFtKwsYEJpqBR9oEiYW968K13ml9WvMPjTb63LP8JVRMQmt1XqADxk0Isa2eivS6weyDWVzVVvenHg2Q6PRb1GrjWrkUBY5caBBXDdxTJ8R2M4JU3HggM3_GaiWnqpzq4D0TvjpqGCY-a3deQnc" />
            <div>
              <h1 className="font-bold text-lg text-slate-900 dark:text-white">PetParadise</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">Your AI Pet Companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-[#182c50] rounded-full">
              <Bell className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-blue-500 dark:bg-blue-600 rounded-full">
              <User className="w-5 h-5 text-white" />
            </button>
          </div>
        </header>

        <main className="p-4 space-y-8">
          {/* Hero Section with AI PetMood and Pet Translator */}
          <section className="grid grid-cols-5 gap-4">
            {/* AI PetMood Card - Large */}
            <div className="col-span-3 bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-3xl text-white flex flex-col justify-between h-56 relative overflow-hidden animate-gradient-bg">
              <div>
                <h2 className="text-lg font-bold">AI PetMood</h2>
                <p className="text-xs opacity-80">Live face & sound scan</p>
              </div>
              <button 
                onClick={() => setActiveModal('camera')}
                className="w-full bg-white/20 backdrop-blur-sm text-white font-bold py-3 rounded-full flex items-center justify-center space-x-2 border border-white/30 transition-transform hover:scale-105 active:scale-95"
              >
                <Camera className="w-5 h-5" />
                <span>Scan Now</span>
              </button>
            </div>

            {/* Pet Translator Card - Small */}
            <div 
              onClick={() => setActiveModal('translator')}
              className="col-span-2 bg-slate-900 dark:bg-[#182c50] p-4 rounded-3xl text-white flex flex-col items-center justify-center space-y-4 text-center h-56 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-orange-400/20 rounded-full animate-pulse"></div>
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
                  <Volume2 className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-sm">Pet Translator</h3>
            </div>
          </section>

          {/* AI Quick Actions */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="text-orange-500 dark:text-orange-400 text-2xl" />
              <h2 className="text-base font-bold tracking-wide text-slate-900 dark:text-white">AI Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => handleQuickAction('feed')}
                className="bg-white dark:bg-[#182c50] p-4 rounded-2xl text-center flex flex-col items-center justify-between space-y-3 shadow-lg shadow-blue-100/50 dark:shadow-black/20 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="bg-blue-100 dark:bg-blue-500/10 p-3 rounded-full">
                  <span className="text-3xl">🥥</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Feed Planner</h3>
                <button className="w-full bg-slate-800 dark:bg-slate-700 text-white font-semibold py-2.5 rounded-full text-sm transition-transform hover:scale-105 active:scale-95">Try Now</button>
              </div>

              <div 
                onClick={() => handleQuickAction('health')}
                className="bg-white dark:bg-[#182c50] p-4 rounded-2xl text-center flex flex-col items-center justify-between space-y-3 shadow-lg shadow-blue-100/50 dark:shadow-black/20 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="bg-indigo-100 dark:bg-indigo-500/10 p-3 rounded-full">
                  <span className="text-3xl">🩺</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Health Check</h3>
                <button className="w-full bg-slate-800 dark:bg-slate-700 text-white font-semibold py-2.5 rounded-full text-sm transition-transform hover:scale-105 active:scale-95">Try Now</button>
              </div>

              <div 
                onClick={() => handleQuickAction('training')}
                className="bg-white dark:bg-[#182c50] p-4 rounded-2xl text-center flex flex-col items-center justify-between space-y-3 shadow-lg shadow-blue-100/50 dark:shadow-black/20 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="bg-green-100 dark:bg-green-500/10 p-3 rounded-full">
                  <span className="text-3xl">🎓</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Training</h3>
                <button className="w-full bg-slate-800 dark:bg-slate-700 text-white font-semibold py-2.5 rounded-full text-sm transition-transform hover:scale-105 active:scale-95">Start</button>
              </div>

              <div 
                onClick={() => handleQuickAction('social')}
                className="bg-white dark:bg-[#182c50] p-4 rounded-2xl text-center flex flex-col items-center justify-between space-y-3 shadow-lg shadow-blue-100/50 dark:shadow-black/20 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="bg-rose-100 dark:bg-rose-500/10 p-3 rounded-full">
                  <span className="text-3xl">❤️</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pet Match</h3>
                <button className="w-full bg-slate-800 dark:bg-slate-700 text-white font-semibold py-2.5 rounded-full text-sm transition-transform hover:scale-105 active:scale-95">Discover</button>
              </div>
            </div>
          </section>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/70 dark:bg-[#0c1426]/70 backdrop-blur-xl border-t border-gray-200/80 dark:border-slate-800/80 rounded-t-3xl h-24">
          <div className="flex justify-around items-center h-full px-2">
            <a className="flex flex-col items-center text-center text-blue-500 dark:text-blue-400 space-y-1" href="#">
              <span className="material-symbols-outlined">home</span>
              <span className="text-[10px] font-bold">Home</span>
            </a>
            <a className="flex flex-col items-center text-center text-gray-400 dark:text-gray-500 space-y-1" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('training'); }}>
              <span className="material-symbols-outlined">school</span>
              <span className="text-[10px] font-medium">Training</span>
            </a>
            <a className="flex flex-col items-center text-center text-gray-400 dark:text-gray-500 space-y-1" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('memories'); }}>
              <span className="material-symbols-outlined">photo_library</span>
              <span className="text-[10px] font-medium">Memories</span>
            </a>
            <a className="flex flex-col items-center text-center" href="#" onClick={(e) => { e.preventDefault(); setActiveModal('camera'); }}>
              <div className="w-16 h-16 -translate-y-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/30 dark:shadow-orange-400/20 transition-transform hover:rotate-12 hover:scale-110">
                <ScanLine className="w-8 h-8" />
              </div>
            </a>
            <a className="flex flex-col items-center text-center text-gray-400 dark:text-gray-500 space-y-1" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('chat'); }}>
              <span className="material-symbols-outlined">chat_bubble</span>
              <span className="text-[10px] font-medium">Chat</span>
            </a>
            <a className="flex flex-col items-center text-center text-gray-400 dark:text-gray-500 space-y-1" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('community'); }}>
              <span className="material-symbols-outlined">groups</span>
              <span className="text-[10px] font-medium">Community</span>
            </a>
            <a className="flex flex-col items-center text-center text-gray-400 dark:text-gray-500 space-y-1" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('settings'); }}>
              <span className="material-symbols-outlined">settings</span>
              <span className="text-[10px] font-medium">Settings</span>
            </a>
          </div>
        </nav>



      </div>
    </div>
  );
};

export default Index;