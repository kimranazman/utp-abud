import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from "../_shared/cors.ts"

interface LinkPreview {
  title: string
  description: string
  image: string | null
  url: string
  siteName: string | null
}

const MAX_URL_LENGTH = 2048
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024 // 5MB
const REQUEST_TIMEOUT = 10000 // 10 seconds

// SSRF Protection: Check if hostname is private/internal
const isPrivateIP = (hostname: string): boolean => {
  // Block private IP ranges and special addresses
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./, // AWS/Azure/GCP metadata
    /^localhost$/i,
    /^0\.0\.0\.0$/,
    /^::1$/, // IPv6 localhost
    /^fe80:/i, // IPv6 link-local
    /^fc00:/i, // IPv6 unique local
  ]
  return privateRanges.some(range => range.test(hostname))
}

const extractMetaContent = (html: string, property: string): string | null => {
  const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i')
  const match = html.match(regex)
  return match ? match[1] : null
}

const extractTitle = (html: string): string => {
  const ogTitle = extractMetaContent(html, 'og:title')
  if (ogTitle) return ogTitle

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  return titleMatch ? titleMatch[1].trim() : 'No title'
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Authentication Check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 2. Parse and validate request
    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 3. URL length check
    if (url.length > MAX_URL_LENGTH) {
      return new Response(
        JSON.stringify({ error: 'URL too long' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 4. Parse and validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 5. SSRF Protection: Protocol whitelist
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return new Response(
        JSON.stringify({ error: 'Only HTTP and HTTPS protocols are allowed' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 6. SSRF Protection: Block private IP ranges
    if (isPrivateIP(parsedUrl.hostname)) {
      return new Response(
        JSON.stringify({ error: 'Access to private networks is not allowed' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 7. Fetch the webpage with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; UTP-AlumniBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        redirect: 'follow',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const status = response.status
        if (status === 404) {
          return new Response(
            JSON.stringify({ error: 'URL not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else if (status === 403 || status === 401) {
          return new Response(
            JSON.stringify({ error: 'Access to this URL is restricted' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        throw new Error(`HTTP ${status}`)
      }

      // 8. Size limit check
      const contentLength = response.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
        return new Response(
          JSON.stringify({ error: 'Response too large' }),
          { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const html = await response.text()

      // 9. Extract metadata
      const title = extractTitle(html)
      const description = extractMetaContent(html, 'og:description') ||
                         extractMetaContent(html, 'description') ||
                         'No description available'
      const image = extractMetaContent(html, 'og:image')
      const siteName = extractMetaContent(html, 'og:site_name')

      const preview: LinkPreview = {
        title,
        description,
        image,
        url: response.url || url, // Use final URL after redirects
        siteName
      }

      return new Response(
        JSON.stringify(preview),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } catch (fetchError) {
      clearTimeout(timeoutId)

      // Handle timeout
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Request timeout' }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw fetchError
    }

  } catch (error) {
    console.error('[LinkPreview] Error:', error?.message)

    // Return generic error message to avoid information disclosure
    return new Response(
      JSON.stringify({ error: 'Failed to fetch link preview' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})