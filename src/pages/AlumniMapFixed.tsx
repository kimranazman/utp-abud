import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Search, Users, MapPin, Shuffle, Globe, RotateCw, ZoomIn, ZoomOut, Compass, Navigation, Info, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/mapbox-popup.css';
import { getMapboxToken, geocodeLocations } from '@/lib/mapbox-cache';

interface LocationGroup {
  city: string;
  state?: string;
  country: string;
  displayName: string;
  alumni: any[];
  coordinates?: [number, number];
}

interface SearchResult {
  type: 'country' | 'state' | 'city';
  name: string;
  displayName: string;
  alumniCount: number;
  coordinates?: [number, number];
  locations?: LocationGroup[];
  boundingBox?: [[number, number], [number, number]];
}

// Fallback coordinates for major cities when geocoding fails
const FALLBACK_COORDINATES: { [key: string]: [number, number] } = {
  'Singapore, Singapore': [103.8198, 1.3521],
  'Austin, Texas, United States': [-97.7431, 30.2672],
  'San Francisco, California, United States': [-122.4194, 37.7749],
  'New York, New York, United States': [-74.0060, 40.7128],
  'London, United Kingdom': [-0.1278, 51.5074],
  'Dubai, United Arab Emirates': [55.2708, 25.2048],
  'Mumbai, India': [72.8777, 19.0760],
  'Barcelona, Spain': [2.1734, 41.3851],
  'Vancouver, Canada': [-123.1216, 49.2827],
  'Seoul, South Korea': [126.9780, 37.5665],
  'São Paulo, Brazil': [-46.6333, -23.5505],
  'Kuala Lumpur, Malaysia': [101.6869, 3.1390],
  'Jakarta, Indonesia': [106.8456, -6.2088],
  'Bangkok, Thailand': [100.5018, 13.7563],
  'Tokyo, Japan': [139.6503, 35.6762],
  'Sydney, Australia': [151.2093, -33.8688],
  'Los Angeles, California, United States': [-118.2437, 34.0522],
  'Chicago, Illinois, United States': [-87.6298, 41.8781],
  'Houston, Texas, United States': [-95.3698, 29.7604],
  'Boston, Massachusetts, United States': [-71.0589, 42.3601],
  // Country-level fallbacks for alumni with only country set
  'Malaysia': [101.6869, 3.1390],
  'Indonesia': [106.8456, -6.2088],
  'Singapore': [103.8198, 1.3521],
  'United States': [-98.5795, 39.8283],
  'United Kingdom': [-0.1278, 51.5074],
  'India': [72.8777, 19.0760],
  'United Arab Emirates': [55.2708, 25.2048],
  'Canada': [-106.3468, 56.1304],
  'Australia': [151.2093, -33.8688],
  'South Korea': [126.9780, 37.5665],
  'Japan': [139.6503, 35.6762],
  'Spain': [-3.7038, 40.4168],
  'Brazil': [-46.6333, -23.5505],
  'Thailand': [100.5018, 13.7563],
  'Philippines': [121.7740, 12.8797],
  'Germany': [13.4050, 52.5200],
  'France': [2.3522, 48.8566],
  'Netherlands': [4.9041, 52.3676],
  'China': [116.4074, 39.9042],
  'Vietnam': [105.8342, 21.0278],
  'Brunei': [114.9480, 4.9431],
  'Saudi Arabia': [46.6753, 24.7136],
  'Qatar': [51.5310, 25.2854],
  'Oman': [58.5922, 23.5880],
  'Bahrain': [50.5577, 26.0667],
  'Kuwait': [47.9774, 29.3759],
  'Nigeria': [3.3792, 6.5244],
  'Pakistan': [73.0479, 33.6844],
  'Bangladesh': [90.4125, 23.8103],
  'Myanmar': [96.1951, 16.8661],
};

const SOURCE_ID = 'alumni-points';
const CLUSTER_MAX_ZOOM = 14;

// ── Popup HTML builder ──────────────────────────────────────────────
function buildLocationPopupHTML(displayName: string, alumni: any[]) {
  const count = alumni.length;

  const cards = alumni.slice(0, 3).map((a: any) => {
    const hasAvatar = a.avatar_thumbnail_url || a.avatar_url;
    const avatarBg = hasAvatar
      ? `url('${a.avatar_thumbnail_url || a.avatar_url}') center/cover`
      : '#e5e7eb';
    const initials = !hasAvatar
      ? (a.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?')
      : '';

    return `
      <div style="display:flex;align-items:center;gap:12px;padding:12px;margin-bottom:8px;background:white;border-radius:8px;cursor:pointer;transition:all 0.2s ease;border:1px solid #e5e7eb;"
        onclick="window.open('/abud/profile/${a.user_id}', '_blank')"
        onmouseover="this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)';this.style.transform='translateY(-1px)'"
        onmouseout="this.style.boxShadow='none';this.style.transform='translateY(0)'"
      >
        <div style="width:40px;height:40px;border-radius:50%;background:${avatarBg};display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:14px;font-weight:500;flex-shrink:0;">
          ${initials}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:600;color:#111827;margin-bottom:2px;">${a.full_name || 'Alumni'}</div>
          ${a.course ? `<div style="font-size:12px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.course}</div>` : ''}
          ${a.graduation_year ? `<div style="font-size:12px;color:#9ca3af;">Class of ${a.graduation_year}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  const viewAll = count > 3 ? `
    <button style="width:100%;padding:12px;margin-top:4px;background:white;border:1px solid #e5e7eb;border-radius:8px;color:#111827;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s ease;display:flex;align-items:center;justify-content:center;gap:8px;"
      onclick="window.open('/abud/directory/alumni?location=${encodeURIComponent(displayName)}', '_blank')"
      onmouseover="this.style.background='#f9fafb';this.style.borderColor='#d1d5db'"
      onmouseout="this.style.background='white';this.style.borderColor='#e5e7eb'"
    >
      View all ${count} alumni
      <span style="color:#6b7280;">→</span>
    </button>` : '';

  return `
    <div style="min-width:320px;max-width:380px;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
      <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04);">
        <div style="padding:20px;border-bottom:1px solid #f3f4f6;">
          <h3 style="margin:0 0 4px 0;font-size:18px;font-weight:600;color:#111827;letter-spacing:-0.025em;">${displayName}</h3>
          <p style="margin:0;font-size:14px;color:#6b7280;">${count} ${count === 1 ? 'Alumnus' : 'Alumni'}</p>
        </div>
        <div style="padding:12px;background:#fafafa;max-height:280px;overflow-y:auto;">
          ${cards}
          ${viewAll}
        </div>
      </div>
    </div>`;
}

// ── Component ───────────────────────────────────────────────────────
const AlumniMapFixed = () => {
  const { user } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const hoverPopup = useRef<mapboxgl.Popup | null>(null);
  const clickPopup = useRef<mapboxgl.Popup | null>(null);
  const styleLoaded = useRef(false);
  const locationGroupsRef = useRef<LocationGroup[]>([]);

  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string>('');
  const [locationGroups, setLocationGroups] = useState<LocationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [highlightedCountry, setHighlightedCountry] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [totalAlumniCount, setTotalAlumniCount] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [geoJson, setGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);

  const rotationAnimationRef = useRef<number | null>(null);

  // Keep ref in sync for use in closures
  useEffect(() => { locationGroupsRef.current = locationGroups; }, [locationGroups]);

  // ── 1. Fetch token (cached, with retries) ─────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const t = await getMapboxToken();
      if (cancelled) return;
      if (t) {
        setToken(t);
        setTokenError('');
      } else {
        setTokenError('Map unavailable. Please ensure you are signed in.');
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── 2. Fetch alumni locations (unchanged) ─────────────────────────
  useEffect(() => {
    const fetchAlumniLocations = async () => {
      try {
        const { data: configData } = await supabase
          .from('app_config')
          .select('value')
          .eq('key', 'development_mode')
          .single();

        const isDevMode = configData?.value?.enabled === true;

        let query = supabase
          .from('profiles')
          .select(`
            user_id,
            full_name,
            avatar_url,
            avatar_thumbnail_url,
            course,
            graduation_year,
            location_city,
            location_state,
            location_country,
            is_seed_data
          `);

        if (!isDevMode) {
          query = query.or('is_seed_data.eq.false,is_seed_data.is.null');
        }

        const { data, error } = await query;
        if (error) throw error;

        const locationMap = new Map<string, LocationGroup>();

        data?.forEach((profile) => {
          // Need at least one location field to place on map
          if (!profile.location_city && !profile.location_state && !profile.location_country) return;

          const city = profile.location_city || '';
          const state = profile.location_state || '';
          const country = profile.location_country || 'Unknown';

          // Build a location key from available parts
          const parts = [city, state, country].filter(Boolean);
          const locationKey = parts.join(', ');

          // Build a readable display name
          let displayName: string;
          if (city && state) {
            displayName = country !== 'United States' ? `${city}, ${state}, ${country}` : `${city}, ${state}`;
          } else if (city) {
            displayName = country !== 'United States' ? `${city}, ${country}` : city;
          } else if (state) {
            displayName = country !== 'United States' ? `${state}, ${country}` : state;
          } else {
            displayName = country;
          }

          if (!locationMap.has(locationKey)) {
            // Try fallback by locationKey, displayName, or city+country
            const fallback = FALLBACK_COORDINATES[locationKey]
              || FALLBACK_COORDINATES[displayName]
              || (city && country ? FALLBACK_COORDINATES[`${city}, ${country}`] : undefined);

            locationMap.set(locationKey, {
              city: city || state || country,
              state,
              country,
              displayName,
              alumni: [],
              coordinates: fallback,
            });
          }

          locationMap.get(locationKey)!.alumni.push(profile);
        });

        const locations = Array.from(locationMap.values());
        setLocationGroups(locations);
        // Count only alumni that have at least one location field
        const alumniWithLocation = locations.reduce((sum, loc) => sum + loc.alumni.length, 0);
        setTotalAlumniCount(alumniWithLocation);
      } catch (error) {
        console.error('Error fetching alumni locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumniLocations();
  }, []);

  // ── 3. Geocode & build GeoJSON ────────────────────────────────────
  useEffect(() => {
    if (!token || locationGroups.length === 0) return;

    let cancelled = false;
    (async () => {
      // Collect locations that still need geocoding (no fallback)
      const needsGeocode: string[] = [];
      for (const loc of locationGroups) {
        if (!loc.coordinates) {
          needsGeocode.push(loc.displayName);
        }
      }

      const geocoded = needsGeocode.length > 0
        ? await geocodeLocations(needsGeocode, token)
        : new Map<string, [number, number]>();

      if (cancelled) return;

      // Merge coordinates back
      const updated = locationGroups.map(loc => {
        if (loc.coordinates) return loc;
        const coords = geocoded.get(loc.displayName);
        return coords ? { ...loc, coordinates: coords } : loc;
      });

      // Build GeoJSON — one feature per alumnus
      const features: GeoJSON.Feature[] = [];
      for (const loc of updated) {
        if (!loc.coordinates) continue;
        for (const alumnus of loc.alumni) {
          features.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: loc.coordinates },
            properties: {
              userId: alumnus.user_id,
              name: alumnus.full_name || 'Alumni',
              location: loc.displayName,
            },
          });
        }
      }

      setLocationGroups(updated);
      setGeoJson({ type: 'FeatureCollection', features });
    })();

    return () => { cancelled = true; };
  }, [token, locationGroups.length]);

  // ── 4. Initialize map ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || !token || map.current) return;

    mapboxgl.accessToken = token;

    const m = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [101.6869, 3.1390],
      zoom: 2,
      projection: 'globe' as any,
      pitch: 45,
      interactive: true,
      dragRotate: true,
      dragPan: true,
      scrollZoom: true,
      touchZoomRotate: true,
      doubleClickZoom: true,
      keyboard: true,
    });

    m.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

    hoverPopup.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: '260px',
    });

    clickPopup.current = new mapboxgl.Popup({
      offset: 25,
      className: 'alumni-location-popup',
      closeButton: true,
      closeOnClick: false,
      maxWidth: '400px',
    });

    m.on('style.load', () => {
      styleLoaded.current = true;

      // Atmosphere / fog
      m.setFog({
        color: 'rgb(25, 25, 35)',
        'high-color': 'rgb(45, 45, 75)',
        'horizon-blend': 0.2,
      });

      // Country boundaries for highlighting
      m.addSource('country-boundaries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1',
      });

      m.addLayer({
        id: 'country-highlight',
        type: 'fill',
        source: 'country-boundaries',
        'source-layer': 'country_boundaries',
        paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0 },
      }, 'admin-1-boundary');

      m.addLayer({
        id: 'country-highlight-border',
        type: 'line',
        source: 'country-boundaries',
        'source-layer': 'country_boundaries',
        paint: { 'line-color': '#3b82f6', 'line-width': 0, 'line-opacity': 0 },
      });

      // ── GeoJSON source with clustering ────────────────────────────
      m.addSource(SOURCE_ID, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: CLUSTER_MAX_ZOOM,
        clusterRadius: 50,
      });

      // Cluster circles
      m.addLayer({
        id: 'alumni-clusters',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step', ['get', 'point_count'],
            'rgb(80, 160, 255)',
            10, 'rgb(59, 130, 246)',
            50, 'rgb(30, 64, 175)',
          ],
          'circle-radius': [
            'step', ['get', 'point_count'],
            18,
            10, 24,
            50, 32,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Cluster count text
      m.addLayer({
        id: 'alumni-cluster-count',
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: { 'text-color': '#ffffff' },
      });

      // Unclustered individual points
      m.addLayer({
        id: 'alumni-unclustered',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': 'rgb(59, 130, 246)',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      setMapReady(true);
    });

    map.current = m;

    return () => {
      styleLoaded.current = false;
      if (rotationAnimationRef.current) {
        cancelAnimationFrame(rotationAnimationRef.current);
      }
      hoverPopup.current?.remove();
      hoverPopup.current = null;
      clickPopup.current?.remove();
      clickPopup.current = null;
      m.remove();
      map.current = null;
    };
  }, [token, loading]);

  // ── 5. Push geoJson into source ───────────────────────────────────
  useEffect(() => {
    const m = map.current;
    if (!m || !geoJson || !mapReady) return;

    const src = m.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (src) src.setData(geoJson);
  }, [geoJson, mapReady]);

  // ── 6. Globe rotation (unchanged) ─────────────────────────────────
  useEffect(() => {
    if (!map.current || !mapReady) return;

    let lastInteractionTime = Date.now();
    const rotationSpeed = 0.1;

    const startRotation = () => {
      if (rotationAnimationRef.current) {
        cancelAnimationFrame(rotationAnimationRef.current);
      }

      const rotateGlobe = () => {
        if (!map.current || !isRotating) {
          rotationAnimationRef.current = null;
          return;
        }

        if (map.current.isMoving()) {
          rotationAnimationRef.current = requestAnimationFrame(rotateGlobe);
          lastInteractionTime = Date.now();
          return;
        }

        const timeSinceLastInteraction = Date.now() - lastInteractionTime;
        if (timeSinceLastInteraction > 3000) {
          const zoom = map.current.getZoom();
          if (zoom <= 3 && !map.current.isMoving()) {
            const center = map.current.getCenter();
            map.current.jumpTo({
              center: [center.lng + rotationSpeed, center.lat]
            });
          }
        }

        rotationAnimationRef.current = requestAnimationFrame(rotateGlobe);
      };

      rotationAnimationRef.current = requestAnimationFrame(rotateGlobe);
    };

    // Stop rotation entirely when user zooms or scrolls
    const handleZoom = () => {
      if (isRotating) setIsRotating(false);
    };

    const handleInteraction = () => {
      lastInteractionTime = Date.now();
      if (rotationAnimationRef.current) {
        cancelAnimationFrame(rotationAnimationRef.current);
        rotationAnimationRef.current = null;
      }
      if (isRotating) {
        setTimeout(() => {
          if (isRotating && !map.current?.isMoving()) {
            startRotation();
          }
        }, 3000);
      }
    };

    const interactionEvents = ['dragstart', 'pitchstart', 'rotatestart', 'mousedown'];
    interactionEvents.forEach(event => {
      map.current?.on(event as any, handleInteraction);
    });
    map.current?.on('zoomstart', handleZoom);
    map.current?.on('wheel', handleZoom);

    if (isRotating) {
      startRotation();
    } else if (rotationAnimationRef.current) {
      cancelAnimationFrame(rotationAnimationRef.current);
      rotationAnimationRef.current = null;
    }

    return () => {
      if (rotationAnimationRef.current) {
        cancelAnimationFrame(rotationAnimationRef.current);
        rotationAnimationRef.current = null;
      }
      interactionEvents.forEach(event => {
        map.current?.off(event as any, handleInteraction);
      });
      map.current?.off('zoomstart', handleZoom);
      map.current?.off('wheel', handleZoom);
    };
  }, [isRotating, mapReady]);

  // ── 7. Click outside search (unchanged) ───────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  // ── 8. Interaction handlers ───────────────────────────────────────
  useEffect(() => {
    const m = map.current;
    if (!m || !mapReady) return;

    const openLocationPopup = (locationName: string, coords: [number, number]) => {
      const group = locationGroupsRef.current.find(lg => lg.displayName === locationName);
      if (!group || !clickPopup.current) return;

      clickPopup.current
        .setLngLat(coords)
        .setHTML(buildLocationPopupHTML(group.displayName, group.alumni))
        .addTo(m);

      setSelectedLocation(group);
    };

    // Click cluster → zoom in or show popup if can't expand
    const handleClusterClick = (e: mapboxgl.MapMouseEvent) => {
      const features = m.queryRenderedFeatures(e.point, { layers: ['alumni-clusters'] });
      if (!features.length) return;

      const clusterId = features[0].properties?.cluster_id;
      const clusterCount = features[0].properties?.point_count || 0;
      const src = m.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
      const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];

      src.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        if (zoom! > CLUSTER_MAX_ZOOM) {
          // Can't expand further — show rich popup with alumni
          src.getClusterLeaves(clusterId, clusterCount, 0, (err2, leaves) => {
            if (err2 || !leaves?.length) return;
            const locationName = leaves[0].properties?.location;
            if (locationName) {
              clickPopup.current?.remove();
              openLocationPopup(locationName, coords);
            }
          });
        } else {
          clickPopup.current?.remove();
          m.easeTo({ center: coords, zoom: zoom! });
        }
      });
    };

    // Click unclustered point → show rich popup
    const handlePointClick = (e: mapboxgl.MapMouseEvent) => {
      const features = m.queryRenderedFeatures(e.point, { layers: ['alumni-unclustered'] });
      if (!features.length) return;

      const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
      const locationName = features[0].properties?.location;

      if (locationName) {
        clickPopup.current?.remove();
        openLocationPopup(locationName, coords);
      }
    };

    // Hover cluster → tooltip
    const handleClusterEnter = (e: mapboxgl.MapMouseEvent) => {
      m.getCanvas().style.cursor = 'pointer';
      const features = m.queryRenderedFeatures(e.point, { layers: ['alumni-clusters'] });
      if (!features.length || !hoverPopup.current) return;
      const count = features[0].properties?.point_count || 0;
      const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
      hoverPopup.current
        .setLngLat(coords)
        .setHTML(`<div style="padding:6px 10px;font-size:13px;background:rgba(0,0,0,0.8);border-radius:6px;color:#fff;animation:fadeIn .15s ease-out;"><strong>${count} alumni</strong><br/><span style="color:#aaa;font-size:11px;">Click to zoom in</span></div>`)
        .addTo(m);
    };

    // Hover unclustered point → tooltip
    const handlePointEnter = (e: mapboxgl.MapMouseEvent) => {
      m.getCanvas().style.cursor = 'pointer';
      const features = m.queryRenderedFeatures(e.point, { layers: ['alumni-unclustered'] });
      if (!features.length || !hoverPopup.current) return;
      const props = features[0].properties!;
      const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
      hoverPopup.current
        .setLngLat(coords)
        .setHTML(`<div style="padding:6px 10px;font-size:13px;background:rgba(0,0,0,0.8);border-radius:6px;color:#fff;animation:fadeIn .15s ease-out;"><strong>${props.name}</strong><div style="color:#aaa;font-size:11px;">${props.location}</div></div>`)
        .addTo(m);
    };

    const handleMouseLeave = () => {
      m.getCanvas().style.cursor = '';
      hoverPopup.current?.remove();
    };

    m.on('click', 'alumni-clusters', handleClusterClick);
    m.on('click', 'alumni-unclustered', handlePointClick);
    m.on('mouseenter', 'alumni-clusters', handleClusterEnter);
    m.on('mouseenter', 'alumni-unclustered', handlePointEnter);
    m.on('mouseleave', 'alumni-clusters', handleMouseLeave);
    m.on('mouseleave', 'alumni-unclustered', handleMouseLeave);

    return () => {
      m.off('click', 'alumni-clusters', handleClusterClick);
      m.off('click', 'alumni-unclustered', handlePointClick);
      m.off('mouseenter', 'alumni-clusters', handleClusterEnter);
      m.off('mouseenter', 'alumni-unclustered', handlePointEnter);
      m.off('mouseleave', 'alumni-clusters', handleMouseLeave);
      m.off('mouseleave', 'alumni-unclustered', handleMouseLeave);
    };
  }, [mapReady]);

  // ── 9. ResizeObserver ─────────────────────────────────────────────
  useEffect(() => {
    const container = mapContainerRef.current;
    const m = map.current;
    if (!container || !m) return;

    const ro = new ResizeObserver(() => m.resize());
    ro.observe(container);
    return () => ro.disconnect();
  }, [token]);

  // ── Helper: show rich location popup ──────────────────────────────
  const showLocationPopup = (location: LocationGroup) => {
    if (!map.current || !location.coordinates || !clickPopup.current) return;

    clickPopup.current
      .setLngLat(location.coordinates)
      .setHTML(buildLocationPopupHTML(location.displayName, location.alumni))
      .addTo(map.current);
  };

  // ── Navigation functions ──────────────────────────────────────────
  const navigateToRandomLocation = () => {
    if (!map.current || locationGroups.length === 0) return;

    const locationsWithCoords = locationGroups.filter(lg => lg.coordinates);
    if (locationsWithCoords.length === 0) return;

    setIsNavigating(true);

    const randomLocation = locationsWithCoords[Math.floor(Math.random() * locationsWithCoords.length)];

    clickPopup.current?.remove();

    map.current.flyTo({
      center: randomLocation.coordinates!,
      zoom: 6,
      duration: 2000,
      essential: true
    });

    setTimeout(() => {
      showLocationPopup(randomLocation);
      setSelectedLocation(randomLocation);
      setIsNavigating(false);
    }, 2000);
  };

  const resetView = () => {
    if (!map.current) return;

    setIsNavigating(true);

    clickPopup.current?.remove();
    clearCountryHighlight();
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);

    map.current.flyTo({
      center: [101.6869, 3.1390],
      zoom: 2,
      pitch: 45,
      bearing: 0,
      duration: 1500,
      essential: true
    });

    setTimeout(() => {
      setIsNavigating(false);
      setSelectedLocation(null);
    }, 1500);
  };

  // ── Search (unchanged) ────────────────────────────────────────────
  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      clearCountryHighlight();
      return;
    }

    const searchLower = query.toLowerCase();
    const results: SearchResult[] = [];

    const countryMap = new Map<string, LocationGroup[]>();
    const stateMap = new Map<string, LocationGroup[]>();

    locationGroups.forEach(group => {
      if (!countryMap.has(group.country)) {
        countryMap.set(group.country, []);
      }
      countryMap.get(group.country)!.push(group);

      if (group.state) {
        const stateKey = `${group.state}, ${group.country}`;
        if (!stateMap.has(stateKey)) {
          stateMap.set(stateKey, []);
        }
        stateMap.get(stateKey)!.push(group);
      }
    });

    countryMap.forEach((locations, country) => {
      if (country.toLowerCase().includes(searchLower)) {
        const totalAlumni = locations.reduce((sum, loc) => sum + loc.alumni.length, 0);
        const centerLng = locations.reduce((sum, loc) => sum + (loc.coordinates?.[0] || 0), 0) / locations.length;
        const centerLat = locations.reduce((sum, loc) => sum + (loc.coordinates?.[1] || 0), 0) / locations.length;

        results.push({
          type: 'country',
          name: country,
          displayName: country,
          alumniCount: totalAlumni,
          coordinates: [centerLng, centerLat],
          locations,
          boundingBox: getCountryBounds(country)
        });
      }
    });

    stateMap.forEach((locations, stateKey) => {
      if (stateKey.toLowerCase().includes(searchLower)) {
        const [state] = stateKey.split(', ');
        const totalAlumni = locations.reduce((sum, loc) => sum + loc.alumni.length, 0);
        const centerLng = locations.reduce((sum, loc) => sum + (loc.coordinates?.[0] || 0), 0) / locations.length;
        const centerLat = locations.reduce((sum, loc) => sum + (loc.coordinates?.[1] || 0), 0) / locations.length;

        results.push({
          type: 'state',
          name: state,
          displayName: stateKey,
          alumniCount: totalAlumni,
          coordinates: [centerLng, centerLat],
          locations
        });
      }
    });

    locationGroups.forEach(location => {
      if (location.displayName.toLowerCase().includes(searchLower)) {
        results.push({
          type: 'city',
          name: location.city,
          displayName: location.displayName,
          alumniCount: location.alumni.length,
          coordinates: location.coordinates,
          locations: [location]
        });
      }
    });

    results.sort((a, b) => {
      const typeOrder = { country: 0, state: 1, city: 2 };
      if (typeOrder[a.type] !== typeOrder[b.type]) {
        return typeOrder[a.type] - typeOrder[b.type];
      }
      return b.alumniCount - a.alumniCount;
    });

    setSearchResults(results.slice(0, 10));
    setShowSearchResults(true);
  };

  const getCountryBounds = (country: string): [[number, number], [number, number]] | undefined => {
    const bounds: Record<string, [[number, number], [number, number]]> = {
      'United States': [[-125, 24], [-66, 49]],
      'Malaysia': [[100, 1], [119, 7]],
      'Singapore': [[103.6, 1.1], [104.1, 1.5]],
      'United Kingdom': [[-8, 50], [2, 59]],
      'Canada': [[-140, 42], [-52, 83]],
      'Australia': [[113, -39], [154, -10]],
      'India': [[68, 8], [97, 35]],
      'United Arab Emirates': [[51, 22], [56, 26]],
      'Brazil': [[-74, -34], [-34, 5]],
      'South Korea': [[124, 33], [131, 39]],
      'Japan': [[129, 31], [146, 45]],
      'Spain': [[-9, 36], [4, 44]],
      'Indonesia': [[95, -11], [141, 6]],
      'Thailand': [[97, 5], [105, 21]]
    };
    return bounds[country];
  };

  const getCountryCode = (countryName: string): string | null => {
    const codes: Record<string, string> = {
      'United States': 'US',
      'Malaysia': 'MY',
      'Singapore': 'SG',
      'United Kingdom': 'GB',
      'Canada': 'CA',
      'Australia': 'AU',
      'India': 'IN',
      'United Arab Emirates': 'AE',
      'Brazil': 'BR',
      'South Korea': 'KR',
      'Japan': 'JP',
      'Spain': 'ES',
      'Indonesia': 'ID',
      'Thailand': 'TH'
    };
    return codes[countryName] || null;
  };

  const highlightCountry = (countryName: string) => {
    if (!map.current) return;

    const countryCode = getCountryCode(countryName);
    if (!countryCode) return;

    map.current.setFilter('country-highlight', ['==', ['get', 'iso_3166_1'], countryCode]);
    map.current.setFilter('country-highlight-border', ['==', ['get', 'iso_3166_1'], countryCode]);

    map.current.setPaintProperty('country-highlight', 'fill-opacity', 0.15);
    map.current.setPaintProperty('country-highlight-border', 'line-width', 2);
    map.current.setPaintProperty('country-highlight-border', 'line-opacity', 0.8);

    setHighlightedCountry(countryName);
  };

  const clearCountryHighlight = () => {
    if (!map.current) return;

    map.current.setFilter('country-highlight', ['==', 'iso_3166_1', '']);
    map.current.setFilter('country-highlight-border', ['==', 'iso_3166_1', '']);
    map.current.setPaintProperty('country-highlight', 'fill-opacity', 0);
    map.current.setPaintProperty('country-highlight-border', 'line-width', 0);
    map.current.setPaintProperty('country-highlight-border', 'line-opacity', 0);

    setHighlightedCountry(null);
  };

  const selectSearchResult = (result: SearchResult) => {
    if (!map.current) return;

    setIsNavigating(true);
    setShowSearchResults(false);
    setSearchQuery(result.displayName);

    clickPopup.current?.remove();

    if (result.type === 'country') {
      if (result.boundingBox) {
        map.current.fitBounds(result.boundingBox, { padding: 50, duration: 2000 });
      } else if (result.coordinates) {
        map.current.flyTo({ center: result.coordinates, zoom: 4, duration: 2000, essential: true });
      }
      highlightCountry(result.name);
      setTimeout(() => setIsNavigating(false), 2000);

    } else if (result.type === 'state' && result.coordinates) {
      map.current.flyTo({ center: result.coordinates, zoom: 5, duration: 2000, essential: true });
      setTimeout(() => setIsNavigating(false), 2000);

    } else if (result.type === 'city' && result.locations?.[0]) {
      const location = result.locations[0];
      if (location.coordinates) {
        map.current.flyTo({ center: location.coordinates, zoom: 6, duration: 2000, essential: true });

        setTimeout(() => {
          showLocationPopup(location);
          setSelectedLocation(location);
          setIsNavigating(false);
        }, 2000);
      }
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  if (tokenError) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Link to="/abud/directory/alumni">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <MapPin className="h-12 w-12 text-muted-foreground" />
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-destructive">Map Unavailable</p>
                <p className="text-muted-foreground max-w-md">{tokenError}</p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-4"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || !token) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">
                {!token ? 'Loading map configuration...' : 'Loading alumni locations...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const locationsWithCoords = locationGroups.filter(lg => lg.coordinates);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <Link to="/abud/directory/alumni">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Alumni World Map</h1>
        <p className="text-muted-foreground mb-4">
          Discover where alumni are located around the world
        </p>

        <div className="flex items-center gap-4 mb-4">
          <Badge variant="secondary" className="gap-2">
            <Users className="h-4 w-4" />
            {totalAlumniCount} Alumni
          </Badge>
          <Badge variant="outline" className="gap-2">
            <MapPin className="h-4 w-4" />
            {locationGroups.length} Locations
          </Badge>
        </div>
      </div>

      <Card className="relative overflow-visible">
        <CardContent className="p-0">
          <div className="relative">
            {/* Search Bar */}
            <div className="absolute top-4 left-4 right-4 z-10 max-w-md mx-auto">
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search locations (e.g., Kuala Lumpur, Malaysia)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="pl-10 pr-4 py-2 w-full shadow-lg backdrop-blur-sm bg-white/95 border-gray-200"
                />

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <Card className="absolute top-full mt-2 w-full shadow-lg bg-white border-gray-200 max-h-80 overflow-y-auto">
                    <CardContent className="p-2">
                      {searchResults.map((result, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start text-left p-3 hover:bg-gray-100 group"
                          onClick={() => selectSearchResult(result)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            {result.type === 'country' ? (
                              <Flag className="h-4 w-4 text-blue-500 group-hover:text-blue-600 flex-shrink-0" />
                            ) : result.type === 'state' ? (
                              <Globe className="h-4 w-4 text-green-500 group-hover:text-green-600 flex-shrink-0" />
                            ) : (
                              <MapPin className="h-4 w-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{result.displayName}</span>
                                {result.type === 'country' && (
                                  <Badge variant="secondary" className="text-xs">Country</Badge>
                                )}
                                {result.type === 'state' && (
                                  <Badge variant="outline" className="text-xs">State/Region</Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {result.alumniCount} {result.alumniCount === 1 ? 'alumnus' : 'alumni'}
                                {result.locations && result.locations.length > 1 && (
                                  <span className="ml-1">• {result.locations.length} locations</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Map Container */}
            <div
              ref={mapContainerRef}
              className="w-full h-[700px] bg-slate-900"
              style={{ borderRadius: '0.5rem' }}
            />

            {/* Navigation Controls */}
            <div className="absolute bottom-8 left-8 z-10 flex flex-col gap-2">
              {/* Rotation Toggle */}
              <Card className="shadow-lg backdrop-blur-sm bg-white/95 border-gray-200 p-3">
                <div className="flex items-center gap-3">
                  <Globe className={`h-4 w-4 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                  <Label htmlFor="rotation-toggle" className="text-sm font-medium cursor-pointer">
                    Auto-rotate
                  </Label>
                  <Switch
                    id="rotation-toggle"
                    checked={isRotating}
                    onCheckedChange={setIsRotating}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </Card>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="shadow-lg backdrop-blur-sm bg-white/95 hover:bg-white border-gray-200"
                      onClick={navigateToRandomLocation}
                      disabled={isNavigating || locationsWithCoords.length === 0}
                    >
                      <Shuffle className="h-4 w-4 mr-2" />
                      Random Location
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Jump to a random alumni location</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shadow-lg backdrop-blur-sm bg-white/95 hover:bg-white border-gray-200"
                      onClick={resetView}
                      disabled={isNavigating}
                    >
                      <RotateCw className="h-4 w-4 mr-2" />
                      Reset View
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset map to initial view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Map Controls Info */}
            <div className="absolute top-20 right-4 z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-md"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-semibold">Map Controls:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <ZoomIn className="h-3 w-3" />
                          <span>Zoom In - Scroll up or click +</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ZoomOut className="h-3 w-3" />
                          <span>Zoom Out - Scroll down or click -</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Compass className="h-3 w-3" />
                          <span>Reset North - Click compass icon</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Navigation className="h-3 w-3" />
                          <span>3D View - Ctrl + drag to tilt</span>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Interactive Map Badge */}
            <div className="absolute top-4 right-4 z-10">
              <Badge variant="secondary" className="gap-2 shadow-lg bg-blue-500 text-white border-blue-600">
                <Globe className="h-4 w-4 animate-pulse" />
                Interactive Alumni Map
              </Badge>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-8 right-8 z-10 max-w-xs">
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">
                    Click on markers to explore alumni in each location • Scroll to zoom • Drag to explore
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlumniMapFixed;
