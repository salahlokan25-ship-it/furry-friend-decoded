import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import TranslatePage from "@/pages/TranslatePage";
import AlbumPage from "@/pages/AlbumPage";
import TrainingPage from "@/pages/TrainingPage";
import ChatPage from "@/pages/ChatPage";
import SettingsPage from "@/pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => {
  const [activeTab, setActiveTab] = useState("translate");

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="relative">
          {renderActivePage()}
          <BottomNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
