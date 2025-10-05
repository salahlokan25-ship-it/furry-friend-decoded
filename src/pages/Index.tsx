import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, ImageIcon, GraduationCap, Languages, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Languages,
      title: "Pet Translator",
      description: "Understand what your pet is saying",
      gradient: "from-pet-orange to-orange-400",
      action: () => navigate('/translate')
    },
    {
      icon: MessageCircle,
      title: "Chat with AI",
      description: "Get expert pet care advice",
      gradient: "from-blue-400 to-blue-500",
      action: () => navigate('/chat')
    },
    {
      icon: GraduationCap,
      title: "Training Courses",
      description: "Learn to train your pet effectively",
      gradient: "from-green-400 to-green-500",
      action: () => navigate('/training')
    },
    {
      icon: ImageIcon,
      title: "Pet Album",
      description: "Cherish your favorite memories",
      gradient: "from-purple-400 to-purple-500",
      action: () => navigate('/album')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-pet-beige/20 to-background pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-pet-orange to-orange-400 text-white px-6 pt-12 pb-16">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 text-center space-y-4">
          <div className="inline-block animate-bounce">
            <Sparkles className="w-12 h-12 mx-auto mb-4" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to PetParadise
          </h1>
          <p className="text-lg opacity-90 max-w-md mx-auto">
            Your all-in-one companion for understanding, training, and caring for your beloved pets
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-pet-orange/30 bg-white/80 backdrop-blur"
                onClick={feature.action}
              >
                <CardHeader className="space-y-3">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Quick Tip Card */}
        <Card className="max-w-4xl mx-auto mt-8 border-pet-orange/20 bg-gradient-to-br from-pet-orange/5 to-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pet-orange">
              <Sparkles className="w-5 h-5" />
              Daily Tip
            </CardTitle>
            <CardDescription className="text-base">
              💡 Did you know? Regular training sessions of just 10-15 minutes a day are more effective than longer, infrequent sessions. Start with our beginner courses!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Index;
