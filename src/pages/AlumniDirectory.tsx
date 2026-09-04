import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationCombobox } from '@/components/ui/location-combobox';
import { ZoomSlider, getGridColumnsClass } from '@/components/ui/zoom-slider';
import { SEO } from '@/components/SEO';
import { locations } from '@/data/locations';
import { AlumniCard } from '@/components/directory/AlumniCard';
import { AlumniMap } from '@/components/ui/alumni-map';
import { DirectoryLayout } from '@/components/directory/DirectoryLayout';
import { FilterPills, getGraduationEraOptions, isYearInEra } from '@/components/directory/FilterPills';
import { DirectoryMap, MapItem } from '@/components/directory/DirectoryMap';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { IncompleteProfileBanner } from '@/components/IncompleteProfileBanner';
import { Search, Filter, MapPin, Calendar, Briefcase, Mail, ExternalLink, Map } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const AlumniDirectory = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>(searchParams.get('location') || 'all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(!!searchParams.get('location'));
  const [zoomLevel, setZoomLevel] = useState(3);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isMapDrawerOpen, setIsMapDrawerOpen] = useState(false);
  const pendingScrollRef = useRef<string | null>(null);

  // Filter pills state
  const [pillFilters, setPillFilters] = useState<Record<string, string[]>>({
    era: [],
    country: [],
  });

  useEffect(() => {
    if (loading) return;
    // Allow public access to alumni directory
    fetchAlumni();
  }, [loading]);

  const fetchAlumni = async () => {
    try {
      setLoadingData(true);

      // Log current user status
      console.log('Current user:', user);
      console.log('Fetching alumni directory...');

      // Use secure function to fetch alumni profiles that protects sensitive data
      const { data: profiles, error: profilesError } = await supabase
        .rpc('search_public_profiles', {
          search_term: '',
          limit_count: 1000
        });

      if (profilesError) throw profilesError;

      // For each profile, fetch their career history and links
      const alumniWithDetails = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Fetch career history
          const { data: careerHistory } = await supabase
            .from('career_history')
            .select('company_name, position, current_position')
            .eq('user_id', profile.user_id);

          // Fetch user links
          const { data: userLinks } = await supabase
            .from('user_links')
            .select('platform, url')
            .eq('user_id', profile.user_id);

          return {
            ...profile,
            career_history: careerHistory || [],
            user_links: userLinks || []
          };
        })
      );

      setAlumni(alumniWithDetails);
    } catch (error) {
      console.error('Error fetching alumni:', error);
      toast.error('Failed to load alumni directory');
    } finally {
      setLoadingData(false);
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
    const cardElement = document.querySelector(`[data-alumni-id="${itemId}"]`);
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
        const cardElement = document.querySelector(`[data-alumni-id="${itemId}"]`);
        if (cardElement) {
          cardElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 300);
    }
  }, [isMapDrawerOpen]);

  const filteredAlumni = alumni.filter(alumnus => {
    const matchesSearch = alumnus.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alumnus.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alumnus.course?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = selectedCourse === 'all' || alumnus.course === selectedCourse;
    const matchesYear = selectedYear === 'all' || alumnus.graduation_year?.toString() === selectedYear;

    // Use only structured fields for location filtering
    // When the location string contains commas (e.g. "Kuala Lumpur, Federal Territory, Malaysia"),
    // split into parts and check each part against the individual fields
    const locLower = selectedLocation.toLowerCase();
    const matchesLocation = selectedLocation === 'all' ||
      (selectedLocation.includes(',')
        ? selectedLocation.split(',').map(s => s.trim().toLowerCase()).every(part =>
            alumnus.location_city?.toLowerCase().includes(part) ||
            alumnus.location_state?.toLowerCase().includes(part) ||
            alumnus.location_country?.toLowerCase().includes(part)
          )
        : alumnus.location_city?.toLowerCase().includes(locLower) ||
          alumnus.location_state?.toLowerCase().includes(locLower) ||
          alumnus.location_country?.toLowerCase().includes(locLower)
      );

    const matchesCountry = selectedCountry === 'all' ||
                          alumnus.location_country === selectedCountry;

    const matchesPosition = selectedPosition === 'all' ||
                           alumnus.career_history?.some((ch: any) =>
                             ch.position?.toLowerCase().includes(selectedPosition.toLowerCase()) ||
                             ch.company_name?.toLowerCase().includes(selectedPosition.toLowerCase())
                           );

    // Era filter (from pills)
    const matchesEra = pillFilters.era.length === 0 ||
      pillFilters.era.some(era =>
        alumnus.graduation_year && isYearInEra(alumnus.graduation_year, era)
      );

    // Country filter (from pills)
    const matchesCountryPill = pillFilters.country.length === 0 ||
      pillFilters.country.includes(alumnus.location_country || '');

    return matchesSearch && matchesCourse && matchesYear && matchesLocation &&
           matchesCountry && matchesPosition && matchesEra && matchesCountryPill;
  });

  // Clear selection if selected item is filtered out
  useEffect(() => {
    if (selectedItemId && !filteredAlumni.some(a => a.user_id === selectedItemId)) {
      setSelectedItemId(null);
    }
  }, [filteredAlumni, selectedItemId]);

  // Get unique values for filters
  const courses = [...new Set(alumni.map(a => a.course).filter(Boolean))];
  const years = [...new Set(alumni.map(a => a.graduation_year).filter(Boolean))].sort((a, b) => b - a);
  // Use structured location fields only
  const alumniLocations = [...new Set([
    ...alumni.map(a => a.location_city).filter(Boolean),
    ...alumni.map(a => a.location_state).filter(Boolean)
  ])];
  const countries = [...new Set([
    ...locations.map(l => l.country),
    ...alumni.map(a => a.location_country).filter(Boolean)
  ])].sort();
  const positions = [...new Set(alumni.flatMap(a =>
    a.career_history?.map((ch: any) => ch.position) || []
  ).filter(Boolean))];
  const companies = [...new Set(alumni.flatMap(a =>
    a.career_history?.map((ch: any) => ch.company_name) || []
  ).filter(Boolean))];

  // Convert alumni to MapItem format for DirectoryMap
  const mapItems: MapItem[] = filteredAlumni.map(a => ({
    id: a.user_id,
    name: a.full_name || 'Unknown',
    location_city: a.hide_location ? null : a.location_city,
    location_state: a.hide_location ? null : a.location_state,
    location_country: a.hide_location ? null : a.location_country,
    type: 'alumni' as const,
    subtitle: a.graduation_year ? `Class of ${a.graduation_year}` : undefined,
    avatarUrl: a.avatar_thumbnail_url || a.avatar_url,
  }));

  // Get unique countries from alumni data for filter pills
  const uniqueCountries = [...new Set(alumni.map(a => a.location_country).filter(Boolean))].sort();

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const getCurrentPosition = (careerHistory: any[]) => {
    const current = careerHistory?.find(c => c.current_position);
    return current ? `${current.position} at ${current.company_name}` : 'Position not specified';
  };

  if (loadingData) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Alumni Directory - UTP Alumni Business Directory"
        description="Connect with thousands of UTP alumni worldwide. Search by batch, industry, location and more. Find fellow graduates from Universiti Teknologi PETRONAS."
        canonical="/directory/alumni"
      />
      <IncompleteProfileBanner />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Alumni Directory</h1>
          <p className="text-muted-foreground">
            Connect with {alumni.length} UTP alumni worldwide
          </p>
        </div>

        {/* Filter Pills */}
        <div className="mb-4">
          <FilterPills
            filters={[
              {
                id: 'era',
                label: 'Graduation',
                options: getGraduationEraOptions(),
                maxVisible: 4,
              },
              {
                id: 'country',
                label: 'Country',
                options: uniqueCountries.map(c => ({ value: c, label: c })),
                maxVisible: 5,
              },
            ]}
            activeFilters={pillFilters}
            onFilterChange={handlePillFilterChange}
            onClearAll={() => setPillFilters({ era: [], country: [] })}
          />
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Alumni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, course, or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
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
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <LocationCombobox
                    value={selectedLocation === 'all' ? '' : selectedLocation}
                    onValueChange={(value) => setSelectedLocation(value || 'all')}
                    placeholder="Filter by specific location"
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by position/company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      {positions.map(position => (
                        <SelectItem key={position} value={position}>{position}</SelectItem>
                      ))}
                      {companies.map(company => (
                        <SelectItem key={company} value={company}>{company}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCourse('all');
                      setSelectedYear('all');
                      setSelectedLocation('all');
                      setSelectedCountry('all');
                      setSelectedPosition('all');
                      setPillFilters({ era: [], country: [] });
                    }}
                    className="gap-2"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Split-view layout */}
        <DirectoryLayout
          mapContent={
            <DirectoryMap
              items={mapItems}
              type="alumni"
              selectedItemId={selectedItemId}
              onMarkerClick={handleMarkerClick}
            />
          }
          storageKey="alumni-directory-map"
          isMapOpen={isMapDrawerOpen}
          setIsMapOpen={setIsMapDrawerOpen}
        >
          {/* Results count and zoom */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {filteredAlumni.length} of {alumni.length} alumni
            </p>
            <ZoomSlider value={zoomLevel} onValueChange={setZoomLevel} />
          </div>

          {/* Alumni Grid */}
          <div className={`grid gap-4 ${getGridColumnsClass(zoomLevel)}`}>
            {filteredAlumni.map((alumnus) => (
              <AlumniCard
                key={alumnus.user_id}
                alumnus={alumnus}
                zoomLevel={zoomLevel}
                isSelected={selectedItemId === alumnus.user_id}
                onSelect={handleCardSelect}
              />
            ))}
          </div>

          {filteredAlumni.length === 0 && (
            <Card className="p-8 text-center">
              <div className="space-y-2">
                <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">No alumni found</h3>
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

export default AlumniDirectory;
