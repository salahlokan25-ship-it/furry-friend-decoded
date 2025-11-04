import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, imageUrl } = await req.json();
    const GOOGLE_CLOUD_API_KEY = Deno.env.get("GOOGLE_CLOUD_API_KEY");
    
    if (!GOOGLE_CLOUD_API_KEY) {
      throw new Error("GOOGLE_CLOUD_API_KEY is not configured");
    }

    console.log("Generating video with Veo 3 model...");

    // Convert image to base64 if it's a blob URL
    let base64Image = imageUrl;
    if (imageUrl.startsWith('blob:') || imageUrl.startsWith('http')) {
      const imgResponse = await fetch(imageUrl);
      const imgBlob = await imgResponse.blob();
      const arrayBuffer = await imgBlob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      base64Image = base64;
    } else if (imageUrl.includes('base64,')) {
      base64Image = imageUrl.split('base64,')[1];
    }

    // Vertex AI Imagen Video (Veo 3) endpoint with API key
    const apiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/petparadise-476315/locations/us-central1/publishers/google/models/veo-003:predict?key=${GOOGLE_CLOUD_API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: prompt,
            image: {
              bytesBase64Encoded: base64Image
            }
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: "16:9",
          personGeneration: "allow_adult",
        }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Vertex AI error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Video generation failed: " + errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("Video generation response received");

    // Extract the video URL from the response
    const videoData = data.predictions?.[0]?.bytesBase64Encoded;
    
    if (!videoData) {
      throw new Error("No video data returned");
    }

    // Return the base64 encoded video
    const videoUrl = `data:video/mp4;base64,${videoData}`;

    return new Response(JSON.stringify({ videoUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-video-veo3:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
