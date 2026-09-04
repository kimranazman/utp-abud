import { supabase } from '@/integrations/supabase/client';
import {
  DROPDOWN_OPTIONS,
  getOptionByValue,
  getLabelByValue
} from '@/constants/dropdowns';
import { BusinessCategory, BusinessSubcategory } from '@/hooks/useBusinessCategories';
import { Location } from '@/hooks/useLocations';

/**
 * Centralized service for managing dropdown data
 * Provides consistent API for fetching and transforming dropdown options
 */
export class DropdownService {
  private static instance: DropdownService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): DropdownService {
    if (!DropdownService.instance) {
      DropdownService.instance = new DropdownService();
    }
    return DropdownService.instance;
  }

  /**
   * Clear cache for specific key or all cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  /**
   * Get cached data
   */
  private getCached<T>(key: string): T | null {
    if (!this.isCacheValid(key)) return null;
    return this.cache.get(key)?.data || null;
  }

  /**
   * Set cache
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Get static dropdown options
   */
  getStaticOptions<T extends keyof typeof DROPDOWN_OPTIONS>(
    dropdownKey: T
  ): typeof DROPDOWN_OPTIONS[T] {
    return DROPDOWN_OPTIONS[dropdownKey];
  }

  /**
   * Fetch business categories
   */
  async getBusinessCategories(): Promise<BusinessCategory[]> {
    const cacheKey = 'business_categories';
    const cached = this.getCached<BusinessCategory[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;

      const categories = data || [];
      this.setCache(cacheKey, categories);
      return categories;
    } catch (error) {
      console.error('Error fetching business categories:', error);
      throw new Error('Failed to load business categories');
    }
  }

  /**
   * Fetch business subcategories for a category
   */
  async getBusinessSubcategories(categoryId: string): Promise<BusinessSubcategory[]> {
    const cacheKey = `business_subcategories_${categoryId}`;
    const cached = this.getCached<BusinessSubcategory[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('business_subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;

      const subcategories = data || [];
      this.setCache(cacheKey, subcategories);
      return subcategories;
    } catch (error) {
      console.error('Error fetching business subcategories:', error);
      throw new Error('Failed to load business subcategories');
    }
  }

  /**
   * Fetch service categories
   */
  async getServiceCategories() {
    const cacheKey = 'service_categories';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;

      const categories = data || [];
      this.setCache(cacheKey, categories);
      return categories;
    } catch (error) {
      console.error('Error fetching service categories:', error);
      throw new Error('Failed to load service categories');
    }
  }

  /**
   * Get locations (will be database-driven in future)
   */
  async getLocations(): Promise<{
    all: Location[];
    popular: Location[];
  }> {
    // Import static data for now
    const { locations, popularLocations } = await import('@/data/locations');

    // Transform to expected format
    const transformLocation = (loc: any): Location => ({
      value: loc.value,
      label: loc.label,
      country: loc.country,
      state: loc.state,
      city: loc.city || loc.label.split(',')[0]?.trim()
    });

    return {
      all: locations.map(transformLocation),
      popular: popularLocations.map(loc => ({
        ...transformLocation(loc),
        isPopular: true
      }))
    };
  }

  /**
   * Search locations
   */
  async searchLocations(searchTerm: string): Promise<Location[]> {
    const { all } = await this.getLocations();
    const term = searchTerm.toLowerCase();

    return all
      .filter(location =>
        location.label.toLowerCase().includes(term) ||
        location.city?.toLowerCase().includes(term) ||
        location.state?.toLowerCase().includes(term) ||
        location.country?.toLowerCase().includes(term)
      )
      .slice(0, 20);
  }

  /**
   * Get graduation years
   */
  getGraduationYears(startYear: number = 1974): number[] {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];

    for (let year = currentYear + 1; year >= startYear; year--) {
      years.push(year);
    }

    return years;
  }

  /**
   * Get UTP programmes
   */
  async getUTPProgrammes(level: 'undergraduate' | 'postgraduate' = 'undergraduate') {
    // This could be moved to database in future
    const programmes = {
      undergraduate: [
        'Chemical Engineering',
        'Civil Engineering',
        'Electrical & Electronic Engineering',
        'Mechanical Engineering',
        'Petroleum Engineering',
        'Business Information Systems',
        'Information & Communication Technology',
        'Applied Chemistry',
        'Applied Physics',
        'Petroleum Geoscience',
        'Business Management',
        'Technology Management',
        'Computer & Information Sciences',
        'Other'
      ],
      postgraduate: [
        'MSc in Petroleum Engineering',
        'MSc in Chemical Engineering',
        'MSc in Mechanical Engineering',
        'MSc in Electrical & Electronic Engineering',
        'MSc in Civil Engineering',
        'MSc in Information Technology',
        'MBA in Business Administration',
        'PhD in Engineering',
        'PhD in Science',
        'PhD in Technology',
        'Other'
      ]
    };

    return programmes[level];
  }

  /**
   * Validate dropdown value against options
   */
  validateDropdownValue<T extends keyof typeof DROPDOWN_OPTIONS>(
    dropdownKey: T,
    value: string
  ): boolean {
    const options = this.getStaticOptions(dropdownKey);
    return options.some(option => option.value === value);
  }

  /**
   * Get display label for dropdown value
   */
  getDropdownLabel<T extends keyof typeof DROPDOWN_OPTIONS>(
    dropdownKey: T,
    value: string
  ): string {
    const options = this.getStaticOptions(dropdownKey);
    return getLabelByValue(options, value);
  }

  /**
   * Transform database enum to dropdown options
   */
  transformEnumToOptions(enumValues: string[]): Array<{ value: string; label: string }> {
    return enumValues.map(value => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')
    }));
  }
}

// Export singleton instance
export const dropdownService = DropdownService.getInstance();