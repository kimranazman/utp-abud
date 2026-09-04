import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ZoomSlider, getGridColumnsClass } from '@/components/ui/zoom-slider';
import { SEO } from '@/components/SEO';
import { BusinessCard } from '@/components/directory/BusinessCard';
import { DirectoryLayout } from '@/components/directory/DirectoryLayout';
import { FilterPills } from '@/components/directory/FilterPills';
import { DirectoryMap, MapItem } from '@/components/directory/DirectoryMap';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { IncompleteProfileBanner } from '@/components/IncompleteProfileBanner';
import { Search, Filter, MapPin, Globe, Building2, Users, ExternalLink, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { BUSINESS_SIZE_OPTIONS, EMPLOYEE_COUNT_OPTIONS } from '@/constants/dropdowns';

interface BusinessCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

interface BusinessSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
}

const BusinessDirectory = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  interface Business {
    id: string
    business_name: string
    position: string
    description?: string
    website?: string
    start_date?: string
    end_date?: string
    current_business?: boolean
    ownership_type?: string
    year_established?: number
    business_size?: string
    employee_count_range?: string
    is_verified?: boolean
    logo_url?: string
    logo_thumbnail_url?: string
    featured_image_url?: string
    location?: string
    location_city?: string
    location_state?: string
    location_country?: string
    tags?: string[]
    created_at: string
    profiles: {
      user_id: string
      full_name: string
      profile_visibility: string
      email: string
      is_verified: boolean
      avatar_url?: string
      avatar_thumbnail_url?: string
      hide_businesses?: boolean
    }
    user_id: string
    business_category_mapping?: Array<{
      category_id: string
      subcategory_id?: string
      business_categories?: {
        id: string
        name: string
        slug: string
        icon?: string
        color?: string
      }
      business_subcategories?: {
        id: string
        name: string
        slug: string
      }
    }>
    business_services?: Array<{ id: string }>
    business_achievements?: Array<{ id: string }>
  }

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(searchParams.get('subcategory') || 'all');
  const [selectedOwnership, setSelectedOwnership] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>(searchParams.get('location') || 'all');
  const [selectedFoundingYear, setSelectedFoundingYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBusinessSize, setSelectedBusinessSize] = useState<string>('all');
  const [selectedEmployeeCount, setSelectedEmployeeCount] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(!!searchParams.get('category') || !!searchParams.get('location'));
  const [zoomLevel, setZoomLevel] = useState(3);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [subcategories, setSubcategories] = useState<BusinessSubcategory[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isMapDrawerOpen, setIsMapDrawerOpen] = useState(false);
  const pendingScrollRef = useRef<string | null>(null);

  // Filter pills state
  const [pillFilters, setPillFilters] = useState<Record<string, string[]>>({
    category: [],
    country: [],
    status: [],
  });

  // Pagination state
  const [displayedCount, setDisplayedCount] = useState(20);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchCategories();
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      fetchSubcategories(selectedCategory);
    } else {
      setSubcategories([]);
      setSelectedSubcategory('all');
    }
  }, [selectedCategory]);

  // Update URL when category filter changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      searchParams.delete('category');
      searchParams.delete('subcategory');
    } else {
      searchParams.set('category', selectedCategory);
      if (selectedSubcategory !== 'all') {
        searchParams.set('subcategory', selectedSubcategory);
      } else {
        searchParams.delete('subcategory');
      }
    }
    setSearchParams(searchParams, { replace: true });
  }, [selectedCategory, selectedSubcategory, searchParams, setSearchParams]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchBusinesses = async () => {
    try {
      setLoading(true);

      // Fetch all businesses with their category mappings, profiles, and metrics
      const { data: businessData, error: businessError } = await supabase
        .from('user_businesses')
        .select(`
          *,
          profiles!user_businesses_user_id_fkey (
            user_id,
            full_name,
            profile_visibility,
            email,
            is_verified,
            avatar_url,
            avatar_thumbnail_url,
            hide_businesses
          ),
          business_category_mapping!fk_business_category_mapping_business_id (
            category_id,
            subcategory_id,
            is_primary,
            business_categories (
              id,
              name,
              slug,
              icon,
              color
            ),
            business_subcategories (
              id,
              name,
              slug
            )
          ),
          business_services (
            id
          ),
          business_achievements (
            id
          )
        `)
        .order('created_at', { ascending: false });

      if (businessError) {
        console.error('Business fetch error:', businessError);
        if (businessError.code === '42501') {
          toast.error('Access denied: Please log in to view the business directory');
        } else {
          toast.error(`Failed to load businesses: ${businessError.message}`);
        }
        throw businessError;
      }

      // Filter out businesses where profile isn't visible or owner isn't verified
      // Also respect hide_businesses privacy setting (unless viewing own business)
      const visibleBusinesses = (businessData || []).filter(business =>
        business.profiles &&
        business.profiles.is_verified && // Only show businesses from verified users
        (business.profiles.profile_visibility === 'public' ||
         business.profiles.profile_visibility === 'alumni_only') &&
        // Respect hide_businesses privacy setting (owner can still see their own)
        (!business.profiles.hide_businesses || business.user_id === user?.id)
      );

      console.log(`Fetched ${businessData?.length || 0} businesses, ${visibleBusinesses.length} are visible`);
      setBusinesses(visibleBusinesses);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      // Don't show another toast if we already showed a specific one above
    } finally {
      setLoading(false);
    }
  };

  // Handle pill filter changes
  const handlePillFilterChange = (groupId: string, values: string[]) => {
    setPillFilters(prev => ({ ...prev, [groupId]: values }));
  };

  // Handle map marker click - scroll to card and highlight
  const handleMarkerClick = useCallback((itemId: string) => {
    setSelectedItemId(itemId);

    // On mobile, close the drawer first and scroll after
    if (isMobile && isMapDrawerOpen) {
      pendingScrollRef.current = itemId;
      setIsMapDrawerOpen(false);
      return;
    }

    // Scroll card into view
    const cardElement = document.querySelector(`[data-business-id="${itemId}"]`);
    if (cardElement) {
      cardElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [isMobile, isMapDrawerOpen]);

  // Handle card selection - toggle selection and open map on mobile
  const handleCardSelect = useCallback((itemId: string) => {
    const isDeselecting = selectedItemId === itemId;
    setSelectedItemId(isDeselecting ? null : itemId);

    // On mobile, open drawer to show highlighted marker
    if (isMobile && !isDeselecting) {
      setIsMapDrawerOpen(true);
    }
  }, [isMobile, selectedItemId]);

  // Handle pending scroll after drawer closes on mobile
  useEffect(() => {
    if (!isMapDrawerOpen && pendingScrollRef.current) {
      const itemId = pendingScrollRef.current;
      pendingScrollRef.current = null;

      // Delay scroll to allow drawer to close
      setTimeout(() => {
        const cardElement = document.querySelector(`[data-business-id="${itemId}"]`);
        if (cardElement) {
          cardElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 300);
    }
  }, [isMapDrawerOpen]);

  // Apply filters
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // Check category matches
    const matchesCategory = selectedCategory === 'all' ||
      business.business_category_mapping?.some((mapping) =>
        mapping.category_id === selectedCategory
      );

    const matchesSubcategory = selectedSubcategory === 'all' ||
      business.business_category_mapping?.some((mapping) =>
        mapping.subcategory_id === selectedSubcategory
      );

    const matchesOwnership = selectedOwnership === 'all' || business.ownership_type === selectedOwnership;
    const matchesLocation = selectedLocation === 'all' ||
      business.location_city?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
      business.location_state?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
      business.location_country?.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesFoundingYear = selectedFoundingYear === 'all' ||
                               (business.start_date && new Date(business.start_date).getFullYear().toString() === selectedFoundingYear);
    const matchesStatus = selectedStatus === 'all' ||
                         (selectedStatus === 'current' ? business.current_business : !business.current_business);
    const matchesBusinessSize = selectedBusinessSize === 'all' || business.business_size === selectedBusinessSize;
    const matchesEmployeeCount = selectedEmployeeCount === 'all' || business.employee_count_range === selectedEmployeeCount;

    // Category filter (from pills)
    const matchesCategoryPill = pillFilters.category.length === 0 ||
      business.business_category_mapping?.some((mapping) =>
        pillFilters.category.includes(mapping.category_id)
      );

    // Country filter (from pills)
    const matchesCountryPill = pillFilters.country.length === 0 ||
      pillFilters.country.includes(business.location_country || '');

    // Status filter (from pills)
    const matchesStatusPill = pillFilters.status.length === 0 ||
      (pillFilters.status.includes('active') && business.current_business) ||
      (pillFilters.status.includes('past') && !business.current_business);

    return matchesSearch && matchesCategory && matchesSubcategory && matchesOwnership &&
           matchesLocation && matchesFoundingYear && matchesStatus &&
           matchesBusinessSize && matchesEmployeeCount &&
           matchesCategoryPill && matchesCountryPill && matchesStatusPill;
  });

  // Apply sorting
  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name-asc':
        return a.business_name.localeCompare(b.business_name);
      case 'name-desc':
        return b.business_name.localeCompare(a.business_name);
      case 'year-desc':
        return (b.year_established || 0) - (a.year_established || 0);
      case 'year-asc':
        return (a.year_established || 0) - (b.year_established || 0);
      default:
        return 0;
    }
  });

  // Clear selection if selected item is filtered out
  useEffect(() => {
    if (selectedItemId && !sortedBusinesses.some(b => b.id === selectedItemId)) {
      setSelectedItemId(null);
    }
  }, [sortedBusinesses, selectedItemId]);

  // Paginate results
  const paginatedBusinesses = sortedBusinesses.slice(0, displayedCount);
  const hasMore = displayedCount < sortedBusinesses.length;

  // Load more handler
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, sortedBusinesses.length));
    }
  }, [loading, hasMore, sortedBusinesses.length]);

  // Use infinite scroll hook
  const lastElementRef = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: loadMore,
    threshold: 200
  });

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [searchTerm, selectedCategory, selectedSubcategory, selectedOwnership,
      selectedLocation, selectedFoundingYear, selectedStatus,
      selectedBusinessSize, selectedEmployeeCount, sortBy, pillFilters]);

  // Get unique values for filters
  const ownershipTypes = [...new Set(businesses.map(b => b.ownership_type).filter(Boolean))];
  const locations = [...new Set(businesses.map(b => b.location).filter(Boolean))];
  const foundingYears = [...new Set(businesses.map(b =>
    b.start_date ? new Date(b.start_date).getFullYear() : null
  ).filter(Boolean))].sort((a, b) => b - a);
  const businessSizes = BUSINESS_SIZE_OPTIONS.map(option => option.value);
  const employeeCountRanges = EMPLOYEE_COUNT_OPTIONS.map(option => option.value);

  // Get unique countries for filter pills
  const uniqueCountries = [...new Set(businesses.map(b => b.location_country).filter(Boolean))].sort();

  // Convert businesses to MapItem format for DirectoryMap
  const mapItems: MapItem[] = paginatedBusinesses.map(b => ({
    id: b.id,
    name: b.business_name,
    location_city: b.location_city,
    location_state: b.location_state,
    location_country: b.location_country,
    type: 'business' as const,
    subtitle: b.business_category_mapping?.[0]?.business_categories?.name,
    avatarUrl: b.logo_thumbnail_url || b.logo_url,
  }));

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const formatBusinessPeriod = (startDate: string, endDate: string | null, isCurrent: boolean) => {
    const start = new Date(startDate).getFullYear();
    if (isCurrent) return `${start} - Present`;
    if (endDate) return `${start} - ${new Date(endDate).getFullYear()}`;
    return `Since ${start}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Business Directory - UTP Alumni Business Directory"
        description="Discover 500+ businesses owned by UTP alumni. Browse by industry, location, and more. Support fellow Universiti Teknologi PETRONAS entrepreneurs."
        canonical="/directory/business"
      />
      <IncompleteProfileBanner />
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Business Directory</h1>
          <p className="text-muted-foreground">
            Discover {businesses.length} businesses founded and led by UTP alumni
          </p>
        </div>

        {/* Filter Pills */}
        <div className="mb-4">
          <FilterPills
            filters={[
              {
                id: 'category',
                label: 'Category',
                options: categories.map(c => ({ value: c.id, label: c.name })),
                maxVisible: 4,
              },
              {
                id: 'country',
                label: 'Country',
                options: uniqueCountries.map(c => ({ value: c, label: c })),
                maxVisible: 5,
              },
              {
                id: 'status',
                label: 'Status',
                options: [
                  { value: 'active', label: 'Active' },
                  { value: 'past', label: 'Past' },
                ],
              },
            ]}
            activeFilters={pillFilters}
            onFilterChange={handlePillFilterChange}
            onClearAll={() => setPillFilters({ category: [], country: [], status: [] })}
          />
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Businesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedOwnership} onValueChange={setSelectedOwnership}>
                <SelectTrigger>
                  <SelectValue placeholder="Ownership type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ownershipTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4" />
                Advanced Filters
              </Button>
            </div>

            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedFoundingYear} onValueChange={setSelectedFoundingYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Founding year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {foundingYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Business status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="current">Currently Operating</SelectItem>
                    <SelectItem value="past">Past Ventures</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedSubcategory('all');
                    setSelectedOwnership('all');
                    setSelectedLocation('all');
                    setSelectedFoundingYear('all');
                    setSelectedStatus('all');
                    setSelectedBusinessSize('all');
                    setSelectedEmployeeCount('all');
                    setPillFilters({ category: [], country: [], status: [] });
                  }}
                  className="gap-2"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Split-view layout */}
        <DirectoryLayout
          mapContent={
            <DirectoryMap
              items={mapItems}
              type="business"
              selectedItemId={selectedItemId}
              onMarkerClick={handleMarkerClick}
            />
          }
          storageKey="business-directory-map"
          isMapOpen={isMapDrawerOpen}
          setIsMapOpen={setIsMapDrawerOpen}
        >
          {/* Results */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {paginatedBusinesses.length} of {sortedBusinesses.length} businesses
            </p>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="year-desc">Year (Newest)</SelectItem>
                  <SelectItem value="year-asc">Year (Oldest)</SelectItem>
                </SelectContent>
              </Select>
              <ZoomSlider
                value={zoomLevel}
                onValueChange={setZoomLevel}
              />
            </div>
          </div>

          {/* Business Grid */}
          <div className={`grid gap-4 ${getGridColumnsClass(zoomLevel)}`}>
            {paginatedBusinesses.map((business, index) => (
              <div
                key={business.id}
                ref={index === paginatedBusinesses.length - 1 ? lastElementRef : null}
              >
                <BusinessCard
                  business={business}
                  zoomLevel={zoomLevel}
                  onCategoryClick={setSelectedCategory}
                  isSelected={selectedItemId === business.id}
                  onSelect={handleCardSelect}
                />
              </div>
            ))}

            {/* Loading skeleton */}
            {loading && hasMore && (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={`skeleton-${i}`} className="space-y-3">
                    <Skeleton className="h-32 w-full" />
                  </div>
                ))}
              </>
            )}
          </div>

          {sortedBusinesses.length === 0 && !loading && (
            <Card className="p-8 text-center">
              <div className="space-y-2">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">No businesses found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            </Card>
          )}
        </DirectoryLayout>
      </div>
    </>
  );
};

export default BusinessDirectory;
