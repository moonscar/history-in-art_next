import React from 'react';
import { useTranslations } from 'next-intl';
import { Artwork } from '../types';
import { MapPin, Calendar, User, Palette } from 'lucide-react';

interface ArtworkCardProps {
  artwork: Artwork;
  onClick: () => void;
  onAddToGallery?: (artwork: Artwork) => void;
  showAddButton?: boolean;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ 
  artwork, 
  onClick, 
  onAddToGallery, 
  showAddButton = true 
}) => {
  const t = useTranslations();

  const handleAddToGallery = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToGallery) {
      onAddToGallery(artwork);
    }
  };

  return (
    <article 
      className="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group"
      onClick={onClick}
      itemScope
      itemType="https://schema.org/VisualArtwork"
    >
      {/* Add to Gallery Button */}
      {onAddToGallery && showAddButton && (
        <button
          onClick={handleAddToGallery}
          className="absolute top-3 left-3 w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg z-10"
          title={t('gallery.addToGallery')}
        >
          <span className="text-lg font-bold leading-none">+</span>
        </button>
      )}
      
      <figure className="relative overflow-hidden">
        <img 
          src={artwork.imageUrl} 
          alt={`${artwork.title} by ${artwork.artist}, ${artwork.year}`}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          itemProp="image"
          loading="lazy"
          width="400"
          height="192"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-3 right-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
          <span itemProp="genre">{artwork.period}</span>
        </div>
      </figure>
      
      <div className="p-4 space-y-3">
        <header>
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate" itemProp="name">
            {artwork.title}
          </h3>
          <div className="flex items-center text-gray-400 text-sm mt-1" itemScope itemType="https://schema.org/Person">
            <User size={14} className="mr-1" />
            <span itemProp="creator">{artwork.artist}</span>
          </div>
        </header>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-300">
            <Calendar size={14} className="mr-2 text-blue-400" />
            <time dateTime={artwork.year.toString()} itemProp="dateCreated">{artwork.year}</time>
          </div>
          
          <div className="flex items-center text-gray-300" itemScope itemType="https://schema.org/Place">
            <MapPin size={14} className="mr-2 text-green-400" />
            <span itemProp="contentLocation">
              <span itemProp="addressLocality">{artwork.location.city}</span>, 
              <span itemProp="addressCountry">{artwork.location.country}</span>
            </span>
          </div>
          
          <div className="flex items-center text-gray-300">
            <Palette size={14} className="mr-2 text-purple-400" />
            <span itemProp="artform">{artwork.movement}</span>
          </div>
        </div>
        
        <p className="text-gray-400 text-xs line-clamp-2" itemProp="description">
          {artwork.description}
        </p>
      </div>
    </article>
  );
};

export default ArtworkCard;