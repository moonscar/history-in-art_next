import React from 'react';
import { Artwork } from '../types';
import SEOHead from './SEOHead';
import { generateArtworkStructuredData } from '../utils/structuredData';
import { X, MapPin, Calendar, User, Palette, Image } from 'lucide-react';

interface ArtworkModalProps {
  artwork: Artwork | null;
  onClose: () => void;
}

const ArtworkModal: React.FC<ArtworkModalProps> = ({ artwork, onClose }) => {
  if (!artwork) return null;

  const artworkSEO = {
    title: `${artwork.title} - ${artwork.artist} | History in Art`,
    description: `${artwork.description.substring(0, 160)}... 创作于${artwork.year}年，${artwork.location.city}, ${artwork.location.country}。`,
    keywords: `${artwork.title},${artwork.artist},${artwork.movement},${artwork.period},${artwork.location.country},艺术品`,
    image: artwork.imageUrl,
    type: 'article',
    canonical: `https://history-in-art.org/artwork/${artwork.id}`
  };

  const structuredData = generateArtworkStructuredData(artwork);

  return (
    <>
      <SEOHead {...artworkSEO} structuredData={structuredData} />
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="artwork-title">
        <article 
          className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          itemScope 
          itemType="https://schema.org/VisualArtwork"
        >
          {/* Header */}
          <header className="flex items-center justify-between p-6 border-b border-gray-700">
            <h1 id="artwork-title" className="text-2xl font-bold text-white" itemProp="name">
              {artwork.title}
            </h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="关闭艺术品详情"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </header>
          
          {/* Content */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <section className="space-y-4" aria-label="艺术品图片">
              <figure className="relative rounded-xl overflow-hidden">
                <img 
                  src={artwork.imageUrl} 
                  alt={`${artwork.title} by ${artwork.artist}, created in ${artwork.year}`}
                  className="w-full h-80 object-cover"
                  itemProp="image"
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <span itemProp="genre">{artwork.period}</span>
                </div>
              </figure>
              
              <div>
                <div className="flex items-center text-gray-300 mb-2">
                  <Image size={16} className="mr-2 text-blue-400" />
                  <span className="font-medium">创作媒介</span>
                </div>
                <p className="text-white" itemProp="artMedium">{artwork.medium}</p>
              </div>
            </section>
            
            {/* Details */}
            <section className="space-y-6" aria-label="艺术品详细信息">
              <div itemScope itemType="https://schema.org/Person">
                <div className="flex items-center text-gray-300 mb-2">
                  <User size={16} className="mr-2 text-green-400" />
                  <span className="font-medium">艺术家</span>
                </div>
                <p className="text-xl text-white font-semibold" itemProp="name">{artwork.artist}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-300 mb-2">
                  <Calendar size={16} className="mr-2 text-blue-400" />
                  <span className="font-medium">创作年代</span>
                </div>
                <time className="text-lg text-white" dateTime={artwork.year.toString()} itemProp="dateCreated">
                  {artwork.year}
                </time>
              </div>
              
              <div itemScope itemType="https://schema.org/Place">
                <div className="flex items-center text-gray-300 mb-2">
                  <MapPin size={16} className="mr-2 text-purple-400" />
                  <span className="font-medium">地点</span>
                </div>
                <p className="text-lg text-white" itemProp="name">
                  <span itemProp="addressLocality">{artwork.location.city}</span>, 
                  <span itemProp="addressCountry">{artwork.location.country}</span>
                </p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-300 mb-2">
                  <Palette size={16} className="mr-2 text-orange-400" />
                  <span className="font-medium">艺术流派</span>
                </div>
                <p className="text-lg text-white" itemProp="artform">{artwork.movement}</p>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">作品描述</h2>
                <p className="text-gray-300 leading-relaxed" itemProp="description">
                  {artwork.description}
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                  onClick={() => window.open(`https://artsandculture.google.com/search?q=${encodeURIComponent(artwork.title + ' ' + artwork.artist)}`, '_blank')}
                >
                  在 Google Arts & Culture 中查看
                </button>
              </div>
            </section>
          </div>
        </article>
      </div>
    </>
  );
};

export default ArtworkModal;