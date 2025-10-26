import { useState } from "react";
import { Home, Plus, GraduationCap, Settings, MessageCircle, Users, Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "training", icon: GraduationCap, label: "Training" },
    { id: "memories", icon: Film, label: "Memories" },
    { id: "album", icon: Plus, label: "Album" }, 
    { id: "chat", icon: MessageCircle, label: "Chat" },
    { id: "community", icon: Users, label: "Community" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 border-t border-orange-400 px-4 py-2 safe-area-pb shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center transition-all duration-200",
                tab.id === "album"
                  ? "relative -mt-6"
                  : isActive 
                    ? "text-white scale-110 bg-white/20 backdrop-blur-sm p-2 rounded-lg" 
                    : "text-orange-100 hover:text-white hover:bg-white/10 p-2 rounded-lg"
              )}
            >
              {tab.id === "album" ? (
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-orange-500 shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors">
                    <Icon size={28} className="text-white stroke-[2.5]" />
                  </div>
                  <span className="text-xs mt-2 font-medium text-orange-100">
                    {tab.label}
                  </span>
                </div>
              ) : (
                <>
                  <Icon 
                    size={20} 
                    className={cn(
                      "transition-all duration-200",
                      isActive && "drop-shadow-sm"
                    )} 
                  />
                  <span className={cn(
                    "text-xs mt-1 font-medium transition-all duration-200",
                    isActive 
                      ? "text-white font-semibold"
                      : "text-orange-100"
                  )}>
                    {tab.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;