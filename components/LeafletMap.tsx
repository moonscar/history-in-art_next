'use client';

import React, { useEffect, useState } from 'react';
import { Artwork, TimeRange } from '../types';
import { MapPin, Calendar } from 'lucide-react';

interface LeafletMapProps {
  artworks: Artwork[];
  timeRange: TimeRange;
  onLocationTimeSelect: (location: string, timeRange: TimeRange) => void;
  onArtworkSelect: (artwork: Artwork) => void;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  artworks,
  timeRange,
  onLocationTimeSelect,
  onArtworkSelect
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Only load Leaflet on client side
    if (typeof window !== 'undefined') {
      let isMounted = true;

      const loadLeaflet = async () => {
        try {
          // Dynamically import Leaflet
          const leaflet = await import('leaflet');
          
          if (!isMounted) return;

          // Fix for default markers
          delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
          leaflet.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          });

          setL(leaflet);

          // Initialize map
          const map = leaflet.map('leaflet-map').setView([20, 0], 2);

          // Add tile layer
          leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
          }).addTo(map);

          setMapInstance(map);
          setMapLoaded(true);

        } catch (error) {
          console.error('Error loading Leaflet:', error);
        }
      };

      loadLeaflet();

      return () => {
        isMounted = false;
        if (mapInstance) {
          mapInstance.remove();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (!mapInstance || !L || !mapLoaded) return;

    // Clear existing markers
    mapInstance.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        mapInstance.removeLayer(layer);
      }
    });

    // Group artworks by location
    const artworksByLocation = artworks.reduce((acc, artwork) => {
      const key = `${artwork.location.coordinates[0]},${artwork.location.coordinates[1]}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(artwork);
      return acc;
    }, {} as { [key: string]: Artwork[] });

    // Add markers for each location
    Object.entries(artworksByLocation).forEach(([locationKey, locationArtworks]) => {
      const [lng, lat] = locationKey.split(',').map(Number);
      const primaryArtwork = locationArtworks[0];

      // Create custom icon based on period
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

      const color = colors[primaryArtwork.period] || '#6366F1';

      const customIcon = L.divIcon({
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

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance);

      // Create popup content
      const popupContent = `
        <div style="background: #1F2937; color: white; padding: 16px; border-radius: 8px; min-width: 280px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <h3 style="font-weight: bold; font-size: 18px; color: #60A5FA; margin: 0;">
              ${primaryArtwork.location.city}, ${primaryArtwork.location.country}
            </h3>
            <span style="background: #7C3AED; font-size: 12px; padding: 4px 8px; border-radius: 9999px;">
              ${locationArtworks.length} artwork${locationArtworks.length > 1 ? 's' : ''}
            </span>
          </div>
          <div style="max-height: 200px; overflow-y: auto;">
            ${locationArtworks.map(artwork => `
              <div style="display: flex; align-items: flex-start; gap: 12px; padding: 8px; background: #374151; border-radius: 8px; margin-bottom: 8px; cursor: pointer;" onclick="window.selectArtwork('${artwork.id}')">
                <img src="${artwork.imageUrl}" alt="${artwork.title}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px;" />
                <div style="flex: 1; min-width: 0;">
                  <h4 style="font-weight: 500; color: white; font-size: 14px; margin: 0 0 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${artwork.title}
                  </h4>
                  <div style="font-size: 12px; color: #D1D5DB; margin-bottom: 4px;">
                    ${artwork.artist}
                  </div>
                  <div style="font-size: 12px; color: #9CA3AF;">
                    ${artwork.year} • ${artwork.period}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <button onclick="window.selectLocation('${primaryArtwork.location.country}')" style="width: 100%; margin-top: 12px; background: #2563EB; color: white; padding: 8px 16px; border-radius: 8px; border: none; font-size: 14px; font-weight: 500; cursor: pointer;">
            查看该地区艺术品 (${locationArtworks.length})
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });
    });

    // Add global functions for popup interactions
    (window as any).selectArtwork = (artworkId: string) => {
      const artwork = artworks.find(a => a.id === artworkId);
      if (artwork) {
        onArtworkSelect(artwork);
      }
    };

    (window as any).selectLocation = (country: string) => {
      onLocationTimeSelect(country, timeRange);
    };

  }, [artworks, mapInstance, L, mapLoaded, onArtworkSelect, onLocationTimeSelect, timeRange]);

  // Group artworks by location for stats
  const artworksByLocation = artworks.reduce((acc, artwork) => {
    const key = `${artwork.location.coordinates[0]},${artwork.location.coordinates[1]}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(artwork);
    return acc;
  }, {} as { [key: string]: Artwork[] });

  return (
    <div className="relative w-full h-full">
      {/* Map Info Panel */}
      <div className="absolute top-6 left-6 z-[1000] bg-black/80 backdrop-blur-sm rounded-xl p-4 shadow-2xl">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center text-white">
            <MapPin size={16} className="mr-2 text-blue-400" />
            <span className="font-medium">{Object.keys(artworksByLocation).length} locations</span>
          </div>
          <div className="flex items-center text-gray-300">
            <Calendar size={16} className="mr-1 text-purple-400" />
            {timeRange.start} - {timeRange.end}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        id="leaflet-map" 
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ minHeight: '400px' }}
      />

      {/* Loading State */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading interactive map...</p>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-black/80 backdrop-blur-sm rounded-xl p-4 shadow-2xl">
        <h3 className="text-white font-medium mb-3 text-sm">Art Periods</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { period: 'Renaissance', color: '#D69E2E' },
            { period: 'Baroque', color: '#C53030' },
            { period: 'Modern', color: '#805AD5' },
            { period: 'Contemporary', color: '#E53E3E' }
          ].map(({ period, color }) => (
            <div key={period} className="flex items-center text-gray-300">
              <div
                className="w-3 h-3 rounded-full mr-2 border border-white"
                style={{ backgroundColor: color }}
              ></div>
              {period}
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-400 border-t border-gray-600 pt-2">
          点击标记查看艺术品详情
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;