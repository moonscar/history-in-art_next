import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Palette } from 'lucide-react';

export default function ThemeNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Search size={32} className="text-gray-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">主题未找到</h1>
        <p className="text-gray-300 mb-8 leading-relaxed">
          抱歉，您访问的艺术主题页面不存在或已被移除。请返回主题列表继续探索其他精彩的艺术主题。
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/themes"
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
          >
            <Palette size={20} className="mr-2" />
            浏览所有主题
          </Link>
          
          <div className="text-sm text-gray-400">
            或者
          </div>
          
          <Link 
            href="/"
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
          >
            <ArrowLeft size={20} className="mr-2" />
            返回探索地图
          </Link>
        </div>
      </div>
    </div>
  );
}