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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        // Load initial welcome message
        setMessages([{
          id: 'welcome',
          content: "Hello! I'm Dr. PetAI, your virtual veterinary assistant. I'm here to help with any questions about your cat or dog's health, behavior, or general care. What would you like to discuss today?",
          role: 'assistant',
          timestamp: new Date()
        }]);

        // Try to load saved messages from database; fallback if table doesn't exist
        try {
          const { data: savedMessages, error } = await (supabase as any)
            .from('chat_messages')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: true });

          if (error) throw error as any;

          if (savedMessages && (savedMessages as any[]).length > 0) {
            const formattedMessages = (savedMessages as any[]).map((msg: any) => ({
              id: msg.id,
              content: msg.content,
              role: msg.role as 'user' | 'assistant',
              timestamp: new Date(msg.created_at)
            }));
            setMessages(prev => [...prev, ...formattedMessages]);
          }
        } catch (dbErr: any) {
          if (dbErr?.code === '42P01') {
            console.warn('chat_messages table missing; using in-memory chat only');
          } else {
            console.error('DB load error:', dbErr);
          }
        }

        // Check for initial AI plan from session storage
        const initialAiPlan = sessionStorage.getItem('initialAiPlan');
        if (initialAiPlan) {
          try {
            const { content, timestamp } = JSON.parse(initialAiPlan);
            
            // Add the AI plan as a bot message
            const botMessage: Message = {
              id: `ai-plan-${Date.now()}`,
              content: content,
              role: 'assistant',
              timestamp: new Date(timestamp)
            };
            
            // Save to database
            await saveMessageToDatabase(botMessage);
            
            setMessages(prev => [...prev, botMessage]);
            sessionStorage.removeItem('initialAiPlan');
          } catch (error) {
            console.error('Error parsing initial AI plan:', error);
            sessionStorage.removeItem('initialAiPlan');
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Subscribe to real-time updates for new messages
  useEffect(() => {
    if (!supabase) return;

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      // If the table doesn't exist, skip realtime subscription
      // (No direct way to check via Realtime; leave subscription but it won't receive events until table exists)
      const channel = supabase
        .channel('chat_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `user_id=eq.${session.user.id}`
          },
          (payload) => {
            const newMessage = payload.new as {
              id: string;
              content: string;
              role: 'user' | 'assistant';
              created_at: string;
            };
            
            // Only add if not already in messages
            setMessages(prev => {
              if (prev.some(m => m.id === newMessage.id)) return prev;
              return [...prev, {
                id: newMessage.id,
                content: newMessage.content,
                role: newMessage.role,
                timestamp: new Date(newMessage.created_at)
              }];
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, []);

  // Save a message to the database
  const saveMessageToDatabase = async (message: Message) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          user_id: session.user.id,
          content: message.content,
          role: message.role,
          created_at: message.timestamp.toISOString()
        }]);

      if (error) throw error as any;
    } catch (error: any) {
      if (error?.code === '42P01') {
        console.warn('chat_messages table missing; skipping DB save');
        return;
      }
      console.error('Error saving message to database:', error);
    }
  };

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
      id: `user-${Date.now()}`,
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    // Save user message to database
    await saveMessageToDatabase(userMessage);
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Get current session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use the chat feature.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Get chat context (last 10 messages for context)
      const chatContext = messages
        .slice(-10) // Get last 10 messages for context
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }));

      const { data, error } = await supabase.functions.invoke("pet-chat", {
        body: { 
          message: inputMessage,
          context: chatContext
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      // Save assistant's response to database
      await saveMessageToDatabase(assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);
      
      // Increment usage counter
      await incrementUsage('chat');
      
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
    <div className="min-h-screen bg-[#121212] text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#121212]/80 backdrop-blur-sm px-4 py-4 border-b border-transparent">
        <h1 className="text-xl font-bold">Vet Chat</h1>
        <div className="flex items-center gap-2 text-[#FF7A00]">
          <Stethoscope size={18} />
          <Bot size={18} />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 flex flex-col h-[calc(100vh-180px)]">
        {/* Quick Tips */}
        <Card className="border border-[#3F3F46] bg-[#1E1E1E] mb-4 rounded-2xl">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 text-sm text-white">💡 Ask me about:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
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
        <Card className="border border-[#3F3F46] bg-[#1E1E1E] rounded-2xl flex-1 flex flex-col">
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
                        message.role === 'assistant' && message.content.includes('Generate AI Plan')
                          ? 'bg-[#FF7A00] text-[#121212]'
                          : 'bg-[#1E1E1E] text-zinc-200 border border-[#3F3F46]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === 'assistant' && (
                          <Stethoscope size={16} className="mt-1 text-[#FF7A00]" />
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
                    <div className="bg-[#1E1E1E] border border-[#3F3F46] p-3 rounded-2xl max-w-[80%] text-zinc-200">
                      <div className="flex items-center gap-2">
                        <Stethoscope size={16} className="text-[#FF7A00]" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-[#3F3F46] bg-[#121212] rounded-b-2xl">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about your pet's health..."
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 bg-[#1E1E1E] border-[#3F3F46] text-white placeholder:text-zinc-500"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="icon"
                  className="bg-[#FF7A00] hover:opacity-90 text-[#121212]"
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