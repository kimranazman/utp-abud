import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Users, Building2 } from 'lucide-react';
import { Badge } from './badge';
import { Card } from './card';
import { Button } from './button';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

interface WorldMapEnhancedProps {
  onLocationSelect?: (location: string) => void;
  selectedLocation?: string;
  className?: string;
}

interface LocationData {
  location: string;
  count: number;
  coordinates?: [number, number];
  type: 'alumni' | 'business';
  details?: any;
}

export function WorldMapEnhanced({ onLocationSelect, selectedLocation, className }: WorldMapEnhancedProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [alumniLocations, setAlumniLocations] = useState<LocationData[]>([]);
  const [businessLocations, setBusinessLocations] = useState<LocationData[]>([]);
  const [displayMode, setDisplayMode] = useState<'alumni' | 'business' | 'both'>('alumni');
  const [loading, setLoading] = useState(true);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

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

    getMapboxToken();
  }, []);

  // Fetch alumni locations
  useEffect(() => {
    const fetchAlumniLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('location, full_name, course, graduation_year')
          .not('location', 'is', null)
          .eq('is_verified', true);

        if (error) throw error;

        // Group and count locations
        const locationGroups = data.reduce((acc: Record<string, any[]>, profile) => {
          if (profile.location) {
            if (!acc[profile.location]) acc[profile.location] = [];
            acc[profile.location].push(profile);
          }
          return acc;
        }, {});

        const locations: LocationData[] = Object.entries(locationGroups).map(([location, profiles]) => ({
          location,
          count: profiles.length,
          type: 'alumni' as const,
          details: profiles
        }));

        setAlumniLocations(locations);
      } catch (error) {
        console.error('Error fetching alumni locations:', error);
      }
    };

    fetchAlumniLocations();
  }, []);

  // Fetch business locations
  useEffect(() => {
    const fetchBusinessLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('user_businesses')
          .select('location, business_name, industry, website, logo_url')
          .not('location', 'is', null)
          .eq('current_business', true);

        if (error) throw error;

        // Group and count business locations
        const locationGroups = data.reduce((acc: Record<string, any[]>, business) => {
          if (business.location) {
            if (!acc[business.location]) acc[business.location] = [];
            acc[business.location].push(business);
          }
          return acc;
        }, {});

        const locations: LocationData[] = Object.entries(locationGroups).map(([location, businesses]) => ({
          location,
          count: businesses.length,
          type: 'business' as const,
          details: businesses
        }));

        setBusinessLocations(locations);
      } catch (error) {
        console.error('Error fetching business locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessLocations();
  }, []);

  // Geocode locations to get coordinates
  const geocodeLocations = async (locations: LocationData[]): Promise<LocationData[]> => {
    if (!mapboxToken || locations.length === 0) return locations;

    const updatedLocations = await Promise.all(
      locations.map(async (location) => {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location.location)}.json?access_token=${mapboxToken}&limit=1`
          );
          const data = await response.json();
          
          if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center;
            return { ...location, coordinates: [lng, lat] as [number, number] };
          }
          return location;
        } catch (error) {
          console.error(`Failed to geocode ${location.location}:`, error);
          return location;
        }
      })
    );

    return updatedLocations;
  };

  // Geocode alumni locations
  useEffect(() => {
    if (!mapboxToken || alumniLocations.length === 0) return;
    
    geocodeLocations(alumniLocations).then(setAlumniLocations);
  }, [mapboxToken, alumniLocations.length]);

  // Geocode business locations
  useEffect(() => {
    if (!mapboxToken || businessLocations.length === 0) return;
    
    geocodeLocations(businessLocations).then(setBusinessLocations);
  }, [mapboxToken, businessLocations.length]);

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

    // Add atmosphere and fog effects
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(25, 25, 35)',
        'high-color': 'rgb(45, 45, 75)',
        'horizon-blend': 0.2,
      });
    });

    // Enable all map interactions
    map.current.scrollZoom.enable();
    map.current.dragPan.enable();
    map.current.dragRotate.enable();
    map.current.touchZoomRotate.enable();

    // Auto-rotation settings
    const secondsPerRevolution = 120;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    let userInteracting = false;
    let spinEnabled = true;
    let animationId: number | null = null;

    function spinGlobe() {
      if (!map.current || !spinEnabled || userInteracting) {
        animationId = null;
        return;
      }
      
      const zoom = map.current.getZoom();
      if (zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        
        const center = map.current.getCenter();
        center.lng -= distancePerSecond / 60;
        
        map.current.easeTo({ 
          center, 
          duration: 1000,
          easing: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
          essential: true
        });
      }
      
      animationId = requestAnimationFrame(() => {
        setTimeout(spinGlobe, 1000);
      });
    }

    const startInteraction = () => {
      userInteracting = true;
      map.current?.stop();
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    const endInteraction = () => {
      userInteracting = false;
      setTimeout(spinGlobe, 800);
    };

    // Event listeners for interaction
    map.current.on('mousedown', startInteraction);
    map.current.on('touchstart', startInteraction);
    map.current.on('dragstart', startInteraction);
    map.current.on('zoomstart', startInteraction);
    map.current.on('pitchstart', startInteraction);
    map.current.on('rotatestart', startInteraction);
    map.current.on('movestart', startInteraction);
    
    map.current.on('mouseup', endInteraction);
    map.current.on('touchend', endInteraction);
    map.current.on('dragend', endInteraction);
    map.current.on('zoomend', endInteraction);
    map.current.on('pitchend', endInteraction);
    map.current.on('rotateend', endInteraction);
    map.current.on('moveend', endInteraction);

    // Start auto-rotation
    setTimeout(spinGlobe, 2000);

    // Cleanup function
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update markers based on display mode
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    let locationsToShow: LocationData[] = [];
    
    if (displayMode === 'alumni') {
      locationsToShow = alumniLocations;
    } else if (displayMode === 'business') {
      locationsToShow = businessLocations;
    } else {
      locationsToShow = [...alumniLocations, ...businessLocations];
    }

    // Add markers for each location
    locationsToShow.forEach((location) => {
      if (!location.coordinates || !map.current) return;

      const isAlumni = location.type === 'alumni';
      const size = Math.max(20, Math.min(60, location.count * 8));
      const intensity = Math.min(1, location.count / 10);

      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = `map-marker ${location.type}-marker`;
      markerEl.style.cssText = `
        position: relative;
        cursor: pointer;
        width: ${size}px;
        height: ${size}px;
      `;

      // Create inner marker element
      const markerInner = document.createElement('div');
      const color = isAlumni ? '210, 100%' : '140, 100%'; // Blue for alumni, green for business
      
      markerInner.style.cssText = `
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, 
          hsla(${color}, 70%, ${0.8 * intensity}) 0%, 
          hsla(${color}, 50%, ${0.6 * intensity}) 40%, 
          hsla(${color}, 30%, ${0.3 * intensity}) 70%,
          transparent 100%);
        border: 2px solid hsla(${color}, 80%, ${0.9 * intensity});
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${Math.max(10, Math.min(14, size / 4))}px;
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        box-shadow: 
          0 0 20px hsla(${color}, 50%, ${0.4 * intensity}),
          0 0 40px hsla(${color}, 50%, ${0.2 * intensity});
        transition: all 0.3s ease;
        animation: pulse 2s infinite;
      `;
      
      // Add icon and count
      const iconEl = document.createElement('div');
      iconEl.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      `;
      
      const icon = document.createElement('div');
      icon.innerHTML = isAlumni ? 
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>' :
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M19 21V11l-6-4"></path><rect width="4" height="6" x="9" y="9"></rect><rect width="4" height="6" x="14" y="12"></rect></svg>';
      
      const count = document.createElement('div');
      count.textContent = location.count.toString();
      
      iconEl.appendChild(icon);
      iconEl.appendChild(count);
      markerInner.appendChild(iconEl);
      markerEl.appendChild(markerInner);

      // Add hover effect
      markerEl.addEventListener('mouseenter', () => {
        markerInner.style.transform = 'scale(1.2)';
      });
      
      markerEl.addEventListener('mouseleave', () => {
        markerInner.style.transform = 'scale(1)';
      });

      // Create popup content with sanitized data
      const popupContent = document.createElement('div');
      popupContent.style.cssText = 'max-width: 200px;';

      const container = document.createElement('div');
      container.style.padding = '8px';

      // Title
      const title = document.createElement('h3');
      title.style.cssText = 'margin: 0 0 8px 0; font-weight: bold; font-size: 14px;';
      title.textContent = location.location; // Safe: uses textContent
      container.appendChild(title);

      // Count
      const countP = document.createElement('p');
      countP.style.cssText = 'margin: 0; font-size: 12px; color: #666;';
      const countStrong = document.createElement('strong');
      countStrong.textContent = location.count.toString();
      countP.appendChild(countStrong);
      countP.appendChild(document.createTextNode(isAlumni ? ' alumni' : ` ${location.count === 1 ? 'business' : 'businesses'}`));
      container.appendChild(countP);

      // Details
      if (location.details && location.details.length > 0) {
        const detailsDiv = document.createElement('div');
        detailsDiv.style.cssText = 'margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-size: 11px; color: #888;';

        const recentText = document.createTextNode('Recent: ');
        detailsDiv.appendChild(recentText);

        const names = location.details.slice(0, 3).map((item: any) =>
          isAlumni ? item.full_name : item.business_name
        ).join(', ');

        // Sanitize names before displaying
        detailsDiv.appendChild(document.createTextNode(names));

        if (location.details.length > 3) {
          const moreText = document.createTextNode(` +${location.details.length - 3} more`);
          detailsDiv.appendChild(moreText);
        }

        container.appendChild(detailsDiv);
      }

      popupContent.appendChild(container);

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
      }).setDOMContent(popupContent);

      // Create marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(location.coordinates)
        .setPopup(popup)
        .addTo(map.current);

      // Show popup on hover
      markerEl.addEventListener('mouseenter', () => {
        popup.addTo(map.current!);
      });
      
      markerEl.addEventListener('mouseleave', () => {
        popup.remove();
      });

      // Click to select location
      markerEl.addEventListener('click', () => {
        if (onLocationSelect) {
          onLocationSelect(location.location);
        }
      });

      markersRef.current.push(marker);
    });

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);

  }, [displayMode, alumniLocations, businessLocations, onLocationSelect]);

  return (
    <div className={className}>
      {/* Toggle Controls */}
      <div className="absolute top-4 left-4 z-10">
        <Card className="p-2 bg-background/95 backdrop-blur">
          <ToggleGroup type="single" value={displayMode} onValueChange={(value) => value && setDisplayMode(value as any)}>
            <ToggleGroupItem value="alumni" aria-label="Show Alumni">
              <Users className="h-4 w-4 mr-2" />
              Alumni ({alumniLocations.reduce((sum, loc) => sum + loc.count, 0)})
            </ToggleGroupItem>
            <ToggleGroupItem value="business" aria-label="Show Businesses">
              <Building2 className="h-4 w-4 mr-2" />
              Businesses ({businessLocations.reduce((sum, loc) => sum + loc.count, 0)})
            </ToggleGroupItem>
            <ToggleGroupItem value="both" aria-label="Show Both">
              Both
            </ToggleGroupItem>
          </ToggleGroup>
        </Card>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="p-3 bg-background/95 backdrop-blur">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">Alumni Locations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Business Locations</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map data...</p>
          </div>
        </div>
      )}
    </div>
  );
}