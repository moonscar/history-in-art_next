import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Artwork, Location } from '../types';
import { X, Filter, MapPin, Calendar, Palette, RotateCcw, RefreshCw } from 'lucide-react';
import ArtworkCard from './ArtworkCard';

const ALL_TAGS = '__ALL_TAGS__';
const ALL_CREATORS = '__ALL_CREATORS__';
const MIN_YEAR = -3000;
const MAX_YEAR = 2024;

const capitalizeWords = (value: string) =>
  value.replace(/\b\w/g, (char) => char.toUpperCase());

const formatTagLabel = (tag: string) => {
  if (!tag) return '';
  const [prefix, rawValue] = tag.split(':');
  const value = (rawValue ?? tag).replace(/[_-]/g, ' ').trim();

  if (!prefix || !rawValue) {
    return capitalizeWords(value || tag);
  }

  return `${capitalizeWords(value)} (${capitalizeWords(prefix)})`;
};

interface ResultsModalProps {
  artworks: Artwork[];
  location?: Location;
  timeRange?: { start: number; end: number };
  onClose: () => void;
  onArtworkSelect: (artwork: Artwork) => void;
  onAddToGallery?: (artwork: Artwork) => void;
  onTimeRangeChange?: (start: number, end: number) => void;
  galleryArtworkIds?: Set<string>;
}

const ResultsModal: React.FC<ResultsModalProps> = ({
  artworks,
  location,
  timeRange,
  onClose,
  onArtworkSelect,
  onAddToGallery,
  onTimeRangeChange,
  galleryArtworkIds = new Set()
}) => {
  const t = useTranslations();
  const [selectedTag, setSelectedTag] = useState(ALL_TAGS);
  const [selectedCreator, setSelectedCreator] = useState(ALL_CREATORS);
  const [sortBy, setSortBy] = useState('year');
  const [startYearInput, setStartYearInput] = useState(() => String(timeRange?.start ?? 1400));
  const [endYearInput, setEndYearInput] = useState(() => String(timeRange?.end ?? 2024));
  const [isApplyingTimeRange, setIsApplyingTimeRange] = useState(false);
  const baseStartYear = timeRange?.start ?? 1400;
  const baseEndYear = timeRange?.end ?? 2024;

  // 当 timeRange prop 变化时更新本地状态
  React.useEffect(() => {
    setStartYearInput(String(baseStartYear));
    setEndYearInput(String(baseEndYear));
  }, [baseStartYear, baseEndYear]);
  const tagOptions = useMemo(() => {
    const mappedTags = new Map<string, string>();
    artworks.forEach((artwork) => {
      if (Array.isArray(artwork.tags)) {
        artwork.tags.forEach((tag) => {
          if (tag && !mappedTags.has(tag)) {
            mappedTags.set(tag, formatTagLabel(tag));
          }
        });
      }
    });
    return Array.from(mappedTags.entries()).sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [artworks]);

  const creators = useMemo(() => {
    const uniqueCreators = [
      ...new Set(artworks.map((a) => a.artist).filter(Boolean))
    ];
    return uniqueCreators.sort();
  }, [artworks]);

  // 筛选和排序艺术品
  const filteredAndSortedArtworks = useMemo(() => {
    let filtered = artworks.filter(artwork => {
      const matchesCreator =
        selectedCreator === ALL_CREATORS || artwork.artist === selectedCreator;
      const matchesTag =
        selectedTag === ALL_TAGS ||
        (Array.isArray(artwork.tags) && artwork.tags.includes(selectedTag));
      return matchesCreator && matchesTag;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'year':
          return a.year - b.year;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'artist':
          return a.artist.localeCompare(b.artist);
        default:
          return 0;
      }
    });

    return filtered;
  }, [artworks, selectedCreator, selectedTag, sortBy]);

  const handleResetFilters = () => {
    setSelectedTag(ALL_TAGS);
    setSelectedCreator(ALL_CREATORS);
    setSortBy('year');
    setStartYearInput(String(baseStartYear));
    setEndYearInput(String(baseEndYear));
  };

  const handleApplyTimeRange = async () => {
    if (!onTimeRangeChange) {
      return;
    }

    const parseYear = (value: string, fallback: number) => {
      if (!value.trim()) return fallback;
      const parsed = parseInt(value, 10);
      if (Number.isNaN(parsed)) return fallback;
      return Math.min(MAX_YEAR, Math.max(MIN_YEAR, parsed));
    };

    let nextStart = parseYear(startYearInput, baseStartYear);
    let nextEnd = parseYear(endYearInput, baseEndYear);

    if (nextStart >= nextEnd) {
      if (nextStart >= MAX_YEAR) {
        nextStart = MAX_YEAR - 1;
        nextEnd = MAX_YEAR;
      } else {
        nextEnd = Math.min(MAX_YEAR, nextStart + 1);
      }
    }

    setStartYearInput(String(nextStart));
    setEndYearInput(String(nextEnd));

    if (nextStart === baseStartYear && nextEnd === baseEndYear) {
      return;
    }

    setIsApplyingTimeRange(true);
    try {
      await onTimeRangeChange(nextStart, nextEnd);
    } finally {
      setIsApplyingTimeRange(false);
    }
  };

  const hasPendingTimeChange = useMemo(() => {
    return startYearInput !== String(baseStartYear) || endYearInput !== String(baseEndYear);
  }, [startYearInput, endYearInput, baseStartYear, baseEndYear]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('results.title')}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              {location && (
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1 text-blue-400" />
                  {location.city && location.city.trim() 
                    ? `${location.country}, ${location.city}`
                    : location.country
                  }
                </div>
              )}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1 text-purple-400" />
                  <input
                    type="number"
                    value={startYearInput}
                    onChange={(e) => setStartYearInput(e.target.value)}
                    className="w-16 bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                    min={MIN_YEAR}
                    max={MAX_YEAR}
                  />
                  <span className="mx-1 text-gray-400">-</span>
                  <input
                    type="number"
                    value={endYearInput}
                    onChange={(e) => setEndYearInput(e.target.value)}
                    className="w-16 bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                    min={MIN_YEAR}
                    max={MAX_YEAR}
                  />
                </div>
                {onTimeRangeChange && hasPendingTimeChange && (
                  <button
                    onClick={handleApplyTimeRange}
                    disabled={isApplyingTimeRange}
                    className="flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
                    title={t('results.applyTimeRange')}
                  >
                    {isApplyingTimeRange ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <RefreshCw size={12} />
                    )}
                  </button>
                )}
              </div>
              <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                {t('results.artworkCount', { count: filteredAndSortedArtworks.length })}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Filter size={18} className="mr-2 text-orange-400" />
              <h3 className="text-white font-medium">{t('results.filters')}</h3>
            </div>
            <button
              onClick={handleResetFilters}
              className="flex items-center px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              <RotateCcw size={14} className="mr-1" />
              {t('results.reset')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('results.tag')}
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value={ALL_TAGS}>{t('results.allTags')}</option>
                {tagOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('results.creator')}
              </label>
              <select
                value={selectedCreator}
                onChange={(e) => setSelectedCreator(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value={ALL_CREATORS}>{t('results.allCreators')}</option>
                {creators.map((creator) => (
                  <option key={creator} value={creator}>
                    {creator}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('results.sortBy')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="year">{t('results.sortByYear')}</option>
                <option value="title">{t('results.sortByTitle')}</option>
                <option value="artist">{t('results.sortByArtist')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {filteredAndSortedArtworks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Palette size={24} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-400 mb-2">{t('results.noResults')}</h3>
              <p className="text-gray-500 text-sm">
                {t('results.noResultsDesc')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedArtworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onClick={() => onArtworkSelect(artwork)}
                  onAddToGallery={onAddToGallery}
                  isAddedToGallery={galleryArtworkIds.has(artwork.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;
