import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Camera, Heart, Trash2, Upload } from "lucide-react";
import petLogo from "@/assets/pet-paradise-logo.png";

interface Photo {
  id: string;
  url: string;
  petType: "cat" | "dog";
  timestamp: Date;
}

const AlbumPage = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPetType, setSelectedPetType] = useState<"cat" | "dog" | "all">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
          setPhotos(prev => [newPhoto, ...prev]);
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
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    toast({
      title: "Photo Deleted",
      description: "Photo removed from album.",
    });
  };

  const filteredPhotos = photos.filter(photo => 
    selectedPetType === "all" || photo.petType === selectedPetType
  );

  const activities = [
    { title: "Beach Walk", description: "Perfect sunny day activity", icon: "🏖️" },
    { title: "Park Playtime", description: "Let them run and explore", icon: "🌳" },
    { title: "Training Session", description: "Practice new tricks", icon: "🎯" },
    { title: "Grooming Time", description: "Keep them looking fresh", icon: "✨" },
    { title: "Vet Checkup", description: "Regular health monitoring", icon: "🏥" },
    { title: "Playdate", description: "Socialize with other pets", icon: "🐕" },
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
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardContent className="p-8 text-center">
              <Camera size={48} className="mx-auto text-primary/60 mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Photos Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your pet's album by adding some photos!
              </p>
              <Button 
                variant="playful"
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
            <h3 className="font-semibold mb-4">Activity Suggestions</h3>
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 transition-colors"
                >
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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