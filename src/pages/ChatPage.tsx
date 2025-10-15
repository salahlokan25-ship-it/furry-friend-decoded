import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Send, Bot, User, Stethoscope, Heart, Cat, Dog, Crown } from "lucide-react";
import petLogo from "@/assets/pet-ai-logo.png";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useUsageTracking } from "@/hooks/useUsageTracking";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const ChatPage = () => {
  const { subscribed } = useSubscription();
  const { canUseFeature, incrementUsage, getRemainingUsage } = useUsageTracking();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Dr. PetAI, your virtual veterinary assistant. I'm here to help with any questions about your cat or dog's health, behavior, or general care. What would you like to discuss today?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Check usage limits for free users
    if (!canUseFeature('chat')) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily chat limit. Upgrade to premium for unlimited access!",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use the chat feature.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("pet-chat", {
        body: { message: inputMessage },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Connection Error",
        description: "Sorry, I couldn't process your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/50 to-blue-50/50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={petLogo} alt="Pet Paradise AI" className="w-12 h-12 rounded-lg shadow-sm" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Vet Chat</h1>
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Stethoscope size={12} />
                  AI Veterinary Assistant
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={20} className="text-red-500" />
              <Bot size={20} className="text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 flex flex-col h-[calc(100vh-180px)]">
        {/* Quick Tips */}
        <Card className="border-0 shadow-soft mb-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 text-sm">💡 Ask me about:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Cat size={12} />
                Cat behavior & health
              </div>
              <div className="flex items-center gap-1">
                <Dog size={12} />
                Dog training & care
              </div>
              <div>🍽️ Nutrition advice</div>
              <div>💊 Medication info</div>
              <div>🏥 Emergency signs</div>
              <div>🧼 Grooming tips</div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="border-0 shadow-soft flex-1 flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === 'assistant' && (
                          <Stethoscope size={16} className="mt-1 text-green-600" />
                        )}
                        {message.role === 'user' && (
                          <User size={16} className="mt-1" />
                        )}
                        <div>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-2xl max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <Stethoscope size={16} className="text-green-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about your pet's health..."
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="icon"
                  className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;