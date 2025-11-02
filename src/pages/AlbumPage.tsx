import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Camera, Heart, Trash2, Upload, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import petLogo from "@/assets/pet-paradise-logo.png";

interface Photo {
  id: string;
  url: string;
  petType: "cat" | "dog";
  timestamp: Date;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  location: "Indoor" | "Outdoor" | "Both";
  benefits: string[];
  instructions: string[];
  tips: string[];
  petTypes: ("cat" | "dog" | "both")[];
}

const AlbumPage = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPetType, setSelectedPetType] = useState<"cat" | "dog" | "all">("all");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activitiesPage, setActivitiesPage] = useState(0);
  const ACTIVITIES_PAGE_SIZE = 6;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load existing photos from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("petparadise-album-photos");
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{ id: string; url: string; petType: "cat" | "dog"; timestamp: string }>;
        const restored = parsed.map(p => ({ ...p, timestamp: new Date(p.timestamp) }));
        setPhotos(restored);
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    setActivitiesPage(0);
  }, [selectedPetType]);

  const savePhotos = (arr: Photo[]) => {
    const serializable = arr.map(p => ({ ...p, timestamp: p.timestamp.toISOString() }));
    localStorage.setItem("petparadise-album-photos", JSON.stringify(serializable));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: Photo = {
            id: Date.now().toString() + Math.random(),
            url: e.target?.result as string,
            petType: selectedPetType === "all" ? "dog" : selectedPetType,
            timestamp: new Date(),
          };
          setPhotos(prev => {
            const next = [newPhoto, ...prev];
            savePhotos(next);
            return next;
          });
          toast({
            title: "Photo Added!",
            description: "Your pet photo has been added to the album.",
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const deletePhoto = (photoId: string) => {
    setPhotos(prev => {
      const next = prev.filter(photo => photo.id !== photoId);
      savePhotos(next);
      return next;
    });
    toast({
      title: "Photo Deleted",
      description: "Photo removed from album.",
    });
  };

  const filteredPhotos = photos.filter(photo => 
    selectedPetType === "all" || photo.petType === selectedPetType
  );

  const activities: Activity[] = [
    {
      id: "beach-walk",
      title: "Beach Walk",
      description: "Perfect sunny day activity for active pets",
      icon: "🏖️",
      duration: "30-60 minutes",
      difficulty: "Easy",
      location: "Outdoor",
      benefits: ["Exercise", "Fresh air", "Socialization", "Mental stimulation"],
      instructions: [
        "Check beach pet policies before visiting",
        "Bring fresh water for your pet",
        "Keep pet on leash if required",
        "Watch for hot sand that could burn paws",
        "Rinse paws after to remove salt and sand"
      ],
      tips: ["Visit during cooler parts of the day", "Bring a towel for cleanup", "Watch for strong currents"],
      petTypes: ["dog"]
    },
    {
      id: "park-playtime",
      title: "Park Playtime",
      description: "Let them run, explore and burn energy",
      icon: "🌳",
      duration: "45-90 minutes",
      difficulty: "Easy",
      location: "Outdoor",
      benefits: ["Physical exercise", "Mental stimulation", "Socialization", "Stress relief"],
      instructions: [
        "Choose a pet-friendly park or off-leash area",
        "Ensure your pet is up to date on vaccinations",
        "Bring water and waste bags",
        "Supervise interactions with other pets",
        "Keep identification tags visible"
      ],
      tips: ["Visit during off-peak hours for shy pets", "Bring favorite toys", "Start with shorter visits"],
      petTypes: ["both"]
    },
    {
      id: "training-session",
      title: "Training Session",
      description: "Practice new tricks and reinforce commands",
      icon: "🎯",
      duration: "15-30 minutes",
      difficulty: "Medium",
      location: "Both",
      benefits: ["Mental stimulation", "Bonding", "Behavior improvement", "Confidence building"],
      instructions: [
        "Choose a quiet, distraction-free environment",
        "Have high-value treats ready",
        "Keep sessions short and positive",
        "End on a successful note",
        "Practice consistently daily"
      ],
      tips: ["Train before meal time for motivation", "Use positive reinforcement only", "Be patient"],
      petTypes: ["both"]
    },
    {
      id: "grooming-time",
      title: "Grooming Session",
      description: "Keep them looking and feeling fresh",
      icon: "✨",
      duration: "20-45 minutes",
      difficulty: "Medium",
      location: "Indoor",
      benefits: ["Health maintenance", "Bonding", "Early problem detection", "Comfort"],
      instructions: [
        "Start with brushing to remove loose fur",
        "Check ears, eyes, and teeth",
        "Trim nails carefully",
        "Bathe only when necessary",
        "Reward calm behavior with treats"
      ],
      tips: ["Start grooming routines early", "Use proper tools", "Take breaks if pet gets stressed"],
      petTypes: ["both"]
    },
    {
      id: "vet-checkup",
      title: "Vet Checkup",
      description: "Regular health monitoring and preventive care",
      icon: "🏥",
      duration: "30-60 minutes",
      difficulty: "Easy",
      location: "Outdoor",
      benefits: ["Health monitoring", "Early disease detection", "Vaccination updates", "Professional advice"],
      instructions: [
        "Schedule regular checkups (annually for young pets, bi-annually for seniors)",
        "Bring vaccination records",
        "List any concerns or behavior changes",
        "Fast your pet if blood work is needed",
        "Bring a list of current medications"
      ],
      tips: ["Bring favorite treats", "Consider carrier training for cats", "Ask about preventive care"],
      petTypes: ["both"]
    },
    {
      id: "playdate",
      title: "Pet Playdate",
      description: "Socialize with other pets and owners",
      icon: "🐕",
      duration: "60-120 minutes",
      difficulty: "Medium",
      location: "Both",
      benefits: ["Socialization", "Exercise", "Mental stimulation", "Owner networking"],
      instructions: [
        "Introduce pets in neutral territory",
        "Supervise all interactions closely",
        "Have exit strategy if conflicts arise",
        "Ensure all pets are vaccinated and healthy",
        "Bring water and cleanup supplies"
      ],
      tips: ["Start with calm, well-socialized pets", "Keep first meetings short", "Watch body language"],
      petTypes: ["both"]
    },
    {
      id: "puzzle-feeding",
      title: "Puzzle Feeding",
      description: "Mental stimulation through food puzzles and games",
      icon: "🧩",
      duration: "15-30 minutes",
      difficulty: "Easy",
      location: "Indoor",
      benefits: ["Mental stimulation", "Slow eating", "Reduced boredom", "Natural foraging behavior"],
      instructions: [
        "Start with easy puzzles and gradually increase difficulty",
        "Use part of regular meal in puzzle feeders",
        "Supervise initially to ensure proper use",
        "Clean puzzles regularly",
        "Rotate different types to maintain interest"
      ],
      tips: ["Make mealtime more engaging", "Perfect for rainy days", "Great for anxious pets"],
      petTypes: ["both"]
    },
    {
      id: "nature-hike",
      title: "Nature Hike",
      description: "Explore trails and natural environments together",
      icon: "🥾",
      duration: "60-180 minutes",
      difficulty: "Hard",
      location: "Outdoor",
      benefits: ["Intense exercise", "Mental stimulation", "Bonding", "Adventure"],
      instructions: [
        "Research pet-friendly trails beforehand",
        "Pack plenty of water for both of you",
        "Check weather conditions",
        "Bring first aid supplies",
        "Keep pet leashed on trails"
      ],
      tips: ["Build up endurance gradually", "Check paws for cuts or thorns", "Avoid hot pavement"],
      petTypes: ["dog"]
    },
    {
      id: "interactive-play",
      title: "Interactive Play Session",
      description: "Engaging play with toys and activities",
      icon: "🎾",
      duration: "20-45 minutes",
      difficulty: "Easy",
      location: "Both",
      benefits: ["Exercise", "Mental stimulation", "Bonding", "Skill development"],
      instructions: [
        "Choose age-appropriate toys",
        "Rotate toys to maintain interest",
        "Let your pet 'win' sometimes",
        "End before pet gets overstimulated",
        "Store toys safely after play"
      ],
      tips: ["Use wand toys for cats", "Try fetch variations for dogs", "Indoor obstacle courses are fun"],
      petTypes: ["both"]
    },
    {
      id: "swimming",
      title: "Swimming Session",
      description: "Low-impact exercise in water environments",
      icon: "🏊",
      duration: "30-60 minutes",
      difficulty: "Hard",
      location: "Outdoor",
      benefits: ["Low-impact exercise", "Joint health", "Cooling down", "Fun adventure"],
      instructions: [
        "Ensure water is clean and safe",
        "Start in shallow water",
        "Never leave pet unattended",
        "Use life jacket for safety if needed",
        "Rinse off chlorine or salt water after"
      ],
      tips: ["Not all pets can swim", "Start young for best results", "Always supervise"],
      petTypes: ["dog"]
    },
    {
      id: "car-ride",
      title: "Car Ride Adventure",
      description: "Explore new places and enjoy the journey",
      icon: "🚗",
      duration: "30-120 minutes",
      difficulty: "Medium",
      location: "Outdoor",
      benefits: ["Mental stimulation", "Socialization", "Adventure", "Bonding"],
      instructions: [
        "Use proper pet restraints or carriers",
        "Never leave pet alone in car",
        "Bring water and comfort items",
        "Take breaks on long trips",
        "Keep windows partially open for airflow"
      ],
      tips: ["Start with short trips", "Bring motion sickness remedies if needed", "Plan pet-friendly stops"],
      petTypes: ["both"]
    },
    {
      id: "agility-course",
      title: "Agility Training",
      description: "Set up obstacle courses for physical and mental challenges",
      icon: "🏃",
      duration: "30-45 minutes",
      difficulty: "Hard",
      location: "Both",
      benefits: ["Physical fitness", "Mental stimulation", "Confidence building", "Skill development"],
      instructions: [
        "Start with simple obstacles",
        "Use positive reinforcement and treats",
        "Build complexity gradually",
        "Ensure all equipment is safe",
        "Keep sessions fun and rewarding"
      ],
      tips: ["DIY obstacles work great", "Perfect for high-energy pets", "Can be done indoors"],
      petTypes: ["both"]
    },
    {
      id: "photo-session",
      title: "Photo Session",
      description: "Capture beautiful memories with your pet",
      icon: "📸",
      duration: "20-40 minutes",
      difficulty: "Medium",
      location: "Both",
      benefits: ["Memory creation", "Bonding", "Social sharing", "Artistic expression"],
      instructions: [
        "Choose good lighting (natural light works best)",
        "Have treats ready for attention",
        "Take lots of shots for best results",
        "Be patient and keep it fun",
        "Try different angles and poses"
      ],
      tips: ["Golden hour lighting is beautiful", "Use burst mode for action shots", "Include props for variety"],
      petTypes: ["both"]
    },
    {
      id: "massage-therapy",
      title: "Pet Massage",
      description: "Relaxing massage for stress relief and bonding",
      icon: "💆",
      duration: "15-30 minutes",
      difficulty: "Easy",
      location: "Indoor",
      benefits: ["Stress relief", "Circulation improvement", "Bonding", "Health monitoring"],
      instructions: [
        "Start with gentle strokes",
        "Pay attention to pet's response",
        "Focus on neck, shoulders, and back",
        "Use slow, circular motions",
        "Stop if pet shows discomfort"
      ],
      tips: ["Perfect for senior pets", "Great for anxious animals", "Can help with arthritis"],
      petTypes: ["both"]
    },
    {
      id: "scent-work",
      title: "Scent Work Games",
      description: "Engage natural hunting instincts with scent-based activities",
      icon: "👃",
      duration: "20-35 minutes",
      difficulty: "Medium",
      location: "Both",
      benefits: ["Mental stimulation", "Natural behavior", "Confidence building", "Focus improvement"],
      instructions: [
        "Hide treats or toys around the area",
        "Start with easy hiding spots",
        "Encourage searching behavior",
        "Reward successful finds immediately",
        "Gradually increase difficulty"
      ],
      tips: ["Use high-value treats", "Perfect for rainy days", "Great for senior pets"],
      petTypes: ["both"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-pink-50/30 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={petLogo} alt="Pet Paradise" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Pet Album</h1>
                <Badge variant="secondary" className="text-xs">{photos.length} Photos</Badge>
              </div>
            </div>
            <Button 
              variant="coral" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus size={16} />
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Pet Type Filter */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex space-x-2">
              {[
                { id: "all", label: "All Pets", emoji: "🐾" },
                { id: "dog", label: "Dogs", emoji: "🐕" },
                { id: "cat", label: "Cats", emoji: "🐱" },
              ].map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedPetType === filter.id ? "coral" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPetType(filter.id as any)}
                  className="flex-1"
                >
                  <span className="mr-1">{filter.emoji}</span>
                  {filter.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upload Area */}
        {photos.length === 0 && (
          <Card className="border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Camera size={40} className="text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-orange-900">No Photos Yet</h3>
              <p className="text-orange-700 mb-4">
                Start building your pet's album by adding some photos!
              </p>
              <Button
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} />
                Upload Photos
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Photo Grid */}
        {filteredPhotos.length > 0 && (
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Your Pet Photos</h3>
              <div className="grid grid-cols-2 gap-3">
                {filteredPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={photo.url}
                        alt="Pet photo"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                      >
                        <Heart size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePhoto(photo.id)}
                        className="text-white hover:bg-red-500/20"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 bg-white/90 text-xs"
                    >
                      {photo.petType === "cat" ? "🐱" : "🐕"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Suggestions */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <span className="mr-2">Activity Suggestions</span>
              <Badge variant="secondary" className="text-xs">{activities.length} Activities</Badge>
            </h3>
            <div className="space-y-3">
              {(() => {
                const list = activities.filter(activity => 
                  selectedPetType === "all" || 
                  activity.petTypes.includes("both") || 
                  activity.petTypes.includes(selectedPetType)
                );
                const totalPages = Math.max(1, Math.ceil(list.length / ACTIVITIES_PAGE_SIZE));
                const clampedPage = Math.min(activitiesPage, totalPages - 1);
                const start = clampedPage * ACTIVITIES_PAGE_SIZE;
                const end = start + ACTIVITIES_PAGE_SIZE;
                const pageItems = list.slice(start, end);
                return pageItems.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className="flex items-center space-x-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 transition-all cursor-pointer border hover:border-primary/20"
                  >
                    <span className="text-3xl">{activity.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold">{activity.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {activity.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          {activity.duration}
                        </span>
                        <span className="flex items-center">
                          <MapPin size={12} className="mr-1" />
                          {activity.location}
                        </span>
                        <span className="flex items-center">
                          <Users size={12} className="mr-1" />
                          {activity.petTypes.includes("both") ? "All Pets" : 
                           activity.petTypes.includes("cat") ? "Cats" : "Dogs"}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </div>
                ));
              })()}
            </div>

            {(() => {
              const list = activities.filter(activity => 
                selectedPetType === "all" || 
                activity.petTypes.includes("both") || 
                activity.petTypes.includes(selectedPetType)
              );
              const totalPages = Math.max(1, Math.ceil(list.length / ACTIVITIES_PAGE_SIZE));
              if (totalPages <= 1) return null;
              return (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-muted-foreground">
                    Page {activitiesPage + 1} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={activitiesPage === 0}
                      onClick={() => setActivitiesPage(p => Math.max(0, p - 1))}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={activitiesPage >= totalPages - 1}
                      onClick={() => setActivitiesPage(p => Math.min(totalPages - 1, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Activity Details Dialog */}
      <Dialog open={selectedActivity !== null} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedActivity && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3">
                  <span className="text-2xl">{selectedActivity.icon}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span>{selectedActivity.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedActivity.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {selectedActivity.duration}
                      </span>
                      <span className="flex items-center">
                        <MapPin size={14} className="mr-1" />
                        {selectedActivity.location}
                      </span>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <p className="text-muted-foreground">{selectedActivity.description}</p>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="font-semibold mb-3 text-primary">Benefits</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedActivity.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-primary/5 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="font-semibold mb-3 text-secondary">Step-by-Step Instructions</h4>
                  <div className="space-y-3">
                    {selectedActivity.instructions.map((instruction, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-secondary text-white rounded-full flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed">{instruction}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div>
                  <h4 className="font-semibold mb-3 text-orange-600">💡 Pro Tips</h4>
                  <div className="space-y-2">
                    {selectedActivity.tips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-orange-50 rounded-lg">
                        <span className="text-orange-600 font-semibold">•</span>
                        <p className="text-sm text-orange-800">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <Button 
                    variant="playful" 
                    className="w-full"
                    onClick={() => {
                      setSelectedActivity(null);
                      toast({
                        title: "Activity Started!",
                        description: `Have fun with ${selectedActivity.title}! Remember to take photos for your album.`,
                      });
                    }}
                  >
                    Start This Activity
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default AlbumPage;