import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Users } from 'lucide-react';
import { Badge } from './badge';
import { Card } from './card';

interface AlumniMapProps {
  onLocationSelect?: (location: string) => void;
  selectedLocation?: string;
  className?: string;
}

interface AlumniLocation {
  location: string;
  count: number;
  coordinates?: [number, number];
}

export function AlumniMap({ onLocationSelect, selectedLocation, className }: AlumniMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [alumniLocations, setAlumniLocations] = useState<AlumniLocation[]>([]);
  const [loading, setLoading] = useState(true);

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
          .select('location_city, location_state, location_country')
          .or('location_city.not.is.null,location_country.not.is.null');

        if (error) throw error;

        // Group and count locations by city, country
        const locationCounts = data.reduce((acc: Record<string, number>, profile) => {
          if (profile.location_city || profile.location_country) {
            // Build location string from structured data
            const parts = [];
            if (profile.location_city) parts.push(profile.location_city);
            if (profile.location_state) parts.push(profile.location_state);
            if (profile.location_country) parts.push(profile.location_country);

            const locationString = parts.join(', ');
            if (locationString) {
              acc[locationString] = (acc[locationString] || 0) + 1;
            }
          }
          return acc;
        }, {});

        const locations: AlumniLocation[] = Object.entries(locationCounts).map(([location, count]) => ({
          location,
          count,
        }));

        setAlumniLocations(locations);
      } catch (error) {
        console.error('Error fetching alumni locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumniLocations();
  }, []);

  // Geocode locations to get coordinates
  useEffect(() => {
    if (!mapboxToken || alumniLocations.length === 0) return;

    const geocodeLocations = async () => {
      const updatedLocations = await Promise.all(
        alumniLocations.map(async (location) => {
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

      setAlumniLocations(updatedLocations);
    };

    geocodeLocations();
  }, [mapboxToken, alumniLocations.length]);

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

    // Enable all map interactions for natural dragging
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
        
        // Use smooth easing for auto-rotation only
        map.current.easeTo({ 
          center, 
          duration: 1000,
          easing: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, // ease-in-out
          essential: true
        });
      }
      
      // Schedule next rotation
      animationId = requestAnimationFrame(() => {
        setTimeout(spinGlobe, 1000);
      });
    }

    // Immediate interaction detection - no delays and cancel any ongoing ease
    const startInteraction = () => {
      userInteracting = true;
      map.current?.stop(); // cancel any ongoing camera animations immediately
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    const endInteraction = () => {
      userInteracting = false;
      // Resume spinning shortly after interaction ends
      setTimeout(spinGlobe, 800);
    };

    // Event listeners for truly natural dragging (cover all gestures)
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

  // Add heatmap-style markers when locations and coordinates are ready
  useEffect(() => {
    if (!map.current || alumniLocations.length === 0) return;

    // Clear existing markers and popups
    const markers = document.querySelectorAll('.alumni-marker');
    markers.forEach(marker => marker.remove());
    
    // Close any existing popups
    const existingPopups = document.querySelectorAll('.mapboxgl-popup');
    existingPopups.forEach(popup => popup.remove());

    let currentOpenPopup: mapboxgl.Popup | null = null;

    // Add heatmap-style markers for each location
    alumniLocations.forEach((location) => {
      if (!location.coordinates || !map.current) return;

      const size = Math.max(15, Math.min(60, location.count * 8));
      const intensity = Math.min(1, location.count / 10);

      // Create marker container
      const markerEl = document.createElement('div');
      markerEl.className = 'alumni-marker';
      markerEl.style.cssText = `
        position: relative;
        cursor: pointer;
      `;

      // Create inner marker element for animations
      const markerInner = document.createElement('div');
      markerInner.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, 
          hsla(210, 100%, 70%, ${0.8 * intensity}) 0%, 
          hsla(210, 100%, 50%, ${0.6 * intensity}) 40%, 
          hsla(210, 100%, 30%, ${0.3 * intensity}) 70%,
          transparent 100%);
        border: 2px solid hsla(210, 100%, 80%, ${0.9 * intensity});
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${Math.max(10, Math.min(14, size / 4))}px;
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        box-shadow: 
          0 0 20px hsla(210, 100%, 50%, ${0.4 * intensity}),
          0 0 40px hsla(210, 100%, 50%, ${0.2 * intensity});
        transition: all 0.3s ease;
        animation: pulse 2s infinite;
      `;
      markerInner.textContent = location.count.toString();
      markerEl.appendChild(markerInner);

      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);

      // Enhanced hover effect on inner element
      markerEl.addEventListener('mouseenter', () => {
        markerInner.style.transform = 'scale(1.3)';
        markerInner.style.zIndex = '1000';
        markerInner.style.boxShadow = `
          0 0 30px hsla(210, 100%, 50%, ${0.6 * intensity}),
          0 0 60px hsla(210, 100%, 50%, ${0.4 * intensity})
        `;
      });
      
      markerEl.addEventListener('mouseleave', () => {
        markerInner.style.transform = 'scale(1)';
        markerInner.style.zIndex = 'auto';
        markerInner.style.boxShadow = `
          0 0 20px hsla(210, 100%, 50%, ${0.4 * intensity}),
          0 0 40px hsla(210, 100%, 50%, ${0.2 * intensity})
        `;
      });

      // Enhanced popup with no white shadow/border and close button
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        className: 'alumni-popup',
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div style="
          padding: 16px; 
          background: hsl(210, 100%, 8%); 
          border-radius: 12px; 
          border: 1px solid hsla(210, 100%, 50%, 0.3);
          color: white;
          text-align: center;
          min-width: 140px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        ">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: hsl(210, 100%, 70%);">
            📍 ${location.location}
          </div>
          <div style="font-size: 14px; margin-bottom: 8px; color: hsl(210, 100%, 80%);">
            👥 ${location.count} alumni
          </div>
          <div style="font-size: 11px; opacity: 0.7; color: hsl(210, 100%, 60%);">
            Click to filter
          </div>
        </div>
      `);

      // Add click handler with popup management
      markerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Close any existing popup
        if (currentOpenPopup) {
          currentOpenPopup.remove();
        }
        
        // Open this popup
        currentOpenPopup = popup;
        popup.addTo(map.current!);
        
        onLocationSelect?.(location.location);
      });

      // Add marker to map
      new mapboxgl.Marker(markerEl)
        .setLngLat(location.coordinates)
        .addTo(map.current);
    });

  }, [alumniLocations, onLocationSelect]);

  // Add popup styles once on component mount
  useEffect(() => {
    // Check if styles already exist to avoid duplicates
    if (document.getElementById('alumni-popup-styles')) return;

    const popupStyle = document.createElement('style');
    popupStyle.id = 'alumni-popup-styles';
    popupStyle.textContent = `
      /* Remove the white background and default padding */
      .alumni-location-popup .mapboxgl-popup-content,
      .alumni-popup .mapboxgl-popup-content,
      .mapboxgl-popup-content {
        background: transparent !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }

      /* Fix all popup tip variations */
      .mapboxgl-popup-anchor-top .mapboxgl-popup-tip {
        border-bottom-color: hsl(210, 100%, 8%) !important;
        border-top-color: transparent !important;
        border-left-color: transparent !important;
        border-right-color: transparent !important;
      }
      .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
        border-top-color: hsl(210, 100%, 8%) !important;
        border-bottom-color: transparent !important;
        border-left-color: transparent !important;
        border-right-color: transparent !important;
      }
      .mapboxgl-popup-anchor-left .mapboxgl-popup-tip {
        border-right-color: hsl(210, 100%, 8%) !important;
        border-top-color: transparent !important;
        border-bottom-color: transparent !important;
        border-left-color: transparent !important;
      }
      .mapboxgl-popup-anchor-right .mapboxgl-popup-tip {
        border-left-color: hsl(210, 100%, 8%) !important;
        border-top-color: transparent !important;
        border-bottom-color: transparent !important;
        border-right-color: transparent !important;
      }

      /* Style the close button */
      .mapboxgl-popup-close-button {
        color: hsl(220, 40%, 70%) !important;
        font-size: 20px !important;
        right: 10px !important;
        top: 10px !important;
        width: 24px !important;
        height: 24px !important;
        border-radius: 50% !important;
        background: hsla(0, 0%, 0%, 0.6) !important;
        border: 1px solid hsla(210, 100%, 50%, 0.4) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        line-height: 1 !important;
      }

      .mapboxgl-popup-close-button:hover {
        color: white !important;
        background: hsla(0, 0%, 0%, 0.8) !important;
        border-color: hsla(210, 100%, 50%, 0.6) !important;
      }
    `;
    document.head.appendChild(popupStyle);

    // Cleanup on component unmount
    return () => {
      document.getElementById('alumni-popup-styles')?.remove();
    };
  }, []); // Empty dependency array - runs once

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6 text-center">
          <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Loading alumni locations...</p>
        </div>
      </Card>
    );
  }

  if (!mapboxToken) {
    return (
      <Card className={className}>
        <div className="p-6 text-center">
          <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Map unavailable</p>
          <p className="text-xs text-muted-foreground mt-1">Please configure Mapbox token</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="font-semibold">Alumni Locations</h3>
          {selectedLocation && (
            <Badge variant="secondary" className="ml-auto">
              {selectedLocation}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Click on markers to filter by location
        </p>
      </div>
      <div 
        ref={mapContainer} 
        className="h-[400px] w-full"
        style={{ borderRadius: '0 0 var(--radius) var(--radius)' }}
      />
    </Card>
  );
}