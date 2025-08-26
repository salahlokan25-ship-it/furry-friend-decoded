import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete: (audioData: string) => void;
  isAnalyzing: boolean;
}

const VoiceRecorder = ({ onRecordingComplete, isAnalyzing }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const audioData = base64String.split(',')[1];
          onRecordingComplete(audioData);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Please allow microphone access to record your pet's voice.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <Button
          size="lg"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isAnalyzing}
          className={cn(
            "w-24 h-24 rounded-full transition-all duration-300 transform",
            "shadow-lg hover:shadow-xl",
            isRecording 
              ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse scale-110" 
              : "bg-gradient-to-br from-primary to-primary/80 hover:scale-105",
            isAnalyzing && "opacity-50 cursor-not-allowed"
          )}
        >
          {isRecording ? (
            <MicOff size={32} className="text-white" />
          ) : (
            <Mic size={32} className="text-white" />
          )}
        </Button>
        
        {isRecording && (
          <div className="absolute -inset-2 rounded-full border-4 border-red-400 animate-ping opacity-75" />
        )}
      </div>

      <div className="text-center">
        {isRecording ? (
          <div className="space-y-2">
            <p className="text-lg font-semibold text-red-600">Recording...</p>
            <p className="text-2xl font-mono text-primary">{formatTime(recordingTime)}</p>
            <p className="text-sm text-muted-foreground">Tap to stop</p>
          </div>
        ) : isAnalyzing ? (
          <div className="space-y-2">
            <p className="text-lg font-semibold text-primary">Analyzing...</p>
            <p className="text-sm text-muted-foreground">Understanding your pet's voice</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Hold to Record</p>
            <p className="text-sm text-muted-foreground">Let your pet make some sounds!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;