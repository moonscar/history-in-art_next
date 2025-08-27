import { Artwork } from '../types';

// Generate structured data for the website
export const generateWebsiteStructuredData = () => ({
  "@context": "https://history-in-art.org",
  "@type": "WebSite",
  "name": "History-in-Art",
  "description": "History-in-Art 是一款将 全球艺术作品 与 历史时空探索 融合的智能交互平台，旨在帮助用户在地理与时间的双重维度中发现、研究与欣赏艺术。通过 交互式世界地图 和 时间轴浏览，用户可以从古代文明到现代艺术，跨越数千年历史，探索各大洲、各国、各城市的绘画、雕塑与其他艺术形式。内置的 AI 艺术助手。内置的 AI 时空信息助手 精准聚焦于作品的年代背景与地域分布，让用户在地图与时间轴上高效开展时空艺术探索。History-in-Art 都能让您在沉浸式的可视化体验中了解作品的历史背景、创作故事与文化价值。适合艺术爱好者、历史学者、教育工作者以及希望通过艺术了解世界的人士，是一个兼具学习、研究与灵感发现的艺术导航平台。",
  "url": "https://history-in-art.org",
  "inLanguage": "zh-CN",
  "copyrightYear": "2025",
  "copyrightHolder": {
    "@type": "Organization",
    "name": "History in Art"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://history-in-art.org?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "author": {
    "@type": "Organization",
    "name": "History in Art",
    "url": "https://history-in-art.org"
  },
  "publisher": {
    "@type": "Organization",
    "name": "History in Art",
    "url": "https://history-in-art.org"
  }
});

// Generate organization structured data
export const generateOrganizationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "History in Art",
  "url": "https://history-in-art.org",
  "description": "艺术品时空导航系统，通过AI助手、交互式地图和时间轴探索世界艺术珍品",
  "foundingDate": "2025",
  "sameAs": [
    "https://github.com/artspace-navigator"
  ]
});

// Generate structured data for artwork
export const generateArtworkStructuredData = (artwork: Artwork) => ({
  "@context": "https://schema.org",
  "@type": "VisualArtwork",
  "name": artwork.title,
  "description": artwork.description,
  "alternateName": artwork.title,
  "creator": {
    "@type": "Person",
    "name": artwork.artist,
    "jobTitle": "Artist"
  },
  "dateCreated": artwork.year.toString(),
  "temporalCoverage": artwork.year.toString(),
  "artform": artwork.movement,
  "artMedium": artwork.medium,
  "artworkSurface": artwork.medium,
  "genre": artwork.period,
  "inLanguage": "zh-CN",
  "contentLocation": {
    "@type": "Place",
    "name": `${artwork.location.city}, ${artwork.location.country}`,
    "addressCountry": artwork.location.country,
    "addressLocality": artwork.location.city,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": artwork.location.coordinates[1],
      "longitude": artwork.location.coordinates[0]
    }
  },
  "image": artwork.imageUrl,
  "thumbnailUrl": artwork.imageUrl,
  "url": `https://history-in-art.org/artwork/${artwork.id}`,
  "keywords": [artwork.movement, artwork.period, artwork.artist, artwork.location.country].join(', '),
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://history-in-art.org/artwork/${artwork.id}`
  }
});

// Generate structured data for art collection
export const generateCollectionStructuredData = (artworks: Artwork[], location?: string, timeRange?: { start: number; end: number }) => {
  const baseData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": location 
      ? `${location}的艺术作品集合` 
      : "世界艺术作品集合",
    "description": `包含${artworks.length}件艺术作品的精选集合`,
    "numberOfItems": artworks.length,
    "collectionSize": artworks.length,
    "inLanguage": "zh-CN",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": artworks.length,
      "itemListElement": artworks.slice(0, 10).map((artwork, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "VisualArtwork",
          "name": artwork.title,
          "creator": artwork.artist,
          "dateCreated": artwork.year.toString(),
          "url": `https://history-in-art.org/artwork/${artwork.id}`
        }
      }))
    }
  };

  if (timeRange) {
    return {
      ...baseData,
      "temporalCoverage": `${timeRange.start}/${timeRange.end}`,
      "description": `${timeRange.start}-${timeRange.end}年间的艺术作品集合，包含${artworks.length}件作品`
    };
  }

  if (location) {
    return {
      ...baseData,
      "spatialCoverage": {
        "@type": "Place",
        "name": location
      }
    };
  }

  return baseData;
};

// Generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": {
      "@type": "WebPage",
      "@id": item.url,
      "name": item.name
    }
  }))
}
)