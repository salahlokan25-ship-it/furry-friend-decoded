import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out animation after 2.5 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Complete and hide splash screen after fade out
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#F97316] via-[#FF8C42] to-[#FFA500] transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in">
        {/* Animated Logo */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <div className="w-32 h-32 rounded-3xl bg-white/30"></div>
          </div>
          <div className="relative w-32 h-32 rounded-3xl overflow-hidden bg-white shadow-2xl animate-bounce-slow">
            <img
              src="/app-logo.png"
              alt="PetParadise Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (img.src.indexOf('/app-icon.png') === -1) {
                  img.src = '/app-icon.png';
                }
              }}
            />
          </div>
        </div>

        {/* Animated Title */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-white tracking-tight animate-slide-up">
            PetParadise
          </h1>
          <p className="text-white/90 text-lg font-medium animate-slide-up-delay">
            Your Pet's Best Friend
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex space-x-2 animate-fade-in-delay">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.3s backwards;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.4s backwards;
        }

        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out 0.6s backwards;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
