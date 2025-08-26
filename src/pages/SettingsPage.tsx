import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Crown, 
  Bell, 
  MessageSquare, 
  Heart, 
  Shield, 
  FileText, 
  RotateCcw,
  ChevronRight,
  User,
  Settings
} from "lucide-react";
import petLogo from "@/assets/pet-paradise-logo.png";

interface UserProfile {
  name: string;
  email: string;
  petName: string;
  petType: "cat" | "dog";
  petAge: string;
  experience: "Beginner" | "Intermediate" | "Expert";
}

const SettingsPage = () => {
  const [profile] = useState<UserProfile>({
    name: "Alex Johnson",
    email: "alex@example.com", 
    petName: "Mimi",
    petType: "dog",
    petAge: "2 years",
    experience: "Intermediate",
  });

  const [notifications, setNotifications] = useState({
    training: true,
    translation: true,
    reminders: false,
  });

  const settingsItems = [
    {
      icon: Bell,
      title: "Reminder",
      description: "Training and care reminders",
      action: (
        <Switch 
          checked={notifications.reminders}
          onCheckedChange={(checked) => 
            setNotifications(prev => ({ ...prev, reminders: checked }))
          }
        />
      ),
    },
    {
      icon: MessageSquare,
      title: "Feedback", 
      description: "Share your thoughts with us",
      action: <ChevronRight size={20} className="text-muted-foreground" />,
    },
    {
      icon: Heart,
      title: "Rate",
      description: "Rate Pet Paradise on app store",
      action: <ChevronRight size={20} className="text-muted-foreground" />,
    },
    {
      icon: Shield,
      title: "Privacy Policy",
      description: "How we protect your data",
      action: <ChevronRight size={20} className="text-muted-foreground" />,
    },
    {
      icon: FileText,
      title: "Terms of Use", 
      description: "App usage terms and conditions",
      action: <ChevronRight size={20} className="text-muted-foreground" />,
    },
    {
      icon: RotateCcw,
      title: "Restore",
      description: "Restore previous purchases",
      action: <ChevronRight size={20} className="text-muted-foreground" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-50/30 to-red-50/30 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <img src={petLogo} alt="Pet Paradise" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Settings</h1>
              <Badge variant="secondary" className="text-xs">Personalize</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Premium Banner */}
        <Card className="border-0 shadow-soft bg-gradient-to-r from-pet-coral to-pet-orange overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <Crown size={24} />
                  <h2 className="text-xl font-bold">Unlimited</h2>
                </div>
                <p className="text-white/90 text-sm">
                  Access to all features
                </p>
              </div>
              <div className="text-right">
                <Button variant="secondary" size="sm" className="bg-white text-pet-coral hover:bg-white/90">
                  Upgrade
                </Button>
              </div>
            </div>
            {/* Decorative paw prints */}
            <div className="absolute -top-2 -right-2 text-white/20 text-6xl">
              🐾
            </div>
          </CardContent>
        </Card>

        {/* User Profile */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                <User size={28} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
              <Button variant="ghost" size="icon">
                <Settings size={20} />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Pet Name</p>
                <p className="font-semibold">{profile.petName}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Pet Type</p>
                <p className="font-semibold capitalize">
                  {profile.petType === "cat" ? "🐱 Cat" : "🐕 Dog"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-semibold">{profile.petAge}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Experience</p>
                <Badge variant="secondary" className="text-xs">
                  {profile.experience}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Training Notifications</p>
                  <p className="text-sm text-muted-foreground">Get notified about training sessions</p>
                </div>
                <Switch 
                  checked={notifications.training}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, training: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Translation Updates</p>
                  <p className="text-sm text-muted-foreground">New translation features</p>
                </div>
                <Switch 
                  checked={notifications.translation}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, translation: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Menu */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-0">
            {settingsItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0 cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  {item.action}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-6 text-center">
            <img src={petLogo} alt="Pet Paradise" className="w-16 h-16 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Pet Paradise</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your AI-powered pet companion app
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>Made with ❤️ for pets</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;