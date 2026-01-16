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
    { id: "album", icon: Plus, label: "Album", isMain: true }, 
    { id: "chat", icon: MessageCircle, label: "Chat" },
    { id: "community", icon: Users, label: "Community" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Background with blur */}
      <div className="absolute inset-0 bg-card/95 backdrop-blur-xl border-t border-border/50" />
      
      {/* Content */}
      <div className="relative flex items-center justify-around max-w-lg mx-auto px-2 py-2 safe-area-pb">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          if (tab.isMain) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative -mt-6 group"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                  "bg-gradient-to-br from-primary to-primary-glow shadow-primary",
                  "hover:scale-105 hover:shadow-xl active:scale-95"
                )}>
                  <Icon className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-2xs font-medium text-muted-foreground whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          }
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 min-w-0 group",
                isActive && "bg-primary/10"
              )}
            >
              <div className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                isActive && "bg-primary/10"
              )}>
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground group-hover:text-foreground"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={cn(
                "text-2xs mt-0.5 font-medium transition-colors duration-200 truncate max-w-[48px]",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground group-hover:text-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
