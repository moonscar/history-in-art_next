import React from 'react';
import Link from 'next/link';
import { BookOpen, Clock, MapPin, ArrowRight } from 'lucide-react';
import { getAllStories, getStory, Story } from '@/lib/stories';
import StoriesClient from '@/components/StoriesClient';
import {getTranslations, getLocale} from 'next-intl/server';


interface StoriesPageProps {
  stories: Story[]
}

async function StoriesPage({ stories }: StoriesPageProps) {
  const t = getTranslations();
  const currentLocale = await getLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              {currentLocale === 'en' ? 'Discover Stories' : '发现故事'}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {currentLocale === 'en' 
                ? 'Explore curated art stories to understand the cultural context and artistic development of historical periods'
                : '通过精选的艺术故事，深入了解历史时期的文化背景和艺术发展脉络'
              }
            </p>
          </div>
        </div>
      </header>

      {/* Stories Grid */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {stories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {currentLocale === 'en' ? 'No stories available yet.' : '暂无故事内容'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <article 
                key={story.slug}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <figure className="relative overflow-hidden">
                  <img 
                    src={story.image} 
                    alt={story.title}
                    className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white text-sm">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {story.readTime}
                      </div>
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1" />
                        {story.location}
                      </div>
                    </div>
                  </div>
                </figure>
                
                <div className="p-6">
                  <div className="mb-3">
                    <span className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {story.period}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-3 line-clamp-2">
                    {story.title}
                  </h2>
                  
                  <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                    {story.excerpt}
                  </p>
                  
                  <Link 
                    href={`/stories/${story.slug}`}
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                  >
                    {currentLocale === 'en' ? 'Read Full Story' : '阅读完整故事'}
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <BookOpen size={48} className="text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              {currentLocale === 'en' ? 'Explore More Art Stories' : '探索更多艺术故事'}
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              {currentLocale === 'en' 
                ? 'Every artwork has a unique story behind it. Discover more artistic treasures hidden in history through our interactive map and timeline.'
                : '每个艺术作品背后都有一个独特的故事。通过我们的交互式地图和时间轴，发现更多隐藏在历史中的艺术珍品。'
              }
            </p>
            <Link 
              href="/"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              {currentLocale === 'en' ? 'Start Exploring' : '开始探索'}
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default async function StoriesPageWrapper() {
  const locale = "zh";
  const slugs = getAllStories(locale);

  const stories = await Promise.all(
    slugs.map(async (slug) => {
      const { meta } = await getStory(slug, locale);
      return meta;
    })
  );

  return <StoriesClient stories={stories} />;
}