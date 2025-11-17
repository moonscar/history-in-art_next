import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Palette, Calendar, Image as ImageIcon } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import { ThemeService } from '@/services/themeService';
import SEOHead from '@/components/SEOHead';
import { AdSense } from '@/components/AdSense';
import { generateWebsiteStructuredData } from '@/utils/structuredData';

export default async function ThemesPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  
  // Fetch all themes
  const themes = await ThemeService.getAllThemes();

  // Generate SEO data
  const seoData = {
    title: locale === 'zh' ? '艺术主题 | History in Art' : 'Art Themes | History in Art',
    description: locale === 'zh' 
      ? '探索精心策划的艺术主题，发现不同时期、风格和地区的艺术作品集合。'
      : 'Explore curated art themes and discover collections of artworks from different periods, styles, and regions.',
    keywords: locale === 'zh'
      ? '艺术主题,艺术收藏,艺术展览,艺术分类,艺术探索'
      : 'art themes,art collections,art exhibitions,art categories,art exploration',
    canonical: 'https://history-in-art.org/themes'
  };

  const structuredData = generateWebsiteStructuredData();

  return (
    <>
      <SEOHead {...seoData} structuredData={structuredData} />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <Link 
              href="/"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              {locale === 'zh' ? '返回主页' : 'Back to Home'}
            </Link>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Palette size={32} className="text-purple-400 mr-3" />
                <h1 className="text-4xl font-bold text-white">
                  {locale === 'zh' ? '艺术主题' : 'Art Themes'}
                </h1>
              </div>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                {locale === 'zh' 
                  ? '探索精心策划的艺术主题，每个主题都包含相关的艺术作品集合'
                  : 'Explore curated art themes, each containing a collection of related artworks'
                }
              </p>
            </div>
          </div>
        </header>

        {/* Themes Grid */}
        <main className="max-w-7xl mx-auto px-4 py-12">
          <AdSense mode="auto" />
          {themes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Palette size={32} className="text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-400 mb-4">
                {locale === 'zh' ? '暂无主题' : 'No Themes Available'}
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                {locale === 'zh' 
                  ? '主题正在策划中，请稍后再来查看。'
                  : 'Themes are being curated. Please check back later.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {themes.map((theme) => (
                <Link 
                  key={theme.id}
                  href={`/themes/${theme.slug}`}
                  className="group"
                >
                  <article className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <figure className="relative overflow-hidden">
                      <img 
                        src={theme.imageUrl} 
                        alt={theme.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 right-4">
                        <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {theme.artworkCount || 0} {locale === 'zh' ? '件作品' : 'artworks'}
                        </div>
                      </div>
                    </figure>
                    
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                        {theme.title}
                      </h2>
                      
                      <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                        {theme.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center">
                          <ImageIcon size={14} className="mr-1" />
                          {theme.artworkCount || 0} {locale === 'zh' ? '件作品' : 'artworks'}
                        </div>
                        <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
                          {locale === 'zh' ? '查看详情 →' : 'View Details →'}
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <Palette size={48} className="text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                {locale === 'zh' ? '探索更多艺术作品' : 'Explore More Artworks'}
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                {locale === 'zh' 
                  ? '通过我们的交互式地图和时间轴，发现更多隐藏在历史中的艺术珍品。'
                  : 'Discover more artistic treasures hidden in history through our interactive map and timeline.'
                }
              </p>
              <Link 
                href="/"
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                {locale === 'zh' ? '开始探索' : 'Start Exploring'}
                <ArrowLeft size={20} className="ml-2 rotate-180" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
