import { Camera, Edit2, Heart, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface PetProfileCardProps {
  onScanMood?: () => void;
  onEditProfile?: () => void;
}

const PetProfileCard = ({ onScanMood, onEditProfile }: PetProfileCardProps) => {
  // Mock pet data - in a real app, this would come from props or a database
  const pet = {
    name: "Luna",
    breed: "Golden Retriever",
    age: "3 years",
    weight: "28 kg",
    photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=face",
    mood: "Happy",
    energy: 85,
    health: 95,
    happiness: 92,
  };

  const statItems = [
    { label: "Energy", value: pet.energy, color: "from-primary to-primary-glow", icon: Zap },
    { label: "Health", value: pet.health, color: "from-success to-accent-emerald", icon: Heart },
    { label: "Happiness", value: pet.happiness, color: "from-warning to-accent-rose", icon: Sparkles },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-elevated via-surface to-surface-elevated border border-border/50">
      {/* Ambient glow effects */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent-violet/15 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-accent-teal/10 rounded-full blur-2xl" />

      <div className="relative p-5">
        {/* Top Section - Photo & Basic Info */}
        <div className="flex gap-4 mb-5">
          {/* Pet Photo */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-primary/30 ring-offset-2 ring-offset-surface shadow-xl">
              <img 
                src={pet.photo} 
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Online/Active indicator */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-success flex items-center justify-center ring-3 ring-surface shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Pet Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1.5">
              <div>
                <h2 className="text-xl font-bold text-foreground">{pet.name}</h2>
                <p className="text-sm text-muted-foreground">{pet.breed}</p>
              </div>
              <button 
                onClick={onEditProfile}
                className="w-8 h-8 rounded-lg bg-surface border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <Badge className="bg-primary/15 text-primary border-primary/25 text-xs font-medium">
                {pet.age}
              </Badge>
              <Badge className="bg-accent-teal/15 text-accent-teal border-accent-teal/25 text-xs font-medium">
                {pet.weight}
              </Badge>
              <Badge className="bg-success/15 text-success border-success/25 text-xs font-medium">
                <Heart className="w-2.5 h-2.5 mr-1" />
                {pet.mood}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-3 mb-5">
          {statItems.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                  <span className="text-xs font-bold text-foreground">{stat.value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${stat.color} transition-all duration-500`}
                    style={{ width: `${stat.value}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            size="sm" 
            onClick={onScanMood}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary font-medium"
          >
            <Camera className="w-4 h-4 mr-2" />
            Scan Mood
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="flex-1 border-border/60 bg-surface-elevated/50 text-foreground hover:bg-muted hover:border-border"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Stats
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PetProfileCard;
