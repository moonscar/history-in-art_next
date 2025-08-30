'use client';

import React from 'react';
import {useTranslations, useLocale} from 'next-intl';
import {Globe} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const LanguageSwitcher: React.FC = () => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLang = locale === 'zh' ? 'en' : 'zh';
    // ✅ 在 next-intl 里切换语言 = 切换到新 locale 的路由
    const cleanPathname = pathname.startsWith(`/${locale}`) 
      ? pathname.slice(`/${locale}`.length) 
      : pathname;
    router.push(`/${newLang}${cleanPathname || '/'}`);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
      title={t('language.switch')}
    >
      <Globe size={16} />
      <span>{locale === 'zh' ? 'EN' : '中文'}</span>
    </button>
  );
};

export default LanguageSwitcher;
