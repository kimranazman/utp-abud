import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface BusinessCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  display_order: number;
  is_active: boolean;
}

export interface BusinessSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

interface UseBusinessCategoriesResult {
  categories: BusinessCategory[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseBusinessSubcategoriesResult {
  subcategories: BusinessSubcategory[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Cache for categories to avoid repeated fetches
let categoriesCache: BusinessCategory[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Custom hook for fetching business categories with caching
 */
export function useBusinessCategories(): UseBusinessCategoriesResult {
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  const fetchCategories = useCallback(async () => {
    try {
      // Check cache first
      if (
        categoriesCache &&
        cacheTimestamp &&
        Date.now() - cacheTimestamp < CACHE_DURATION
      ) {
        setCategories(categoriesCache);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('business_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (fetchError) throw fetchError;

      if (isMountedRef.current) {
        const categoriesData = data || [];
        categoriesCache = categoriesData;
        cacheTimestamp = Date.now();
        setCategories(categoriesData);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      if (isMountedRef.current) {
        setError(err as Error);
        toast.error('Failed to load business categories');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchCategories();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

/**
 * Custom hook for fetching business subcategories for a specific category
 */
export function useBusinessSubcategories(
  categoryId: string | null
): UseBusinessSubcategoriesResult {
  const [subcategories, setSubcategories] = useState<BusinessSubcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  const fetchSubcategories = useCallback(async () => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('business_subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('display_order');

      if (fetchError) throw fetchError;

      if (isMountedRef.current) {
        setSubcategories(data || []);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      if (isMountedRef.current) {
        setError(err as Error);
        toast.error('Failed to load subcategories');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [categoryId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchSubcategories();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchSubcategories]);

  return { subcategories, loading, error, refetch: fetchSubcategories };
}

/**
 * Custom hook for fetching all categories and subcategories at once
 */
export function useAllBusinessCategories() {
  const [data, setData] = useState<{
    categories: BusinessCategory[];
    subcategories: Record<string, BusinessSubcategory[]>;
  }>({
    categories: [],
    subcategories: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('business_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (categoriesError) throw categoriesError;

      // Fetch all subcategories
      const { data: subcategoriesData, error: subcategoriesError } = await supabase
        .from('business_subcategories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (subcategoriesError) throw subcategoriesError;

      // Group subcategories by category_id
      const subcategoriesByCategory: Record<string, BusinessSubcategory[]> = {};
      subcategoriesData?.forEach((subcategory) => {
        if (!subcategoriesByCategory[subcategory.category_id]) {
          subcategoriesByCategory[subcategory.category_id] = [];
        }
        subcategoriesByCategory[subcategory.category_id].push(subcategory);
      });

      setData({
        categories: categoriesData || [],
        subcategories: subcategoriesByCategory
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching categories and subcategories:', err);
      setError(err as Error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...data, loading, error, refetch: fetchAll };
}