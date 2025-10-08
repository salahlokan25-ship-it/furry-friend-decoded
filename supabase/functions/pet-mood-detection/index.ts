import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type MoodType = "happy" | "anxious" | "hungry" | "tired" | "playful" | "neutral";

interface MoodResult {
  mood: MoodType;
  confidence: number;
  advice: string;
  details: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, fileType } = await req.json();

    if (!image) {
      throw new Error('No image provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Prepare the image for the AI model
    const base64Data = image.split(',')[1] || image;
    const imageUrl = `data:${fileType || 'image/jpeg'};base64,${base64Data}`;

    // Call Lovable AI with vision capabilities
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
            content: `You are an expert pet behavior analyst. Analyze the pet's mood from images/videos by observing:
- Body posture (relaxed, tense, alert)
- Eyes (wide, squinting, focused, sleepy)
- Ears position (perked up, flat, relaxed)
- Tail position (wagging, tucked, raised)
- Overall energy level

Respond with a JSON object containing:
{
  "mood": one of ["happy", "anxious", "hungry", "tired", "playful", "neutral"],
  "confidence": number between 0 and 1,
  "advice": practical advice for the owner (one sentence),
  "details": what you observed that led to this conclusion (2-3 sentences)
}

Be friendly, helpful, and specific. Use the pet's name if visible.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this pet\'s mood and provide detailed insights.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let result: MoodResult;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      result = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response');
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in pet-mood-detection:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred during mood detection'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
