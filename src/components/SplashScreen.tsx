import { useEffect, useState } from "react";
import { PawPrint } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
    const completeTimer = setTimeout(() => onComplete(), 2200);
    
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-teal/5" />
      
      <div className="relative flex flex-col items-center animate-scale-in">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-primary mb-6">
          <PawPrint className="w-12 h-12 text-primary-foreground" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">PetParadise</h1>
        <p className="text-muted-foreground text-sm">Your pet's best companion</p>
        
        <div className="mt-8 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
