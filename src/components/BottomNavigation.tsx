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
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 border-t border-orange-400 px-2 py-1.5 safe-area-pb shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center transition-all duration-200 min-w-0",
                tab.id === "album"
                  ? "relative -mt-5"
                  : isActive 
                    ? "text-white scale-105 bg-white/20 backdrop-blur-sm px-1.5 py-1 rounded-lg" 
                    : "text-orange-100 hover:text-white hover:bg-white/10 px-1.5 py-1 rounded-lg"
              )}
            >
              {tab.id === "album" ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-orange-500 shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors">
                    <Icon size={24} className="text-white stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] mt-1.5 font-medium text-orange-100 whitespace-nowrap">
                    {tab.label}
                  </span>
                </div>
              ) : (
                <>
                  <Icon 
                    size={18} 
                    className={cn(
                      "transition-all duration-200",
                      isActive && "drop-shadow-sm"
                    )} 
                  />
                  <span className={cn(
                    "text-[10px] mt-0.5 font-medium transition-all duration-200 whitespace-nowrap",
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