import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const groqApiKey = Deno.env.get('GROQ_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    console.log('Received message:', message);

    if (!groqApiKey) {
      console.error('GROQ_API_KEY not found');
      throw new Error('GROQ API key not configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are Dr. PetAI, a knowledgeable and compassionate virtual veterinary assistant specializing in cats and dogs. Your role is to:

1. Provide helpful, accurate information about pet health, behavior, nutrition, and general care
2. Offer practical advice for common pet issues
3. Recognize when a situation requires immediate veterinary attention
4. Be warm, empathetic, and professional in your responses
5. Always remind users that you're providing general guidance, not replacing professional veterinary diagnosis

Key guidelines:
- For emergency situations (difficulty breathing, severe injury, poisoning, seizures), immediately advise to contact an emergency vet
- For concerning symptoms, recommend scheduling a vet appointment
- Provide practical home care tips for minor issues
- Share preventive care advice
- Be encouraging and supportive to worried pet parents
- Keep responses concise but thorough
- Use a warm, professional tone

Always end serious health concerns with: "If you're worried about your pet's condition, it's always best to consult with your veterinarian for a proper examination and diagnosis."`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', response.status, errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Groq API response received');

    return new Response(JSON.stringify({ 
      response: data.choices[0].message.content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pet-chat function:', error);
    
    // Provide a helpful fallback response
    const fallbackResponse = "I'm sorry, I'm having trouble connecting right now. For any urgent pet health concerns, please contact your veterinarian immediately. For general questions, please try again in a moment.";
    
    return new Response(JSON.stringify({ 
      response: fallbackResponse 
    }), {
      status: 200, // Return 200 so the frontend gets the fallback message
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});