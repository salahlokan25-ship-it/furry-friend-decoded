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
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 safe-area-pb shadow-[0_-2px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around max-w-md mx-auto px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center transition-all duration-300 min-w-0 relative group",
                tab.id === "album"
                  ? "relative -mt-8"
                  : "px-2 py-1.5 rounded-xl"
              )}
            >
              {tab.id === "album" ? (
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-[0_8px_24px_rgba(251,146,60,0.4)] flex items-center justify-center hover:shadow-[0_12px_32px_rgba(251,146,60,0.5)] hover:scale-105 transition-all duration-300">
                    <Icon size={26} className="text-white stroke-[2.5]" />
                  </div>
                  <span className="text-[9px] mt-2 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {tab.label}
                  </span>
                </div>
              ) : (
                <>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl" />
                  )}
                  <Icon 
                    size={20} 
                    className={cn(
                      "transition-all duration-300 relative z-10",
                      isActive 
                        ? "text-orange-600 dark:text-orange-500 scale-110" 
                        : "text-gray-500 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-400"
                    )} 
                  />
                  <span className={cn(
                    "text-[9px] mt-1 font-medium transition-all duration-300 whitespace-nowrap relative z-10",
                    isActive 
                      ? "text-orange-600 dark:text-orange-500 font-semibold"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-400"
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