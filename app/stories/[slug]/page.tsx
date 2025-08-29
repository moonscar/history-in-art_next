'use client'

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, Calendar, User } from 'lucide-react';
import I18nProvider from '@/components/I18nProvider';
import { useTranslation } from 'react-i18next';

// 示例故事内容数据
const storyContent: { [key: string]: any } = {
  'renaissance-florence': {
    title: '文艺复兴的摇篮：佛罗伦萨的艺术革命',
    subtitle: '探索15-16世纪佛罗伦萨如何成为文艺复兴运动的中心',
    image: 'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1200',
    period: '1400-1600',
    location: '意大利佛罗伦萨',
    readTime: '8分钟',
    author: 'History in Art 编辑团队',
    publishDate: '2025年1月',
    content: [
      {
        type: 'paragraph',
        text: '15世纪的佛罗伦萨，一个不到10万人口的城市，却孕育了人类历史上最伟大的艺术革命。在美第奇家族的赞助下，这里聚集了达芬奇、米开朗基罗、波提切利等传奇艺术家。'
      },
      {
        type: 'heading',
        text: '美第奇家族的艺术赞助'
      },
      {
        type: 'paragraph',
        text: '美第奇家族不仅是银行家和政治家，更是艺术的伟大赞助人。他们建立了欧洲第一个公共图书馆，收藏了大量古希腊和古罗马的艺术品和手稿，为文艺复兴提供了丰富的文化土壤。'
      },
      {
        type: 'heading',
        text: '艺术技法的革新'
      },
      {
        type: 'paragraph',
        text: '文艺复兴时期的佛罗伦萨艺术家们发明了线性透视法，掌握了人体解剖学，并开始使用油画技法。这些技术革新使得艺术作品更加逼真和富有表现力。'
      }
    ]
  },
  'impressionism-paris': {
    title: '光影的革命：巴黎印象派的诞生',
    subtitle: '19世纪末的巴黎，艺术家们如何用光影重新定义绘画',
    image: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=1200',
    period: '1850-1900',
    location: '法国巴黎',
    readTime: '6分钟',
    author: 'History in Art 编辑团队',
    publishDate: '2025年1月',
    content: [
      {
        type: 'paragraph',
        text: '1874年，一群被官方沙龙拒绝的艺术家在巴黎举办了一场展览，这场展览后来被认为是印象派运动的开端。莫奈的《印象·日出》给这个运动命名，也改变了艺术史的进程。'
      },
      {
        type: 'heading',
        text: '户外写生的革命'
      },
      {
        type: 'paragraph',
        text: '印象派画家们走出画室，来到户外直接面对自然作画。他们捕捉光线在不同时间的变化，记录瞬间的视觉印象，这种全新的创作方式彻底颠覆了传统的学院派绘画。'
      }
    ]
  },
  'edo-japan-art': {
    title: '江户时代的浮世绘：日本艺术的黄金时代',
    subtitle: '从葛饰北斋到歌川广重，探索浮世绘的艺术魅力',
    image: 'https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg?auto=compress&cs=tinysrgb&w=1200',
    period: '1603-1868',
    location: '日本江户',
    readTime: '7分钟',
    author: 'History in Art 编辑团队',
    publishDate: '2025年1月',
    content: [
      {
        type: 'paragraph',
        text: '江户时代（1603-1868）是日本历史上一个相对和平繁荣的时期。在这个时代，浮世绘艺术达到了前所未有的高度，成为日本文化的重要象征。'
      },
      {
        type: 'heading',
        text: '葛饰北斋的《神奈川冲浪里》'
      },
      {
        type: 'paragraph',
        text: '葛饰北斋的《神奈川冲浪里》可能是世界上最著名的日本艺术作品。这幅作品不仅展现了日本艺术家对自然的独特理解，也影响了后来的欧洲印象派画家。'
      }
    ]
  }
};

function StoryDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const slug = params.slug as string;
  
  const story = storyContent[slug];

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">故事未找到</h1>
          <p className="text-gray-300 mb-6">抱歉，您访问的故事不存在。</p>
          <Link 
            href="/stories"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            返回故事列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <img 
          src={story.image} 
          alt={story.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-4 pb-12 w-full">
            <Link 
              href="/stories"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              返回故事列表
            </Link>
            
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full">
                  {story.period}
                </span>
                <div className="flex items-center text-gray-300">
                  <MapPin size={16} className="mr-1" />
                  {story.location}
                </div>
                <div className="flex items-center text-gray-300">
                  <Clock size={16} className="mr-1" />
                  {story.readTime}
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {story.title}
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl">
                {story.subtitle}
              </p>
              
              <div className="flex items-center text-gray-400 text-sm">
                <User size={16} className="mr-2" />
                <span className="mr-4">{story.author}</span>
                <Calendar size={16} className="mr-2" />
                <span>{story.publishDate}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 md:p-12">
          <div className="prose prose-lg prose-invert max-w-none">
            {story.content.map((section: any, index: number) => {
              if (section.type === 'heading') {
                return (
                  <h2 key={index} className="text-2xl font-bold text-white mt-8 mb-4 first:mt-0">
                    {section.text}
                  </h2>
                );
              }
              
              if (section.type === 'paragraph') {
                return (
                  <p key={index} className="text-gray-300 leading-relaxed mb-6 text-lg">
                    {section.text}
                  </p>
                );
              }
              
              return null;
            })}
          </div>
          
          {/* Call to Action */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">探索相关艺术品</h3>
              <p className="text-gray-300 mb-6">
                在我们的交互式地图上发现更多来自{story.location}的艺术珍品
              </p>
              <Link 
                href={`/?country=${encodeURIComponent(story.location.split(' ')[0])}&start=${story.period.split('-')[0]}&end=${story.period.split('-')[1]}`}
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                开始探索
                <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function StoryDetailPageWrapper() {
  return (
    <I18nProvider>
      <StoryDetailPage />
    </I18nProvider>
  );
}