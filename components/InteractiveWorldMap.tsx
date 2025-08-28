import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { point } from '@turf/helpers';
// import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import rewind from '@turf/rewind';
import { Artwork, TimeRange, Location } from '../types';
import { MapPin, Image as ImageIcon, Calendar, User, BarChart3 } from 'lucide-react';
import { ArtworkService } from '../services/artworkService';
import worldCountries from '../data/world-countries.json';
// import cities from '../data/cities.json';
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

// Component to handle map click events
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

// Component to get country name from coordinates (simplified)
// const getCountryFromCoordinates = (lat: number, lng: number): string => {
//   try {
//     const clickPoint = point([lng, lat]);

//     // 在 worldCountries 数据中查找包含该点的国家
//     for (const feature of worldCountries.features) {
//       if (booleanPointInPolygon(clickPoint, feature)) {
//         return feature.properties.NAME || feature.properties.name || 'Unknown';
//       }
//     }

//     return 'Unknown Location';
//   } catch (error) {
//     console.error('Error in coordinate detection:', error);
//     return 'Unknown Location';
//   }
// };

// Get city name from coordinates
const getCityFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );
    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.village || 'Unknown Location';
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Unknown Location';
  }
};

const InteractiveWorldMap: React.FC<InteractiveWorldMapProps> = ({
  artworks,
  timeRange,
  onLocationTimeSelect,
  onArtworkSelect
}) => {
  const { t } = useTranslation();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [countryCounts, setCountryCounts] = useState<{ [country: string]: number }>({});
  const [clickedLocation, setClickedLocation] = useState<{
    lat: number;
    lng: number;
    city: string;
    country: string;
  } | null>(null);

  // Fetch country counts when component mounts or time range changes
  useEffect(() => {
    const fetchCountryCounts = async () => {
      const rawCounts = await ArtworkService.getArtworkCountsByCountry({ timeRange });

      // 获取GeoJSON中的有效国家名
      const validCountries = new Set(
       worldCountries.features.map(f => f.properties.name).filter(Boolean)
      );

      // 只保留匹配的国家
      const filteredCounts = Object.fromEntries(
       Object.entries(rawCounts).filter(([location]) => validCountries.has(location))
      );

      setCountryCounts(filteredCounts);
    };

    fetchCountryCounts();
  }, [timeRange]);

  // 计算动态分级断点
  const calculateBreakpoints = (counts: number[]): number[] => {
    if (counts.length === 0) return [0, 1, 5, 10, 50];

    const sortedCounts = counts.sort((a, b) => a - b);
    const minCount = sortedCounts[0];
    const maxCount = sortedCounts[sortedCounts.length - 1];

    // 如果所有值都相同，返回简单分级
    if (minCount === maxCount) {
      return minCount === 0 ? [0, 1] : [0, Math.ceil(minCount / 2), minCount];
    }

    // 使用分位数方法计算断点
    const getPercentile = (arr: number[], percentile: number): number => {
      const index = Math.ceil(arr.length * percentile) - 1;
      return arr[Math.max(0, index)];
    };

    return [
      0, // 无数据
      getPercentile(sortedCounts, 0.2), // 20分位数
      getPercentile(sortedCounts, 0.4), // 40分位数
      getPercentile(sortedCounts, 0.6), // 60分位数
      getPercentile(sortedCounts, 0.8), // 80分位数
      maxCount // 最大值
    ].filter((value, index, arr) => index === 0 || value > arr[index - 1]); // 去重
  };

  // 获取当前数据的断点
  const counts = Object.values(countryCounts).filter(count => count > 0);
  const breakpoints = calculateBreakpoints(counts);

  // Get color based on artwork count (动态版本)
  const getHeatmapColor = (count: number): string => {
    const colors = ['#374151', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#DC2626'];

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
    const colors = ['#374151', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#DC2626'];
    const labels: Array<{color: string, label: string, range: [number, number]}> = [];

    // 无数据
    labels.push({
      color: colors[0],
      label: t('map.noArtworks'),
      range: [0, 0]
    });

    // 动态分级标签
    for (let i = 1; i < breakpoints.length; i++) {
      const start = i === 1 ? 1 : breakpoints[i - 1] + 1;
      const end = breakpoints[i];
      
      let label: string;
      if (i === breakpoints.length - 1) {
        // label = `${start}+ 件`;
        label = t("map.artworkCount", { count: start });
      } else {
        // label = start === end ? `${start} 件` : `${start}-${end} 件`;
        label = start === end ? t("map.artworkCount", { count: start }) : t("map.artworkCount", { count: start - end});
      }
      
      labels.push({
        color: colors[Math.min(i, colors.length - 1)],
        label,
        range: [start, end]
      });
    }

    return labels;
  };

  // Get max count for reference
  const maxCount = Math.max(...Object.values(countryCounts), 0);

  // 获取图例数据
  const legendData = generateLegendLabels();

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

  // 3. 修改 onCountryClick 函数，使用 Nominatim API
  const onCountryClick = async (feature: any, layer: any) => {
    // 获取国家的中心点坐标
    const bounds = layer.getBounds();
    const center = bounds.getCenter();
    
    try {
      const location: Location = await getLocationFromCoordinates(center.lat, center.lng);
      const count = countryCounts[location.country] || countryCounts[feature.properties.NAME] || 0;

      if (count > 0) {
        onLocationTimeSelect(location, timeRange);
      }

      // Show popup with country info
      const popup = L.popup()
        .setContent(`
          <div class="bg-gray-800 text-white p-3 rounded-lg">
            <h3 class="font-bold text-blue-400 mb-2">${location.country}</h3>
            <p class="text-gray-300 text-sm mb-2">${count} artwork${count !== 1 ? 's' : ''}</p>
            ${count > 0 ? 
              `<button onclick="window.queryCountry('${location.country}')" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm">{t('map.viewArtworks')}</button>` : 
              `<p class="text-gray-500 text-xs">{t('map.noArtworks')}</p>`
            }
          </div>
        `);

      layer.bindPopup(popup);
    } catch (error) {
      console.error('Error getting country info:', error);
      // 回退到原来的逻辑
      const countryName = feature.properties.NAME;
      const count = countryCounts[countryName] || 0;
      
      if (count > 0) {
        onLocationTimeSelect(countryName, timeRange);
      }
    }
  };

  // Add global function for popup button
  useEffect(() => {
    (window as any).queryCountry = (countryName: string) => {
      const location: Location = {
        country: countryName,
        city: ''
      }
      onLocationTimeSelect(location, timeRange);
    };

    return () => {
      delete (window as any).queryCountry;
    };
  }, [onLocationTimeSelect, timeRange]);

  // Group artworks by location to create clusters
  const artworksByLocation = artworks.reduce((acc, artwork) => {
    const key = `${artwork.location.coordinates[0]},${artwork.location.coordinates[1]}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(artwork);
    return acc;
  }, {} as { [key: string]: Artwork[] });

  const handleLocationClick = (locationArtworks: Artwork[]) => {
    const location = locationArtworks[0].location;
    onLocationTimeSelect(location, timeRange);
  };

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
              <span className="font-medium">{Object.keys(artworksByLocation).length} {t('map.locations')}</span>
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
          <GeoJSON
            data={worldCountries as any}
            style={countryStyle}
            onEachFeature={(feature, layer) => {
              layer.on({
                click: () => onCountryClick(feature, layer),
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                  });
                },
                mouseout: (e) => {
                  const layer = e.target;
                  layer.setStyle(countryStyle(feature));
                }
              });
            }}
          />
          
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
          
          {/* Individual Artwork Markers - only show when zoomed in or heatmap is off */}
          {(!showHeatmap || Object.keys(artworksByLocation).length < 20) && 
            Object.entries(artworksByLocation).map(([locationKey, locationArtworks]) => {
              const [lng, lat] = locationKey.split(',').map(Number);
              const primaryArtwork = locationArtworks[0];
              
              return (
                <Marker
                  key={locationKey}
                  position={[lat, lng]}
                  icon={createCustomIcon(primaryArtwork.period)}
                >
                  <Popup className="custom-popup" maxWidth={300}>
                    <div className="bg-gray-800 text-white p-4 rounded-lg min-w-[280px]">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg text-blue-400">
                          {primaryArtwork.location.city}, {primaryArtwork.location.country}
                        </h3>
                        <span className="bg-purple-600 text-xs px-2 py-1 rounded-full">
                          {locationArtworks.length} artwork{locationArtworks.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {locationArtworks.map((artwork) => (
                          <div
                            key={artwork.id}
                            className="flex items-start space-x-3 p-2 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                            onClick={() => onArtworkSelect(artwork)}
                          >
                            <img
                              src={artwork.imageUrl}
                              alt={artwork.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white text-sm truncate">
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
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => handleLocationClick(locationArtworks)}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                      >
                        {t('map.viewArtworks')} ({locationArtworks.length})
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })
          }
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