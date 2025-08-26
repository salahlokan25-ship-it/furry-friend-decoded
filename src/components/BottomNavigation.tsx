import { useState } from "react";
import { Home, Camera, GraduationCap, Settings, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: "translate", icon: Mic, label: "Translate" },
    { id: "album", icon: Camera, label: "Album" }, 
    { id: "training", icon: GraduationCap, label: "Training" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-pb">
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
                isActive 
                  ? "text-primary scale-110" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  "transition-all duration-200",
                  isActive && "drop-shadow-sm"
                )} 
              />
              <span className={cn(
                "text-xs mt-1 font-medium transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
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