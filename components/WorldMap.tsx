"use client";

import React from 'react';
import { Artwork } from '../types';

interface WorldMapProps {
  artworks: Artwork[];
  selectedCountry: string | null;
  onCountrySelect: (country: string | null) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ artworks, selectedCountry, onCountrySelect }) => {
  const getCountryArtworkCount = (country: string) => {
    return artworks.filter(artwork => artwork.location.country === country).length;
  };

  const getCountryColor = (country: string) => {
    const count = getCountryArtworkCount(country);
    if (count === 0) return '#374151';
    if (count <= 2) return '#6366F1';
    if (count <= 4) return '#8B5CF6';
    return '#EC4899';
  };

  const countries = [
    { name: 'Italy', path: 'M 300 220 L 320 220 L 330 240 L 320 260 L 300 250 Z', center: [315, 240] },
    { name: 'France', path: 'M 280 200 L 300 195 L 310 210 L 295 225 L 275 215 Z', center: [290, 210] },
    { name: 'Spain', path: 'M 260 230 L 285 225 L 290 245 L 270 250 L 255 240 Z', center: [270, 237] },
    { name: 'Netherlands', path: 'M 285 180 L 305 175 L 310 190 L 290 195 Z', center: [295, 185] },
    { name: 'Japan', path: 'M 650 250 L 680 245 L 685 270 L 675 285 L 655 275 Z', center: [670, 265] },
    { name: 'United States', path: 'M 120 220 L 200 210 L 210 250 L 190 280 L 110 270 Z', center: [160, 245] }
  ];

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
        World Map
      </h2>
      
      <div className="relative">
        <svg 
          width="800" 
          height="400" 
          viewBox="0 0 800 400" 
          className="w-full h-auto border border-gray-700 rounded-lg bg-gray-800"
        >
          {/* Background */}
          <rect width="800" height="400" fill="#1F2937" />
          
          {/* Countries */}
          {countries.map((country) => (
            <g key={country.name}>
              <path
                d={country.path}
                fill={selectedCountry === country.name ? '#F59E0B' : getCountryColor(country.name)}
                stroke="#374151"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-300 hover:brightness-125"
                onClick={() => onCountrySelect(selectedCountry === country.name ? null : country.name)}
              />
              
              {/* Country labels */}
              <text
                x={country.center[0]}
                y={country.center[1]}
                fill="white"
                fontSize="12"
                textAnchor="middle"
                className="pointer-events-none select-none"
              >
                {country.name}
              </text>
              
              {/* Artwork count indicators */}
              {getCountryArtworkCount(country.name) > 0 && (
                <circle
                  cx={country.center[0]}
                  cy={country.center[1] + 15}
                  r={Math.max(4, getCountryArtworkCount(country.name) * 2)}
                  fill="#EF4444"
                  className="animate-pulse"
                />
              )}
            </g>
          ))}
          
          {/* Legend */}
          <g transform="translate(20, 20)">
            <rect x="0" y="0" width="150" height="80" fill="rgba(0,0,0,0.7)" rx="5" />
            <text x="10" y="20" fill="white" fontSize="12" fontWeight="bold">Artwork Density</text>
            <circle cx="20" cy="35" r="3" fill="#374151" />
            <text x="30" y="40" fill="white" fontSize="10">No artworks</text>
            <circle cx="20" cy="50" r="3" fill="#6366F1" />
            <text x="30" y="55" fill="white" fontSize="10">1-2 artworks</text>
            <circle cx="20" cy="65" r="3" fill="#EC4899" />
            <text x="30" y="70" fill="white" fontSize="10">3+ artworks</text>
          </g>
        </svg>
      </div>
      
      <div className="mt-4 text-sm text-gray-400">
        Click on countries to filter artworks by location. Selected: {selectedCountry || 'None'}
      </div>
    </div>
  );
};

export default WorldMap;