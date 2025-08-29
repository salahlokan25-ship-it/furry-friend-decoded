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
  const [microphoneStatus, setMicrophoneStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Check microphone permissions on component mount
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      // Only check permission status, don't request access yet
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setMicrophoneStatus(permission.state);
      
      permission.addEventListener('change', () => {
        setMicrophoneStatus(permission.state);
      });
    } catch (error) {
      // Permission API not supported, show normal button
      setMicrophoneStatus('unknown');
    }
  };

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
      // Request microphone access with proper constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // If we get here, access was granted
      setMicrophoneStatus('granted');
      
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

    } catch (error: any) {
      console.error('Error accessing microphone:', error);
      setMicrophoneStatus('denied');
      
      let errorMessage = "Please allow microphone access to record your pet's voice.";
      let title = "Microphone Error";
      
      if (error.name === 'NotAllowedError') {
        title = "Microphone Access Required";
        errorMessage = "🎤 Please allow microphone access:\n\n• Click the microphone icon (🎤) in your browser's address bar\n• Select 'Allow' when prompted\n• Or try the button below to request access again";
      } else if (error.name === 'NotFoundError') {
        title = "No Microphone Found";
        errorMessage = "No microphone detected. Please connect a microphone and try again.";
      } else if (error.name === 'NotSupportedError') {
        title = "Microphone Not Supported";
        errorMessage = "Your browser doesn't support microphone recording. Try using Chrome, Firefox, or Safari.";
      } else if (error.name === 'AbortError') {
        title = "Microphone Access Interrupted";
        errorMessage = "Microphone access was interrupted. Please try again.";
      }
      
      toast({
        title,
        description: errorMessage,
        variant: "destructive",
        duration: 10000,
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
        ) : microphoneStatus === 'denied' ? (
          <div className="space-y-3 text-center">
            <p className="text-lg font-semibold text-red-600">🎤 Microphone Access Needed</p>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                To record your pet's voice:
              </p>
              <ol className="text-sm text-red-700 dark:text-red-300 mt-2 text-left space-y-1">
                <li>1. Click the 🎤 icon in your browser's address bar</li>
                <li>2. Select "Allow" for microphone access</li>
                <li>3. Try the button below to request access</li>
              </ol>
            </div>
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={startRecording}
                className="flex-1"
              >
                Try Recording
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Tap to Record</p>
            <p className="text-sm text-muted-foreground">Let your pet make some sounds!</p>
            {microphoneStatus === 'prompt' && (
              <p className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">
                💡 You may be prompted to allow microphone access
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;