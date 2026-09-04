import { supabase } from '@/integrations/supabase/client';

const TOKEN_CACHE_KEY = 'mapbox_token';
const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
const GEOCODE_PREFIX = 'geo_';
const GEOCODE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedValue<T> {
  value: T;
  expires: number;
}

function getCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const cached: CachedValue<T> = JSON.parse(raw);
    if (Date.now() > cached.expires) {
      sessionStorage.removeItem(key);
      return null;
    }
    return cached.value;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, value: T, ttl: number): void {
  try {
    const entry: CachedValue<T> = { value, expires: Date.now() + ttl };
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable — silently ignore
  }
}

/**
 * Fetch the Mapbox token from the Supabase edge function.
 * Caches in sessionStorage for 30 minutes. Retries up to 3 times with backoff.
 */
export async function getMapboxToken(): Promise<string | null> {
  const cached = getCache<string>(TOKEN_CACHE_KEY);
  if (cached) return cached;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const backoffs = [0, 500, 1000];
  for (let attempt = 0; attempt < backoffs.length; attempt++) {
    if (backoffs[attempt] > 0) {
      await new Promise((r) => setTimeout(r, backoffs[attempt]));
    }
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (!error && data?.token) {
        setCache(TOKEN_CACHE_KEY, data.token, TOKEN_TTL_MS);
        return data.token;
      }
    } catch {
      // retry
    }
  }
  return null;
}

export interface MapItemLike {
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
}

/**
 * Build a deterministic location string from city/state/country fields.
 * Returns null when there are no location parts.
 */
export function buildLocationKey(item: MapItemLike): string | null {
  const parts = [item.location_city, item.location_state, item.location_country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

/**
 * Batch-geocode an array of unique location strings.
 * Returns a Map from locationKey → [lng, lat].
 * Caches each result in sessionStorage for 7 days.
 * Processes in batches of 5 concurrently and gracefully skips failures.
 */
export async function geocodeLocations(
  locationKeys: string[],
  token: string,
): Promise<Map<string, [number, number]>> {
  const results = new Map<string, [number, number]>();

  // Separate cached vs uncached
  const toFetch: string[] = [];
  for (const key of locationKeys) {
    const cached = getCache<[number, number]>(GEOCODE_PREFIX + key);
    if (cached) {
      results.set(key, cached);
    } else {
      toFetch.push(key);
    }
  }

  // Fetch in batches of 5
  const BATCH_SIZE = 5;
  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (location) => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${token}&limit=1`,
        );
        const data = await res.json();
        if (data.features?.[0]) {
          const coords: [number, number] = data.features[0].center;
          setCache(GEOCODE_PREFIX + location, coords, GEOCODE_TTL_MS);
          results.set(location, coords);
        }
      } catch {
        // skip this location
      }
    });
    await Promise.all(promises);
  }

  return results;
}
