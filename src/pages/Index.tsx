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
  ChevronRight,
  Image,
  Star,
  Zap
} from "lucide-react";
import PetProfileCard from "@/components/PetProfileCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
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
      toast.success("Camera started");
    } catch (err) {
      setCameraError("Camera access denied");
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
      toast.success(`Mood: ${guess}`);
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
        setAudioUrl(URL.createObjectURL(blob));
        setTimeout(() => {
          const translations = ["I'm hungry!", "I want to play!", "I'm happy to see you!", "Let's go outside!"];
          setTranslationResult(translations[Math.floor(Math.random() * translations.length)]);
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
    if (mediaRecorder) mediaRecorder.stop();
    setMediaRecorder(null);
    stopCamera();
    setCapturedImage(null);
    setMoodResult(null);
    setCameraError(null);
  };

  const validateForm = (action: string | null) => {
    if (action === 'feed') {
      if (!formData.petName || !formData.age || !formData.breed || !formData.mealsPerDay || !formData.activityLevel || !formData.foodType || !formData.weight || !formData.weightGoal) {
        toast.error("Please fill all required fields");
        return false;
      }
    } else if (action === 'health') {
      if (!formData.petName || !formData.symptoms) {
        toast.error("Please fill pet name and symptoms");
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
      const newResult = {
        id: Date.now().toString(),
        type: safeAction,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(),
        petName: formData.petName || 'Your Pet',
        data: formData,
        report
      };
      setAiResults(prev => [newResult, ...prev]);
      if (safeAction === 'translator') {
        sessionStorage.setItem('initialAiPlan', JSON.stringify({ content: `## Translation for ${formData.petName}\n\n${report.summary}`, timestamp: new Date().toISOString() }));
        onNavigate?.('chat');
      } else {
        setActiveModal(null);
        toast.success("Plan generated!");
      }
      setFormData({});
    } catch (err) {
      toast.error('Failed to generate plan');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAIReport = (action: string, data: any) => {
    const reports: Record<string, any> = {
      feed: { title: `Feeding Plan for ${data.petName}`, summary: `Custom nutrition plan for ${data.age} ${data.breed} with ${data.activityLevel} activity`, recommendations: [`Feed ${data.mealsPerDay} meals/day`, `Food type: ${data.foodType}`], nextSteps: ["Monitor weight weekly", "Keep fresh water available"] },
      health: { title: `Health Report for ${data.petName}`, summary: `Health analysis based on symptoms`, recommendations: [`Urgency: ${data.urgency || 'Routine'}`, data.symptoms ? `Symptoms: ${data.symptoms}` : ''], nextSteps: ["Schedule vet visit", "Monitor symptoms"] },
      translator: { title: `Translation for ${data.petName}`, summary: `AI analyzed your ${data.petType}'s ${data.soundType}`, recommendations: [`Sound: ${data.soundType}`, "Confidence: 90%"], nextSteps: ["Record more sounds", "Track patterns"] }
    };
    return reports[action] || { title: "AI Analysis", summary: "Complete", recommendations: [], nextSteps: [] };
  };

  const deleteReport = (id: string) => {
    setAiResults(prev => prev.filter(r => r.id !== id));
    toast.success("Report deleted");
  };

  const quickActions = [
    { id: 'translator', icon: Mic, label: 'Translator', description: 'Understand your pet', gradient: 'from-primary to-primary-glow' },
    { id: 'feed', icon: Utensils, label: 'Feed Planner', description: 'Nutrition plans', gradient: 'from-accent-teal to-accent-emerald' },
    { id: 'health', icon: Stethoscope, label: 'Health Check', description: 'Monitor vitals', gradient: 'from-accent-violet to-accent-rose' },
    { id: 'training', icon: PawPrint, label: 'Training', description: 'Learn tricks', gradient: 'from-warning to-primary' },
  ];

  const tips = [
    { title: 'Daily Walk', description: '30 min walk keeps your pet healthy and happy', icon: Sparkles },
    { title: 'Hydration', description: 'Fresh water available at all times', icon: Zap },
    { title: 'Play Time', description: '15 min interactive play daily', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-2xl border-b border-border/40">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-primary">
              <PawPrint className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">PetParadise</h1>
              <p className="text-xs text-muted-foreground">AI Pet Companion</p>
            </div>
          </div>
          <button className="relative w-11 h-11 rounded-xl bg-surface-elevated border border-border/50 flex items-center justify-center hover:bg-muted transition-all duration-200 group">
            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-surface" />
          </button>
        </div>
      </header>

      <main className="px-5 py-6 pb-28 space-y-6">
        {/* Pet Profile Card */}
        <section className="animate-fade-in">
          <PetProfileCard 
            onScanMood={() => handleQuickAction('camera')}
            onEditProfile={() => toast.info("Edit profile coming soon!")}
          />
        </section>

        {/* Quick Actions */}
        <section className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Quick Actions</h3>
            <button className="text-xs text-primary font-medium flex items-center gap-0.5 hover:underline">
              See all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => action.id === 'training' ? onNavigate?.('training') : handleQuickAction(action.id)}
                className="group relative overflow-hidden bg-surface-elevated rounded-2xl p-4 border border-border/40 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-lg active:scale-[0.98]"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3.5 shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="relative font-semibold text-foreground text-sm">{action.label}</h4>
                <p className="relative text-xs text-muted-foreground mt-1">{action.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* AI Reports */}
        {aiResults.length > 0 && (
          <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">Your AI Plans</h3>
              <Badge variant="secondary" className="text-2xs bg-primary/15 text-primary border-primary/25">{aiResults.length}</Badge>
            </div>
            <div className="space-y-2.5">
              {aiResults.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-surface-elevated rounded-2xl p-4 border border-border/40 hover:border-border transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground truncate">{item.report?.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.report?.summary}</p>
                      <p className="text-2xs text-muted-foreground/70 mt-1.5">{item.date} • {item.timestamp}</p>
                    </div>
                    <button onClick={() => deleteReport(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors ml-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tips Section */}
        <section className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Daily Tips</h3>
          </div>
          <div className="space-y-2.5">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-center gap-4 bg-surface-elevated rounded-2xl p-4 border border-border/40 hover:border-border transition-colors group cursor-pointer">
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <tip.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{tip.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
            ))}
          </div>
        </section>

        {/* Weekly Progress */}
        <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-surface-elevated rounded-2xl p-5 border border-border/40">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-foreground">Weekly Progress</h3>
              <Badge className="bg-success/15 text-success border-success/25 text-2xs font-medium">On Track</Badge>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Activity Goals</span>
                  <span className="font-medium text-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2.5 bg-muted/50" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Feeding Schedule</span>
                  <span className="font-medium text-foreground">100%</span>
                </div>
                <Progress value={100} className="h-2.5 bg-muted/50" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Training Sessions</span>
                  <span className="font-medium text-foreground">60%</span>
                </div>
                <Progress value={60} className="h-2.5 bg-muted/50" />
              </div>
            </div>
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
                      <SelectItem value="puppy">Puppy</SelectItem>
                      <SelectItem value="young">Young</SelectItem>
                      <SelectItem value="adult">Adult</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
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
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
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
                      <SelectItem value="dry">Dry</SelectItem>
                      <SelectItem value="wet">Wet</SelectItem>
                      <SelectItem value="raw">Raw</SelectItem>
                      <SelectItem value="mix">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Goal *</Label>
                  <Select onValueChange={(v) => setFormData({...formData, weightGoal: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Lose</SelectItem>
                      <SelectItem value="maintain">Maintain</SelectItem>
                      <SelectItem value="gain">Gain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => handleFormSubmit('feed')} disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90">
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Generate Plan
              </Button>
            </div>
          )}

          {activeModal === 'health' && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Pet Name *</Label>
                <Input placeholder="Enter name" value={formData.petName || ''} onChange={(e) => setFormData({...formData, petName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Symptoms *</Label>
                <Textarea placeholder="Describe symptoms" value={formData.symptoms || ''} onChange={(e) => setFormData({...formData, symptoms: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Urgency</Label>
                <Select onValueChange={(v) => setFormData({...formData, urgency: v})}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => handleFormSubmit('health')} disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90">
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Generate Report
              </Button>
            </div>
          )}

          {activeModal === 'translator' && (
            <div className="space-y-4 pt-2">
              <div className="text-center py-4">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${isRecording ? 'bg-destructive animate-pulse' : 'bg-gradient-to-br from-primary to-primary-glow'}`}>
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">{isRecording ? "Recording... Tap to stop" : "Tap to record"}</p>
              </div>
              <div className="flex gap-2 justify-center">
                {!isRecording ? (
                  <Button onClick={startRecording} className="bg-primary hover:bg-primary/90"><Mic className="w-4 h-4 mr-2" />Start</Button>
                ) : (
                  <Button onClick={stopRecording} variant="destructive">Stop</Button>
                )}
              </div>
              {translationResult && (
                <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Translation:</p>
                  <p className="font-semibold text-foreground">"{translationResult}"</p>
                </div>
              )}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Pet Name *</Label>
                  <Input placeholder="Name" value={formData.petName || ''} onChange={(e) => setFormData({...formData, petName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select onValueChange={(v) => setFormData({...formData, petType: v})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sound *</Label>
                    <Select onValueChange={(v) => setFormData({...formData, soundType: v})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bark">Bark</SelectItem>
                        <SelectItem value="meow">Meow</SelectItem>
                        <SelectItem value="whine">Whine</SelectItem>
                        <SelectItem value="growl">Growl</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleFormSubmit('translator')} disabled={isProcessing || !audioUrl} className="w-full bg-primary hover:bg-primary/90">
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Generate
              </Button>
            </div>
          )}

          {activeModal === 'camera' && (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl overflow-hidden bg-muted aspect-video">
                {!capturedImage ? (
                  <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                ) : (
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                )}
              </div>
              {cameraError && <p className="text-sm text-destructive text-center">{cameraError}</p>}
              <div className="flex gap-2">
                {!capturedImage ? (
                  <>
                    <Button onClick={capturePhoto} className="flex-1 bg-primary hover:bg-primary/90"><Camera className="w-4 h-4 mr-2" />Capture</Button>
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1"><Image className="w-4 h-4 mr-2" />Upload</Button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </>
                ) : (
                  <>
                    <Button onClick={() => { setCapturedImage(null); setMoodResult(null); }} variant="outline" className="flex-1">Retake</Button>
                    <Button onClick={analyzeMoodFromImage} disabled={isAnalyzing} className="flex-1 bg-primary hover:bg-primary/90">
                      {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Analyze
                    </Button>
                  </>
                )}
              </div>
              {moodResult && (
                <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Detected Mood:</p>
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
