import React from 'react';
import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object | object[];
  canonical?: string;
  hreflang?: Array<{ lang: string; url: string }>;
  robots?: string;
  currentLanguage?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "History-in-Art - 通过艺术品重新发现历史，探索时间与地理的交汇点",
  description = "History-in-Art 是一款将 全球艺术作品 与 历史时空探索 融合的智能交互平台，旨在帮助用户在地理与时间的双重维度中发现、研究与欣赏艺术。通过 交互式世界地图 和 时间轴浏览，用户可以从古代文明到现代艺术，跨越数千年历史，探索各大洲、各国、各城市的绘画、雕塑与其他艺术形式。内置的 AI 艺术助手。内置的 AI 时空信息助手 精准聚焦于作品的年代背景与地域分布，让用户在地图与时间轴上高效开展时空艺术探索。History-in-Art 都能让您在沉浸式的可视化体验中了解作品的历史背景、创作故事与文化价值。适合艺术爱好者、历史学者、教育工作者以及希望通过艺术了解世界的人士，是一个兼具学习、研究与灵感发现的艺术导航平台。",
  keywords = "艺术品,艺术导航,世界艺术,历史艺术,艺术地图,艺术时间轴,文艺复兴,巴洛克,印象派,现代艺术",
  image = "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=1200",
  url = "https://history-in-art.org",
  type = "website",
  structuredData,
  canonical,
  hreflang = [
    { lang: "zh-CN", url: "https://history-in-art.org" },
    { lang: "en", url: "https://history-in-art.org/en" },
    { lang: "x-default", url: "https://history-in-art.org" }
  ],
  robots = "index, follow",
  currentLanguage = "zh"
}) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <meta name="author" content="History in Art" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Language and region */}
      <html lang={currentLanguage === 'zh' ? 'zh-CN' : 'en'} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="History in Art" />
      <meta property="og:locale" content="zh_CN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@ArtSpaceNav" />
      <meta name="twitter:creator" content="@ArtSpaceNav" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || url} />
      
      {/* Hreflang for international SEO */}
      {hreflang.map(({ lang, url: hrefUrl }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={hrefUrl} />
      ))}
      
      {/* Additional meta tags for better SEO */}
      <meta name="theme-color" content="#1F2937" />
      <meta name="msapplication-TileColor" content="#1F2937" />
      
      {/* Structured Data */}
      {structuredData && (
        Array.isArray(structuredData) ? (
          structuredData.map((data, index) => (
            <script key={index} type="application/ld+json">
              {JSON.stringify(data)}
            </script>
          ))
        ) : (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )
      )}
    </Head>
  );
};

export default SEOHead;