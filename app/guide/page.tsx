'use client'

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Map, Clock, MessageCircle, Search, Lightbulb } from 'lucide-react';
import I18nProvider from '@/components/I18nProvider';
import { useTranslation } from 'react-i18next';

function GuidePage() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Map,
      title: '交互式世界地图',
      description: '点击世界地图上的任意国家或地区，查看该地区的艺术作品分布和详细信息。'
    },
    {
      icon: Clock,
      title: '历史时间轴',
      description: '拖拽时间轴的端点来调整时间范围，筛选特定历史时期的艺术作品。'
    },
    {
      icon: MessageCircle,
      title: 'AI 智能助手',
      description: '使用自然语言描述您想要探索的时间和地点，AI助手会自动为您筛选相关艺术品。'
    },
    {
      icon: Search,
      title: '智能搜索',
      description: '通过艺术家姓名、作品标题、艺术流派等关键词快速找到您感兴趣的艺术作品。'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            返回主页
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">使用指南</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              学习如何使用 History in Art 探索世界艺术珍品
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Video Section */}
        <section className="mb-16">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <Play size={32} className="text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">产品演示视频</h2>
            </div>
            
            {/* Video Container - 预留第三方视频嵌入位置 */}
            <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
              <div className="aspect-video">
                {/* 
                  在这里嵌入您的第三方视频
                  例如 YouTube: 
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
                    title="History in Art 使用指南"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                  
                  或者 Bilibili:
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="//player.bilibili.com/player.html?bvid=YOUR_VIDEO_ID" 
                    scrolling="no" 
                    border="0" 
                    frameBorder="no" 
                    framespacing="0" 
                    allowFullScreen
                  ></iframe>
                */}
                
                {/* 临时占位内容 */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="text-center">
                    <Play size={64} className="text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">视频即将上线</h3>
                    <p className="text-gray-400">
                      请在此处嵌入您的产品演示视频
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                      支持 YouTube、Bilibili 等主流视频平台
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 mt-6 max-w-2xl mx-auto">
              通过这个视频，您将学会如何使用交互式地图、时间轴和AI助手来探索世界各地的艺术珍品。
            </p>
          </div>
        </section>

        {/* Features Guide */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">功能介绍</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 hover:bg-gray-800/50 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Start Guide */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center mb-6">
              <Lightbulb size={32} className="text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">快速开始</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">选择时间范围</h3>
                <p className="text-gray-300 text-sm">
                  拖拽时间轴来设置您感兴趣的历史时期
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">探索地图</h3>
                <p className="text-gray-300 text-sm">
                  点击世界地图上的国家或地区查看艺术品
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">发现艺术</h3>
                <p className="text-gray-300 text-sm">
                  浏览筛选结果，点击艺术品查看详细信息
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-3xl font-bold text-white text-center mb-12">常见问题</h2>
          
          <div className="space-y-6">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">如何使用AI助手？</h3>
              <p className="text-gray-300">
                在右上角的聊天界面中，您可以用自然语言描述您想要探索的内容，例如"显示文艺复兴时期意大利的画作"或"查找19世纪法国印象派作品"。AI助手会自动为您筛选相关艺术品并更新地图和时间轴。
              </p>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">如何调整时间范围？</h3>
              <p className="text-gray-300">
                在页面底部的时间轴上，您可以拖拽蓝色和紫色的圆形控制点来调整开始和结束时间。时间轴会实时显示不同历史时期的颜色标识，帮助您快速定位感兴趣的时代。
              </p>
            </div>
            
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">地图上的颜色代表什么？</h3>
              <p className="text-gray-300">
                地图上不同的颜色表示该地区艺术品的数量密度。颜色越深表示艺术品越多。您可以点击右上角的图表图标来切换热力图的显示。
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function GuidePageWrapper() {
  return (
    <I18nProvider>
      <GuidePage />
    </I18nProvider>
  );
}