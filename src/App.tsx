import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import TranslatePage from "@/pages/TranslatePage";
import AlbumPage from "@/pages/AlbumPage";
import TrainingPage from "@/pages/TrainingPage";
import ChatPage from "@/pages/ChatPage";
import SettingsPage from "@/pages/SettingsPage";
import OnboardingQuiz, { QuizResults } from "@/components/OnboardingQuiz";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

const queryClient = new QueryClient();

const App = () => {
  const [activeTab, setActiveTab] = useState("translate");
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem("petparadise-onboarding-completed");
    const subscriptionSeen = localStorage.getItem("petparadise-subscription-seen");
    
    if (onboardingCompleted && !subscriptionSeen) {
      setShowSubscriptionPlans(true);
    } else {
      setHasCompletedOnboarding(!!onboardingCompleted);
    }
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = (results: QuizResults) => {
    // Save onboarding completion status
    localStorage.setItem("petparadise-onboarding-completed", "true");
    localStorage.setItem("petparadise-quiz-results", JSON.stringify(results));
    
    // Set active tab based on quiz results
    if (results.primaryGoals?.includes("basic-obedience") || results.experienceLevel === "beginner") {
      setActiveTab("training");
    } else if (results.challenges?.length > 0 && !results.challenges.includes("none")) {
      setActiveTab("chat");
    }
    
    // Show subscription plans after quiz
    setShowSubscriptionPlans(true);
  };

  const handleSubscriptionComplete = () => {
    localStorage.setItem("petparadise-subscription-seen", "true");
    setShowSubscriptionPlans(false);
    setHasCompletedOnboarding(true);
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case "translate":
        return <TranslatePage />;
      case "album":
        return <AlbumPage />;
      case "training":
        return <TrainingPage />;
      case "chat":
        return <ChatPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <TranslatePage />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 to-blue-50/30 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading PetParadise...</p>
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show onboarding quiz for new users
  if (!hasCompletedOnboarding && !showSubscriptionPlans) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SubscriptionProvider>
            <Toaster />
            <Sonner />
            <OnboardingQuiz onComplete={handleOnboardingComplete} />
          </SubscriptionProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show subscription plans after quiz
  if (showSubscriptionPlans) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SubscriptionProvider>
            <Toaster />
            <Sonner />
            <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 to-blue-50/30 flex items-center justify-center p-4">
              <SubscriptionPlans onComplete={handleSubscriptionComplete} />
            </div>
          </SubscriptionProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show main app for returning users
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SubscriptionProvider>
          <Toaster />
          <Sonner />
          <div className="relative">
            {renderActivePage()}
            <BottomNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />
          </div>
        </SubscriptionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
