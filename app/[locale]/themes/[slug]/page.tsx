import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Palette, Image as ImageIcon } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import { ThemeService } from '@/services/themeService';
import SEOHead from '@/components/SEOHead';
import ArtworkCard from '@/components/ArtworkCard';
import { generateCollectionStructuredData } from '@/utils/structuredData';

interface ThemeDetailPageProps {
  params: {
    slug: string;
    locale: string;
  };
}

// Generate static params for all themes
export async function generateStaticParams() {
  try {
    const slugs = await ThemeService.getAllThemeSlugs();
    return slugs.map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function ThemeDetailPage({ params }: ThemeDetailPageProps) {
  const { slug } = params;
  const t = await getTranslations();
  const locale = await getLocale();
  
  // Fetch theme data
  const theme = await ThemeService.getThemeBySlug(slug);
  
  if (!theme) {
    notFound();
  }

  // Generate SEO data
  const seoData = {
    title: `${theme.title} | ${locale === 'zh' ? '艺术主题' : 'Art Theme'} | History in Art`,
    description: `${theme.description.substring(0, 160)}... ${locale === 'zh' ? '包含' : 'Contains'} ${theme.artworks?.length || 0} ${locale === 'zh' ? '件艺术作品' : 'artworks'}.`,
    keywords: `${theme.title},${locale === 'zh' ? '艺术主题,艺术收藏,艺术展览' : 'art theme,art collection,art exhibition'}`,
    image: theme.imageUrl,
    type: 'article' as const,
    canonical: `https://history-in-art.org/themes/${theme.slug}`
  };

  const structuredData = generateCollectionStructuredData(
    theme.artworks || [], 
    undefined, 
    undefined
  );

  return (
    <>
      <SEOHead {...seoData} structuredData={structuredData} />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Hero Section */}
        <section className="relative h-96 overflow-hidden">
          <img 
            src={theme.imageUrl} 
            alt={theme.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto px-4 pb-12 w-full">
              <Link 
                href="/themes"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                {locale === 'zh' ? '返回主题列表' : 'Back to Themes'}
              </Link>
              
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full">
                    {locale === 'zh' ? '艺术主题' : 'Art Theme'}
                  </span>
                  <div className="flex items-center text-gray-300">
                    <ImageIcon size={16} className="mr-1" />
                    {theme.artworks?.length || 0} {locale === 'zh' ? '件作品' : 'artworks'}
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  {theme.title}
                </h1>
                
                <p className="text-xl text-gray-300 max-w-3xl">
                  {theme.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Theme Info */}
          <section className="mb-12">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <Palette size={24} className="text-purple-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">
                  {locale === 'zh' ? '主题介绍' : 'About This Theme'}
                </h2>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg">
                {theme.description}
              </p>
            </div>
          </section>

          {/* Artworks Grid */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <ImageIcon size={24} className="mr-3 text-blue-400" />
                {locale === 'zh' ? '收录作品' : 'Featured Artworks'}
                <span className="ml-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  {theme.artworks?.length || 0}
                </span>
              </h2>
            </div>

            {!theme.artworks || theme.artworks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <ImageIcon size={24} className="text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-400 mb-2">
                  {locale === 'zh' ? '暂无作品' : 'No Artworks'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {locale === 'zh' ? '该主题下暂无收录的艺术作品。' : 'No artworks have been added to this theme yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {theme.artworks.map((artwork) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    onClick={() => {}} // Will be handled by the Link in ArtworkCard
                  />
                ))}
              </div>
            )}
          </section>

          {/* Call to Action */}
          <section className="mt-16">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                {locale === 'zh' ? '探索更多主题' : 'Explore More Themes'}
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                {locale === 'zh' 
                  ? '发现更多精心策划的艺术主题，每个主题都有独特的故事和艺术作品集合。'
                  : 'Discover more curated art themes, each with unique stories and collections of artworks.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/themes"
                  className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                >
                  <Palette size={20} className="mr-2" />
                  {locale === 'zh' ? '浏览所有主题' : 'Browse All Themes'}
                </Link>
                <Link 
                  href="/"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                >
                  <ArrowLeft size={20} className="mr-2 rotate-180" />
                  {locale === 'zh' ? '返回探索地图' : 'Back to Explore'}
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}