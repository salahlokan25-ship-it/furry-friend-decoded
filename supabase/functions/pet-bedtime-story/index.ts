import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
    const { petName, breed } = await req.json();

    if (!petName || !breed) {
      return new Response(
        JSON.stringify({ error: 'Pet name and breed are required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof petName !== 'string' || typeof breed !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Pet name and breed must be strings' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedPetName = petName.trim();
    const trimmedBreed = breed.trim();

    if (trimmedPetName.length === 0 || trimmedBreed.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Pet name and breed cannot be empty' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (trimmedPetName.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Pet name too long (max 50 characters)' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (trimmedBreed.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Breed name too long (max 100 characters)' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!/^[a-zA-Z0-9\s\-']+$/.test(trimmedPetName)) {
      return new Response(
        JSON.stringify({ error: 'Pet name contains invalid characters' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!/^[a-zA-Z0-9\s\-']+$/.test(trimmedBreed)) {
      return new Response(
        JSON.stringify({ error: 'Breed name contains invalid characters' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Generating bedtime story for user ${user.id}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a creative storyteller who writes magical, calming bedtime stories for pets. 
            Your stories should be:
            - Short (2-3 paragraphs)
            - Soothing and peaceful
            - Include the pet's name and breed naturally
            - Feature gentle adventures in dreamy settings
            - End with the pet falling asleep peacefully
            - Use warm, comforting language perfect for bedtime`
          },
          {
            role: 'user',
            content: `Create a personalized bedtime story for ${trimmedPetName}, who is a ${trimmedBreed}. Make it magical and perfect for helping them drift off to sleep.`
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    const story = data.choices[0].message.content;

    console.log('Story generated successfully');

    return new Response(
      JSON.stringify({ story }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error generating bedtime story:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
