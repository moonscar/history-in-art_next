'use client'

import { useEffect, useState } from 'react';
import i18n from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('I18n initialization status:', i18n.isInitialized);
    
    if (i18n.isInitialized) {
      setIsReady(true);
    } else {
      const handleInitialized = () => {
        console.log('I18n initialized');
        setIsReady(true);
      };

      i18n.on('initialized', handleInitialized);
      return () => i18n.off('initialized', handleInitialized);
    }
  }, []);

  if (!isReady) {
    return <div>Loading translations...</div>;
  }

  return <>{children}</>;
}