import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LandingStats {
  alumni: number;
  businesses: number;
  countries: number;
  years: number;
}

interface LandingStatsConfig {
  mode: 'realtime' | 'hardcoded';
  hardcoded: LandingStats;
}

const DEFAULT_CONFIG: LandingStatsConfig = {
  mode: 'realtime',
  hardcoded: { alumni: 5000, businesses: 200, countries: 50, years: 27 }
};

export function useLandingStats() {
  return useQuery({
    queryKey: ['landing-stats'],
    queryFn: async (): Promise<LandingStats> => {
      // Fetch config from site_settings table
      const { data: configData, error: configError } = await supabase
        .from('site_settings' as any)
        .select('value')
        .eq('key', 'landing_stats')
        .single();

      // If table doesn't exist yet or no config, use defaults
      const config: LandingStatsConfig = configData?.value as LandingStatsConfig || DEFAULT_CONFIG;

      // If hardcoded mode, return hardcoded values
      if (config.mode === 'hardcoded') {
        return config.hardcoded;
      }

      // Real-time mode: fetch actual counts
      const [alumniResult, businessesResult, countriesResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_businesses').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('location').not('location', 'is', null)
      ]);

      // Count unique countries from location field
      // Location format assumed to be "City, Country" or similar
      const uniqueCountries = new Set(
        (countriesResult.data || [])
          .map(p => {
            const parts = (p.location || '').split(',');
            return parts[parts.length - 1]?.trim();
          })
          .filter(Boolean)
      );

      return {
        alumni: alumniResult.count || 0,
        businesses: businessesResult.count || 0,
        countries: uniqueCountries.size || 1,
        years: 27 // UTP founded in 1997, static value
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false
  });
}

// Hook for admin to get and update config
export function useLandingStatsConfig() {
  return useQuery({
    queryKey: ['landing-stats-config'],
    queryFn: async (): Promise<LandingStatsConfig> => {
      const { data, error } = await supabase
        .from('site_settings' as any)
        .select('value')
        .eq('key', 'landing_stats')
        .single();

      if (error || !data) {
        return DEFAULT_CONFIG;
      }

      return data.value as LandingStatsConfig;
    }
  });
}

export async function updateLandingStatsConfig(config: LandingStatsConfig): Promise<void> {
  const { error } = await supabase
    .from('site_settings' as any)
    .upsert({
      key: 'landing_stats',
      value: config,
      updated_at: new Date().toISOString()
    });

  if (error) {
    throw error;
  }
}
