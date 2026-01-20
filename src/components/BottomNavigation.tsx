import { Home, Plus, GraduationCap, Settings, MessageCircle, Users, Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: "home", icon: Home },
    { id: "training", icon: GraduationCap },
    { id: "memories", icon: Film },
    { id: "album", icon: Plus, isMain: true }, 
    { id: "chat", icon: MessageCircle },
    { id: "community", icon: Users },
    { id: "settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Dark glass background */}
      <div className="absolute inset-0 bg-surface/90 backdrop-blur-2xl border-t border-border/30" />
      
      {/* Content */}
      <div className="relative flex items-center justify-around max-w-lg mx-auto px-4 py-3 safe-area-pb">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          if (tab.isMain) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative -mt-8 group"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-primary/40 blur-xl group-hover:bg-primary/60 transition-all duration-300" />
                
                <div className={cn(
                  "relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                  "bg-gradient-to-br from-primary to-primary-glow shadow-primary",
                  "hover:scale-110 hover:shadow-xl active:scale-95"
                )}>
                  <Icon className="w-7 h-7 text-primary-foreground" strokeWidth={2.5} />
                </div>
              </button>
            );
          }
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group",
                isActive && "bg-primary/15"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary-glow/10" />
              )}
              
              <Icon 
                className={cn(
                  "w-6 h-6 transition-all duration-300 relative z-10",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground group-hover:text-foreground"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              
              {/* Active dot */}
              {isActive && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
