import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
// Import existing location data as fallback
import { locations as staticLocations, popularLocations as staticPopularLocations } from '@/data/locations';

export interface Location {
  value: string;
  label: string;
  country?: string;
  state?: string;
  city?: string;
  isPopular?: boolean;
}

interface UseLocationsResult {
  locations: Location[];
  popularLocations: Location[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Cache for locations to avoid repeated fetches
let locationsCache: Location[] | null = null;
let popularCache: Location[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Custom hook for fetching locations
 * Currently uses static data, but prepared for database migration
 */
export function useLocations(): UseLocationsResult {
  const [locations, setLocations] = useState<Location[]>([]);
  const [popularLocations, setPopularLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  const fetchLocations = useCallback(async () => {
    try {
      // Check cache first
      if (
        locationsCache &&
        popularCache &&
        cacheTimestamp &&
        Date.now() - cacheTimestamp < CACHE_DURATION
      ) {
        setLocations(locationsCache);
        setPopularLocations(popularCache);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Switch to database data now that location tables are populated
      const useStaticData = false; // Using database instead of static data

      if (useStaticData) {
        // Transform static data to match expected format
        const transformedLocations = staticLocations.map(loc => ({
          value: loc.value,
          label: loc.label,
          country: loc.country,
          state: loc.state,
          city: loc.city || loc.label.split(',')[0]?.trim()
        }));

        const transformedPopular = staticPopularLocations.map(loc => ({
          value: loc.value,
          label: loc.label,
          country: loc.country,
          state: loc.state,
          city: loc.city || loc.label.split(',')[0]?.trim(),
          isPopular: true
        }));

        if (isMountedRef.current) {
          locationsCache = transformedLocations;
          popularCache = transformedPopular;
          cacheTimestamp = Date.now();
          setLocations(transformedLocations);
          setPopularLocations(transformedPopular);
          setError(null);
        }
      } else {
        // Future database implementation
        // This will be activated once location tables are created
        const [locationsResult, popularResult] = await Promise.all([
          supabase
            .from('locations')
            .select(`
              id,
              city,
              state,
              country,
              display_name,
              is_active
            `)
            .eq('is_active', true)
            .order('country')
            .order('city'),
          supabase
            .from('locations')
            .select(`
              id,
              city,
              state,
              country,
              display_name,
              is_popular
            `)
            .eq('is_popular', true)
            .eq('is_active', true)
            .order('display_order')
        ]);

        if (locationsResult.error) throw locationsResult.error;
        if (popularResult.error) throw popularResult.error;

        // Transform database data to expected format
        const dbLocations = (locationsResult.data || []).map(loc => ({
          value: `${loc.city}, ${loc.state || ''} ${loc.country}`.trim(),
          label: loc.display_name || `${loc.city}, ${loc.country}`,
          country: loc.country,
          state: loc.state,
          city: loc.city
        }));

        const dbPopular = (popularResult.data || []).map(loc => ({
          value: `${loc.city}, ${loc.state || ''} ${loc.country}`.trim(),
          label: loc.display_name || `${loc.city}, ${loc.country}`,
          country: loc.country,
          state: loc.state,
          city: loc.city,
          isPopular: true
        }));

        if (isMountedRef.current) {
          locationsCache = dbLocations;
          popularCache = dbPopular;
          cacheTimestamp = Date.now();
          setLocations(dbLocations);
          setPopularLocations(dbPopular);
          setError(null);
        }
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      if (isMountedRef.current) {
        setError(err as Error);
        // Fallback to static data on error
        setLocations(staticLocations);
        setPopularLocations(staticPopularLocations);
        toast.error('Failed to load locations, using cached data');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchLocations();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchLocations]);

  return { locations, popularLocations, loading, error, refetch: fetchLocations };
}

/**
 * Custom hook for searching locations
 */
export function useLocationSearch(searchTerm: string) {
  const { locations, loading, error } = useLocations();
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredLocations([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = locations.filter(location =>
      location.label.toLowerCase().includes(term) ||
      location.city?.toLowerCase().includes(term) ||
      location.state?.toLowerCase().includes(term) ||
      location.country?.toLowerCase().includes(term)
    );

    setFilteredLocations(filtered.slice(0, 20)); // Limit results
  }, [searchTerm, locations]);

  return { locations: filteredLocations, loading, error };
}

/**
 * Parse location string into components
 */
export function parseLocation(locationString: string): {
  city?: string;
  state?: string;
  country?: string;
} {
  const parts = locationString.split(',').map(p => p.trim());

  if (parts.length === 1) {
    return { city: parts[0] };
  } else if (parts.length === 2) {
    return { city: parts[0], country: parts[1] };
  } else if (parts.length >= 3) {
    return {
      city: parts[0],
      state: parts[1],
      country: parts.slice(2).join(', ')
    };
  }

  return {};
}

/**
 * Format location components into display string
 */
export function formatLocation(location: {
  city?: string;
  state?: string;
  country?: string;
}): string {
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.state) parts.push(location.state);
  if (location.country) parts.push(location.country);
  return parts.join(', ');
}