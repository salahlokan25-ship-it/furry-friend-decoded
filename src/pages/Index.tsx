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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F7] via-white to-[#F5F5F7] relative overflow-hidden">
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
                {activeModal === 'camera' && '📷 Mood Scanner'}
                {activeModal === 'translator' && '🎤 Pet Translator'}
                {activeModal === 'sound-sim' && '🔊 Dog Sound Simulator'}
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
        <header className="bg-white border-b border-gray-200 mb-8 -mx-4 px-4 py-3 sticky top-12 z-10 shadow-sm">
          <img src="/header-design.png" alt="PetParadise Header" className="w-full h-auto" />
        </header>

        {/* AI PetMood Live */}
        <Card className="mb-8 border-0 shadow-lg bg-[#FF6B5A] text-white animate-slide-up rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <div className="bg-[#1A3B5C] text-white px-4 py-2 rounded-xl inline-block mb-3">
                <h3 className="text-lg font-bold">AI PETMOOD LIVE</h3>
              </div>
              <p className="text-white/90 text-base font-medium">Scan your pet's face & sounds</p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-white/30">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <Button 
                size="lg"
                onClick={() => setActiveModal('camera')}
                className="bg-white text-[#FF6B5A] hover:bg-white/90 font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full px-8 py-4 text-base border border-[#FF6B5A]"
              >
                <Camera className="w-5 h-5 mr-2" />
                Scan Mood
              </Button>
            </div>
          </CardContent>
        </Card>


        {/* Pet Translator Voice Audio */}
        <Card className="mb-8 border-0 shadow-lg bg-white animate-slide-up rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-[#FF6B5A]/10 flex items-center justify-center mx-auto mb-4">
                <Mic className="w-10 h-10 text-[#FF6B5A]" />
              </div>
              <div className="bg-[#1A3B5C] text-white px-4 py-2 rounded-xl inline-block mb-4">
                <h3 className="text-lg font-bold">PET TRANSLATOR</h3>
              </div>
              <p className="text-[#333333] text-base font-medium">Record your pet's voice & AI will translate what they want to say</p>
            </div>
            
            {/* Pet and Human Avatars */}
            <div className="flex items-center justify-between mb-8">
              {/* Human Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-[#1A3B5C] flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                <p className="text-[#333333] text-sm mt-3 font-semibold">You</p>
              </div>
              
              {/* Translation Arrow */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#FF6B5A] flex items-center justify-center shadow-lg">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
                <p className="text-[#333333] text-sm mt-2 font-semibold">AI</p>
              </div>
              
              {/* Pet Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-[#FF6B5A] flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🐕</span>
                </div>
                <p className="text-[#333333] text-sm mt-3 font-semibold">Your Pet</p>
              </div>
            </div>

            {/* Audio Waveform Display */}
            {isRecording && (
              <div className="mb-6">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-white/60 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
                <p className="text-white/80 text-xs text-center">Listening to your pet...</p>
              </div>
            )}

            {/* Translation Result */}
            {translationResult && (
              <div className="mb-8 p-6 bg-[#F5F5F7] rounded-2xl border border-[#E8E8E8]">
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="w-6 h-6 text-[#FF6B5A]" />
                  <h4 className="font-bold text-[#1A3B5C] text-base">AI Translation</h4>
                </div>
                <p className="text-[#333333] text-base font-semibold mb-3">"{translationResult}"</p>
                <div className="flex items-center justify-between text-sm text-[#333333]">
                  <span className="font-medium">Confidence: 92%</span>
                  <span className="font-medium">🐕 Dog</span>
                </div>
              </div>
            )}

            {/* Recording Controls */}
            <div className="flex gap-4">
              {!isRecording ? (
                <Button 
                  onClick={startRecording}
                  className="flex-1 bg-[#1A3B5C] text-white hover:bg-[#1A3B5C]/90 font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full py-4 text-base"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button 
                  onClick={stopRecording}
                  className="flex-1 bg-[#FF5252] hover:bg-[#FF5252]/90 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full py-4 text-base"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
              )}
              
              {audioUrl && (
                <Button
                  onClick={playRecording}
                  variant="outline"
                  className="border-[#FF6B5A] text-[#FF6B5A] hover:bg-[#FF6B5A]/10 px-6 py-4 rounded-full"
                >
                  <Play className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-white/90">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">Recording in progress...</span>
                </div>
                <p className="text-white/70 text-xs mt-1">Speak clearly near your pet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Quick Actions */}
        <div className="mb-8">
          <div className="bg-[#1A3B5C] text-white px-4 py-3 rounded-xl inline-block mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-5 h-5" />
              AI QUICK ACTIONS
            </h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[
              { id: "feed", title: "Feed Planner", emoji: "🍖", color: "from-orange-500 to-yellow-500" },
              { id: "health", title: "Health Check", emoji: "🩺", color: "from-green-500 to-emerald-500" },
              { id: "training", title: "Training Chat", emoji: "🐶", color: "from-blue-500 to-indigo-500" },
              { id: "social", title: "Pet Social Feed", emoji: "🌍", color: "from-purple-500 to-pink-500" },
              { id: "vet", title: "Vet Finder", emoji: "📍", color: "from-slate-600 to-slate-700" },
              { id: "translator", title: "Pet Translator", emoji: "🎤", color: "from-pink-500 to-rose-500" },
              { id: "sound-sim", title: "Dog Sound Sim", emoji: "🔊", color: "from-indigo-500 to-purple-500" }
            ].map((action) => (
              <Card 
                key={action.id}
                className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 min-w-[140px] animate-slide-up rounded-2xl"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FF6B5A]/10 flex items-center justify-center mx-auto mb-4 text-3xl">
                    {action.emoji}
                  </div>
                  <h4 className="font-bold text-[#1A3B5C] text-sm mb-4">{action.title}</h4>
                  <Button 
                    onClick={() => handleQuickAction(action.id)}
                    size="sm" 
                    className="w-full bg-[#1A3B5C] hover:bg-[#1A3B5C]/90 text-white font-bold transition-all duration-300 hover:scale-105 text-sm h-10 rounded-full shadow-lg"
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



      </div>
    </div>
  );
};

export default Index;