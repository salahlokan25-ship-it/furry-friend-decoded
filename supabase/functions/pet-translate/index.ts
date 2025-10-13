import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
    const { audio, petType } = await req.json();
    
    if (!audio || typeof audio !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Audio data is required and must be a string' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate audio size (10MB limit for base64)
    if (audio.length > 10485760) {
      return new Response(
        JSON.stringify({ error: 'Audio data too large (max 10MB)' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!petType || !['cat', 'dog'].includes(petType)) {
      return new Response(
        JSON.stringify({ error: 'Pet type must be either "cat" or "dog"' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Translating pet audio for user ${user.id}, pet type: ${petType}`);

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    // First, transcribe the audio using OpenAI's Whisper
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Convert base64 to blob for audio transcription
    const binaryString = atob(audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Prepare form data for Whisper API
    const formData = new FormData();
    const blob = new Blob([bytes], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');

    // Transcribe audio
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`Transcription failed: ${await transcriptionResponse.text()}`);
    }

    const transcriptionResult = await transcriptionResponse.json();
    const audioText = transcriptionResult.text || '';

    // Create pet-specific prompts
    const petPrompts = {
      cat: `You are a professional pet behaviorist specializing in cat communication. A cat owner has recorded their cat making sounds, and the audio was transcribed as: "${audioText}". 

Based on typical cat vocalizations and behavior patterns, provide a thoughtful interpretation of what the cat might be trying to communicate. Consider:
- Meows are primarily for human communication
- Different meow tones (short, long, high-pitched, low) have different meanings
- Purring, chirping, trilling, and other sounds
- Time of day and context clues

Respond as if you're the cat speaking directly to their owner in first person (e.g., "I am hungry and would like some food" rather than "The cat is hungry"). Keep the response warm, affectionate, and realistic to how cats actually communicate their needs. Limit to 2-3 sentences.`,

      dog: `You are a professional pet behaviorist specializing in dog communication. A dog owner has recorded their dog making sounds, and the audio was transcribed as: "${audioText}".

Based on typical dog vocalizations and behavior patterns, provide a thoughtful interpretation of what the dog might be trying to communicate. Consider:
- Barks vary in pitch, frequency, and intensity with different meanings
- Whining, howling, growling, and other vocalizations
- Context like excitement, anxiety, alertness, or needs
- Dogs are generally more expressive and social than cats

Respond as if you're the dog speaking directly to their owner in first person (e.g., "I'm excited to see you!" rather than "The dog is excited"). Keep the response enthusiastic, loyal, and realistic to how dogs actually communicate their emotions and needs. Limit to 2-3 sentences.`
    };

    // Use Groq API for pet translation
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: petPrompts[petType as keyof typeof petPrompts]
          },
          {
            role: 'user',
            content: `Please interpret this ${petType} sound: "${audioText}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', errorText);
      throw new Error(`Translation failed: ${errorText}`);
    }

    const groqResult = await groqResponse.json();
    const translation = groqResult.choices[0]?.message?.content || 
      `Your ${petType} seems to be trying to communicate something, but I couldn't quite understand it this time. Try recording again!`;

    console.log(`Successfully translated ${petType} audio:`, { audioText, translation });

    return new Response(
      JSON.stringify({ 
        translation,
        transcription: audioText,
        petType 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Pet translation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        translation: "I'm having trouble understanding your pet right now. Please try again!"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});