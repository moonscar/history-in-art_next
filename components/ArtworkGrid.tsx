import React from 'react';
import { Artwork } from '../types';
import ArtworkCard from './ArtworkCard';
import { Search, Filter } from 'lucide-react';

interface ArtworkGridProps {
  artworks: Artwork[];
  onArtworkSelect: (artwork: Artwork) => void;
}

const ArtworkGrid: React.FC<ArtworkGridProps> = ({ artworks, onArtworkSelect }) => {
  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          Discovered Artworks
          <span className="ml-2 bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-sm">
            {artworks.length}
          </span>
        </h2>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search artworks..."
              className="pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>
          <button className="p-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors">
            <Filter size={16} />
          </button>
        </div>
      </div>
      
      {artworks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Search size={24} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-400 mb-2">No Artworks Found</h3>
          <p className="text-gray-500 text-sm">
            Try adjusting your time range or location filters to discover more artworks.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              onClick={() => onArtworkSelect(artwork)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtworkGrid;