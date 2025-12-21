import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Artwork, TimeRange, Location } from '../types';
import { MapPin, Calendar, User, BarChart3 } from 'lucide-react';
import { ArtworkService } from '../services/artworkService';
import worldCountries from '../data/world-countries.json';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveWorldMapProps {
  artworks: Artwork[];
  timeRange: TimeRange;
  onLocationTimeSelect: (location: Location, timeRange: TimeRange) => void;
  onArtworkSelect: (artwork: Artwork) => void;
  onAddToGallery?: (artwork: Artwork) => void;
  galleryArtworkIds?: Set<string>;
}

const FEATURED_MARKERS: { country: string; city: string; lat: number; lng: number; label: string }[] = [
  { country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522, label: 'Paris, France' },
  { country: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278, label: 'London, UK' },
  { country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041, label: 'Amsterdam, NL' },
  { country: 'United States', city: 'New York City', lat: 40.7128, lng: -74.006, label: 'New York, USA' },
  { country: 'Russia', city: 'Moscow', lat: 55.7558, lng: 37.6173, label: 'Moscow, Russia' },
  { country: 'China', city: 'Beijing', lat: 39.9042, lng: 116.4074, label: 'Beijing, China' },
  { country: 'Italy', city: 'Florence', lat: 43.7696, lng: 11.2558, label: 'Florence, Italy' },
  { country: 'Brazil', city: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, label: 'Rio de Janeiro, Brazil' }
];

type WorldCountryProperties = {
  name?: string;
  'ISO3166-1-Alpha-2'?: string;
  'ISO3166-1-Alpha-3'?: string;
};

type WorldCountriesGeoJson = {
  type: string;
  features: Array<{
    type: string;
    properties: WorldCountryProperties;
    geometry: unknown;
  }>;
};

const normalizeCountryKey = (value: string) => value.trim().toLowerCase();

const countryAliasToGeoName: Record<string, string> = {
  usa: 'United States of America',
  us: 'United States of America',
  'u.s.': 'United States of America',
  'u.s.a.': 'United States of America',
  'united states': 'United States of America',
  'united states of america of america': 'United States of America',
  uk: 'United Kingdom',
  england: 'United Kingdom',
  wales: 'United Kingdom',
  scotland: 'United Kingdom',
  'united kingdom of great britain and ireland': 'United Kingdom',
  uae: 'United Arab Emirates',
  'russian federation': 'Russia',
  'czech republic': 'Czechia',
  'the netherlands': 'Netherlands',
  holland: 'Netherlands',
  'republic of korea': 'South Korea',
  'korea, republic of': 'South Korea',
  'south korea': 'South Korea',
  'north korea': 'North Korea',
  'korea, democratic people\'s republic of': 'North Korea'
};

function niceRound(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  if (value <= 1) return 1;

  const exponent = Math.floor(Math.log10(value));
  const base = Math.pow(10, exponent);
  const candidates = [1, 2, 3, 5, 10].map(mult => mult * base);
  let best = candidates[0];
  let bestDistance = Math.abs(value - best);

  for (const candidate of candidates.slice(1)) {
    const distance = Math.abs(value - candidate);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return Math.max(1, Math.round(best));
}

// Custom marker icons for different periods
const createCustomIcon = (period: string) => {
  const colors: { [key: string]: string } = {
    'Ancient': '#8B5A2B',
    'Medieval': '#4A5568',
    'Renaissance': '#D69E2E',
    'Baroque': '#C53030',
    'Neoclassical': '#3182CE',
    'Impressionism': '#38A169',
    'Post-Impressionism': '#38A169',
    'Modern': '#805AD5',
    'Contemporary': '#E53E3E',
    'Surrealism': '#805AD5',
    'Edo Period': '#2D3748'
  };

  const color = colors[period] || '#6366F1';
  
  return L.divIcon({
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

// City location marker
const createCityMarker = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 12px;
        height: 12px;
        background: #3B82F6;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    `,
    className: 'city-marker',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6]
  });
};

const MapClickHandler: React.FC<{
  onLocationClick: (lat: number, lng: number) => void;
}> = ({ onLocationClick }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationClick(lat, lng);
    }
  });
  return null;
};

const InteractiveWorldMap: React.FC<InteractiveWorldMapProps> = ({
  artworks,
  timeRange,
  onLocationTimeSelect,
  onAddToGallery,
  galleryArtworkIds = new Set()
}) => {
  const t = useTranslations();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [countryCounts, setCountryCounts] = useState<{ [country: string]: number }>({});
  const [clickedLocation, setClickedLocation] = useState<{
    lat: number;
    lng: number;
    city: string;
    country: string;
  } | null>(null);
  const [featuredMarkerArtworks, setFeaturedMarkerArtworks] = useState<Record<string, {
    status: 'idle' | 'loading' | 'loaded' | 'error';
    artworks: Artwork[];
  }>>({});

  const geoCountryKeyToName = useMemo(() => {
    const geo = worldCountries as unknown as WorldCountriesGeoJson;
    const map = new Map<string, string>();

    for (const feature of geo.features || []) {
      const name = feature.properties?.name;
      if (!name) continue;

      map.set(normalizeCountryKey(name), name);

      const iso2 = feature.properties?.['ISO3166-1-Alpha-2'];
      if (iso2) map.set(normalizeCountryKey(iso2), name);

      const iso3 = feature.properties?.['ISO3166-1-Alpha-3'];
      if (iso3) map.set(normalizeCountryKey(iso3), name);
    }

    for (const [alias, canonical] of Object.entries(countryAliasToGeoName)) {
      map.set(normalizeCountryKey(alias), canonical);
    }

    return map;
  }, []);

  // Fetch country counts when component mounts or time range changes
  useEffect(() => {
    const fetchCountryCounts = async () => {
      const mappedCounts: { [country: string]: number } = {};
      const rows = await ArtworkService.getArtworkCountsByCountry({ timeRange });

      for (const { country: rawCountry, count } of rows) {
        const mappedName = geoCountryKeyToName.get(normalizeCountryKey(rawCountry));
        if (!mappedName) continue;
        mappedCounts[mappedName] = (mappedCounts[mappedName] || 0) + count;
      }

      setCountryCounts(mappedCounts);
    };

    fetchCountryCounts();
  }, [timeRange, geoCountryKeyToName]);

  const colors = ['#374151', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#7F1D1D'];
  const positiveClassCount = colors.length - 1;

  const calculateThresholds = (counts: number[]): number[] => {
    const positiveCounts = counts.filter(count => count > 0);
    if (positiveCounts.length === 0) return [0, 1];

    const maxCount = Math.max(...positiveCounts);
    const minCount = 1;

    if (maxCount <= 1) return [0, 1];

    const ratio = Math.pow(maxCount / minCount, 1 / positiveClassCount);
    const raw = Array.from({ length: positiveClassCount }, (_, index) =>
      minCount * Math.pow(ratio, index)
    );

    const rounded = raw.map((value, index) => (index === 0 ? 1 : niceRound(value)));
    const uniqueSorted = Array.from(new Set(rounded)).sort((a, b) => a - b);

    const thresholds: number[] = [0];
    for (const value of uniqueSorted) {
      const previous = thresholds[thresholds.length - 1] || 0;
      thresholds.push(Math.max(previous + 1, value));
      if (thresholds.length === colors.length) break;
    }

    while (thresholds.length < colors.length) {
      thresholds.push((thresholds[thresholds.length - 1] || 0) + 1);
    }

    return thresholds;
  };

  const counts = Object.values(countryCounts).filter(count => count > 0);
  const breakpoints = calculateThresholds(counts);

  // Get color based on artwork count (动态版本)
  const getHeatmapColor = (count: number): string => {
    if (count === 0) return colors[0]; // Gray for no artworks

    // 根据断点确定颜色
    for (let i = breakpoints.length - 1; i >= 1; i--) {
      if (count >= breakpoints[i]) {
        return colors[Math.min(i, colors.length - 1)];
      }
    }

    return colors[1]; // 默认第一级颜色
  };

  // 生成图例标签
  const generateLegendLabels = (): Array<{color: string, label: string, range: [number, number]}> => {
    const labels: Array<{color: string, label: string, range: [number, number]}> = [];

    // 无数据
    labels.push({
      color: colors[0],
      label: t('map.noArtworks'),
      range: [0, 0]
    });

    for (let i = 1; i < breakpoints.length; i++) {
      const start = breakpoints[i];
      const next = breakpoints[i + 1];
      const isLast = i === breakpoints.length - 1;
      const end = isLast ? start : Math.max(start, next - 1);

      const rangeLabel = isLast
        ? `${start}+`
        : start === end
          ? `${start}`
          : `${start} - ${end}`;

      labels.push({
        color: colors[Math.min(i, colors.length - 1)],
        label: t('map.artworkCount', { range: rangeLabel }),
        range: [start, end]
      });
    }

    return labels;
  };

	  // Get max count for reference
	  const maxCount = Math.max(...Object.values(countryCounts), 0);
	  const heatmapLayerKey = `${timeRange.start}-${timeRange.end}-${maxCount}-${Object.keys(countryCounts).length}`;

  // 获取图例数据
  const legendData = generateLegendLabels();
  const featuredMarkers = useMemo(() => FEATURED_MARKERS, []);
  const featuredMarkerCountryCandidates = useMemo<Record<string, string[]>>(() => ({
    'United Kingdom': [
      'United Kingdom',
      'United Kingdom of Great Britain and Ireland',
      'UK',
      'England',
      'Scotland',
      'Wales'
    ],
    'United States': [
      'United States',
      'United States of America',
      'USA',
      'US',
      'U.S.',
      'U.S.A.',
      'United States of America of America'
    ],
    Netherlands: ['Netherlands', 'The Netherlands', 'Holland'],
    Russia: ['Russia', 'Russian Federation'],
    France: ['France'],
    China: ['China'],
    Brazil: ['Brazil'],
    Italy: ['Italy']
  }), []);

  const ensureFeaturedMarkerArtworks = async (marker: (typeof featuredMarkers)[number]) => {
    const key = `${marker.country}||${marker.city}`;
    const existing = featuredMarkerArtworks[key];
    if (existing?.status === 'loading' || existing?.status === 'loaded') return;

    setFeaturedMarkerArtworks(prev => ({
      ...prev,
      [key]: { status: 'loading', artworks: prev[key]?.artworks || [] }
    }));

    const countries = Array.from(
      new Set([marker.country, ...(featuredMarkerCountryCandidates[marker.country] || [])])
    ).filter(Boolean);

    try {
      const rows = await ArtworkService.getArtworksByCountriesAndCityLoose({
        countries,
        city: marker.city,
        timeRange,
        limit: 30
      });

      setFeaturedMarkerArtworks(prev => ({
        ...prev,
        [key]: { status: 'loaded', artworks: rows }
      }));
    } catch (error) {
      console.error('Error loading featured marker artworks:', { key, error });
      setFeaturedMarkerArtworks(prev => ({
        ...prev,
        [key]: { status: 'error', artworks: prev[key]?.artworks || [] }
      }));
    }
  };

  const featuredArtworksByKey = useMemo(() => {
    const normalize = (value: string) => value.trim().toLowerCase();

    const buckets = new Map<string, { marker: (typeof featuredMarkers)[number]; cityMatches: Artwork[]; countryMatches: Artwork[] }>();
    for (const marker of featuredMarkers) {
      buckets.set(`${marker.country}||${marker.city}`, { marker, cityMatches: [], countryMatches: [] });
    }

    for (const artwork of artworks) {
      const artworkCountry = normalize(artwork.location.country || '');
      const artworkCity = normalize(artwork.location.city || '');

      for (const entry of buckets.values()) {
        const markerCity = normalize(entry.marker.city);
        const acceptableCountries = new Set([
          normalize(entry.marker.country),
          ...(featuredMarkerCountryCandidates[entry.marker.country] || []).map(normalize)
        ]);

        const matchesMarkerCountry = acceptableCountries.has(artworkCountry) || acceptableCountries.has(artworkCity);
        const matchesMarkerCity = (artworkCity && artworkCity === markerCity) || (artworkCountry && artworkCountry === markerCity);

        if (!matchesMarkerCountry && !matchesMarkerCity) continue;

        entry.countryMatches.push(artwork);
        if (matchesMarkerCity) {
          entry.cityMatches.push(artwork);
        }
      }
    }

    const result = new Map<string, Artwork[]>();
    for (const [key, entry] of buckets.entries()) {
      result.set(key, entry.cityMatches.length > 0 ? entry.cityMatches : entry.countryMatches);
    }
    return result;
  }, [artworks, featuredMarkers, featuredMarkerCountryCandidates]);

  // Style function for GeoJSON countries (保持不变)
  const countryStyle = (feature: any) => {
    const countryName = feature.properties.name;
    const count = countryCounts[countryName] || 0;

    return {
      fillColor: getHeatmapColor(count),
      weight: 1,
      opacity: 0.8,
      color: '#1F2937',
      fillOpacity: showHeatmap ? 0.7 : 0.1
    };
  };

  // Country click: use country name directly (no external geocoding)
  const onCountryClick = (feature: any, layer: any) => {
    const countryName = feature.properties.name;
    const count = countryCounts[countryName] || 0;

    if (count > 0) {
      onLocationTimeSelect({ country: countryName, city: '' }, timeRange);
    }

    const popup = L.popup().setContent(`
      <div class="bg-gray-800 text-white p-3 rounded-lg">
        <h3 class="font-bold text-blue-400 mb-2">${countryName}</h3>
        <p class="text-gray-300 text-sm mb-2">${count} artwork${count !== 1 ? 's' : ''}</p>
      </div>
    `);

    layer.bindPopup(popup);
    layer.openPopup();
  };

  // No global functions needed anymore (country click handled inline, gallery via props)

  const handleLocationClick = (locationArtworks: Artwork[], locationOverride?: Location) => {
    if (locationOverride) {
      onLocationTimeSelect(locationOverride, timeRange);
      return;
    }
    if (locationArtworks.length === 0) {
      return;
    }
    const location = locationArtworks[0].location;
    onLocationTimeSelect(location, timeRange);
  };

  const renderLocationPopup = (
    locationArtworks: Artwork[],
    title: string,
    options?: { locationOverride?: Location; status?: 'idle' | 'loading' | 'loaded' | 'error' }
  ) => (
    <div className="bg-gray-800 text-white p-4 rounded-lg min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-blue-400">
          {title}
        </h3>
        <span className="bg-purple-600 text-xs px-2 py-1 rounded-full">
          {locationArtworks.length} artwork{locationArtworks.length > 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {options?.status === 'loading' && locationArtworks.length === 0 && (
          <div className="text-sm text-gray-300">Loading artworks…</div>
        )}
        {options?.status === 'error' && locationArtworks.length === 0 && (
          <div className="text-sm text-gray-300">Failed to load artworks.</div>
        )}
        {locationArtworks.map((artwork) => (
          <div
            key={artwork.id}
            className="flex items-start space-x-3 p-2 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
            onClick={() => window.open(`/artwork/${artwork.slug}`, '_self')}
          >
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-white truncate">
                {artwork.title}
              </h4>
              <div className="flex items-center text-xs text-gray-300 mt-1">
                <User size={10} className="mr-1" />
                {artwork.artist}
              </div>
              <div className="flex items-center text-xs text-gray-400 mt-1">
                <Calendar size={10} className="mr-1" />
                {artwork.year} • {artwork.period}
              </div>
            </div>
            
            {/* Add to Gallery Button in Popup */}
            {onAddToGallery && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToGallery(artwork);
                }}
                className={`w-6 h-6 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                  galleryArtworkIds.has(artwork.id) 
                    ? 'bg-pink-600 hover:bg-pink-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                title={t('gallery.addToGallery')}
              >
                <span className="text-xs font-bold leading-none">
                  {galleryArtworkIds.has(artwork.id) ? '♥' : '+'}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
      
      <button
        onClick={() => handleLocationClick(locationArtworks, options?.locationOverride)}
        disabled={locationArtworks.length === 0 && !options?.locationOverride}
        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
      >
        {t('map.viewArtworks')} ({locationArtworks.length})
      </button>
    </div>
  );

  // 1. 修改 getCityFromCoordinates 函数，同时获取城市和国家信息
  const getLocationFromCoordinates = async (lat: number, lng: number): Promise<{
    city: string;
    country: string;
  }> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`
      );
      const data = await response.json();
      
      const city = data.address?.city || 
                   data.address?.town || 
                   data.address?.village || 
                   data.display_name?.split(',')[0] || 
                   'Unknown Location';
      
      const country = data.address?.country || 'Unknown Country';
      
      return { city, country };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { city: 'Unknown Location', country: 'Unknown Country' };
    }
  };

  // 2. 修改 handleMapClick 函数
  const handleMapClick = async (lat: number, lng: number) => {
    try {
      const { city, country } = await getLocationFromCoordinates(lat, lng);
      console.log('Clicked location:', { lat, lng, city, country });

      setClickedLocation({
        lat,
        lng,
        city,
        country
      });
    } catch (error) {
      console.error('Error getting location info:', error);
    }
  };

  const handleCityClick = () => {
    if (!clickedLocation) return;

    // Filter artworks by the clicked location and current time range
    const locationArtworks = artworks.filter(artwork => 
      artwork.location.country === clickedLocation.country &&
      artwork.year >= timeRange.start && 
      artwork.year <= timeRange.end
    );

    if (locationArtworks.length > 0) {
      onLocationTimeSelect(clickedLocation, timeRange);
    } else {
      // Show a message if no artworks found for this location/time combination
      alert(`在 ${clickedLocation.city}, ${clickedLocation.country} (${timeRange.start}-${timeRange.end}) 未找到艺术品`);
    }

    // Clear the clicked location after query
    setClickedLocation(null);
  };

  return (
    <div className="absolute inset-0">
      {/* Map Info Panel */}
      <div className="absolute top-6 left-6 z-20 bg-black/80 backdrop-blur-sm rounded-xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center text-white">
              <MapPin size={16} className="mr-2 text-blue-400" />
              <span className="font-medium">{featuredMarkers.length} {t('map.locations')}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Calendar size={16} className="mr-1 text-purple-400" />
              {t('header.timeRange', { start: timeRange.start, end: timeRange.end })}
            </div>
          </div>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`p-2 rounded-lg transition-colors ${
              showHeatmap 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={showHeatmap ? t('map.hideHeatmap') : t('map.showHeatmap')}
          >
            <BarChart3 size={16} />
          </button>
        </div>

        {showHeatmap && (
          <div className="border-t border-gray-600 pt-3">
            <div className="text-xs text-gray-400 mb-2">{t('map.heatmapTitle')}</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {legendData.map((item, index) => (
                <div key={index} className="flex items-center text-gray-300">
                  <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: item.color }}></div>
                  {item.label}
                </div>
              ))}
            </div>
            {maxCount > 0 && (
              <div className="text-gray-400 text-xs mt-2 space-y-1">
                <div>{t('map.totalCountries', { count: counts.length })}</div>
                <div>{t('map.maxCount', { count: maxCount })}</div>
              </div>
            )}
          </div>
        )}

        {clickedLocation && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-xs text-gray-400 mb-1">{t('map.clickedLocation')}</div>
            <div className="text-sm text-blue-400">{clickedLocation.city}, {clickedLocation.country}</div>
          </div>
        )}
      </div>

      <div className="absolute inset-0">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="z-10"
          whenReady={() => setMapLoaded(true)}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
	          {/* Country Heatmap Layer */}
	          {showHeatmap && (
	            <GeoJSON
	              key={heatmapLayerKey}
	              data={worldCountries as any}
	              style={countryStyle}
	              onEachFeature={(feature, layer) => {
	                layer.on({
                  click: () => onCountryClick(feature, layer),
                  mouseover: (e) => {
                    const targetLayer = e.target;
                    const baseStyle = countryStyle(feature);
                    targetLayer.setStyle({
                      fillColor: baseStyle.fillColor,
                      color: baseStyle.color,
                      weight: 2,
                      dashArray: '',
                      fillOpacity: Math.min(
                        1,
                        (baseStyle.fillOpacity ?? 0.7) + 0.2
                      )
                    });
                    targetLayer.bringToFront();
                  },
                  mouseout: (e) => {
                    const layer = e.target;
                    layer.setStyle(countryStyle(feature));
                  }
                });
              }}
            />
	          )}

          {/* Featured onboarding markers */}
          {featuredMarkers.map(({ city, country, lat, lng, label }) => {
            const key = `${country}||${city}`;
            const loaded = featuredMarkerArtworks[key];
            const markerArtworks = loaded?.artworks || featuredArtworksByKey.get(key) || [];
            const primaryArtwork = markerArtworks[0];

            return (
              <Marker
                key={`featured-${country}-${city}`}
                position={[lat, lng]}
                icon={createCustomIcon(primaryArtwork?.period || '')}
                eventHandlers={{
                  popupopen: () => {
                    void ensureFeaturedMarkerArtworks({ country, city, lat, lng, label });
                  }
                }}
              >
                <Popup className="custom-popup" maxWidth={300}>
                  {renderLocationPopup(markerArtworks, label, {
                    locationOverride: { country, city },
                    status: loaded?.status || 'idle'
                  })}
                </Popup>
              </Marker>
            );
          })}
          
          <MapClickHandler onLocationClick={handleMapClick} />
          
          {/* Clicked location marker */}
          {clickedLocation && (
            <Marker
              position={[clickedLocation.lat, clickedLocation.lng]}
              icon={createCityMarker()}
            >
              <Popup className="custom-popup" maxWidth={200}>
                <div className="bg-gray-800 text-white p-3 rounded-lg">
                  <h3 className="font-bold text-blue-400 mb-2">
                    {clickedLocation.city}
                  </h3>
                  <p className="text-gray-300 text-sm mb-3">
                    {clickedLocation.country}
                  </p>
                  <button
                    onClick={handleCityClick}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t('map.queryLocation')}
                  </button>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
        
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">{t('map.loadingMap')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Updated Map Legend */}
      <div className="absolute bottom-6 left-6 z-20 bg-black/80 backdrop-blur-sm rounded-xl p-4 shadow-2xl">
        
        <div className="mt-3 text-xs text-gray-400 border-t border-gray-600 pt-2">
          {showHeatmap ? t('map.clickCountry') : t('map.clickMap')}
        </div>
      </div>
    </div>
  );
};

export default InteractiveWorldMap;
