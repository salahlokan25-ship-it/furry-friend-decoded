import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PetPlayAnimation from "@/components/PetPlayAnimation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Volume2, Cat, Dog, Crown, Zap } from "lucide-react";
import petLogo from "@/assets/pet-ai-logo.png";
import happyDog from "@/assets/happy-dog.png";
import cuteCat from "@/assets/cute-cat.png";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import PremiumGate from "@/components/PremiumGate";

const TranslatePage = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [translationResult, setTranslationResult] = useState("");
  const [selectedPetType, setSelectedPetType] = useState<"cat" | "dog" | null>(null);
  const { toast } = useToast();
  const { subscribed } = useSubscription();
  const { canUseFeature, incrementUsage, getRemainingUsage } = useUsageTracking();

  const handleRecordingComplete = async (audioData: string) => {
    if (!selectedPetType) {
      toast({
        title: "Select Pet Type",
        description: "Please select whether this is a cat or dog sound first!",
        variant: "destructive",
      });
      return;
    }

    // Check usage limits for free users
    if (!canUseFeature('scan')) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily translation limit. Upgrade to premium for unlimited access!",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Increment usage count
      const canProceed = await incrementUsage('scan');
      if (!canProceed) {
        setIsAnalyzing(false);
        return;
      }

      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use pet translation.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("pet-translate", {
        body: { 
          audio: audioData,
          petType: selectedPetType 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
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
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(translationResult);
      utterance.rate = 0.8;
      utterance.pitch = selectedPetType === "cat" ? 1.3 : 0.8;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';
      
      // Try to use a more natural English voice
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.includes('en') && voice.name.includes('Google')
      ) || voices.find(voice => voice.lang.includes('en-US'));
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-[#18181B] pb-20">
      {/* Header */}
      <div className="bg-[#27272A] shadow-sm border-b border-[#3F3F46]">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/app-logo.png" alt="PetParadise AI" className="w-12 h-12 rounded-lg shadow-sm" />
              <div>
                <h1 className="text-xl font-bold text-white">PetParadise</h1>
                <Badge variant="secondary" className="text-xs bg-[#F97316] text-white">AI Powered</Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-[#F97316]">
              <Volume2 size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Pet Type Selection */}
        <Card className="border border-[#3F3F46] bg-[#27272A] shadow-soft">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-center text-white">Choose Your Pet</h2>
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

        {/* Pet Play Animation */}
        <Card className="border border-[#3F3F46] bg-[#27272A] shadow-soft">
          <CardContent className="p-6">
            <PetPlayAnimation />
          </CardContent>
        </Card>

        {/* Translation Result */}
        {translationResult && (
          <Card className="border border-[#3F3F46] bg-[#27272A] shadow-soft">
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

        {/* Pet Sound Library */}
        <Card className="border border-[#3F3F46] bg-[#27272A] shadow-soft">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-white">Pet Sound Library</h3>
            <p className="text-sm text-[#A1A1AA] mb-4">
              Tap any sound to communicate with your pet
            </p>
            
            {/* Dog Sounds */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Dog size={16} className="text-coral" />
                Dog Sounds
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Happy Bark", sound: "woof woof!" },
                  { label: "Playful Yip", sound: "yip yip yip!" },
                  { label: "Excited Whine", sound: "whiiine whine!" },
                  { label: "Hungry Whimper", sound: "whimper whimper" },
                  { label: "Alert Bark", sound: "WOOF! WOOF!" },
                  { label: "Gentle Ruff", sound: "ruff ruff" },
                  { label: "Howl", sound: "awooooo!" },
                  { label: "Panting Happy", sound: "hah hah hah" },
                  { label: "Sleepy Sigh", sound: "huff... sigh" },
                  { label: "Greeting Bark", sound: "woof woof woof!" },
                  { label: "Attention Whine", sound: "whine whine whine" },
                  { label: "Confused Tilt", sound: "ruff?" },
                  { label: "Protective Growl", sound: "grrrr woof" },
                  { label: "Lap Dog Yap", sound: "yap yap yap!" },
                  { label: "Deep Woof", sound: "WOOF! WOOF!" }
                ].map((sound) => (
                  <Button
                    key={sound.label}
                    variant="outline"
                    className="h-16 flex-col space-y-1 hover:bg-coral/10 text-xs p-2"
                    onClick={() => {
                      try {
                        // Cancel any ongoing speech
                        speechSynthesis.cancel();
                        
                        // Create and configure utterance
                        const utterance = new SpeechSynthesisUtterance(sound.sound);
                        utterance.rate = 1.2;
                        utterance.pitch = 0.7;
                        utterance.volume = 0.8;
                        utterance.lang = 'en-US';
                        
                        // Try to use a more natural English voice
                        const voices = speechSynthesis.getVoices();
                        const englishVoice = voices.find(voice => 
                          voice.lang.includes('en') && voice.name.includes('Google')
                        ) || voices.find(voice => voice.lang.includes('en-US'));
                        
                        if (englishVoice) {
                          utterance.voice = englishVoice;
                        }
                        
                        // Play the sound
                        speechSynthesis.speak(utterance);
                      } catch (error) {
                        console.error('Speech synthesis error:', error);
                        // Fallback: show toast with the sound text
                        toast({
                          title: "Dog Sound",
                          description: sound.sound,
                        });
                      }
                    }}
                  >
                    <Dog size={14} className="text-coral" />
                    <span className="leading-tight">{sound.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Interactive Pet Games */}
            <div className="my-8 p-4 bg-[#1F1F22] rounded-lg border border-[#3F3F46]">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2 justify-center">
                🎮 Interactive Pet Games
              </h4>
              <p className="text-xs text-muted-foreground text-center mb-4">
                Fun games to play with your pets using sounds and interactions
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 hover:bg-primary/10 bg-gradient-to-br from-coral/10 to-coral/5"
                  onClick={() => {
                    const sounds = ["woof woof!", "meow meow!", "chirp chirp!", "ruff ruff!"];
                    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
                    
                    try {
                      speechSynthesis.cancel();
                      const utterance = new SpeechSynthesisUtterance(randomSound);
                      utterance.rate = 1.0;
                      utterance.pitch = randomSound.includes("meow") ? 1.3 : 0.8;
                      utterance.volume = 0.8;
                      speechSynthesis.speak(utterance);
                      
                      toast({
                        title: "🎲 Random Sound Game",
                        description: `Playing: "${randomSound}" - See how your pet reacts!`,
                      });
                    } catch (error) {
                      toast({
                        title: "🎲 Random Sound Game",
                        description: randomSound,
                      });
                    }
                  }}
                >
                  <span className="text-lg">🎲</span>
                  <span className="text-xs text-center leading-tight">Random Sound Game</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 hover:bg-secondary/10 bg-gradient-to-br from-teal/10 to-teal/5"
                  onClick={() => {
                    const sequence = ["chirp chirp!", "meow!", "purrrr"];
                    let index = 0;
                    
                    const playSequence = () => {
                      if (index < sequence.length) {
                        try {
                          speechSynthesis.cancel();
                          const utterance = new SpeechSynthesisUtterance(sequence[index]);
                          utterance.rate = 0.9;
                          utterance.pitch = 1.2;
                          utterance.volume = 0.7;
                          speechSynthesis.speak(utterance);
                        } catch (error) {
                          console.error('Speech error:', error);
                        }
                        index++;
                        setTimeout(playSequence, 1500);
                      }
                    };
                    
                    toast({
                      title: "🎵 Call & Response",
                      description: "Playing a sequence for your pet to respond to!",
                    });
                    playSequence();
                  }}
                >
                  <span className="text-lg">🎵</span>
                  <span className="text-xs text-center leading-tight">Call & Response</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 hover:bg-accent/10 bg-gradient-to-br from-purple-100/50 to-purple-50"
                  onClick={() => {
                    const hideAndSeekSounds = [
                      "Where are you? Come find me!",
                      "I'm hiding! Can you find me?",
                      "Peek-a-boo! I see you!"
                    ];
                    const randomPhrase = hideAndSeekSounds[Math.floor(Math.random() * hideAndSeekSounds.length)];
                    
                    try {
                      speechSynthesis.cancel();
                      const utterance = new SpeechSynthesisUtterance(randomPhrase);
                      utterance.rate = 0.8;
                      utterance.pitch = 1.1;
                      utterance.volume = 0.9;
                      speechSynthesis.speak(utterance);
                    } catch (error) {
                      console.error('Speech error:', error);
                    }
                    
                    toast({
                      title: "🙈 Hide & Seek",
                      description: "Try hiding and calling your pet to find you!",
                    });
                  }}
                >
                  <span className="text-lg">🙈</span>
                  <span className="text-xs text-center leading-tight">Hide & Seek</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 hover:bg-green-50 bg-gradient-to-br from-green-100/50 to-green-50"
                  onClick={() => {
                    const commands = [
                      { text: "Sit! Good pet!", type: "command" },
                      { text: "Come here! That's it!", type: "command" },
                      { text: "Stay! Very good!", type: "command" },
                      { text: "woof woof!", type: "reward" },
                      { text: "purrrr purrrr", type: "reward" }
                    ];
                    const randomCommand = commands[Math.floor(Math.random() * commands.length)];
                    
                    try {
                      speechSynthesis.cancel();
                      const utterance = new SpeechSynthesisUtterance(randomCommand.text);
                      utterance.rate = randomCommand.type === "command" ? 0.9 : 1.1;
                      utterance.pitch = randomCommand.type === "command" ? 0.9 : 1.2;
                      utterance.volume = 0.8;
                      speechSynthesis.speak(utterance);
                    } catch (error) {
                      console.error('Speech error:', error);
                    }
                    
                    toast({
                      title: "🎯 Training Game",
                      description: "Practice basic commands with your pet!",
                    });
                  }}
                >
                  <span className="text-lg">🎯</span>
                  <span className="text-xs text-center leading-tight">Training Game</span>
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-[#18181B] rounded-lg border border-[#3F3F46]">
                <p className="text-xs text-[#A1A1AA] text-center">
                  💡 <strong>Tip:</strong> Play these games regularly to strengthen your bond and keep your pets mentally stimulated!
                </p>
              </div>
            </div>

            {/* Cat Sounds */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Cat size={16} className="text-teal" />
                Cat Sounds
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Happy Purr", sound: "purrrr purrrr" },
                  { label: "Meow", sound: "meow meow!" },
                  { label: "Chirp", sound: "chirp chirp!" },
                  { label: "Trill", sound: "prrrrow!" },
                  { label: "Hungry Mew", sound: "mew mew mew" },
                  { label: "Loud Meow", sound: "MEOW! MEOW!" },
                  { label: "Question Meow", sound: "meow?" },
                  { label: "Chatty Trill", sound: "prrrr-ow prrrr-ow!" },
                  { label: "Sleepy Purr", sound: "purrrr... purrrr..." },
                  { label: "Kitten Mew", sound: "mew mew mew!" },
                  { label: "Greeting Chirp", sound: "chirp! prrrrow!" },
                  { label: "Annoyed Meow", sound: "mrow! mrow!" },
                  { label: "Gentle Purr", sound: "purr purr purr" },
                  { label: "Demanding Yowl", sound: "yowwwwl!" },
                  { label: "Content Purr", sound: "purrrrrr..." }
                ].map((sound) => (
                  <Button
                    key={sound.label}
                    variant="outline"
                    className="h-16 flex-col space-y-1 hover:bg-teal/10 text-xs p-2"
                    onClick={() => {
                      try {
                        // Cancel any ongoing speech
                        speechSynthesis.cancel();
                        
                        // Create and configure utterance
                        const utterance = new SpeechSynthesisUtterance(sound.sound);
                        utterance.rate = 0.9;
                        utterance.pitch = 1.4;
                        utterance.volume = 0.7;
                        utterance.lang = 'en-US';
                        
                        // Try to use a more natural English voice
                        const voices = speechSynthesis.getVoices();
                        const englishVoice = voices.find(voice => 
                          voice.lang.includes('en') && voice.name.includes('Google')
                        ) || voices.find(voice => voice.lang.includes('en-US'));
                        
                        if (englishVoice) {
                          utterance.voice = englishVoice;
                        }
                        
                        // Play the sound
                        speechSynthesis.speak(utterance);
                      } catch (error) {
                        console.error('Speech synthesis error:', error);
                        // Fallback: show toast with the sound text
                        toast({
                          title: "Cat Sound",
                          description: sound.sound,
                        });
                      }
                    }}
                  >
                    <Cat size={14} className="text-teal" />
                    <span className="leading-tight">{sound.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pet Mood Interpreter */}
        <Card className="border border-[#3F3F46] bg-[#27272A] shadow-soft">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-white">🎭 Pet Mood Interpreter</h3>
            <p className="text-sm text-[#A1A1AA] mb-4">
              Learn to read your pet's emotions and understand what they're feeling
            </p>
            
            {/* Dog Moods */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Dog size={16} className="text-coral" />
                Dog Emotions
              </h4>
              <div className="space-y-3">
                {[
                  { 
                    mood: "Happy & Excited", 
                    emoji: "😄",
                    signs: "Tail wagging, bouncing, panting with relaxed mouth",
                    meaning: "Your dog is joyful and ready to play or interact",
                    color: "bg-green-100 border-green-200"
                  },
                  { 
                    mood: "Anxious & Nervous", 
                    emoji: "😰",
                    signs: "Pacing, whining, trembling, hiding",
                    meaning: "Your dog feels stressed and needs comfort or space",
                    color: "bg-yellow-100 border-yellow-200"
                  },
                  { 
                    mood: "Alert & Curious", 
                    emoji: "🤔",
                    signs: "Ears forward, head tilted, focused stare",
                    meaning: "Your dog is interested and paying attention to something",
                    color: "bg-blue-100 border-blue-200"
                  },
                  { 
                    mood: "Tired & Sleepy", 
                    emoji: "😴",
                    signs: "Yawning, lying down, slow movements",
                    meaning: "Your dog needs rest and a comfortable place to sleep",
                    color: "bg-purple-100 border-purple-200"
                  },
                  { 
                    mood: "Hungry & Begging", 
                    emoji: "🤤",
                    signs: "Staring at food, drooling, pawing at you",
                    meaning: "Your dog wants food or treats",
                    color: "bg-orange-100 border-orange-200"
                  },
                  { 
                    mood: "Guilty & Submissive", 
                    emoji: "😅",
                    signs: "Lowered head, avoiding eye contact, tail between legs",
                    meaning: "Your dog knows they did something wrong",
                    color: "bg-red-100 border-red-200"
                  }
                ].map((mood) => (
                  <div key={mood.mood} className={`p-3 rounded-lg border ${mood.color}`}>
                    <div className="flex items-start space-x-3">
                      <div className="text-xl">{mood.emoji}</div>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm mb-1">{mood.mood}</h5>
                        <p className="text-xs text-muted-foreground mb-1"><strong>Signs:</strong> {mood.signs}</p>
                        <p className="text-xs text-foreground">{mood.meaning}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cat Moods */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Cat size={16} className="text-teal" />
                Cat Emotions
              </h4>
              <div className="space-y-3">
                {[
                  { 
                    mood: "Content & Relaxed", 
                    emoji: "😌",
                    signs: "Slow blinking, purring, kneading with paws",
                    meaning: "Your cat feels safe, loved, and comfortable",
                    color: "bg-green-100 border-green-200"
                  },
                  { 
                    mood: "Playful & Energetic", 
                    emoji: "😸",
                    signs: "Pouncing, running, dilated pupils, chirping",
                    meaning: "Your cat wants to play and has lots of energy",
                    color: "bg-blue-100 border-blue-200"
                  },
                  { 
                    mood: "Scared & Defensive", 
                    emoji: "😿",
                    signs: "Hissing, arched back, flattened ears, hiding",
                    meaning: "Your cat feels threatened and needs space to calm down",
                    color: "bg-red-100 border-red-200"
                  },
                  { 
                    mood: "Curious & Investigating", 
                    emoji: "🧐",
                    signs: "Sniffing, slow approach, ears forward, tail up",
                    meaning: "Your cat is interested in exploring something new",
                    color: "bg-purple-100 border-purple-200"
                  },
                  { 
                    mood: "Hungry & Demanding", 
                    emoji: "😋",
                    signs: "Meowing loudly, following you, rubbing against legs",
                    meaning: "Your cat wants food and is asking for your attention",
                    color: "bg-orange-100 border-orange-200"
                  },
                  { 
                    mood: "Annoyed & Overstimulated", 
                    emoji: "😤",
                    signs: "Tail twitching, ears back, swatting, quick movements",
                    meaning: "Your cat needs a break from interaction or stimulation",
                    color: "bg-yellow-100 border-yellow-200"
                  }
                ].map((mood) => (
                  <div key={mood.mood} className={`p-3 rounded-lg border ${mood.color}`}>
                    <div className="flex items-start space-x-3">
                      <div className="text-xl">{mood.emoji}</div>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm mb-1">{mood.mood}</h5>
                        <p className="text-xs text-muted-foreground mb-1"><strong>Signs:</strong> {mood.signs}</p>
                        <p className="text-xs text-foreground">{mood.meaning}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1F1F22] p-4 rounded-lg border border-[#3F3F46]">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                💡 Pro Tip
              </h4>
              <p className="text-xs text-[#A1A1AA]">
                Understanding your pet's moods helps you respond appropriately to their needs and strengthens your bond. 
                Use this guide alongside the sound translator for better communication!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pet Food Guide */}
        <Card className="border border-[#3F3F46] bg-[#27272A] shadow-soft">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-white">Pet Food Guide</h3>
            <p className="text-sm text-[#A1A1AA] mb-4">
              Discover the best foods for your furry friend
            </p>
            
            {/* Dog Foods */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Dog size={16} className="text-coral" />
                Dog Foods
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { 
                    name: "Premium Dry Kibble", 
                    image: "🥘",
                    description: "Balanced nutrition for daily meals",
                    benefits: "Complete protein, vitamins & minerals"
                  },
                  { 
                    name: "Wet Canned Food", 
                    image: "🥫",
                    description: "High moisture content for hydration",
                    benefits: "Easy to digest, great for seniors"
                  },
                  { 
                    name: "Raw Diet Mix", 
                    image: "🥩",
                    description: "Natural raw food blend",
                    benefits: "High protein, natural enzymes"
                  },
                  { 
                    name: "Training Treats", 
                    image: "🦴",
                    description: "Small rewards for good behavior",
                    benefits: "Motivation, bonding, skills building"
                  },
                  { 
                    name: "Dental Chews", 
                    image: "🦷",
                    description: "Promotes oral health",
                    benefits: "Cleans teeth, fresh breath"
                  },
                  { 
                    name: "Puppy Formula", 
                    image: "🍼",
                    description: "Specially formulated for growing pups",
                    benefits: "Growth support, brain development"
                  },
                  { 
                    name: "Senior Dog Food", 
                    image: "👴",
                    description: "Gentle nutrition for older dogs",
                    benefits: "Joint support, easy digestion"
                  },
                  { 
                    name: "Grain-Free Option", 
                    image: "🌾",
                    description: "For dogs with grain sensitivities",
                    benefits: "Reduces allergies, better digestion"
                  }
                ].map((food) => (
                  <Card key={food.name} className="p-4 hover:bg-coral/5 transition-colors cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{food.image}</div>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm mb-1">{food.name}</h5>
                        <p className="text-xs text-muted-foreground mb-2">{food.description}</p>
                        <Badge variant="secondary" className="text-xs">{food.benefits}</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Cat Foods */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Cat size={16} className="text-teal" />
                Cat Foods
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { 
                    name: "Premium Cat Kibble", 
                    image: "🥣",
                    description: "Complete nutrition for adult cats",
                    benefits: "Balanced protein, healthy coat"
                  },
                  { 
                    name: "Wet Pâté", 
                    image: "🍖",
                    description: "Rich, smooth textured meals",
                    benefits: "High moisture, irresistible taste"
                  },
                  { 
                    name: "Fish-Based Diet", 
                    image: "🐟",
                    description: "Ocean-fresh protein source",
                    benefits: "Omega-3, brain health"
                  },
                  { 
                    name: "Freeze-Dried Treats", 
                    image: "❄️",
                    description: "Pure protein snacks",
                    benefits: "Training rewards, natural flavor"
                  },
                  { 
                    name: "Hairball Control", 
                    image: "🧼",
                    description: "Helps reduce hairball formation",
                    benefits: "Digestive health, fiber blend"
                  },
                  { 
                    name: "Kitten Formula", 
                    image: "🐱",
                    description: "Growth nutrition for kittens",
                    benefits: "Brain development, immune support"
                  },
                  { 
                    name: "Indoor Cat Food", 
                    image: "🏠",
                    description: "Tailored for indoor lifestyle",
                    benefits: "Weight control, less odor"
                  },
                  { 
                    name: "Sensitive Stomach", 
                    image: "💚",
                    description: "Gentle formula for sensitive cats",
                    benefits: "Easy digestion, limited ingredients"
                  }
                ].map((food) => (
                  <Card key={food.name} className="p-4 hover:bg-teal/5 transition-colors cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{food.image}</div>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm mb-1">{food.name}</h5>
                        <p className="text-xs text-muted-foreground mb-2">{food.description}</p>
                        <Badge variant="secondary" className="text-xs">{food.benefits}</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TranslatePage;