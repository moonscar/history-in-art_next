'use client'

import React from 'react';
import Link from 'next/link';
import { BookOpen, Clock, MapPin, ArrowRight } from 'lucide-react';
import I18nProvider from '@/components/I18nProvider';
import { useTranslation } from 'react-i18next';

// 示例故事数据
const stories = [
  {
    slug: 'renaissance-florence',
    title: '文艺复兴的摇篮：佛罗伦萨的艺术革命',
    excerpt: '探索15-16世纪佛罗伦萨如何成为文艺复兴运动的中心，见证达芬奇、米开朗基罗等大师的传奇故事。',
    image: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=800',
    period: '1400-1600',
    location: '意大利佛罗伦萨',
    readTime: '8分钟'
  },
  {
    slug: 'impressionism-paris',
    title: '光影的革命：巴黎印象派的诞生',
    excerpt: '19世纪末的巴黎，莫奈、雷诺阿等艺术家如何打破传统，用光影重新定义绘画艺术。',
    image: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=800',
    period: '1850-1900',
    location: '法国巴黎',
    readTime: '6分钟'
  },
  {
    slug: 'edo-japan-art',
    title: '江户时代的浮世绘：日本艺术的黄金时代',
    excerpt: '从葛饰北斋到歌川广重，探索江户时代浮世绘如何影响了世界艺术的发展。',
    image: 'https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg?auto=compress&cs=tinysrgb&w=800',
    period: '1603-1868',
    location: '日本江户',
    readTime: '7分钟'
  }
];

function StoriesPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">发现故事</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              通过精选的艺术故事，深入了解历史时期的文化背景和艺术发展脉络
            </p>
          </div>
        </div>
      </header>

      {/* Stories Grid */}
      <main className="max-w-7xl mx-auto px-4 py-12">
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
                  阅读完整故事
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <BookOpen size={48} className="text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">探索更多艺术故事</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              每个艺术作品背后都有一个独特的故事。通过我们的交互式地图和时间轴，发现更多隐藏在历史中的艺术珍品。
            </p>
            <Link 
              href="/"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              开始探索
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function StoriesPageWrapper() {
  return (
    <I18nProvider>
      <StoriesPage />
    </I18nProvider>
  );
}