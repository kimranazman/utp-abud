import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Mapbox token from environment
    // Note: This is a PUBLIC token, not a secret. Mapbox public tokens are
    // designed to be used on the client-side and exposed in frontend code.
    // Access control is handled by Mapbox via URL restrictions and usage limits.
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
    if (!mapboxToken) {
      console.error('[MapboxToken] MAPBOX_PUBLIC_TOKEN environment variable is not set')
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ token: mapboxToken }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('[MapboxToken] Unexpected error:', error?.message)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})