import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, User, Palette, Image, ExternalLink } from 'lucide-react';
import { ArtworkService } from '@/services/artworkService';
import { generateArtworkStructuredData } from '@/utils/structuredData';
import SEOHead from '@/components/SEOHead';
import { AdSense } from '@/components/AdSense';

interface ArtworkDetailPageProps {
  params: {
    slug: string;
    locale: string;
  };
}

// Generate static params for all artworks
export async function generateStaticParams() {
  try {
    const slugs = await ArtworkService.getAllArtworkSlugs();
    return slugs.map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

async function ArtworkDetailPage({ params }: ArtworkDetailPageProps) {
  const { slug, locale } = params;
  
  // Fetch artwork data
  const artwork = await ArtworkService.getArtworkBySlug(slug);
  
  if (!artwork) {
    notFound();
  }

  // Generate SEO data
  const artworkSEO = {
    title: `${artwork.title} - ${artwork.artist} | History in Art`,
    description: `${artwork.description.substring(0, 160)}... 创作于${artwork.year}年，${artwork.location.city}, ${artwork.location.country}。`,
    keywords: `${artwork.title},${artwork.artist},${artwork.movement},${artwork.period},${artwork.location.country},艺术品`,
    image: artwork.imageUrl,
    type: 'article' as const,
    canonical: `https://history-in-art.org/artwork/${artwork.slug}`
  };

  const structuredData = generateArtworkStructuredData(artwork);

  const keywordTags = Array.from(
    new Set(
      (artwork.tags || [])
        .filter(tag => !tag.startsWith('movement:') && !tag.startsWith('medium:'))
        .filter((tag) => tag.length >= 2 && tag.length <= 80)
        .filter((tag) => !/https?:|www\.|\.com/i.test(tag))
    )
  )
    .map((tag) => ({
      value: tag,
      label: tag.replace(/^subject:/, '').replace(/^tag:/, '').trim(),
      href: `/${locale}?tags=${encodeURIComponent(tag)}`
    }))
    .filter((tag) => tag.label.length >= 2 && tag.label.length <= 40)
    .filter((tag) => !/,|\./.test(tag.label))
    .slice(0, 12);

  return (
    <>
      <SEOHead {...artworkSEO} structuredData={structuredData} />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Hero Section */}
        <section className="relative h-96 overflow-hidden">
          <img 
            src={artwork.imageUrl} 
            alt={`${artwork.title} by ${artwork.artist}, created in ${artwork.year}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-6xl mx-auto px-4 pb-12 w-full">
              <Link 
                href="/"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                返回探索
              </Link>
              
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full">
                    {artwork.period}
                  </span>
                  <div className="flex items-center text-gray-300">
                    <MapPin size={16} className="mr-1" />
                    {artwork.location.city}, {artwork.location.country}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Calendar size={16} className="mr-1" />
                    {artwork.year}
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  {artwork.title}
                </h1>
                
                <div className="flex items-center text-gray-300 text-xl">
                  <User size={20} className="mr-2" />
                  <span className="font-semibold">{artwork.artist}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <main className="max-w-6xl mx-auto px-4 py-12">
          <AdSense mode="auto" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Section */}
            <section className="space-y-6">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6">
                <figure className="relative rounded-xl overflow-hidden mb-6">
                  <img 
                    src={artwork.imageUrl} 
                    alt={`${artwork.title} by ${artwork.artist}`}
                    className="w-full h-96 object-cover"
                    itemProp="image"
                  />
                </figure>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center text-gray-300 mb-2">
                      <Palette size={16} className="mr-2 text-orange-400" />
                      <span className="font-medium">艺术流派</span>
                    </div>
                    <p className="text-white">{artwork.movement}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-gray-300 mb-2">
                      <Image size={16} className="mr-2 text-blue-400" />
                      <span className="font-medium">创作媒介</span>
                    </div>
                    <p className="text-white">{artwork.medium}</p>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Details Section */}
            <section className="space-y-6">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">作品信息</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center text-gray-300 mb-2">
                          <User size={16} className="mr-2 text-green-400" />
                          <span className="font-medium">艺术家</span>
                        </div>
                        <p className="text-xl text-white font-semibold">{artwork.artist}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center text-gray-300 mb-2">
                          <Calendar size={16} className="mr-2 text-blue-400" />
                          <span className="font-medium">创作年代</span>
                        </div>
                        <p className="text-lg text-white">{artwork.year}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center text-gray-300 mb-2">
                          <MapPin size={16} className="mr-2 text-purple-400" />
                          <span className="font-medium">地点</span>
                        </div>
                        <p className="text-lg text-white">
                          {artwork.location.city}, {artwork.location.country}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">作品描述</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {artwork.description}
                    </p>
                  </div>

                  {keywordTags.length > 0 ? (
                    <div className="border-t border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {keywordTags.map((tag) => (
                          <Link
                            key={tag.value}
                            href={tag.href}
                            className="inline-flex items-center rounded-full bg-purple-600/20 px-3 py-1 text-sm text-purple-200 hover:bg-purple-600/30 transition-colors"
                          >
                            {tag.label}
                          </Link>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-gray-400">
                        Click a keyword to explore artworks on the map with the same tag.
                      </p>
                    </div>
                  ) : null}
                  
                  <div className="border-t border-gray-700 pt-6">
                    <div className="space-y-3">
                      <a
                        href={`https://artsandculture.google.com/search?q=${encodeURIComponent(
                          artwork.title + " " + artwork.artist
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                      >
                        <ExternalLink size={18} className="mr-2" />
                        在 Google Arts & Culture 中查看
                      </a>
                      
                      <Link
                        href={`/?country=${encodeURIComponent(artwork.location.country)}&start=${artwork.year - 50}&end=${artwork.year + 50}`}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                      >
                        <MapPin size={18} className="mr-2" />
                        探索同时期同地区作品
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          
          {/* Related Artworks Call to Action */}
          <section className="mt-16">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">发现更多艺术珍品</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                通过我们的交互式地图和时间轴，探索更多来自 {artwork.location.country} 的 {artwork.period} 时期艺术作品。
              </p>
              <Link 
                href="/"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeft size={20} className="mr-2" />
                返回探索地图
              </Link>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default ArtworkDetailPage;
