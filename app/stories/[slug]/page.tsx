import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, Calendar, User, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getStory, Story } from '@/lib/stories';
// import {getTranslations} from 'next-intl/server';

interface StoryDetailPageProps {
  story: {
    slug: string;
    meta: Story;
    content: string;
  };
}

function StoryDetailPage({ story }: StoryDetailPageProps) {
  // const { t, i18n } = useTranslation();
  // const currentLocale = i18n.language || 'zh';
  const {slug, meta, content} = story;
  const currentLocale = slug;
  const period = meta.period ?? '未知';
  const [start, end] = period.split('-');

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
{/*          <h1 className="text-2xl font-bold text-white mb-4">
            {currentLocale === 'en' ? 'Story Not Found' : '故事未找到'}
          </h1>
          <p className="text-gray-300 mb-6">
            {currentLocale === 'en' ? 'Sorry, the story you are looking for does not exist.' : '抱歉，您访问的故事不存在。'}
          </p>*/}
          <Link 
            href="/stories"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            {currentLocale === 'en' ? 'Back to Stories' : '返回故事列表'}
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
          src={meta.image} 
          alt={meta.title}
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
              {currentLocale === 'en' ? 'Back to Stories' : '返回故事列表'}
            </Link>
            
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full">
                  {meta.period}
                </span>
                <div className="flex items-center text-gray-300">
                  <MapPin size={16} className="mr-1" />
                  {meta.title}
                </div>
                <div className="flex items-center text-gray-300">
                  <Clock size={16} className="mr-1" />
                  {meta.readTime}
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {meta.title}
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl">
                {meta.excerpt}
              </p>
              
              <div className="flex items-center text-gray-400 text-sm">
                <User size={16} className="mr-2" />
                <span className="mr-4">{meta.author}</span>
                <Calendar size={16} className="mr-2" />
                <span>{meta.publishDate}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 md:p-12">
          <div className="prose prose-lg prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: ({children}) => <h1 className="text-3xl font-bold text-white mt-8 mb-6 first:mt-0">{children}</h1>,
                h2: ({children}) => <h2 className="text-2xl font-bold text-white mt-8 mb-4 first:mt-0">{children}</h2>,
                h3: ({children}) => <h3 className="text-xl font-bold text-white mt-6 mb-3 first:mt-0">{children}</h3>,
                p: ({children}) => <p className="text-gray-300 leading-relaxed mb-6 text-lg">{children}</p>,
                ul: ({children}) => <ul className="text-gray-300 mb-6 space-y-2">{children}</ul>,
                ol: ({children}) => <ol className="text-gray-300 mb-6 space-y-2">{children}</ol>,
                li: ({children}) => <li className="text-gray-300">{children}</li>,
                blockquote: ({children}) => (
                  <blockquote className="border-l-4 border-blue-400 pl-6 my-6 text-gray-300 italic">
                    {children}
                  </blockquote>
                )
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
          
          {/* Call to Action */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-4">
                {currentLocale === 'en' ? 'Explore Related Artworks' : '探索相关艺术品'}
              </h3>
              <p className="text-gray-300 mb-6">
                {currentLocale === 'en' 
                  ? `Discover more artistic treasures from ${meta.title} on our interactive map`
                  : `在我们的交互式地图上发现更多来自${meta.title}的艺术珍品`
                }
              </p>
              <Link 
                href={`/?country=${encodeURIComponent(meta.title.split(' ')[0])}&start=${start}&end=${end || start}`}
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                {currentLocale === 'en' ? 'Start Exploring' : '开始探索'}
                <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default async function StoryDetailPageWrapper({ params }: { params: { slug: string } }) {
  const story = await getStory(params.slug, 'zh'); // 默认中文，可根据实际路由调整
  
  return (
      <StoryDetailPage story={story} />
  );
}