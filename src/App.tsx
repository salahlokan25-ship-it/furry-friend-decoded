import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import Index from "@/pages/Index";
import TranslatePage from "@/pages/TranslatePage";
import AlbumPage from "@/pages/AlbumPage";
import TrainingPage from "@/pages/TrainingPage";
import MemoriesPage from "@/pages/MemoriesPage";
import ChatPage from "@/pages/ChatPage";
import SettingsPage from "@/pages/SettingsPage";
import CommunityPage from "@/pages/CommunityPage";
import AuthPage from "@/pages/AuthPage";
import OnboardingQuiz, { QuizResults } from "@/components/OnboardingQuiz";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import SplashScreen from "@/components/SplashScreen";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Track auth session
    supabase.auth.getSession().then(({ data }) => {
      setSessionUserId(data.session?.user?.id ?? null);
      // Compute flags at startup
      const onboardingCompleted = localStorage.getItem("petparadise-onboarding-completed");
      const subscriptionSeen = localStorage.getItem("petparadise-subscription-seen");
      setHasCompletedOnboarding(!!onboardingCompleted);
      setShowSubscriptionPlans(!!onboardingCompleted && !subscriptionSeen);
      setIsLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSessionUserId(sess?.user?.id ?? null);
      // Recompute on auth change (e.g., re-login without reload)
      const onboardingCompleted = localStorage.getItem("petparadise-onboarding-completed");
      const subscriptionSeen = localStorage.getItem("petparadise-subscription-seen");
      setHasCompletedOnboarding(!!onboardingCompleted);
      setShowSubscriptionPlans(!!onboardingCompleted && !subscriptionSeen);
      if (sess?.user?.id) setActiveTab("home");
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // Listen for global navigation/auth events
  useEffect(() => {
    const openAuth = () => setActiveTab("auth");
    const onAuthSuccess = (e: any) => {
      const signup = !!e?.detail?.signup;
      const onboardingCompleted = localStorage.getItem("petparadise-onboarding-completed");
      const subscriptionSeen = localStorage.getItem("petparadise-subscription-seen");
      if (signup) {
        // Show quiz next
        setHasCompletedOnboarding(false);
        setShowSubscriptionPlans(false);
        setActiveTab("home");
      } else {
        // Returning login: if quiz done and plans not seen -> show plans
        setHasCompletedOnboarding(!!onboardingCompleted);
        setShowSubscriptionPlans(!!onboardingCompleted && !subscriptionSeen);
        setActiveTab("home");
      }
    };
    window.addEventListener("open-auth", openAuth as any);
    window.addEventListener("auth-success", onAuthSuccess as any);
    return () => {
      window.removeEventListener("open-auth", openAuth as any);
      window.removeEventListener("auth-success", onAuthSuccess as any);
    };
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
      case "home":
        return <Index onNavigate={setActiveTab} />;
      case "translate":
        return <TranslatePage />;
      case "album":
        return <AlbumPage />;
      case "training":
        return <TrainingPage />;
      case "memories":
        return <MemoriesPage />;
      case "chat":
        return <ChatPage />;
      case "community":
        return <CommunityPage />;
      case "auth":
        return <AuthPage onDone={() => setActiveTab("community")} />;
      case "settings":
        return <SettingsPage onNavigate={setActiveTab} />;
      case "subscription":
        return (
          <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 to-blue-50/30 flex items-center justify-center p-4">
            <SubscriptionPlans onComplete={() => setActiveTab("settings")} />
          </div>
        );
      default:
        return <Index onNavigate={setActiveTab} />;
    }
  };

  // Show splash screen on first load
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

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

  // Always require authentication before opening the app
  if (!sessionUserId) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SubscriptionProvider>
            <Toaster />
            <Sonner />
            <AuthPage onDone={() => setActiveTab("home")} />
          </SubscriptionProvider>
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
