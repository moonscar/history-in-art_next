import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Artwork, TimeRange, Location } from '@/types';
import { useArtworks } from '@/hooks/useArtworks';
import { parseURLParams, updateURL, getInitialStateFromURL } from '@/utils/urlParams';
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
import I18nProvider from '@/components/I18nProvider';
import { Globe, Clock, Palette, AlertCircle } from 'lucide-react';

import dynamic from 'next/dynamic';

const InteractiveWorldMap = dynamic(() => import('@/components/InteractiveWorldMap'), {
  ssr: false,
});


function App() {
  const { t, i18n } = useTranslation();
  const initialState = getInitialStateFromURL();
  const [timeRange, setTimeRange] = useState<TimeRange>(initialState.timeRange);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [showResults, setShowResults] = useState(false);
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

  const handleLocationTimeUpdate = (location: Location, timeRange: TimeRange) => {
    // 更新时间轴
    setTimeRange(timeRange);
    
    // 更新查询参数
    setChatQuery(prev => ({
      ...prev,
      location,
      timeRange
    }));
    
    // 自动显示该地区的艺术品结果
    setTimeout(async () => {
      const locationArtworks = await getArtworksByLocation(location, timeRange);
      setResultsData({
        artworks: locationArtworks,
        location,
        timeRange
      });
      setShowResults(true);
    }, 500); // 给时间让筛选条件先更新
  };

  const handleResultsClose = () => {
    setShowResults(false);
    setChatQuery({ timeRange: timeRange });
    setTimeRange({ start: 1400, end: 2024 });
    // window.history.replaceState({}, '', window.location.pathname);
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

  // Generate dynamic SEO data based on current state
  const generateDynamicSEO = () => {
    let title = t('site.title');
    let description = t('site.description');
    let keywords = i18n.language === 'zh' 
      ? "艺术品,艺术导航,世界艺术,历史艺术,艺术地图,艺术时间轴,文艺复兴,巴洛克,印象派,现代艺术"
      : "artwork,art navigation,world art,historical art,art map,art timeline,renaissance,baroque,impressionism,modern art";
    let robots = "index, follow";

    if (chatQuery.location || chatQuery.movement || chatQuery.artist) {
      const filters = [];
      if (chatQuery.location) filters.push(chatQuery.location);
      if (chatQuery.movement) filters.push(chatQuery.movement);
      if (chatQuery.artist) filters.push(chatQuery.artist);
      
      const siteName = t('site.name');
      if (i18n.language === 'zh') {
        title = `${filters.join(' ')} 艺术作品 | ${siteName}`;
        description = `探索${filters.join('、')}相关的艺术作品，发现${timeRange.start}-${timeRange.end}年间的艺术珍品。`;
      } else {
        title = `${filters.join(' ')} Artworks | ${siteName}`;
        description = `Explore artworks related to ${filters.join(', ')}, discover art treasures from ${timeRange.start}-${timeRange.end}.`;
      }
      keywords = `${filters.join(',')},${keywords}`;
    } else if (timeRange.start !== 1400 || timeRange.end !== 2024) {
      const siteName = t('site.name');
      if (i18n.language === 'zh') {
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
    { name: i18n.language === 'zh' ? "首页" : "Home", url: "https://history-in-art.org" }
  ];
  
  if (chatQuery.location) {
    breadcrumbItems.push({ 
      name: i18n.language === 'zh' ? `${chatQuery.location.country}艺术品` : `${chatQuery.location.country} Artworks`, 
      url: `https://history-in-art.org?country=${encodeURIComponent(chatQuery.location.country)}` 
    });
  }
  
  if (timeRange.start !== 1400 || timeRange.end !== 2024) {
    breadcrumbItems.push({ 
      name: `${timeRange.start}-${timeRange.end}${i18n.language === 'zh' ? '年' : ''}`, 
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
          currentLanguage={i18n.language}
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
          currentLanguage={i18n.language}
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
        currentLanguage={i18n.language}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-sm border-b border-gray-700" role="banner">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Palette size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{t('site.name')}</h1>
                  <p className="text-gray-300 text-sm">{t('site.tagline')}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <LanguageSwitcher />
                <div className="flex items-center">
                  <Globe size={16} className="mr-1 text-blue-400" />
                  {filteredArtworks.length} {t('header.artworksFound')}
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1 text-purple-400" />
                  {t('header.timeRange', { start: timeRange.start, end: timeRange.end })}
                </div>
                {loading && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-blue-400">{t('header.updating')}</span>
                  </div>
                )}
                {chatQuery.location && (
                  <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                    {chatQuery.location.country}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>


        {/* Main Content */}
        <main className="relative" role="main">
          {/* Full-screen Map */}
          <section className="h-[calc(100vh-80px)] relative" aria-label={t('map.title')}>
            <InteractiveWorldMap
              artworks={filteredArtworks}
              timeRange={timeRange}
              onLocationTimeSelect={handleLocationTimeSelect}
              onArtworkSelect={setSelectedArtwork}
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
            />
          )}

          {/* Artwork Detail Modal */}
          <ArtworkModal
            artwork={selectedArtwork}
            onClose={() => setSelectedArtwork(null)}
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