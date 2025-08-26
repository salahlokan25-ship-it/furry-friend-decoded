import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VoiceRecorder from "@/components/VoiceRecorder";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Volume2, Cat, Dog } from "lucide-react";
import petLogo from "@/assets/pet-paradise-logo.png";
import happyDog from "@/assets/happy-dog.png";
import cuteCat from "@/assets/cute-cat.png";

const TranslatePage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [translationResult, setTranslationResult] = useState("");
  const [selectedPetType, setSelectedPetType] = useState<"cat" | "dog" | null>(null);
  const { toast } = useToast();

  const handleRecordingComplete = async (audioData: string) => {
    if (!selectedPetType) {
      toast({
        title: "Select Pet Type",
        description: "Please select whether this is a cat or dog sound first!",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("pet-translate", {
        body: { 
          audio: audioData,
          petType: selectedPetType 
        },
      });

      if (error) throw error;

      setTranslationResult(data.translation);
      toast({
        title: "Translation Complete!",
        description: `Your ${selectedPetType} says: "${data.translation.substring(0, 50)}..."`,
      });
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "Translation Failed",
        description: "Sorry, couldn't understand your pet this time. Try again!",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const speakTranslation = () => {
    if (translationResult) {
      const utterance = new SpeechSynthesisUtterance(translationResult);
      utterance.rate = 0.8;
      utterance.pitch = selectedPetType === "cat" ? 1.3 : 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/50 to-orange-50/50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={petLogo} alt="Pet Paradise" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Pet Translator</h1>
                <Badge variant="secondary" className="text-xs">AI Powered</Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-primary">
              <Volume2 size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Pet Type Selection */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-center">Choose Your Pet</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={selectedPetType === "dog" ? "coral" : "outline"}
                className="h-20 flex-col space-y-2"
                onClick={() => setSelectedPetType("dog")}
              >
                <img src={happyDog} alt="Dog" className="w-8 h-8" />
                <span>Dog</span>
              </Button>
              <Button
                variant={selectedPetType === "cat" ? "teal" : "outline"}
                className="h-20 flex-col space-y-2"
                onClick={() => setSelectedPetType("cat")}
              >
                <img src={cuteCat} alt="Cat" className="w-8 h-8" />
                <span>Cat</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Voice Recorder */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-8">
            <VoiceRecorder 
              onRecordingComplete={handleRecordingComplete}
              isAnalyzing={isAnalyzing}
            />
          </CardContent>
        </Card>

        {/* Translation Result */}
        {translationResult && (
          <Card className="border-0 shadow-soft bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {selectedPetType === "cat" ? <Cat size={20} /> : <Dog size={20} />}
                  Your {selectedPetType} says:
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={speakTranslation}
                  className="text-primary hover:bg-primary/10"
                >
                  <Volume2 size={18} />
                </Button>
              </div>
              <p className="text-foreground leading-relaxed text-base">
                "{translationResult}"
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Sounds */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Quick Pet Sounds</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Happy", emoji: "😊" },
                { label: "Hungry", emoji: "🍖" },
                { label: "Playful", emoji: "🎾" },
                { label: "Sleepy", emoji: "😴" },
                { label: "Excited", emoji: "🎉" },
                { label: "Curious", emoji: "🤔" },
              ].map((sound) => (
                <Button
                  key={sound.label}
                  variant="outline"
                  className="h-16 flex-col space-y-1 hover:bg-primary/5"
                >
                  <span className="text-2xl">{sound.emoji}</span>
                  <span className="text-xs">{sound.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TranslatePage;