'use client'

import { useEffect } from 'react';
import Script from 'next/script';

type ManualProps = {
  mode?: 'manual';
  adSlot: string;
  format?: string;
  layout?: 'in-article' | 'fluid';
  responsive?: 'true' | 'false';
  className?: string;
};

type AutoProps = {
  mode: 'auto';
};

type AdSenseProps = ManualProps | AutoProps;

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

const ADSENSE_SRC =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6333474665018049';

export function AdSense(props: AdSenseProps) {
  const isAuto = props.mode === 'auto';

  useEffect(() => {
    if (isAuto || !('adSlot' in props)) return;

    try {
      if (typeof window === 'undefined') return;
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (error) {
      // Suppress duplicate push errors that AdSense throws before script is ready.
      console.error('Adsense error', error);
    }
  }, [isAuto, 'adSlot' in props ? props.adSlot : undefined]);

  const script = (
    <Script
      id="google-adsense"
      src={ADSENSE_SRC}
      strategy="afterInteractive"
      async
      crossOrigin="anonymous"
    />
  );

  if (isAuto || !('adSlot' in props)) {
    return script;
  }

  const {
    adSlot,
    className = '',
    format = 'auto',
    layout,
    responsive = 'true',
  } = props;

  return (
    <>
      {script}
      <ins
        className={`adsbygoogle block ${className}`.trim()}
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6333474665018049"
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-full-width-responsive={responsive}
      />
    </>
  );
}
