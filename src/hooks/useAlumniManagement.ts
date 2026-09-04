import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AlumniFilters {
  search: string;
  yearMin: number | null;
  yearMax: number | null;
  location: string | null;
  program: string | null;
  completionTier: 'all' | '0-24' | '25-49' | '50-74' | '75-100';
  status: 'all' | 'verified' | 'pending';
}

export interface AlumniProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  graduation_year: number | null;
  location_city: string | null;
  location_country: string | null;
  course: string | null;
  is_verified: boolean;
  created_at: string;
  avatar_url: string | null;
  completion: number;
  role: string;
}

interface FilterOptions {
  locations: string[];
  programs: string[];
  yearRange: { min: number; max: number };
}

const defaultFilters: AlumniFilters = {
  search: '',
  yearMin: null,
  yearMax: null,
  location: null,
  program: null,
  completionTier: 'all',
  status: 'all'
};

export function useAlumniManagement() {
  const [filters, setFilters] = useState<AlumniFilters>(defaultFilters);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Fetch filter options (distinct values)
  const { data: filterOptions } = useQuery({
    queryKey: ['alumni-filter-options'],
    queryFn: async (): Promise<FilterOptions> => {
      const [locationsResult, programsResult, yearsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('location_country')
          .not('location_country', 'is', null)
          .order('location_country'),
        supabase
          .from('profiles')
          .select('course')
          .not('course', 'is', null)
          .order('course'),
        supabase
          .from('profiles')
          .select('graduation_year')
          .not('graduation_year', 'is', null)
      ]);

      const uniqueLocations = [...new Set(
        (locationsResult.data || [])
          .map(p => p.location_country)
          .filter(Boolean) as string[]
      )];

      const uniquePrograms = [...new Set(
        (programsResult.data || [])
          .map(p => p.course)
          .filter(Boolean) as string[]
      )];

      const years = (yearsResult.data || [])
        .map(p => p.graduation_year)
        .filter((y): y is number => y !== null);

      return {
        locations: uniqueLocations,
        programs: uniquePrograms,
        yearRange: {
          min: years.length > 0 ? Math.min(...years) : 2000,
          max: years.length > 0 ? Math.max(...years) : new Date().getFullYear()
        }
      };
    },
    staleTime: 300000 // 5 minutes
  });

  // Fetch alumni data with filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['alumni-management', filters, page],
    queryFn: async () => {
      // Build query
      let query = supabase
        .from('profiles')
        .select('id, user_id, full_name, email, graduation_year, location_city, location_country, course, is_verified, created_at, avatar_url', { count: 'exact' });

      // Apply search filter
      if (filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        query = query.or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`);
      }

      // Apply year range filter
      if (filters.yearMin !== null) {
        query = query.gte('graduation_year', filters.yearMin);
      }
      if (filters.yearMax !== null) {
        query = query.lte('graduation_year', filters.yearMax);
      }

      // Apply location filter
      if (filters.location) {
        query = query.eq('location_country', filters.location);
      }

      // Apply program filter
      if (filters.program) {
        query = query.eq('course', filters.program);
      }

      // Apply status filter
      if (filters.status === 'verified') {
        query = query.eq('is_verified', true);
      } else if (filters.status === 'pending') {
        query = query.eq('is_verified', false);
      }

      // Apply pagination and ordering
      query = query
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      const { data: profiles, error, count } = await query;

      if (error) throw error;

      // Fetch completion percentages and roles for all profiles
      const userIds = (profiles || []).map(p => p.user_id);

      const [completionResults, rolesResult] = await Promise.all([
        Promise.all(
          userIds.map(userId =>
            supabase.rpc('calculate_profile_completion', { p_user_id: userId })
          )
        ),
        supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds)
      ]);

      // Map completion percentages
      const completionMap = new Map<string, number>();
      userIds.forEach((userId, index) => {
        completionMap.set(userId, completionResults[index].data || 0);
      });

      // Map roles
      const roleMap = new Map<string, string>();
      (rolesResult.data || []).forEach(r => {
        roleMap.set(r.user_id, r.role);
      });

      // Combine data
      let alumni: AlumniProfile[] = (profiles || []).map(p => ({
        ...p,
        completion: completionMap.get(p.user_id) || 0,
        role: roleMap.get(p.user_id) || 'pending'
      }));

      // Client-side completion tier filter (since RPC can't be used in WHERE)
      if (filters.completionTier !== 'all') {
        const [min, max] = filters.completionTier.split('-').map(Number);
        alumni = alumni.filter(a => a.completion >= min && a.completion <= max);
      }

      return {
        alumni,
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
    staleTime: 30000 // 30 seconds
  });

  const updateFilter = <K extends keyof AlumniFilters>(key: K, value: AlumniFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page on filter change
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setPage(0);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.yearMin !== null ||
      filters.yearMax !== null ||
      filters.location !== null ||
      filters.program !== null ||
      filters.completionTier !== 'all' ||
      filters.status !== 'all'
    );
  }, [filters]);

  return {
    alumni: data?.alumni || [],
    totalCount: data?.totalCount || 0,
    page,
    pageSize,
    totalPages: data?.totalPages || 0,
    setPage,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    filterOptions: filterOptions || { locations: [], programs: [], yearRange: { min: 2000, max: new Date().getFullYear() } },
    isLoading,
    error,
    refetch
  };
}
