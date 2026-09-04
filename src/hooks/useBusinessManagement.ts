import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessFilters {
  search: string;
  category: string | null;
  location: string | null;
  ownerYearMin: number | null;
  ownerYearMax: number | null;
}

export interface BusinessWithOwner {
  id: string;
  business_name: string;
  location_city: string | null;
  location_country: string | null;
  logo_url: string | null;
  website: string | null;
  created_at: string;
  user_id: string;
  owner_name: string | null;
  owner_email: string | null;
  owner_graduation_year: number | null;
  category_name: string | null;
}

interface FilterOptions {
  categories: { id: string; name: string }[];
  locations: string[];
  ownerYearRange: { min: number; max: number };
}

const defaultFilters: BusinessFilters = {
  search: '',
  category: null,
  location: null,
  ownerYearMin: null,
  ownerYearMax: null
};

export function useBusinessManagement() {
  const [filters, setFilters] = useState<BusinessFilters>(defaultFilters);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Fetch filter options (categories, locations, year range)
  const { data: filterOptions } = useQuery({
    queryKey: ['business-filter-options'],
    queryFn: async (): Promise<FilterOptions> => {
      const [categoriesResult, locationsResult, yearsResult] = await Promise.all([
        // Get active categories
        supabase
          .from('business_categories')
          .select('id, name')
          .eq('is_active', true)
          .order('display_order'),
        // Get distinct locations from businesses
        supabase
          .from('user_businesses')
          .select('location_country')
          .not('location_country', 'is', null)
          .order('location_country'),
        // Get owner graduation years (join to profiles via user_id)
        supabase
          .from('user_businesses')
          .select('user_id')
      ]);

      const categories = (categoriesResult.data || []).map(c => ({
        id: c.id,
        name: c.name
      }));

      const uniqueLocations = [...new Set(
        (locationsResult.data || [])
          .map(b => b.location_country)
          .filter(Boolean) as string[]
      )];

      // Get owner graduation years
      const userIds = [...new Set((yearsResult.data || []).map(b => b.user_id))];
      let yearRange = { min: 2000, max: new Date().getFullYear() };

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('graduation_year')
          .in('user_id', userIds)
          .not('graduation_year', 'is', null);

        const years = (profilesData || [])
          .map(p => p.graduation_year)
          .filter((y): y is number => y !== null);

        if (years.length > 0) {
          yearRange = {
            min: Math.min(...years),
            max: Math.max(...years)
          };
        }
      }

      return {
        categories,
        locations: uniqueLocations,
        ownerYearRange: yearRange
      };
    },
    staleTime: 300000 // 5 minutes
  });

  // Fetch businesses with owner data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['business-management', filters, page],
    queryFn: async () => {
      // Step 1: Build base business query
      let query = supabase
        .from('user_businesses')
        .select('id, business_name, location_city, location_country, logo_url, website, created_at, user_id', { count: 'exact' });

      // Apply location filter
      if (filters.location) {
        query = query.eq('location_country', filters.location);
      }

      // Apply pagination and ordering
      query = query
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      const { data: businesses, error: bizError, count } = await query;

      if (bizError) throw bizError;
      if (!businesses || businesses.length === 0) {
        return {
          businesses: [],
          totalCount: 0,
          page,
          pageSize,
          totalPages: 0
        };
      }

      // Step 2: Get owner profiles
      const userIds = [...new Set(businesses.map(b => b.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, graduation_year')
        .in('user_id', userIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      // Step 3: Get primary categories for businesses
      const businessIds = businesses.map(b => b.id);
      const { data: categoryMappings } = await supabase
        .from('business_category_mapping')
        .select('business_id, category_id, business_categories(name)')
        .in('business_id', businessIds)
        .eq('is_primary', true);

      const categoryMap = new Map(
        (categoryMappings || []).map(cm => [
          cm.business_id,
          (cm.business_categories as { name: string } | null)?.name || null
        ])
      );

      // Step 4: Combine data
      let result: BusinessWithOwner[] = businesses.map(b => {
        const owner = profileMap.get(b.user_id);
        return {
          ...b,
          owner_name: owner?.full_name || null,
          owner_email: owner?.email || null,
          owner_graduation_year: owner?.graduation_year || null,
          category_name: categoryMap.get(b.id) || null
        };
      });

      // Step 5: Apply client-side filters that require joins

      // Search filter (business name or owner name)
      if (filters.search.trim()) {
        const searchLower = filters.search.trim().toLowerCase();
        result = result.filter(b =>
          b.business_name.toLowerCase().includes(searchLower) ||
          (b.owner_name && b.owner_name.toLowerCase().includes(searchLower))
        );
      }

      // Category filter
      if (filters.category) {
        result = result.filter(b => {
          // Need to check if this business has the selected category
          const mapping = categoryMappings?.find(
            cm => cm.business_id === b.id && cm.category_id === filters.category
          );
          return !!mapping;
        });
      }

      // Owner graduation year filter
      if (filters.ownerYearMin !== null) {
        result = result.filter(b =>
          b.owner_graduation_year !== null && b.owner_graduation_year >= filters.ownerYearMin!
        );
      }
      if (filters.ownerYearMax !== null) {
        result = result.filter(b =>
          b.owner_graduation_year !== null && b.owner_graduation_year <= filters.ownerYearMax!
        );
      }

      return {
        businesses: result,
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
    staleTime: 30000 // 30 seconds
  });

  const updateFilter = <K extends keyof BusinessFilters>(key: K, value: BusinessFilters[K]) => {
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
      filters.category !== null ||
      filters.location !== null ||
      filters.ownerYearMin !== null ||
      filters.ownerYearMax !== null
    );
  }, [filters]);

  return {
    businesses: data?.businesses || [],
    totalCount: data?.totalCount || 0,
    page,
    pageSize,
    totalPages: data?.totalPages || 0,
    setPage,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    filterOptions: filterOptions || {
      categories: [],
      locations: [],
      ownerYearRange: { min: 2000, max: new Date().getFullYear() }
    },
    isLoading,
    error,
    refetch
  };
}
