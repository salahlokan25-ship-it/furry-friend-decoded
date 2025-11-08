import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, CheckCircle } from "lucide-react";

interface QuizProps {
  onComplete: (results: QuizResults) => void;
}

export interface QuizResults {
  petType: "dog" | "cat" | "both";
  experienceLevel: "beginner" | "intermediate" | "experienced";
  primaryGoals: string[];
  petAge: "puppy" | "adult" | "senior";
  challenges: string[];
}

const OnboardingQuiz = ({ onComplete }: QuizProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizResults>>({});

  const questions = [
    {
      id: "petType",
      title: "What type of pet do you have?",
      subtitle: "This helps us personalize your training experience",
      options: [
        { value: "dog", label: "Dog", emoji: "🐕" },
        { value: "cat", label: "Cat", emoji: "🐱" },
        { value: "both", label: "Both Dog & Cat", emoji: "🐕🐱" },
      ],
    },
    {
      id: "experienceLevel", 
      title: "How experienced are you with pet training?",
      subtitle: "We'll recommend courses based on your experience",
      options: [
        { value: "beginner", label: "Beginner", description: "New to pet training" },
        { value: "intermediate", label: "Intermediate", description: "Some training experience" },
        { value: "experienced", label: "Experienced", description: "Confident with training techniques" },
      ],
    },
    {
      id: "petAge",
      title: "What's your pet's life stage?",
      subtitle: "Age-appropriate training is most effective",
      options: [
        { value: "puppy", label: "Puppy/Kitten", description: "Under 1 year old" },
        { value: "adult", label: "Adult", description: "1-7 years old" },
        { value: "senior", label: "Senior", description: "7+ years old" },
      ],
    },
    {
      id: "primaryGoals",
      title: "What are your main training goals?",
      subtitle: "Select all that apply",
      multiple: true,
      options: [
        { value: "basic-obedience", label: "Basic Commands", emoji: "✋" },
        { value: "behavior-issues", label: "Behavior Problems", emoji: "🚫" },
        { value: "socialization", label: "Socialization", emoji: "👥" },
        { value: "tricks", label: "Fun Tricks", emoji: "🎪" },
        { value: "anxiety", label: "Anxiety/Stress", emoji: "😰" },
        { value: "exercise", label: "Physical Exercise", emoji: "🏃" },
      ],
    },
    {
      id: "challenges",
      title: "What challenges are you facing?",
      subtitle: "We'll prioritize courses to help with these issues",
      multiple: true,
      options: [
        { value: "pulling-leash", label: "Leash Pulling", emoji: "🦮" },
        { value: "excessive-barking", label: "Excessive Barking", emoji: "🔊" },
        { value: "jumping", label: "Jumping on People", emoji: "⬆️" },
        { value: "scratching", label: "Scratching Furniture", emoji: "🪑" },
        { value: "litter-box", label: "Litter Box Issues", emoji: "📦" },
        { value: "aggression", label: "Aggression", emoji: "⚠️" },
        { value: "separation", label: "Separation Anxiety", emoji: "💔" },
        { value: "none", label: "No Major Issues", emoji: "✅" },
      ],
    },
  ];

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    if (currentQuestion.multiple) {
      const currentAnswers = answers[currentQuestion.id as keyof QuizResults] as string[] || [];
      let newAnswers: string[];
      
      if (value === "none") {
        newAnswers = currentAnswers.includes("none") ? [] : ["none"];
      } else {
        if (currentAnswers.includes(value)) {
          newAnswers = currentAnswers.filter(a => a !== value);
        } else {
          newAnswers = [...currentAnswers.filter(a => a !== "none"), value];
        }
      }
      
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: newAnswers,
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: value,
      }));
    }
  };

  const canProceed = () => {
    const answer = answers[currentQuestion.id as keyof QuizResults];
    if (currentQuestion.multiple) {
      return Array.isArray(answer) && answer.length > 0;
    }
    return Boolean(answer);
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(answers as QuizResults);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isSelected = (value: string) => {
    const answer = answers[currentQuestion.id as keyof QuizResults];
    if (currentQuestion.multiple) {
      return Array.isArray(answer) && answer.includes(value);
    }
    return answer === value;
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="bg-[#0F172A]/80 backdrop-blur-sm border-b border-[#1F2937]">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-center mb-4">
            <img src="/app-logo.png" alt="PetParadise" className="w-16 h-16 rounded-xl" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/app-icon.png';}} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to PetParadise!</h1>
            <p className="text-[#9CA3AF] text-sm">Let's create a personalized training plan for you</p>
          </div>
          <div className="mt-6">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-2 bg-[#FF7F50] rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-center text-xs text-[#9CA3AF] mt-2">
              Step {currentStep + 1} of {questions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-md mx-auto px-4 py-6">
        <Card className="border border-[#1F2937] bg-[#1F2937] mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2 text-[#FF7F50]">{currentQuestion.title}</h2>
            <p className="text-sm text-[#9CA3AF] mb-6">{currentQuestion.subtitle}</p>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const selected = isSelected(option.value);
                return (
                  <button
                    key={option.value}
                    className={`w-full text-left h-auto p-4 rounded-lg border transition ${
                      selected
                        ? 'bg-[#FF7F50] border-[#FF7F50] text-white'
                        : 'bg-transparent border-gray-700 text-[#E5E7EB] hover:bg-gray-800'
                    }`}
                    onClick={() => handleAnswer(option.value)}
                  >
                    <div className="flex items-center space-x-3">
                      {option.emoji && <span className="text-2xl">{option.emoji}</span>}
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        {option.description && (
                          <div className={`text-sm font-normal ${selected ? 'text-white/90' : 'text-[#9CA3AF]'}`}>
                            {option.description}
                          </div>
                        )}
                      </div>
                      {selected && <CheckCircle className="w-5 h-5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="text-[#9CA3AF]"
          >
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center space-x-2 bg-[#FF7F50] text-white hover:opacity-95"
          >
            <span>{currentStep === questions.length - 1 ? "Complete" : "Next"}</span>
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Skip Option */}
        {currentStep === questions.length - 1 && (
          <div className="text-center mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComplete(answers as QuizResults)}
              className="text-[#9CA3AF]"
            >
              Skip remaining questions
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingQuiz;