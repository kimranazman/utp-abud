import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@/styles/mapbox-popup.css';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Users, ArrowLeft, Loader2, Shuffle, Globe, Navigation, Search, X, Flag, Play, Pause, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { locations } from '@/data/locations';

interface AlumniProfile {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  avatar_thumbnail_url?: string;
  course?: string;
  graduation_year?: number;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  businesses?: {
    business_name: string;
    role?: string;
    is_primary?: boolean;
  }[];
}

interface BusinessProfile {
  id: string;
  business_name: string;
  industry?: string;
  website?: string;
  logo_url?: string;
  location?: string;
  user_id: string;
}

interface LocationGroup {
  city: string;
  state: string;
  country: string;
  displayName: string;
  coordinates?: [number, number];
  alumni: AlumniProfile[];
  businesses?: BusinessProfile[];
}

interface SearchResult {
  type: 'city' | 'state' | 'country' | 'alumni';
  name: string;
  displayName: string;
  alumniCount: number;
  businessCount?: number;
  coordinates?: [number, number];
  locations?: LocationGroup[];
  boundingBox?: [[number, number], [number, number]];
  alumni?: AlumniProfile; // For alumni search results
}

const AlumniMap = () => {
  // v2: Added search mode toggle and business markers
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [locationGroups, setLocationGroups] = useState<LocationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationGroup | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupsRef = useRef<mapboxgl.Popup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchMode, setSearchMode] = useState<'location' | 'alumni'>('location');
  const [highlightedCountry, setHighlightedCountry] = useState<string | null>(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [displayMode, setDisplayMode] = useState<'alumni' | 'business' | 'both'>('alumni');
  const autoRotateRef = useRef(isAutoRotate);
  useEffect(() => { autoRotateRef.current = isAutoRotate; }, [isAutoRotate]);
  // Get Mapbox token
  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) {
          console.error('Error invoking get-mapbox-token:', error);
          return;
        }
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Failed to get Mapbox token:', error);
      }
    };

    if (user) {
      getMapboxToken();
    }
  }, [user]);

  // Fetch alumni and businesses with structured locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Use secure function to fetch alumni data
        const { data: alumniData, error: alumniError } = await supabase
          .rpc('search_public_profiles', { 
            search_term: '', 
            limit_count: 1000 
          });

        if (alumniError) throw alumniError;

        // Filter alumni that have location data
        const filteredAlumniData = (alumniData || []).filter(profile => 
          profile.location_city && profile.location_city.trim() !== ''
        );

        // Fetch business data
        const { data: businessData, error: businessError } = await supabase
          .from('user_businesses')
          .select(`
            id,
            business_name,
            industry,
            website,
            logo_url,
            location,
            user_id
          `)
          .not('location', 'is', null)
          .eq('current_business', true);

        if (businessError) throw businessError;

        // Group data by location
        const locationMap = new Map<string, LocationGroup>();

        // Process alumni
        filteredAlumniData?.forEach((profile) => {
          if (!profile.location_city) return;

          const locationKey = `${profile.location_city}, ${profile.location_state || ''}, ${profile.location_country || 'United States'}`;
          const displayName = profile.location_state 
            ? `${profile.location_city}, ${profile.location_state}${profile.location_country !== 'United States' ? `, ${profile.location_country}` : ''}`
            : `${profile.location_city}${profile.location_country !== 'United States' ? `, ${profile.location_country}` : ''}`;

          if (!locationMap.has(locationKey)) {
            locationMap.set(locationKey, {
              city: profile.location_city,
              state: profile.location_state || '',
              country: profile.location_country || 'United States',
              displayName,
              alumni: [],
              businesses: []
            });
          }

          locationMap.get(locationKey)!.alumni.push(profile);
        });

        // Process businesses
        businessData?.forEach((business) => {
          if (!business.location) return;

          // Try to parse location string (assuming format: "City, State, Country" or "City, Country")
          const locationParts = business.location.split(',').map(s => s.trim());
          let city = locationParts[0] || '';
          let state = locationParts.length === 3 ? locationParts[1] : '';
          let country = locationParts[locationParts.length - 1] || 'United States';

          const locationKey = `${city}, ${state}, ${country}`;
          const displayName = state 
            ? `${city}, ${state}${country !== 'United States' ? `, ${country}` : ''}`
            : `${city}${country !== 'United States' ? `, ${country}` : ''}`;

          if (!locationMap.has(locationKey)) {
            locationMap.set(locationKey, {
              city,
              state,
              country,
              displayName,
              alumni: [],
              businesses: []
            });
          }

          locationMap.get(locationKey)!.businesses?.push(business);
        });

        setLocationGroups(Array.from(locationMap.values()));
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLocations();
    }
  }, [user]);

  // Geocode locations to get coordinates
  useEffect(() => {
    if (!mapboxToken || locationGroups.length === 0) return;

    const geocodeLocations = async () => {
      const updatedLocations = await Promise.all(
        locationGroups.map(async (locationGroup) => {
          try {
            const query = `${locationGroup.city}, ${locationGroup.state}, ${locationGroup.country}`;
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&limit=1`
            );
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
              const [lng, lat] = data.features[0].center;
              return { ...locationGroup, coordinates: [lng, lat] as [number, number] };
            }
            return locationGroup;
          } catch (error) {
            console.error(`Failed to geocode ${locationGroup.displayName}:`, error);
            return locationGroup;
          }
        })
      );

      setLocationGroups(updatedLocations);
    };

    geocodeLocations();
  }, [mapboxToken, locationGroups.length]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      projection: 'globe',
      center: [30, 15],
      zoom: 1.5,
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Enable all interactions for natural dragging
    map.current.scrollZoom.enable();
    map.current.dragPan.enable();
    map.current.dragRotate.enable();
    map.current.touchZoomRotate.enable();

    // Add atmosphere and fog effects
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(25, 25, 35)',
        'high-color': 'rgb(45, 45, 75)',
        'horizon-blend': 0.2,
      });
      
      // Add country boundaries source and layer for highlighting
      map.current?.addSource('country-boundaries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
      });
      
      map.current?.addLayer({
        id: 'country-highlight',
        type: 'fill',
        source: 'country-boundaries',
        'source-layer': 'country_boundaries',
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0
        }
      }, 'admin-1-boundary');
      
      map.current?.addLayer({
        id: 'country-highlight-border',
        type: 'line',
        source: 'country-boundaries',
        'source-layer': 'country_boundaries',
        paint: {
          'line-color': '#3b82f6',
          'line-width': 0,
          'line-opacity': 0
        }
      });
    });

    // Natural rotation logic without restricting dragging
    let lastInteraction = Date.now();
    let rotationId: number | null = null;

    const startRotation = () => {
      if (rotationId) {
        cancelAnimationFrame(rotationId);
      }

      const rotate = () => {
        if (!map.current || !autoRotateRef.current) {
          rotationId = null;
          return;
        }

        // Check if map is currently moving
        if (map.current.isMoving()) {
          rotationId = requestAnimationFrame(rotate);
          lastInteraction = Date.now();
          return;
        }

        // Wait 3 seconds after interaction before resuming rotation
        const idle = Date.now() - lastInteraction > 3000;
        if (idle) {
          const zoom = map.current.getZoom();
          if (zoom <= 3 && !map.current.isMoving()) {
            const center = map.current.getCenter();
            map.current.jumpTo({
              center: [center.lng - 0.1, center.lat]
            });
          }
        }

        rotationId = requestAnimationFrame(rotate);
      };

      rotationId = requestAnimationFrame(rotate);
    };

    const handleInteraction = () => {
      lastInteraction = Date.now();
      
      // Cancel rotation immediately
      if (rotationId) {
        cancelAnimationFrame(rotationId);
        rotationId = null;
      }
      
      // Restart after delay
      if (autoRotateRef.current) {
        setTimeout(() => {
          if (autoRotateRef.current && !map.current?.isMoving()) {
            startRotation();
          }
        }, 3000);
      }
    };

    // Attach interaction listeners
    const events = ['dragstart', 'zoomstart', 'pitchstart', 'rotatestart', 'wheel', 'mousedown'];
    events.forEach(event => {
      map.current.on(event as any, handleInteraction);
    });

    // Start auto-rotation if enabled
    if (autoRotateRef.current) {
      startRotation();
    }

    // Cleanup function
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Add markers based on display mode
  useEffect(() => {
    if (!map.current || locationGroups.length === 0) return;

    // Clear existing markers
    const markers = document.querySelectorAll('.alumni-location-marker, .business-location-marker');
    markers.forEach(marker => marker.remove());
    
    // Clear marker refs
    markersRef.current = [];
    popupsRef.current = [];

    // Track currently open popup
    let currentOpenPopup: mapboxgl.Popup | null = null;

    // Add markers for each location
    locationGroups.forEach((locationGroup) => {
      if (!locationGroup.coordinates || !map.current) return;

      const alumniCount = locationGroup.alumni.length;
      const businessCount = locationGroup.businesses?.length || 0;
      
      // Skip if no data to show based on display mode
      if (displayMode === 'alumni' && alumniCount === 0) return;
      if (displayMode === 'business' && businessCount === 0) return;
      if (displayMode === 'both' && alumniCount === 0 && businessCount === 0) return;
      
      // Determine what to show
      const showAlumni = displayMode === 'alumni' || displayMode === 'both';
      const showBusiness = displayMode === 'business' || displayMode === 'both';
      const count = displayMode === 'alumni' ? alumniCount : displayMode === 'business' ? businessCount : alumniCount + businessCount;
      const size = Math.max(20, Math.min(80, count * 10));
      const intensity = Math.min(1, count / 15);
      
      // Determine marker color based on type
      const isBusinessMarker = displayMode === 'business';
      const color = isBusinessMarker ? '140, 100%' : '220, 100%'; // Green for business, blue for alumni

      // Create marker container
      const markerEl = document.createElement('div');
      markerEl.className = isBusinessMarker ? 'business-location-marker' : 'alumni-location-marker';
      markerEl.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
      `;

      // Inner bubble that we animate (important: do NOT set transform on the outer container)
      const bubbleEl = document.createElement('div');
      bubbleEl.style.cssText = `
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, 
          hsla(${color}, 70%, ${0.9 * intensity}) 0%, 
          hsla(${color}, 60%, ${0.7 * intensity}) 30%, 
          hsla(${color}, 40%, ${0.5 * intensity}) 60%,
          hsla(${color}, 20%, ${0.3 * intensity}) 80%,
          transparent 100%);
        border: 3px solid hsla(${color}, 80%, ${0.8 * intensity});
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${Math.max(12, Math.min(18, size / 5))}px;
        font-weight: bold;
        text-shadow: 0 2px 4px rgba(0,0,0,0.9);
        box-shadow: 
          0 0 30px hsla(220, 100%, 60%, ${0.5 * intensity}),
          0 0 60px hsla(220, 100%, 50%, ${0.3 * intensity}),
          0 4px 20px rgba(0,0,0,0.3);
        transition: transform 0.15s ease, box-shadow 0.2s ease;
        animation: glow 3s ease-in-out infinite alternate;
        will-change: transform;
      `;
      bubbleEl.textContent = count.toString();

      markerEl.appendChild(bubbleEl);

      // Enhanced hover effect (scale the inner bubble only so Mapbox positioning is preserved)
      markerEl.addEventListener('mouseenter', () => {
        bubbleEl.style.transform = 'scale(1.15)';
        markerEl.style.zIndex = '1000';
      });
      
      markerEl.addEventListener('mouseleave', () => {
        bubbleEl.style.transform = 'scale(1)';
        markerEl.style.zIndex = '10';
      });

      // Create better formatted display name
      const getDisplayName = (group: LocationGroup) => {
        const parts = [];
        if (group.city) parts.push(group.city);
        if (group.state && group.state !== group.city) parts.push(group.state);
        if (group.country && group.country !== 'United States') parts.push(group.country);
        return parts.join(', ');
      };

      // Create detailed popup content with refined light theme styling
      const popupContent = `
        <div style="
          padding: 18px; 
          background: linear-gradient(to bottom, #ffffff, #fafafa); 
          border-radius: 14px; 
          border: 1px solid #e5e7eb;
          color: #111827;
          min-width: 280px;
          max-width: 320px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px; 
            font-weight: 600; 
            margin-bottom: 12px;
            color: #111827;
            letter-spacing: -0.025em;
          ">
            <span style="font-size: 16px; filter: saturate(0.8);">📍</span>
            ${getDisplayName(locationGroup)}
          </div>
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px; 
            margin-bottom: 16px;
            color: #6b7280;
            padding: 10px 14px;
            background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
            border-radius: 10px;
            border: 1px solid #e5e7eb;
          ">
            <span style="font-size: 16px;">👥</span>
            <span style="font-weight: 500;">${alumniCount} ${alumniCount === 1 ? 'alumnus' : 'alumni'}</span>
          </div>
          <div style="
            display: grid;
            gap: 10px;
            margin-bottom: 16px;
          ">
            ${locationGroup.alumni.slice(0, 3).map(alumnus => `
              <div style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: #ffffff;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.15s ease;
                border: 1px solid #f3f4f6;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              "
              onclick="window.open('/abud/profile/${alumnus.user_id}', '_blank')"
              onmouseover="this.style.background='#fafafa'; this.style.borderColor='#e5e7eb'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'; this.style.transform='translateY(-1px)'"
              onmouseout="this.style.background='#ffffff'; this.style.borderColor='#f3f4f6'; this.style.boxShadow='0 1px 2px 0 rgba(0, 0, 0, 0.05)'; this.style.transform='translateY(0)'"
              >
                <div style="
                  width: 32px;
                  height: 32px;
                  border-radius: 50%;
                  background: ${alumnus.avatar_thumbnail_url || alumnus.avatar_url 
                    ? `url('${alumnus.avatar_thumbnail_url || alumnus.avatar_url}') center/cover` 
                    : 'linear-gradient(135deg, #667eea, #764ba2)'};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 12px;
                  font-weight: 600;
                  border: 2px solid #f3f4f6;
                  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                ">
                  ${!alumnus.avatar_thumbnail_url && !alumnus.avatar_url 
                    ? (alumnus.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?')
                    : ''}
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="
                    font-size: 14px; 
                    font-weight: 500;
                    color: #111827;
                    letter-spacing: -0.01em;
                    margin-bottom: 4px;
                  ">
                    ${alumnus.full_name}
                  </div>
                  ${alumnus.course || alumnus.graduation_year ? `
                    <div style="
                      font-size: 12px;
                      color: #6b7280;
                      letter-spacing: -0.01em;
                    ">
                      ${[alumnus.course, alumnus.graduation_year].filter(Boolean).join(' • ')}
                    </div>
                  ` : ''}
                </div>
                <div style="
                  color: #9ca3af;
                  font-size: 14px;
                  transition: color 0.15s ease;
                ">
                  →
                </div>
              </div>
            `).join('')}
          </div>
          ${alumniCount > 3 ? `
            <div style="
              text-align: center;
              padding: 12px;
              background: linear-gradient(135deg, #1e293b, #0f172a);
              border-radius: 10px;
              color: white;
              font-size: 13px;
              font-weight: 600;
              letter-spacing: -0.01em;
              cursor: pointer;
              border: 1px solid #1e293b;
              transition: all 0.15s ease;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            " 
            onclick="window.open('/directory/alumni?location=${encodeURIComponent(getDisplayName(locationGroup))}', '_blank')"
            onmouseover="this.style.background='linear-gradient(135deg, #334155, #1e293b)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'"
            onmouseout="this.style.background='linear-gradient(135deg, #1e293b, #0f172a)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'"
            >
              View all ${alumniCount} alumni →
            </div>
          ` : ''}
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        className: 'alumni-location-popup',
        closeButton: true,
        closeOnClick: false
      }).setHTML(popupContent);

      // Add marker to map
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(locationGroup.coordinates)
        .setPopup(popup)
        .addTo(map.current);
      
      // Store references
      markersRef.current.push(marker);
      popupsRef.current.push(popup);

      // Handle marker click with auto-close functionality
      markerEl.addEventListener('click', () => {
        // Close any existing popup
        if (currentOpenPopup && currentOpenPopup !== popup) {
          currentOpenPopup.remove();
        }
        
        // Set the new popup as current
        currentOpenPopup = popup;
        
        setSelectedLocation(locationGroup);
        if (locationGroup.coordinates && map.current) {
          map.current.flyTo({
            center: locationGroup.coordinates,
            zoom: 8,
            essential: true
          });
        }
      });
      
      // Also handle popup close event
      popup.on('close', () => {
        if (currentOpenPopup === popup) {
          currentOpenPopup = null;
        }
      });
    });
  }, [locationGroups, displayMode]);

  // Navigation functions
  const navigateToRandomLocation = () => {
    if (!map.current || locationGroups.length === 0) return;
    
    const locationsWithCoords = locationGroups.filter(lg => lg.coordinates);
    if (locationsWithCoords.length === 0) return;
    
    setIsNavigating(true);
    const randomLocation = locationsWithCoords[Math.floor(Math.random() * locationsWithCoords.length)];
    
    // Close all popups first
    popupsRef.current.forEach(popup => popup.remove());
    
    map.current.flyTo({
      center: randomLocation.coordinates!,
      zoom: 6,
      duration: 2000,
      essential: true
    });
    
    // Open the popup for this location after flying
    setTimeout(() => {
      const locationIndex = locationGroups.indexOf(randomLocation);
      if (popupsRef.current[locationIndex]) {
        popupsRef.current[locationIndex].addTo(map.current!);
      }
      setSelectedLocation(randomLocation);
      setIsNavigating(false);
    }, 2000);
  };

  const navigateToContinent = (continent: string) => {
    if (!map.current) return;
    
    setIsNavigating(true);
    
    const continentCenters: Record<string, [number, number]> = {
      'North America': [-100, 45],
      'South America': [-60, -15],
      'Europe': [10, 50],
      'Africa': [20, 0],
      'Asia': [100, 30],
      'Oceania': [135, -25]
    };
    
    if (continentCenters[continent]) {
      map.current.flyTo({
        center: continentCenters[continent],
        zoom: 3,
        duration: 2000,
        essential: true
      });
      
      setTimeout(() => setIsNavigating(false), 2000);
    }
  };

  const resetView = () => {
    if (!map.current) return;
    
    setIsNavigating(true);
    popupsRef.current.forEach(popup => popup.remove());
    setSelectedLocation(null);
    setSearchQuery('');
    setShowSearchResults(false);
    clearCountryHighlight();
    
    map.current.flyTo({
      center: [30, 15],
      zoom: 1.5,
      pitch: 45,
      duration: 1500,
      essential: true
    });
    
    setTimeout(() => setIsNavigating(false), 1500);
  };

  // Search functionality with country/state aggregation and alumni search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      clearCountryHighlight();
      return;
    }
    
    const searchLower = query.toLowerCase();
    const results: SearchResult[] = [];
    
    if (searchMode === 'alumni') {
      // Search for alumni by name
      locationGroups.forEach(group => {
        group.alumni.forEach(alumnus => {
          if (alumnus.full_name?.toLowerCase().includes(searchLower)) {
            results.push({
              type: 'alumni',
              name: alumnus.full_name || 'Unknown',
              displayName: `${alumnus.full_name}${alumnus.course ? ` - ${alumnus.course}` : ''}${alumnus.graduation_year ? ` (${alumnus.graduation_year})` : ''}`,
              alumniCount: 1,
              coordinates: group.coordinates,
              locations: [group],
              alumni: alumnus
            });
          }
        });
      });
      
      // Sort alumni results by name
      results.sort((a, b) => a.name.localeCompare(b.name));
      
    } else {
      // Location search (existing logic)
      // Country aggregation
      const countryMap = new Map<string, LocationGroup[]>();
      const stateMap = new Map<string, LocationGroup[]>();
      
      locationGroups.forEach(group => {
        // Group by country
        if (!countryMap.has(group.country)) {
          countryMap.set(group.country, []);
        }
        countryMap.get(group.country)!.push(group);
        
        // Group by state
        if (group.state) {
          const stateKey = `${group.state}, ${group.country}`;
          if (!stateMap.has(stateKey)) {
            stateMap.set(stateKey, []);
          }
          stateMap.get(stateKey)!.push(group);
        }
      });
    
    // Check for country matches
    countryMap.forEach((locations, country) => {
      const countryLower = country.toLowerCase();
      const countryAliases: Record<string, string[]> = {
        'United States': ['usa', 'us', 'america', 'united states', 'states'],
        'United Kingdom': ['uk', 'britain', 'england', 'united kingdom'],
        'Malaysia': ['malaysia', 'my'],
        'Singapore': ['singapore', 'sg'],
        'Canada': ['canada', 'ca'],
        'Australia': ['australia', 'au']
      };
      
      let isMatch = countryLower.includes(searchLower);
      
      // Check aliases
      if (!isMatch && countryAliases[country]) {
        isMatch = countryAliases[country].some(alias => 
          alias.toLowerCase().includes(searchLower) || 
          searchLower.includes(alias.toLowerCase())
        );
      }
      
      if (isMatch && locations.length > 0) {
        const totalAlumni = locations.reduce((sum, loc) => sum + loc.alumni.length, 0);
        const avgCoords = locations[0].coordinates; // Use first location's coords for now
        
        results.push({
          type: 'country',
          name: country,
          displayName: country,
          alumniCount: totalAlumni,
          coordinates: avgCoords,
          locations: locations,
          boundingBox: getCountryBounds(country)
        });
      }
    });
    
    // Check for state matches
    stateMap.forEach((locations, stateKey) => {
      const stateLower = stateKey.toLowerCase();
      if (stateLower.includes(searchLower) && locations.length > 0) {
        const totalAlumni = locations.reduce((sum, loc) => sum + loc.alumni.length, 0);
        const avgCoords = locations[0].coordinates;
        
        results.push({
          type: 'state',
          name: stateKey.split(', ')[0],
          displayName: stateKey,
          alumniCount: totalAlumni,
          coordinates: avgCoords,
          locations: locations
        });
      }
    });
    
    // Check for city matches
    locationGroups.forEach(group => {
      if (group.displayName.toLowerCase().includes(searchLower)) {
        results.push({
          type: 'city',
          name: group.city,
          displayName: group.displayName,
          alumniCount: group.alumni.length,
          coordinates: group.coordinates,
          locations: [group]
        });
      }
    });
    
      // Sort results: countries first, then states, then cities
      results.sort((a, b) => {
        const typeOrder = { country: 0, state: 1, city: 2 };
        if (typeOrder[a.type] !== typeOrder[b.type]) {
          return typeOrder[a.type] - typeOrder[b.type];
        }
        return b.alumniCount - a.alumniCount;
      });
    }
    
    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  };
  
  // Get approximate country bounds for zooming
  const getCountryBounds = (country: string): [[number, number], [number, number]] | undefined => {
    const bounds: Record<string, [[number, number], [number, number]]> = {
      'United States': [[-125, 24], [-66, 49]],
      'Malaysia': [[100, 1], [119, 7]],
      'Singapore': [[103.6, 1.1], [104.1, 1.5]],
      'United Kingdom': [[-8, 50], [2, 59]],
      'Canada': [[-140, 42], [-52, 83]],
      'Australia': [[113, -39], [154, -10]]
    };
    return bounds[country];
  };
  
  // Highlight country on map
  const highlightCountry = (countryName: string) => {
    if (!map.current) return;
    
    const countryCode = getCountryCode(countryName);
    if (!countryCode) return;
    
    setHighlightedCountry(countryName);
    
    // Update the filter to highlight the selected country
    map.current.setFilter('country-highlight', ['==', ['get', 'iso_3166_1'], countryCode]);
    map.current.setFilter('country-highlight-border', ['==', ['get', 'iso_3166_1'], countryCode]);
    
    // Animate the highlight
    map.current.setPaintProperty('country-highlight', 'fill-opacity', 0.15);
    map.current.setPaintProperty('country-highlight-border', 'line-width', 2);
    map.current.setPaintProperty('country-highlight-border', 'line-opacity', 0.8);
  };
  
  const clearCountryHighlight = () => {
    if (!map.current) return;
    
    setHighlightedCountry(null);
    map.current.setFilter('country-highlight', ['==', 'iso_3166_1', '']);
    map.current.setFilter('country-highlight-border', ['==', 'iso_3166_1', '']);
    map.current.setPaintProperty('country-highlight', 'fill-opacity', 0);
    map.current.setPaintProperty('country-highlight-border', 'line-width', 0);
    map.current.setPaintProperty('country-highlight-border', 'line-opacity', 0);
  };
  
  const getCountryCode = (countryName: string): string | null => {
    const codes: Record<string, string> = {
      'United States': 'US',
      'Malaysia': 'MY',
      'Singapore': 'SG',
      'United Kingdom': 'GB',
      'Canada': 'CA',
      'Australia': 'AU',
      'Germany': 'DE',
      'France': 'FR',
      'Japan': 'JP',
      'China': 'CN',
      'India': 'IN'
    };
    return codes[countryName] || null;
  };

  const selectSearchResult = (result: SearchResult) => {
    if (!map.current) return;
    
    setIsNavigating(true);
    setShowSearchResults(false);
    
    // Close all popups first
    popupsRef.current.forEach(popup => popup.remove());
    
    if (result.type === 'country') {
      // For country results, fit to bounds and highlight
      if (result.boundingBox) {
        map.current.fitBounds(result.boundingBox, {
          padding: 50,
          duration: 2000
        });
      } else if (result.coordinates) {
        map.current.flyTo({
          center: result.coordinates,
          zoom: 4,
          duration: 2000,
          essential: true
        });
      }
      
      // Highlight the country
      highlightCountry(result.name);
      
      setTimeout(() => setIsNavigating(false), 2000);
      
    } else if (result.type === 'state') {
      // For state results, zoom to show all cities in state
      if (result.coordinates) {
        map.current.flyTo({
          center: result.coordinates,
          zoom: 6,
          duration: 2000,
          essential: true
        });
      }
      
      setTimeout(() => setIsNavigating(false), 2000);
      
    } else if (result.type === 'city' && result.locations && result.locations[0]) {
      // For city results, zoom in close and show popup
      const location = result.locations[0];
      
      if (location.coordinates) {
        map.current.flyTo({
          center: location.coordinates,
          zoom: 8,
          duration: 2000,
          essential: true
        });
        
        // Open the popup for this location after flying
        setTimeout(() => {
          const locationIndex = locationGroups.indexOf(location);
          if (locationIndex !== -1 && popupsRef.current[locationIndex]) {
            popupsRef.current[locationIndex].addTo(map.current!);
          }
          setSelectedLocation(location);
          setIsNavigating(false);
        }, 2000);
      }
    } else if (result.type === 'alumni' && result.locations && result.locations[0]) {
      // For alumni results, zoom to their location and highlight
      const location = result.locations[0];
      
      if (location.coordinates) {
        map.current.flyTo({
          center: location.coordinates,
          zoom: 10,
          duration: 2000,
          essential: true
        });
        
        // Open the popup for this location after flying and highlight the specific alumni
        setTimeout(() => {
          const locationIndex = locationGroups.indexOf(location);
          if (locationIndex !== -1 && popupsRef.current[locationIndex]) {
            popupsRef.current[locationIndex].addTo(map.current!);
          }
          setSelectedLocation(location);
          setIsNavigating(false);
          
          // Optionally open the alumni's profile in a new tab
          if (result.alumni?.user_id) {
            // You could add a confirmation or just navigate
            // window.open(`/abud/profile/${result.alumni.user_id}`, '_blank');
          }
        }, 2000);
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    clearCountryHighlight();
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Alumni World Map</h1>
        </div>
        <Card className="h-[calc(100vh-12rem)]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading alumni locations...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Alumni World Map</h1>
        </div>
        <Card className="h-[calc(100vh-12rem)]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Map Unavailable</h3>
              <p className="text-muted-foreground">The interactive map requires configuration.</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Alumni World Map</h1>
            <p className="text-muted-foreground">
              Discover where alumni are located around the world
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="font-medium">{locationGroups.reduce((total, group) => total + group.alumni.length, 0)} Alumni</span>
            <span className="text-muted-foreground">•</span>
            <Building2 className="h-5 w-5" />
            <span className="font-medium">{locationGroups.reduce((total, group) => total + (group.businesses?.length || 0), 0)} Businesses</span>
            <span className="text-muted-foreground">•</span>
            <MapPin className="h-5 w-5" />
            <span className="font-medium">{locationGroups.length} Locations</span>
          </div>
        </div>
      </div>

      <Card className="h-[calc(100vh-12rem)]">
        <div className="p-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse"></div>
              <span className="text-sm font-medium">Interactive Alumni Map</span>
            </div>
            {selectedLocation && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                {selectedLocation.displayName} • {selectedLocation.alumni.length} alumni
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Click on markers to explore alumni in each location • Scroll to zoom • Drag to explore
          </p>
        </div>
        <div className="relative flex-1" style={{ height: 'calc(100% - 80px)' }}>
          <div 
            ref={mapContainer} 
            className="w-full h-full"
          />
          
          {/* Search Bar and Controls */}
          <div className="absolute top-6 left-6 right-6 max-w-xl mx-auto z-20">
            {/* Search Type Selector and Search Bar */}
            <div className="space-y-3">
              {/* Search Bar with Type Indicator */}
              <div className="relative">
                <div className="flex gap-2">
                  {/* Search Type Toggle */}
                  <Card className="p-1 bg-white/95 backdrop-blur-sm shadow-lg border-gray-200">
                    <ToggleGroup type="single" value={searchMode} onValueChange={(value) => value && setSearchMode(value as 'location' | 'alumni')} className="h-9">
                      <ToggleGroupItem value="location" className="text-xs px-3">
                        <MapPin className="h-3 w-3 mr-1" />
                        Location
                      </ToggleGroupItem>
                      <ToggleGroupItem value="alumni" className="text-xs px-3">
                        <Users className="h-3 w-3 mr-1" />
                        Alumni
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </Card>
                  
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={searchMode === 'location' ? "Search locations (e.g., Kuala Lumpur)..." : "Search alumni by name..."}
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 pr-10 shadow-lg border-gray-200 bg-white/95 backdrop-blur-sm focus:bg-white h-9"
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Display Mode Toggle - Below Search */}
              <div className="flex justify-center">
                <Card className="p-1.5 bg-white/95 backdrop-blur-sm shadow-md border-gray-200">
                  <div className="flex items-center gap-2 px-2 text-xs text-gray-600">
                    <span className="font-medium">Show:</span>
                    <ToggleGroup type="single" value={displayMode} onValueChange={(value) => value && setDisplayMode(value as any)} className="h-7">
                      <ToggleGroupItem value="alumni" className="text-xs px-3 h-7">
                        <Users className="h-3 w-3 mr-1" />
                        Alumni
                      </ToggleGroupItem>
                      <ToggleGroupItem value="business" className="text-xs px-3 h-7">
                        <Building2 className="h-3 w-3 mr-1" />
                        Businesses
                      </ToggleGroupItem>
                      <ToggleGroupItem value="both" className="text-xs px-3 h-7">
                        Both
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </Card>
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50">
                  <div className="py-2">
                    {searchResults.slice(0, 10).map((result, index) => (
                      <button
                        key={index}
                        onClick={() => selectSearchResult(result)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          {result.type === 'country' ? (
                            <Flag className="h-4 w-4 text-blue-500 group-hover:text-blue-600" />
                          ) : result.type === 'state' ? (
                            <Globe className="h-4 w-4 text-green-500 group-hover:text-green-600" />
                          ) : result.type === 'alumni' ? (
                            <Users className="h-4 w-4 text-purple-500 group-hover:text-purple-600" />
                          ) : (
                            <MapPin className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-gray-900">
                                {result.displayName}
                              </span>
                              {result.type === 'country' && (
                                <Badge variant="default" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                  Country
                                </Badge>
                              )}
                              {result.type === 'state' && (
                                <Badge variant="default" className="text-xs bg-green-100 text-green-700 border-green-200">
                                  State/Region
                                </Badge>
                              )}
                              {result.type === 'alumni' && (
                                <Badge variant="default" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                                  Alumni
                                </Badge>
                              )}
                            </div>
                            {result.type === 'country' && result.locations && (
                              <div className="text-xs text-gray-500 mt-1">
                                {result.locations.length} location{result.locations.length !== 1 ? 's' : ''} across {result.name}
                              </div>
                            )}
                            {result.type === 'alumni' && result.locations && result.locations[0] && (
                              <div className="text-xs text-gray-500 mt-1">
                                📍 {result.locations[0].displayName}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {result.alumniCount} {result.alumniCount === 1 ? 'alumnus' : 'alumni'}
                          </Badge>
                          <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                          </span>
                        </div>
                      </button>
                    ))}
                    {searchResults.length > 10 && (
                      <div className="px-4 py-2 text-xs text-gray-500 border-t">
                        Showing 10 of {searchResults.length} results
                      </div>
                    )}
                  </div>
                  {searchResults.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">
                      No locations found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Floating Navigation Controls */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="shadow-lg backdrop-blur-sm bg-white/95 hover:bg-white border-gray-200"
              onClick={navigateToRandomLocation}
              disabled={isNavigating || locationGroups.length === 0}
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Random Location
            </Button>

            <Button
              size="sm"
              variant="secondary"
              className="shadow-lg backdrop-blur-sm bg-white/95 hover:bg-white border-gray-200"
              onClick={() => setIsAutoRotate(v => !v)}
              title={isAutoRotate ? 'Turn off auto-rotate' : 'Turn on auto-rotate'}
            >
              {isAutoRotate ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isAutoRotate ? 'Auto-rotate: On' : 'Auto-rotate: Off'}
            </Button>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="shadow-lg backdrop-blur-sm bg-white/95 hover:bg-white border-gray-200"
                onClick={() => navigateToContinent('Asia')}
                disabled={isNavigating}
                title="View Asia"
              >
                <Globe className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="shadow-lg backdrop-blur-sm bg-white/95 hover:bg-white border-gray-200"
                onClick={() => navigateToContinent('Europe')}
                disabled={isNavigating}
                title="View Europe"
              >
                <Navigation className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="shadow-lg backdrop-blur-sm bg-white/95 hover:bg-white border-gray-200"
                onClick={resetView}
                disabled={isNavigating}
                title="Reset View"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Navigation Status */}
          {isNavigating && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Navigating...</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AlumniMap;