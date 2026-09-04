import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GraduationYearData {
  year: number;
  count: number;
}

interface LocationData {
  country: string;
  count: number;
}

interface ChartData {
  graduationYears: GraduationYearData[];
  locations: LocationData[];
}

export function useDashboardCharts() {
  return useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: async (): Promise<ChartData> => {
      // Fetch graduation years and locations
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('graduation_year, location_country');

      if (error) throw error;

      // Aggregate graduation years
      const yearCounts: Record<number, number> = {};
      const countryCounts: Record<string, number> = {};

      for (const profile of profiles || []) {
        if (profile.graduation_year) {
          yearCounts[profile.graduation_year] = (yearCounts[profile.graduation_year] || 0) + 1;
        }
        if (profile.location_country) {
          countryCounts[profile.location_country] = (countryCounts[profile.location_country] || 0) + 1;
        }
      }

      // Format graduation year data (sorted by year)
      const graduationYears = Object.entries(yearCounts)
        .map(([year, count]) => ({ year: parseInt(year), count }))
        .sort((a, b) => a.year - b.year);

      // Format location data (top 8 + "Other")
      const sortedCountries = Object.entries(countryCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);

      let locations: LocationData[];
      if (sortedCountries.length > 8) {
        const top8 = sortedCountries.slice(0, 8);
        const otherCount = sortedCountries.slice(8).reduce((sum, c) => sum + c.count, 0);
        locations = [...top8, { country: 'Other', count: otherCount }];
      } else {
        locations = sortedCountries;
      }

      return { graduationYears, locations };
    },
    staleTime: 60000, // 1 minute cache
    refetchOnWindowFocus: false
  });
}
