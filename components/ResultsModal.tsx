import React, { useState, useMemo } from 'react';
import { Artwork, Location } from '../types';
import { X, Filter, MapPin, Calendar, User, Palette, RotateCcw } from 'lucide-react';
import ArtworkCard from './ArtworkCard';

interface ResultsModalProps {
  artworks: Artwork[];
  location?: Location;
  timeRange?: { start: number; end: number };
  onClose: () => void;
  onArtworkSelect: (artwork: Artwork) => void;
  onAddToGallery?: (artwork: Artwork) => void;
}

const ResultsModal: React.FC<ResultsModalProps> = ({
  artworks,
  location,
  timeRange,
  onClose,
  onArtworkSelect,
  onAddToGallery
}) => {
  const [selectedMovement, setSelectedMovement] = useState('All Movements');
  const [selectedArtist, setSelectedArtist] = useState('All Artists');
  const [sortBy, setSortBy] = useState('year');

  // 获取可用的筛选选项
  const movements = useMemo(() => {
    const uniqueMovements = [...new Set(artworks.map(a => a.movement))];
    return ['All Movements', ...uniqueMovements.sort()];
  }, [artworks]);

  const artists = useMemo(() => {
    const uniqueArtists = [...new Set(artworks.map(a => a.artist))];
    return ['All Artists', ...uniqueArtists.sort()];
  }, [artworks]);

  // 筛选和排序艺术品
  const filteredAndSortedArtworks = useMemo(() => {
    let filtered = artworks.filter(artwork => {
      const matchesMovement = selectedMovement === 'All Movements' || artwork.movement === selectedMovement;
      const matchesArtist = selectedArtist === 'All Artists' || artwork.artist === selectedArtist;
      return matchesMovement && matchesArtist;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'year':
          return a.year - b.year;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'artist':
          return a.artist.localeCompare(b.artist);
        default:
          return 0;
      }
    });

    return filtered;
  }, [artworks, selectedMovement, selectedArtist, sortBy]);

  const handleResetFilters = () => {
    setSelectedMovement('All Movements');
    setSelectedArtist('All Artists');
    setSortBy('year');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">搜索结果</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              {location && (
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1 text-blue-400" />
                  {location.city && location.city.trim() 
                    ? `${location.country}, ${location.city}`
                    : location.country
                  }
                </div>
              )}
              {timeRange && (
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1 text-purple-400" />
                  {timeRange.start} - {timeRange.end}
                </div>
              )}
              <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                {filteredAndSortedArtworks.length} 件作品
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Filter size={18} className="mr-2 text-orange-400" />
              <h3 className="text-white font-medium">筛选和排序</h3>
            </div>
            <button
              onClick={handleResetFilters}
              className="flex items-center px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              <RotateCcw size={14} className="mr-1" />
              重置
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                艺术流派
              </label>
              <select
                value={selectedMovement}
                onChange={(e) => setSelectedMovement(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                {movements.map((movement) => (
                  <option key={movement} value={movement}>
                    {movement}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                艺术家
              </label>
              <select
                value={selectedArtist}
                onChange={(e) => setSelectedArtist(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                {artists.map((artist) => (
                  <option key={artist} value={artist}>
                    {artist}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                排序方式
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="year">按年代</option>
                <option value="title">按标题</option>
                <option value="artist">按艺术家</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {filteredAndSortedArtworks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Palette size={24} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-400 mb-2">未找到匹配的艺术品</h3>
              <p className="text-gray-500 text-sm">
                请尝试调整筛选条件或重新搜索。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedArtworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onClick={() => onArtworkSelect(artwork)}
                  onAddToGallery={onAddToGallery}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;