import { useState } from "react";
import { Home, Plus, GraduationCap, Settings, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: "translate", icon: Home, label: "Home" },
    { id: "training", icon: GraduationCap, label: "Training" },
    { id: "album", icon: Plus, label: "Album" }, 
    { id: "chat", icon: MessageCircle, label: "Chat" },
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
                "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200",
                tab.id === "album"
                  ? "bg-white text-orange-500 scale-110 hover:bg-orange-50"
                  : isActive 
                    ? "text-white scale-110 bg-white/20 backdrop-blur-sm" 
                    : "text-orange-100 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  "transition-all duration-200",
                  tab.id === "album" ? "stroke-[3]" : "",
                  isActive && "drop-shadow-sm"
                )} 
              />
              <span className={cn(
                "text-xs mt-1 font-medium transition-all duration-200",
                tab.id === "album"
                  ? "text-orange-500 font-semibold"
                  : isActive 
                    ? "text-white font-semibold"
                    : "text-orange-100"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;