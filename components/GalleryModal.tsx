import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Artwork } from '../types';
import { X, Trash2, Heart, Calendar, User, MapPin, Palette } from 'lucide-react';
import ArtworkCard from './ArtworkCard';

interface GalleryModalProps {
  artworks: Artwork[];
  onClose: () => void;
  onRemoveArtwork: (id: string) => void;
  onClearGallery: () => void;
  onArtworkSelect: (artwork: Artwork) => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({
  artworks,
  onClose,
  onRemoveArtwork,
  onClearGallery,
  onArtworkSelect
}) => {
  const t = useTranslations();
  const [sortBy, setSortBy] = useState('year');

  // Sort artworks based on selected criteria
  const sortedArtworks = useMemo(() => {
    const sorted = [...artworks];
    
    switch (sortBy) {
      case 'year':
        return sorted.sort((a, b) => a.year - b.year);
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'artist':
        return sorted.sort((a, b) => a.artist.localeCompare(b.artist));
      case 'dateAdded':
        return sorted.reverse(); // Most recently added first
      default:
        return sorted;
    }
  }, [artworks, sortBy]);

  const handleClearGallery = () => {
    if (window.confirm(t('gallery.confirmClear'))) {
      onClearGallery();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{t('gallery.title')}</h2>
              <p className="text-gray-400 text-sm">
                {t('gallery.count', { count: artworks.length })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {artworks.length > 0 && (
              <button
                onClick={handleClearGallery}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              >
                <Trash2 size={16} className="mr-2" />
                {t('gallery.clearGallery')}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={t('gallery.close')}
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Sort Controls */}
        {artworks.length > 0 && (
          <div className="p-4 border-b border-gray-700 bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-300">
                  {t('gallery.sortBy')}:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="year">{t('gallery.sortByYear')}</option>
                  <option value="title">{t('gallery.sortByTitle')}</option>
                  <option value="artist">{t('gallery.sortByArtist')}</option>
                  <option value="dateAdded">{t('gallery.sortByDateAdded')}</option>
                </select>
              </div>
              
              <div className="text-sm text-gray-400">
                {t('gallery.totalArtworks', { count: artworks.length })}
              </div>
            </div>
          </div>
        )}

        {/* Gallery Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {artworks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Heart size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-400 mb-3">{t('gallery.emptyTitle')}</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                {t('gallery.emptyMessage')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedArtworks.map((artwork) => (
                <div key={artwork.id} className="relative group">
                  <ArtworkCard
                    artwork={artwork}
                    onClick={() => onArtworkSelect(artwork)}
                  />
                  
                  {/* Remove from Gallery Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveArtwork(artwork.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                    title={t('gallery.removeArtwork')}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;