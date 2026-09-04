// Allowed origins - configure these in your Supabase Edge Function settings
const getAllowedOrigins = (): string[] => {
  const allowedOriginsEnv = Deno.env.get('ALLOWED_ORIGINS') || ''

  // Default allowed origins (customize based on your deployment)
  const defaults = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:8080',
  ]

  // Parse additional origins from environment variable (comma-separated)
  const envOrigins = allowedOriginsEnv
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0)

  return [...defaults, ...envOrigins]
}

export const getCorsHeaders = (requestOrigin: string | null): Record<string, string> => {
  const allowedOrigins = getAllowedOrigins()

  // Check if the request origin is allowed
  const isAllowed = requestOrigin && allowedOrigins.includes(requestOrigin)

  return {
    'Access-Control-Allow-Origin': isAllowed ? requestOrigin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours
  }
}

// Backwards compatibility - use first allowed origin as default
export const corsHeaders = getCorsHeaders(null)