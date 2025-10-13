import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check usage limits
    const { data: canProceed } = await supabase.rpc('increment_usage', {
      user_id_param: user.id,
      usage_type: 'chat'
    });

    if (!canProceed) {
      return new Response(
        JSON.stringify({ error: 'Usage limit exceeded' }), 
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Input validation
    const { message } = await req.json();
    
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a string' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message cannot be empty' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (trimmedMessage.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Message too long (max 1000 characters)' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Received message from user:', user.id);

    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
            content: trimmedMessage
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