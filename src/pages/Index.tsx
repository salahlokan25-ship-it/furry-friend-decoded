import { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Sparkles, 
  Heart, 
  PawPrint,
  Bell,
  Mic,
  X,
  Loader2,
  Utensils,
  Stethoscope,
  TrendingUp,
  ChevronRight,
  Image,
  Plus,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface IndexProps {
  onNavigate?: (tab: string) => void;
}

const Index = ({ onNavigate }: IndexProps) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [aiResults, setAiResults] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aiReports');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [translationResult, setTranslationResult] = useState<string | null>(null);

  // Camera Scan State
  const videoRef = useRef<HTMLVideoElement | null>(null);
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiReports', JSON.stringify(aiResults));
    }
  }, [aiResults]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setCameraError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream as any;
        await videoRef.current.play();
      }
      toast.success("Camera started", { description: "Point at your pet", duration: 2000 });
    } catch (err) {
      setCameraError("Camera access denied. Please enable permissions.");
      toast.error("Camera access denied");
    }
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
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
      setMoodResult(null);
      toast.success("Photo captured");
    }
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
        toast.success("Photo uploaded");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const analyzeMoodFromImage = async () => {
    if (!capturedImage) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const moods = ["Happy & Relaxed", "Alert & Curious", "Playful & Excited", "Calm & Content"];
      const guess = moods[Math.floor(Math.random() * moods.length)];
      setMoodResult(guess);
      setIsAnalyzing(false);
      toast.success(`Mood detected: ${guess}`);
    }, 1800);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        setTimeout(() => {
          const translations = [
            "I'm hungry and want food!",
            "I need to go outside!",
            "I'm happy to see you!",
            "I want to play!",
          ];
          const randomTranslation = translations[Math.floor(Math.random() * translations.length)];
          setTranslationResult(randomTranslation);
          toast.success(`Translation: "${randomTranslation}"`);
        }, 2000);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      toast.success("Recording stopped, analyzing...");
    }
  };

  const handleQuickAction = (action: string) => {
    setActiveModal(action);
    setFormData({});
  };

  const closeModal = () => {
    setActiveModal(null);
    setFormData({});
    setIsProcessing(false);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setTranslationResult(null);
    setIsRecording(false);
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    stopCamera();
    setCapturedImage(null);
    setMoodResult(null);
    setCameraError(null);
  };

  const validateForm = (action: string | null) => {
    if (action === 'feed') {
      const requiredFields = ['petName', 'age', 'breed', 'mealsPerDay', 'activityLevel', 'foodType', 'weight', 'weightGoal'];
      for (const field of requiredFields) {
        if (!formData[field]) {
          toast.error(`Please fill in all required fields`);
          return false;
        }
      }
    } else if (action === 'health') {
      if (!formData.petName || !formData.symptoms) {
        toast.error("Please fill in pet name and symptoms");
        return false;
      }
    } else if (action === 'translator') {
      if (!formData.petName || !formData.petType || !formData.soundType || !audioUrl) {
        toast.error("Please fill all fields and record audio");
        return false;
      }
    }
    return true;
  };

  const handleFormSubmit = async (action: string | null) => {
    if (!validateForm(action)) return;
    setIsProcessing(true);

    try {
      const safeAction = (action === 'feed' || action === 'health' || action === 'translator') ? action : 'feed';
      const report = generateAIReport(safeAction, formData);
      const petName = formData.petName || 'Your Pet';

      const newResult = {
        id: Date.now().toString(),
        type: safeAction,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(),
        petName: petName,
        data: formData,
        report: report
      };

      setAiResults(prev => [newResult, ...prev]);

      if (safeAction === 'translator') {
        sessionStorage.setItem('initialAiPlan', JSON.stringify({
          content: `## Pet Translation for ${petName}\n\n${typeof report === 'string' ? report : report.summary}`,
          timestamp: new Date().toISOString()
        }));
        onNavigate?.('chat');
        setAudioUrl?.(null);
        setAudioBlob?.(null);
        setTranslationResult?.('');
        toast.success("Plan generated! Opening chat...");
      } else {
        setActiveModal(null);
        toast.success("AI Plan generated!");
        setFormData({});
      }
    } catch (err) {
      toast.error('Failed to generate plan. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAIReport = (action: string, data: any) => {
    const reports: Record<string, any> = {
      feed: {
        title: `Feeding Plan for ${data.petName || 'Your Pet'}`,
        summary: `Custom nutrition plan for a ${data.age || 'adult'} ${data.breed || 'pet'} with ${data.activityLevel || 'moderate'} activity`,
        recommendations: [
          `Feed ${data.mealsPerDay || '2'} meals per day`,
          `Recommended food type: ${data.foodType || 'dry kibble'}`,
          `Activity level: ${data.activityLevel || 'moderate'}`,
        ],
        nextSteps: [
          "Monitor weight weekly",
          "Ensure fresh water always available",
          "Schedule regular vet checkups",
        ]
      },
      health: {
        title: `Health Report for ${data.petName || 'Your Pet'}`,
        summary: `Health analysis based on reported symptoms`,
        recommendations: [
          `Urgency: ${data.urgency || 'Routine'} care recommended`,
          data.symptoms ? `Symptoms: ${data.symptoms}` : 'No symptoms reported',
        ],
        nextSteps: [
          data.urgency === 'urgent' ? "Schedule vet within 24-48 hours" : "Routine checkup recommended",
          "Monitor symptoms daily",
        ]
      },
      translator: {
        title: `Translation for ${data.petName || 'Your Pet'}`,
        summary: `AI analyzed your ${data.petType}'s ${data.soundType}`,
        recommendations: [
          `Sound type: ${data.soundType}`,
          "AI confidence: 85-95%",
        ],
        nextSteps: [
          "Continue recording different sounds",
          "Track communication patterns",
        ]
      }
    };
    
    return reports[action] || { title: "AI Analysis Complete", summary: "Analysis completed", recommendations: [], nextSteps: [] };
  };

  const deleteReport = (id: string) => {
    setAiResults(prev => prev.filter(report => report.id !== id));
    toast.success("Report deleted");
  };

  const quickActions = [
    { id: 'translator', icon: Mic, label: 'Translator', description: 'Understand your pet', color: 'bg-gradient-to-br from-primary to-primary-glow' },
    { id: 'feed', icon: Utensils, label: 'Feed Planner', description: 'Plan their meals', color: 'bg-gradient-to-br from-accent-teal to-accent-emerald' },
    { id: 'health', icon: Stethoscope, label: 'Health Check', description: 'Monitor vitals', color: 'bg-gradient-to-br from-accent-violet to-accent-rose' },
    { id: 'training', icon: PawPrint, label: 'Training', description: 'Learn new tricks', color: 'bg-gradient-to-br from-warning to-primary' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-primary">
              <PawPrint className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">PetParadise</h1>
              <p className="text-xs text-muted-foreground">Welcome back!</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center hover:bg-muted transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <main className="px-5 py-6 pb-28 space-y-8">
        {/* Pet Status Card */}
        <section className="animate-fade-in">
          <div className="card-elevated overflow-hidden">
            <div className="relative h-48 bg-gradient-to-br from-primary/10 via-accent-teal/10 to-accent-violet/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-3 shadow-primary">
                    <Heart className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Feeling Playful!
                  </Badge>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Your Pets</h2>
                  <p className="text-sm text-muted-foreground mt-1">They're in a great mood today</p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleQuickAction('camera')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Scan Mood
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Quick Actions</h3>
            <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => action.id === 'training' ? onNavigate?.('training') : handleQuickAction(action.id)}
                className="card-interactive p-4 text-left"
              >
                <div className={`w-11 h-11 rounded-xl ${action.color} flex items-center justify-center mb-3 shadow-sm`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">{action.label}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* AI Reports */}
        {aiResults.length > 0 && (
          <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Your AI Plans</h3>
              <Badge variant="secondary" className="text-xs">{aiResults.length} reports</Badge>
            </div>
            <div className="space-y-3">
              {aiResults.slice(0, 3).map((item) => (
                <div key={item.id} className="card-elevated p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">{item.report?.title || 'AI Report'}</span>
                        <Badge variant="outline" className="text-2xs">{item.date}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.report?.summary}</p>
                    </div>
                    <button 
                      onClick={() => deleteReport(item.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Insights */}
        <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Daily Insights</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Health', value: '95%', icon: Heart, color: 'text-success' },
              { label: 'Activity', value: 'High', icon: TrendingUp, color: 'text-primary' },
              { label: 'Mood', value: 'Happy', icon: Sparkles, color: 'text-warning' },
            ].map((stat) => (
              <div key={stat.label} className="card-elevated p-4 text-center">
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modal Dialogs */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-md mx-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {activeModal === 'feed' && 'Feed Planner'}
              {activeModal === 'health' && 'Health Check'}
              {activeModal === 'translator' && 'Pet Translator'}
              {activeModal === 'camera' && 'Mood Scanner'}
            </DialogTitle>
          </DialogHeader>

          {/* Feed Planner Form */}
          {activeModal === 'feed' && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Pet Name *</Label>
                <Input placeholder="Enter name" value={formData.petName || ''} onChange={(e) => setFormData({...formData, petName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Age *</Label>
                  <Select onValueChange={(v) => setFormData({...formData, age: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="puppy">Puppy (0-1y)</SelectItem>
                      <SelectItem value="young">Young (1-3y)</SelectItem>
                      <SelectItem value="adult">Adult (3-7y)</SelectItem>
                      <SelectItem value="senior">Senior (7+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg) *</Label>
                  <Input type="number" placeholder="e.g. 15" value={formData.weight || ''} onChange={(e) => setFormData({...formData, weight: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Breed *</Label>
                <Input placeholder="e.g. Golden Retriever" value={formData.breed || ''} onChange={(e) => setFormData({...formData, breed: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Meals/Day *</Label>
                  <Select onValueChange={(v) => setFormData({...formData, mealsPerDay: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 meal</SelectItem>
                      <SelectItem value="2">2 meals</SelectItem>
                      <SelectItem value="3">3 meals</SelectItem>
                      <SelectItem value="4">4 meals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Activity *</Label>
                  <Select onValueChange={(v) => setFormData({...formData, activityLevel: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Food Type *</Label>
                  <Select onValueChange={(v) => setFormData({...formData, foodType: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dry">Dry Kibble</SelectItem>
                      <SelectItem value="wet">Wet Food</SelectItem>
                      <SelectItem value="raw">Raw Diet</SelectItem>
                      <SelectItem value="mix">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Weight Goal *</Label>
                  <Select onValueChange={(v) => setFormData({...formData, weightGoal: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Lose weight</SelectItem>
                      <SelectItem value="maintain">Maintain</SelectItem>
                      <SelectItem value="gain">Gain weight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Allergies (optional)</Label>
                <Textarea placeholder="List any food allergies" value={formData.allergies || ''} onChange={(e) => setFormData({...formData, allergies: e.target.value})} />
              </div>
              <Button onClick={() => handleFormSubmit('feed')} disabled={isProcessing} className="w-full btn-primary">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Generate Plan
              </Button>
            </div>
          )}

          {/* Health Check Form */}
          {activeModal === 'health' && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Pet Name *</Label>
                <Input placeholder="Enter name" value={formData.petName || ''} onChange={(e) => setFormData({...formData, petName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Symptoms *</Label>
                <Textarea placeholder="Describe symptoms or concerns" value={formData.symptoms || ''} onChange={(e) => setFormData({...formData, symptoms: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Urgency Level</Label>
                <Select onValueChange={(v) => setFormData({...formData, urgency: v})}>
                  <SelectTrigger><SelectValue placeholder="Select urgency" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine Check</SelectItem>
                    <SelectItem value="mild">Mild Concern</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Behavior Changes (optional)</Label>
                <Textarea placeholder="Any changes in behavior?" value={formData.behavior || ''} onChange={(e) => setFormData({...formData, behavior: e.target.value})} />
              </div>
              <Button onClick={() => handleFormSubmit('health')} disabled={isProcessing} className="w-full btn-primary">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Generate Report
              </Button>
            </div>
          )}

          {/* Translator Form */}
          {activeModal === 'translator' && (
            <div className="space-y-4 pt-2">
              <div className="text-center py-4">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${isRecording ? 'bg-destructive animate-pulse' : 'bg-gradient-to-br from-primary to-primary-glow'}`}>
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {isRecording ? "Recording... Tap to stop" : "Tap to start recording"}
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                {!isRecording ? (
                  <Button onClick={startRecording} className="btn-primary">
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button onClick={stopRecording} variant="destructive">
                    Stop Recording
                  </Button>
                )}
              </div>
              {translationResult && (
                <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Translation:</p>
                  <p className="font-semibold text-foreground">"{translationResult}"</p>
                </div>
              )}
              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label>Pet Name *</Label>
                  <Input placeholder="Enter name" value={formData.petName || ''} onChange={(e) => setFormData({...formData, petName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Pet Type *</Label>
                    <Select onValueChange={(v) => setFormData({...formData, petType: v})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sound Type *</Label>
                    <Select onValueChange={(v) => setFormData({...formData, soundType: v})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="barking">Barking</SelectItem>
                        <SelectItem value="meowing">Meowing</SelectItem>
                        <SelectItem value="whining">Whining</SelectItem>
                        <SelectItem value="growling">Growling</SelectItem>
                        <SelectItem value="purring">Purring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleFormSubmit('translator')} disabled={isProcessing || !audioUrl} className="w-full btn-primary">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Generate Translation
              </Button>
            </div>
          )}

          {/* Camera/Mood Scanner */}
          {activeModal === 'camera' && (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl overflow-hidden bg-muted aspect-video">
                {!capturedImage ? (
                  <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                ) : (
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                )}
              </div>
              {cameraError && (
                <p className="text-sm text-destructive text-center">{cameraError}</p>
              )}
              <div className="flex gap-2">
                {!capturedImage ? (
                  <>
                    <Button onClick={capturePhoto} className="flex-1 btn-primary">
                      <Camera className="w-4 h-4 mr-2" />
                      Capture
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1">
                      <Image className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </>
                ) : (
                  <>
                    <Button onClick={() => { setCapturedImage(null); setMoodResult(null); }} variant="outline" className="flex-1">
                      Retake
                    </Button>
                    <Button onClick={analyzeMoodFromImage} disabled={isAnalyzing} className="flex-1 btn-primary">
                      {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Analyze
                    </Button>
                  </>
                )}
              </div>
              {moodResult && (
                <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Detected Mood:</p>
                  <p className="font-semibold text-foreground text-lg">{moodResult}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
