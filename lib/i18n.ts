import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// 强制初始化配置
const initI18n = () => {
  if (typeof window !== 'undefined' && !i18n.isInitialized) {
    i18n
      .use(Backend)
      .use(LanguageDetector)  
      .use(initReactI18next)
      .init({
        fallbackLng: 'zh',
        debug: true,
        lng: 'zh',
        
        interpolation: {
          escapeValue: false,
        },
        
        backend: {
          loadPath: '/locales/{{lng}}/translation.json',
        },
        
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage'],
        },
      });
      
    // 暴露到全局作用域用于调试
    if (typeof window !== 'undefined') {
      (window as any).i18next = i18n;
    }
  }
  
  return i18n;
};

export default initI18n();