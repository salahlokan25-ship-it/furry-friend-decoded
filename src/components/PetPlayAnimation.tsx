import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import cuteCat from "@/assets/cute-cat.png";
import happyDog from "@/assets/happy-dog.png";

const PetPlayAnimation = () => {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl overflow-hidden border border-green-200/50 dark:border-green-700/50">
      {/* Grass ground */}
      <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-green-200 to-green-100 dark:from-green-800/50 dark:to-green-700/30"></div>
      
      {/* Floating hearts */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-red-400 animate-bounce"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + (i % 2) * 20}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s'
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      {/* Sun */}
      <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-yellow-300 shadow-lg animate-pulse">
        <div className="absolute inset-2 rounded-full bg-yellow-200"></div>
      </div>

      {/* Cat Animation */}
      <div 
        className={cn(
          "absolute transition-all duration-1000 ease-in-out",
          animationPhase === 0 && "bottom-12 left-8 transform rotate-0",
          animationPhase === 1 && "bottom-20 left-1/4 transform -rotate-12 scale-110",
          animationPhase === 2 && "bottom-12 left-1/3 transform rotate-12",
          animationPhase === 3 && "bottom-16 left-1/6 transform -rotate-6 scale-105"
        )}
      >
        <img 
          src={cuteCat} 
          alt="Playing Cat" 
          className={cn(
            "w-16 h-16 transition-transform duration-500",
            animationPhase === 1 && "animate-bounce"
          )}
        />
        {/* Cat's meow bubble */}
        {animationPhase === 2 && (
          <div className="absolute -top-8 -right-2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs border shadow-sm animate-fade-in">
            Meow! 🐾
          </div>
        )}
      </div>

      {/* Dog Animation */}
      <div 
        className={cn(
          "absolute transition-all duration-1000 ease-in-out",
          animationPhase === 0 && "bottom-12 right-8 transform rotate-0",
          animationPhase === 1 && "bottom-12 right-1/3 transform rotate-12",
          animationPhase === 2 && "bottom-20 right-1/4 transform -rotate-12 scale-110",
          animationPhase === 3 && "bottom-16 right-1/6 transform rotate-6 scale-105"
        )}
      >
        <img 
          src={happyDog} 
          alt="Playing Dog" 
          className={cn(
            "w-16 h-16 transition-transform duration-500",
            animationPhase === 2 && "animate-bounce"
          )}
        />
        {/* Dog's woof bubble */}
        {animationPhase === 0 && (
          <div className="absolute -top-8 -left-2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs border shadow-sm animate-fade-in">
            Woof! 🐕
          </div>
        )}
      </div>

      {/* Ball Animation */}
      <div 
        className={cn(
          "absolute w-6 h-6 bg-gradient-to-br from-red-400 to-red-500 rounded-full shadow-md transition-all duration-1000 ease-in-out",
          animationPhase === 0 && "bottom-16 left-1/2 transform -translate-x-1/2",
          animationPhase === 1 && "bottom-24 left-2/3 animate-bounce",
          animationPhase === 2 && "bottom-16 right-1/3",
          animationPhase === 3 && "bottom-20 left-1/2 transform -translate-x-1/2 animate-pulse"
        )}
      >
        <div className="absolute inset-1 bg-red-300 rounded-full"></div>
      </div>

      {/* Paw prints trail */}
      <div className="absolute bottom-8 left-12 opacity-30">
        <div className="flex space-x-2">
          {[...Array(6)].map((_, i) => (
            <span 
              key={i} 
              className="text-gray-600 dark:text-gray-400 animate-fade-in"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              🐾
            </span>
          ))}
        </div>
      </div>

      {/* Play message */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md animate-pulse">
          <p className="text-sm font-medium text-center text-gray-700 dark:text-gray-300">
            🎾 Best Friends Playing Together! 🎾
          </p>
        </div>
      </div>
    </div>
  );
};

export default PetPlayAnimation;