import { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import {
  getMapboxToken,
  geocodeLocations,
  buildLocationKey,
} from '@/lib/mapbox-cache';

// ── Public API (unchanged) ──────────────────────────────────────────
export interface MapItem {
  id: string;
  name: string;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  type: 'alumni' | 'business';
  subtitle?: string;
  avatarUrl?: string;
}

interface DirectoryMapProps {
  items: MapItem[];
  type: 'alumni' | 'business';
  onMarkerClick?: (itemId: string) => void;
  selectedItemId?: string | null;
  className?: string;
}

// ── Color themes ────────────────────────────────────────────────────
const THEMES = {
  alumni: {
    base: 'hsl(210, 100%, 50%)',
    baseRgb: [0, 102, 255],       // blue
    clusterLg: [0, 80, 210],      // darker blue for large clusters
    clusterMd: [0, 102, 255],     // medium blue
    clusterSm: [80, 160, 255],    // lighter blue
  },
  business: {
    base: 'hsl(140, 70%, 45%)',
    baseRgb: [35, 155, 86],       // green
    clusterLg: [20, 120, 60],
    clusterMd: [35, 155, 86],
    clusterSm: [80, 190, 120],
  },
} as const;

const SOURCE_ID = 'directory-items';

// ── Component ───────────────────────────────────────────────────────
export function DirectoryMap({
  items,
  type,
  onMarkerClick,
  selectedItemId,
  className,
}: DirectoryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const clickPopup = useRef<mapboxgl.Popup | null>(null);
  const styleLoaded = useRef(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [geoJson, setGeoJson] = useState<GeoJSON.FeatureCollection | null>(null);

  const theme = THEMES[type];

  // ── 1. Fetch token ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const t = await getMapboxToken();
      if (!cancelled) {
        setToken(t);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── 2. Geocode & build GeoJSON ────────────────────────────────────
  // Dedupe location keys and map items to their keys
  const locationMap = useMemo(() => {
    const m = new Map<string, MapItem[]>();
    for (const item of items) {
      const key = buildLocationKey(item);
      if (!key) continue;
      const arr = m.get(key);
      if (arr) arr.push(item);
      else m.set(key, [item]);
    }
    return m;
  }, [items]);

  useEffect(() => {
    if (!token || locationMap.size === 0) {
      if (token && locationMap.size === 0) setGeoJson({ type: 'FeatureCollection', features: [] });
      return;
    }

    let cancelled = false;
    (async () => {
      const coords = await geocodeLocations([...locationMap.keys()], token);
      if (cancelled) return;

      const features: GeoJSON.Feature[] = [];
      for (const [locKey, locItems] of locationMap) {
        const coord = coords.get(locKey);
        if (!coord) continue;
        for (const item of locItems) {
          features.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: coord },
            properties: {
              id: item.id,
              name: item.name,
              subtitle: item.subtitle ?? '',
              avatarUrl: item.avatarUrl ?? '',
              location: locKey,
              type: item.type,
            },
          });
        }
      }

      setGeoJson({ type: 'FeatureCollection', features });
    })();

    return () => { cancelled = true; };
  }, [token, locationMap]);

  // ── 3. Initialize map ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [101.5, 3.1],
      zoom: 2,
    });

    m.addControl(new mapboxgl.NavigationControl(), 'top-right');

    popup.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: '260px',
    });

    clickPopup.current = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: true,
      maxWidth: '300px',
      className: 'directory-click-popup',
    });

    m.on('load', () => {
      styleLoaded.current = true;

      // Add empty source — will be updated when geoJson is ready
      m.addSource(SOURCE_ID, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Layer 1: Cluster circles
      m.addLayer({
        id: 'clusters',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            `rgb(${theme.clusterSm.join(',')})`,
            10,
            `rgb(${theme.clusterMd.join(',')})`,
            50,
            `rgb(${theme.clusterLg.join(',')})`,
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            10, 24,
            50, 32,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Layer 2: Cluster count text
      m.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Layer 3: Unclustered individual points
      m.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': `rgb(${theme.baseRgb.join(',')})`,
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Layer 4: Selected-point highlight
      m.addLayer({
        id: 'selected-point',
        type: 'circle',
        source: SOURCE_ID,
        filter: ['==', ['get', 'id'], ''],
        paint: {
          'circle-color': `rgb(${theme.baseRgb.join(',')})`,
          'circle-radius': 11,
          'circle-stroke-width': 3,
          'circle-stroke-color': 'hsl(45, 100%, 60%)',
        },
      });

      setMapReady(true);
    });

    map.current = m;

    return () => {
      styleLoaded.current = false;
      setMapReady(false);
      popup.current?.remove();
      popup.current = null;
      clickPopup.current?.remove();
      clickPopup.current = null;
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // theme is stable per type, token gates init

  // ── 4. Push geoJson into source ───────────────────────────────────
  useEffect(() => {
    const m = map.current;
    if (!m || !geoJson || !mapReady) return;

    const src = m.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (src) {
      src.setData(geoJson);

      // Fit bounds
      if (geoJson.features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        for (const f of geoJson.features) {
          const geom = f.geometry as GeoJSON.Point;
          bounds.extend(geom.coordinates as [number, number]);
        }
        m.fitBounds(bounds, { padding: 50, maxZoom: 10 });
      }
    }
  }, [geoJson, mapReady]);

  // ── 5. Update selected-point filter ───────────────────────────────
  useEffect(() => {
    const m = map.current;
    if (!m || !mapReady) return;

    if (m.getLayer('selected-point')) {
      m.setFilter('selected-point', ['==', ['get', 'id'], selectedItemId ?? '']);
    }

    // Also fly to selected
    if (selectedItemId && geoJson) {
      const feat = geoJson.features.find(
        (f) => f.properties?.id === selectedItemId,
      );
      if (feat) {
        const coords = (feat.geometry as GeoJSON.Point).coordinates as [number, number];
        m.easeTo({ center: coords, zoom: Math.max(m.getZoom(), 8), duration: 800 });
      }
    }
  }, [selectedItemId, geoJson, mapReady]);

  // ── 6. Interactions ───────────────────────────────────────────────
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  // Helper: build rich popup HTML for a single item
  const buildItemPopupHtml = (props: Record<string, string>) => {
    const profileUrl = props.type === 'business'
      ? `/abud/business/${props.id}`
      : `/abud/profile/${props.id}`;
    const buttonLabel = props.type === 'business' ? 'View Business' : 'View Profile';
    const avatarHtml = props.avatarUrl
      ? `<img src="${props.avatarUrl}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0;" />`
      : `<div style="width:40px;height:40px;border-radius:50%;background:#374151;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;color:#9ca3af;">${props.name.charAt(0).toUpperCase()}</div>`;
    const subtitleHtml = props.subtitle
      ? `<div style="color:#9ca3af;font-size:12px;line-height:1.3;margin-top:1px;">${props.subtitle}</div>`
      : '';

    return `<div style="padding:12px;min-width:220px;">` +
      `<div style="display:flex;gap:10px;align-items:center;">` +
      avatarHtml +
      `<div style="min-width:0;">` +
      `<div style="font-weight:600;font-size:14px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${props.name}</div>` +
      subtitleHtml +
      `</div></div>` +
      `<div style="color:#9ca3af;font-size:11px;margin-top:6px;">${props.location}</div>` +
      `<a href="${profileUrl}" style="display:block;margin-top:8px;padding:6px 0;text-align:center;background:hsl(210,100%,50%);color:#fff;border-radius:6px;font-size:13px;font-weight:500;text-decoration:none;">${buttonLabel}</a>` +
      `</div>`;
  };

  useEffect(() => {
    const m = map.current;
    if (!m) return;

    // Click cluster → zoom in, or show list popup at max zoom
    const handleClusterClick = (e: mapboxgl.MapMouseEvent) => {
      const features = m.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      if (!features.length) return;
      const clusterId = features[0].properties?.cluster_id;
      const count = features[0].properties?.point_count || 0;
      const geom = features[0].geometry as GeoJSON.Point;
      const coords = geom.coordinates as [number, number];
      const src = m.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;

      src.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        // If already at or near max zoom, show a cluster popup instead
        if (zoom! >= 14 || m.getZoom() >= 13.5) {
          popup.current?.remove();
          src.getClusterLeaves(clusterId, 3, 0, (err2, leaves) => {
            if (err2 || !leaves?.length || !clickPopup.current) return;
            let html = `<div style="padding:12px;min-width:200px;">` +
              `<div style="font-weight:600;font-size:13px;color:#fff;margin-bottom:8px;">${count} ${type === 'alumni' ? 'alumni' : 'businesses'} here</div>`;
            for (const leaf of leaves) {
              const p = leaf.properties!;
              const avatarHtml = p.avatarUrl
                ? `<img src="${p.avatarUrl}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0;" />`
                : `<div style="width:28px;height:28px;border-radius:50%;background:#374151;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;color:#9ca3af;">${(p.name as string).charAt(0).toUpperCase()}</div>`;
              const url = p.type === 'business' ? `/abud/business/${p.id}` : `/abud/profile/${p.id}`;
              html += `<a href="${url}" style="display:flex;gap:8px;align-items:center;padding:4px 0;text-decoration:none;color:#fff;">` +
                avatarHtml +
                `<div style="font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name}</div></a>`;
            }
            if (count > 3) {
              html += `<div style="color:#60a5fa;font-size:12px;margin-top:6px;cursor:pointer;" onclick="document.querySelector('.mapboxgl-popup-close-button')?.click()">+${count - 3} more</div>`;
            }
            html += `</div>`;
            clickPopup.current.setLngLat(coords).setHTML(html).addTo(m);
          });
        } else {
          clickPopup.current?.remove();
          m.easeTo({ center: coords, zoom: zoom! });
        }
      });
    };

    // Click unclustered → rich popup + callback
    const handlePointClick = (e: mapboxgl.MapMouseEvent) => {
      const features = m.queryRenderedFeatures(e.point, { layers: ['unclustered-point', 'selected-point'] });
      if (!features.length) return;
      const props = features[0].properties!;
      const geom = features[0].geometry as GeoJSON.Point;
      const coords = geom.coordinates as [number, number];
      const id = props.id as string;

      // Remove hover popup, show click popup
      popup.current?.remove();
      if (clickPopup.current) {
        clickPopup.current
          .setLngLat(coords)
          .setHTML(buildItemPopupHtml(props as Record<string, string>))
          .addTo(m);
      }

      if (id) onMarkerClickRef.current?.(id);
    };

    // Close click popup when clicking empty area
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const features = m.queryRenderedFeatures(e.point, {
        layers: ['unclustered-point', 'selected-point', 'clusters'],
      });
      if (!features.length) {
        clickPopup.current?.remove();
      }
    };

    // Hover cluster → popup
    const handleClusterEnter = (e: mapboxgl.MapMouseEvent) => {
      m.getCanvas().style.cursor = 'pointer';
      const features = m.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      if (!features.length || !popup.current) return;
      const count = features[0].properties?.point_count || 0;
      const geom = features[0].geometry as GeoJSON.Point;
      popup.current
        .setLngLat(geom.coordinates as [number, number])
        .setHTML(`<div style="padding:6px 10px;font-size:13px;background:rgba(0,0,0,0.8);border-radius:6px;color:#fff;animation:fadeIn .15s ease-out;"><strong>${count} ${type === 'alumni' ? 'alumni' : 'businesses'}</strong><br/><span style="color:#aaa;font-size:11px;">Click to zoom in</span></div>`)
        .addTo(m);
    };

    // Hover unclustered → popup (only if click popup not showing)
    const handlePointEnter = (e: mapboxgl.MapMouseEvent) => {
      m.getCanvas().style.cursor = 'pointer';
      if (clickPopup.current?.isOpen()) return;
      const features = m.queryRenderedFeatures(e.point, { layers: ['unclustered-point', 'selected-point'] });
      if (!features.length || !popup.current) return;
      const props = features[0].properties!;
      const geom = features[0].geometry as GeoJSON.Point;
      const subtitleHtml = props.subtitle ? `<div style="color:#aaa;font-size:11px;">${props.subtitle}</div>` : '';
      popup.current
        .setLngLat(geom.coordinates as [number, number])
        .setHTML(
          `<div style="padding:6px 10px;font-size:13px;background:rgba(0,0,0,0.8);border-radius:6px;color:#fff;animation:fadeIn .15s ease-out;">` +
          `<strong>${props.name}</strong>` +
          subtitleHtml +
          `<div style="color:#aaa;font-size:11px;margin-top:2px;">${props.location}</div>` +
          `</div>`,
        )
        .addTo(m);
    };

    const handleMouseLeave = () => {
      m.getCanvas().style.cursor = '';
      popup.current?.remove();
    };

    m.on('click', 'clusters', handleClusterClick);
    m.on('click', 'unclustered-point', handlePointClick);
    m.on('click', 'selected-point', handlePointClick);
    m.on('click', handleMapClick);
    m.on('mouseenter', 'clusters', handleClusterEnter);
    m.on('mouseenter', 'unclustered-point', handlePointEnter);
    m.on('mouseenter', 'selected-point', handlePointEnter);
    m.on('mouseleave', 'clusters', handleMouseLeave);
    m.on('mouseleave', 'unclustered-point', handleMouseLeave);
    m.on('mouseleave', 'selected-point', handleMouseLeave);

    return () => {
      m.off('click', 'clusters', handleClusterClick);
      m.off('click', 'unclustered-point', handlePointClick);
      m.off('click', 'selected-point', handlePointClick);
      m.off('click', handleMapClick);
      m.off('mouseenter', 'clusters', handleClusterEnter);
      m.off('mouseenter', 'unclustered-point', handlePointEnter);
      m.off('mouseenter', 'selected-point', handlePointEnter);
      m.off('mouseleave', 'clusters', handleMouseLeave);
      m.off('mouseleave', 'unclustered-point', handleMouseLeave);
      m.off('mouseleave', 'selected-point', handleMouseLeave);
    };
  }, [type]);

  // ── 7. ResizeObserver ─────────────────────────────────────────────
  useEffect(() => {
    const container = mapContainer.current;
    const m = map.current;
    if (!container || !m) return;

    const ro = new ResizeObserver(() => {
      m.resize();
    });
    ro.observe(container);

    return () => ro.disconnect();
  }, [token]); // re-attach when map re-initializes

  // ── Render ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center h-full min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center h-full min-h-[300px]">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Map unavailable</p>
            <p className="text-xs text-muted-foreground mt-1">Please sign in to view map</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      <style>{`
        .directory-click-popup .mapboxgl-popup-content {
          background: #1f2937;
          border-radius: 10px;
          padding: 0;
          box-shadow: 0 10px 25px rgba(0,0,0,0.4);
          border: 1px solid #374151;
        }
        .directory-click-popup .mapboxgl-popup-tip {
          border-top-color: #1f2937;
        }
        .directory-click-popup .mapboxgl-popup-close-button {
          color: #9ca3af;
          font-size: 18px;
          padding: 4px 8px;
          right: 2px;
          top: 2px;
        }
        .directory-click-popup .mapboxgl-popup-close-button:hover {
          color: #fff;
          background: transparent;
        }
      `}</style>
      <div ref={mapContainer} className="w-full h-full min-h-[300px] rounded-lg" />
    </div>
  );
}
