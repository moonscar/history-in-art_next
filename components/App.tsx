import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Artwork, TimeRange, Location } from '@/types';
import { useArtworks } from '@/hooks/useArtworks';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { parseURLParams, updateURL, generateURLParams, getInitialStateFromURL, URLParams } from '@/utils/urlParams';
import SEOHead from '@/components/SEOHead';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { 
  generateWebsiteStructuredData, 
  generateCollectionStructuredData,
  generateOrganizationStructuredData,
  generateBreadcrumbStructuredData
} from '@/utils/structuredData';
// import InteractiveWorldMap from '@/components/InteractiveWorldMap';
import Timeline from '@/components/Timeline';
import ArtworkModal from '@/components/ArtworkModal';
import ChatInterface from '@/components/ChatInterface';
import ResultsModal from '@/components/ResultsModal';
import GalleryModal from '@/components/GalleryModal';
import Navbar from "@/components/Navbar";
import { Globe, Clock, Palette, AlertCircle, Heart } from 'lucide-react';

import dynamic from 'next/dynamic';

const InteractiveWorldMap = dynamic(() => import('@/components/InteractiveWorldMap'), {
  ssr: false,
});


function App() {
  const t = useTranslations();
  const locale = useLocale();
  const initialState = getInitialStateFromURL();
  const [timeRange, setTimeRange] = useState<TimeRange>(initialState.timeRange);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryArtworks, setGalleryArtworks] = useState<Artwork[]>([]);
  
  // 使用 localStorage 持久化画廊数据
  const [persistedGallery, setPersistedGallery] = useLocalStorage<Artwork[]>('artGallery', []);
  
  // 初始化时从 localStorage 加载画廊数据
  useEffect(() => {
    setGalleryArtworks(persistedGallery);
  }, [persistedGallery]);

  // 创建画廊作品ID集合以提高查找效率
  const galleryArtworkIds = useMemo(() => new Set(galleryArtworks.map(a => a.id)), [galleryArtworks]);
  const [resultsData, setResultsData] = useState<{
    artworks: Artwork[];
    location?: Location;
    timeRange?: TimeRange;
  }>({ artworks: [] });
  const [chatQuery, setChatQuery] = useState<{
    timeRange?: TimeRange;
    location?: Location;
    movement?: string;
    artist?: string;
  }>(initialState.chatQuery);
  const lastUrlSnapshotRef = useRef<string | null>(null);

  // Use the custom hook to fetch artworks from database
  const {
    artworks: dbArtworks, 
    loading, 
    error, 
    getArtworksByLocation 
  } = useArtworks({
    timeRange,
    location: chatQuery.location,
    movement: chatQuery.movement,
    artist: chatQuery.artist
  });


  useEffect(() => {
    const urlParams = parseURLParams();
    const hasValidParams = urlParams.country || urlParams.artist || urlParams.movement || 
                          urlParams.start || urlParams.end;
    
    if (!hasValidParams) return;

    const location = urlParams.country ? {
      country: urlParams.country || '',
      city: urlParams.city || ''
    } : undefined;
    
    const queryTimeRange = {
      start: urlParams.start || 1400,
      end: urlParams.end || 2024
    };

    setChatQuery({
      location,
      artist: urlParams.artist,
      movement: urlParams.movement,
      timeRange: queryTimeRange
    });
    
    setTimeRange(queryTimeRange);

    // 延迟执行自动查询，确保数据已加载
    if (location && dbArtworks.length > 0) {
        const queryTimeRange = {
          start: urlParams.start || 1400,
          end: urlParams.end || 2024
        };
        handleLocationTimeUpdate(location, queryTimeRange);
    }
  }, [dbArtworks.length > 0]); // 修复依赖数组

  const filteredArtworks = useMemo(() => {
    return dbArtworks.filter(artwork => {
      const withinTimeRange = artwork.year >= timeRange.start && artwork.year <= timeRange.end;
      const matchesLocation = !chatQuery.location || artwork.location.country === chatQuery.location.country;
      const matchesMovement = !chatQuery.movement || artwork.movement === chatQuery.movement;
      const matchesArtist = !chatQuery.artist || artwork.artist === chatQuery.artist;
      
      return withinTimeRange && matchesLocation && matchesMovement && matchesArtist;
    });
  }, [dbArtworks, timeRange, chatQuery]);

  const handleChatQuery = (params: {
    timeRange?: TimeRange;
    location?: Location;
    movement?: string;
    artist?: string;
  }) => {
    setChatQuery(params);
    if (params.timeRange) {
      setTimeRange(params.timeRange);
    }
  };

  const handleLocationTimeUpdate = async (location: Location, timeRange: TimeRange) => {
    // 更新时间轴
    setTimeRange(timeRange);
    
    // 更新查询参数
    setChatQuery(prev => ({
      ...prev,
      location,
      timeRange
    }));
    
    try {
      const locationArtworks = await getArtworksByLocation(location, timeRange);
      setResultsData({
        artworks: locationArtworks,
        location,
        timeRange
      });
      setShowResults(true);
    } catch (fetchError) {
      console.error('Error fetching location artworks:', fetchError);
    }
  };

  const handleResultsClose = () => {
    setShowResults(false);
    setChatQuery({ timeRange: timeRange });
    setTimeRange({ start: 1400, end: 2024 });
    
    // 更新 URL，移除查询参数
    updateURL({}, true);
  };

  const handleResultsTimeRangeChange = async (newStart: number, newEnd: number) => {
    const newTimeRange = { start: newStart, end: newEnd };
    setTimeRange(newTimeRange);
    
    // 更新 chatQuery 以触发数据重新获取
    setChatQuery(prev => ({
      ...prev,
      timeRange: newTimeRange
    }));
    
    // 如果有位置信息，重新获取该位置的艺术品
    if (resultsData.location) {
      try {
        const locationArtworks = await getArtworksByLocation(resultsData.location, newTimeRange);
        setResultsData({
          artworks: locationArtworks,
          location: resultsData.location,
          timeRange: newTimeRange
        });
      } catch (error) {
        console.error('Error fetching artworks with new time range:', error);
      }
    }
  };
  const handleLocationTimeSelect = async (location: Location, currentTimeRange: TimeRange) => {
    try {
      const locationArtworks = await getArtworksByLocation(location, currentTimeRange);
      setResultsData({
        artworks: locationArtworks,
        location,
        timeRange: currentTimeRange
      });
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching location artworks:', error);
    }
  };

  // Gallery functions
  const handleAddToGallery = (artwork: Artwork) => {
    const updateGallery = (prev: Artwork[]) => {
      // Check if artwork already exists in gallery
      if (prev.some(item => item.id === artwork.id)) {
        return prev; // Don't add duplicates
      }
      return [...prev, artwork];
    };
    
    setGalleryArtworks(updateGallery);
    setPersistedGallery(updateGallery);
  };

  const handleRemoveFromGallery = (artworkId: string) => {
    const updateGallery = (prev: Artwork[]) => prev.filter(artwork => artwork.id !== artworkId);
    setGalleryArtworks(updateGallery);
    setPersistedGallery(updateGallery);
  };

  const handleClearGallery = () => {
    setGalleryArtworks([]);
    setPersistedGallery([]);
  };

  // Generate dynamic SEO data based on current state
  const generateDynamicSEO = () => {
    const locationLabel = chatQuery.location
      ? [chatQuery.location.city, chatQuery.location.country].filter(Boolean).join(', ')
      : null;

    let title = t('site.title');
    let description = t('site.description');
    let keywords = locale === 'zh' 
      ? "艺术品,艺术导航,世界艺术,历史艺术,艺术地图,艺术时间轴,文艺复兴,巴洛克,印象派,现代艺术"
      : "artwork,art navigation,world art,historical art,art map,art timeline,renaissance,baroque,impressionism,modern art";
    let robots = "index, follow";

    const filters: string[] = [];
    if (locationLabel) filters.push(locationLabel);
    if (chatQuery.movement) filters.push(chatQuery.movement);
    if (chatQuery.artist) filters.push(chatQuery.artist);

    if (filters.length > 0) {
      const siteName = t('site.name');

      if (locale === 'zh') {
        const zhFilters = filters.join('、');
        title = `${zhFilters} 艺术作品 | ${siteName}`;
        description = `探索${zhFilters}相关的艺术作品，发现${timeRange.start}-${timeRange.end}年间的艺术珍品。`;
      } else {
        const enFilters = filters.join(', ');
        title = `${enFilters} Artworks | ${siteName}`;
        description = `Explore artworks related to ${enFilters}, discover art treasures from ${timeRange.start}-${timeRange.end}.`;
      }

      keywords = `${filters.join(',')},${keywords}`;
    } else if (timeRange.start !== 1400 || timeRange.end !== 2024) {
      const siteName = t('site.name');
      if (locale === 'zh') {
        title = `${timeRange.start}-${timeRange.end}年艺术作品 | ${siteName}`;
        description = `探索${timeRange.start}-${timeRange.end}年间的世界艺术作品，通过交互式地图和时间轴发现历史艺术珍品。`;
      } else {
        title = `${timeRange.start}-${timeRange.end} Artworks | ${siteName}`;
        description = `Explore world artworks from ${timeRange.start}-${timeRange.end}, discover historical art treasures through interactive maps and timelines.`;
      }
    }
    
    return { title, description, keywords, robots };
  };

  const { title, description, keywords, robots } = generateDynamicSEO();
  
  // Generate comprehensive structured data
  const websiteData = generateWebsiteStructuredData();
  const organizationData = generateOrganizationStructuredData();
  const collectionData = generateCollectionStructuredData(filteredArtworks, chatQuery.location, timeRange);
  
  // Generate breadcrumb data
  const breadcrumbItems = [
    { name: locale === 'zh' ? "首页" : "Home", url: "https://history-in-art.org" }
  ];
  
  if (chatQuery.location) {
    breadcrumbItems.push({ 
      name: locale === 'zh' ? `${chatQuery.location.country}艺术品` : `${chatQuery.location.country} Artworks`, 
      url: `https://history-in-art.org?country=${encodeURIComponent(chatQuery.location.country)}` 
    });
  }
  
  if (timeRange.start !== 1400 || timeRange.end !== 2024) {
    breadcrumbItems.push({ 
      name: `${timeRange.start}-${timeRange.end}${locale === 'zh' ? '年' : ''}`, 
      url: `https://history-in-art.org?start=${timeRange.start}&end=${timeRange.end}` 
    });
  }
  
  const breadcrumbData = generateBreadcrumbStructuredData(breadcrumbItems);
  
  const allStructuredData = [websiteData, organizationData, collectionData, breadcrumbData];
  
  // Generate hreflang for international SEO (future preparation)
  const hreflangLinks = [
    { lang: "zh-CN", url: `https://history-in-art.org?lng=zh` },
    { lang: "en", url: `https://history-in-art.org?lng=en` },
    { lang: "x-default", url: "https://history-in-art.org" }
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasLocationFilter = Boolean(chatQuery.location?.country || chatQuery.location?.city);
    const hasMovementFilter = Boolean(chatQuery.movement);
    const hasArtistFilter = Boolean(chatQuery.artist);

    let params: URLParams = {};
    let replaceHistory = false;

    if (hasLocationFilter || hasMovementFilter || hasArtistFilter) {
      params = {
        country: chatQuery.location?.country || undefined,
        city: chatQuery.location?.city || undefined,
        start: timeRange.start !== 1400 ? timeRange.start : undefined,
        end: timeRange.end !== 2024 ? timeRange.end : undefined,
        artist: chatQuery.artist,
        movement: chatQuery.movement
      };
    } else if (timeRange.start !== 1400 || timeRange.end !== 2024) {
      params = {
        start: timeRange.start !== 1400 ? timeRange.start : undefined,
        end: timeRange.end !== 2024 ? timeRange.end : undefined
      };
    } else {
      replaceHistory = true;
    }

    const queryString = generateURLParams(params);
    const snapshot = `${replaceHistory ? 'replace' : 'push'}|${queryString}`;

    if (lastUrlSnapshotRef.current === snapshot) {
      return;
    }

    lastUrlSnapshotRef.current = snapshot;
    updateURL(params, replaceHistory);
  }, [
    chatQuery.location?.country,
    chatQuery.location?.city,
    chatQuery.movement,
    chatQuery.artist,
    timeRange.start,
    timeRange.end
  ]);

  // Show loading state
  if (loading && dbArtworks.length === 0) {
    return (
      <>
        <SEOHead 
          title={`${t('loading.title')} | ${t('site.name')}`}
          description={t('loading.artworks')}
          keywords={keywords} 
          structuredData={websiteData}
          robots="noindex, nofollow"
          currentLanguage={locale}
        />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('loading.title')}</h2>
            <p className="text-gray-300">{t('loading.fetchingData')}</p>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <SEOHead 
          title={`${t('error.databaseConnection')} | ${t('site.name')}`}
          description={t('error.description')}
          keywords={keywords} 
          structuredData={websiteData}
          robots="noindex, nofollow"
          currentLanguage={locale}
        />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle size={64} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">{t('error.databaseConnection')}</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <p className="text-sm text-gray-400">
              {t('error.supabaseSetup')}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title={title} 
        description={description} 
        keywords={keywords} 
        structuredData={allStructuredData}
        robots={robots}
        hreflang={hreflangLinks}
        currentLanguage={locale}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Header */}
        <Navbar
          loading={loading}
          chatQuery={chatQuery}
          galleryArtworks={galleryArtworks}
          setShowGalleryModal={setShowGalleryModal}
        />

        {/* Main Content */}
        <main className="relative" role="main">
          {/* Full-screen Map */}
          <section className="h-[calc(100vh-80px)] relative" aria-label={t('map.title')}>
            <InteractiveWorldMap
              artworks={filteredArtworks}
              timeRange={timeRange}
              onLocationTimeSelect={handleLocationTimeSelect}
              onArtworkSelect={setSelectedArtwork}
              onAddToGallery={handleAddToGallery}
              galleryArtworkIds={galleryArtworkIds}
            />
            
            {/* Floating Timeline */}
            <aside className="absolute bottom-6 left-6 right-6 z-20" aria-label={t('timeline.title')}>
              <Timeline
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
            </aside>
            
            {/* Floating Chat Interface */}
            <aside className="absolute top-6 right-6 z-20 w-80" aria-label={t('chat.title')}>
              <ChatInterface
                onQueryUpdate={handleChatQuery}
                onLocationTimeUpdate={handleLocationTimeUpdate}
              />
            </aside>
          </section>

          {/* Results Modal */}
          {showResults && (
            <ResultsModal
              artworks={resultsData.artworks}
              location={resultsData.location}
              timeRange={resultsData.timeRange}
              onClose={handleResultsClose}
              onArtworkSelect={setSelectedArtwork}
              onAddToGallery={handleAddToGallery}
              onTimeRangeChange={handleResultsTimeRangeChange}
              galleryArtworkIds={galleryArtworkIds}
            />
          )}

          {/* Gallery Modal */}
          {showGalleryModal && (
            <GalleryModal
              artworks={galleryArtworks}
              onClose={() => setShowGalleryModal(false)}
              onRemoveArtwork={handleRemoveFromGallery}
              onClearGallery={handleClearGallery}
              onArtworkSelect={setSelectedArtwork}
            />
          )}

          {/* Artwork Detail Modal */}
          <ArtworkModal
            artwork={selectedArtwork}
            onClose={() => setSelectedArtwork(null)}
            onAddToGallery={handleAddToGallery}
            isAddedToGallery={selectedArtwork ? galleryArtworkIds.has(selectedArtwork.id) : false}
          />
        </main>

        {/* Footer */}
        <footer className="mt-12 bg-black/20 backdrop-blur-sm border-t border-gray-700" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <nav className="mb-4" aria-label="Footer navigation">
              <ul className="flex flex-wrap justify-center space-x-6 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.about')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
                <li><a href="mailto:feedback@history-in-art.org?subject=Feedback&body=Current URL: %0D%0A%0D%0APage: History-in-Art%0D%0A%0D%0AFeedback:" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
                <li><a href="/sitemap.xml" className="hover:text-white transition-colors">{t('footer.sitemap')}</a></li>
              </ul>
            </nav>
            <div className="text-center text-gray-400 text-sm">
              <p>{t('footer.copyright')}</p>
              <p className="mt-2">{t('footer.subtitle')}</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
