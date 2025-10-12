'use client';

import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Artwork, Location } from '../types';
import { X, Filter, MapPin, Calendar, Palette, RotateCcw, RefreshCw } from 'lucide-react';
import ArtworkCard from './ArtworkCard';

const ALL_CREATORS = '__ALL_CREATORS__';
const MIN_YEAR = -3000;
const MAX_YEAR = 2024;
const TAG_MAX_LIMIT = 200;
const TAGS_PER_ARTWORK_LIMIT = 3;

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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [selectedCreator, setSelectedCreator] = useState(ALL_CREATORS);
  const [sortBy, setSortBy] = useState('year');
  const [startYearInput, setStartYearInput] = useState(() => String(timeRange?.start ?? 1400));
  const [endYearInput, setEndYearInput] = useState(() => String(timeRange?.end ?? 2024));
  const [isApplyingTimeRange, setIsApplyingTimeRange] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const tagSelectorRef = React.useRef<HTMLDivElement>(null);
  const baseStartYear = timeRange?.start ?? 1400;
  const baseEndYear = timeRange?.end ?? 2024;

  // 当 timeRange prop 变化时更新本地状态
  React.useEffect(() => {
    setStartYearInput(String(baseStartYear));
    setEndYearInput(String(baseEndYear));
  }, [baseStartYear, baseEndYear]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagSelectorRef.current && !tagSelectorRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const tagStats = useMemo(() => {
    const stats = new Map<string, { label: string; count: number }>();
    artworks.forEach((artwork) => {
      if (!Array.isArray(artwork.tags) || artwork.tags.length === 0) {
        return;
      }

      const uniqueTags = new Set(artwork.tags.filter(Boolean));
      uniqueTags.forEach((tag) => {
        if (!tag) return;
        if (!stats.has(tag)) {
          stats.set(tag, { label: formatTagLabel(tag), count: 0 });
        }
        const entry = stats.get(tag);
        if (entry) {
          entry.count += 1;
        }
      });
    });

    const sorted = Array.from(stats.entries())
      .map(([value, data]) => ({
        value,
        label: data.label,
        count: data.count
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.label.localeCompare(b.label);
      });

    if (sorted.length === 0) {
      return sorted;
    }

    const dynamicLimit = Math.max(
      0,
      Math.min(
        TAG_MAX_LIMIT,
        Math.max(artworks.length * TAGS_PER_ARTWORK_LIMIT, TAGS_PER_ARTWORK_LIMIT)
      )
    );

    return sorted.slice(0, dynamicLimit || sorted.length);
  }, [artworks]);

  const tagInfoMap = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    tagStats.forEach((entry) => {
      map.set(entry.value, { label: entry.label, count: entry.count });
    });
    return map;
  }, [tagStats]);

  const filteredTagOptions = useMemo(() => {
    const term = tagSearchTerm.trim().toLowerCase();
    if (!term) {
      return tagStats;
    }
    return tagStats.filter((tag) => {
      const haystack = `${tag.label} ${tag.value}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [tagStats, tagSearchTerm]);

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
      const tagSet = Array.isArray(artwork.tags) ? new Set(artwork.tags) : null;
      const matchesTag =
        selectedTags.length === 0 ||
        (tagSet !== null && selectedTags.every((tag) => tagSet.has(tag)));
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
  }, [artworks, selectedCreator, selectedTags, sortBy]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag);
      }
      return [...prev, tag];
    });
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags((prev) => prev.filter((item) => item !== tag));
  };

  const handleResetFilters = () => {
    setSelectedTags([]);
    setTagSearchTerm('');
    setIsTagDropdownOpen(false);
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
            <div ref={tagSelectorRef}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('results.tag')}
              </label>
              <div
                className="bg-gray-800 border border-gray-700 rounded-lg"
                onClick={() => setIsTagDropdownOpen(true)}
              >
                <div className="px-3 pt-3 pb-2">
                  {selectedTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => {
                        const info = tagInfoMap.get(tag);
                        const label = info?.label ?? formatTagLabel(tag);
                        return (
                          <span
                            key={tag}
                            className="inline-flex items-center space-x-2 bg-blue-600/80 text-white text-xs px-2 py-1 rounded-full"
                          >
                            <span>{label}</span>
                            <button
                              type="button"
                              onClick={() => handleTagRemove(tag)}
                              className="p-0.5 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-1 focus:ring-white transition-colors"
                              aria-label={t('results.removeTag', { tag: label })}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      {t('results.tagSearchPlaceholder')}
                    </p>
                  )}
                </div>
                <div className="px-3 pb-3">
                  <input
                    type="text"
                    value={tagSearchTerm}
                    onChange={(e) => setTagSearchTerm(e.target.value)}
                    placeholder={t('results.tagSearchInputPlaceholder')}
                    className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    onFocus={() => setIsTagDropdownOpen(true)}
                  />
                </div>
                {isTagDropdownOpen && (
                  <div className="border-t border-gray-700 max-h-40 overflow-y-auto">
                    {filteredTagOptions.length === 0 ? (
                      <div className="px-3 py-3 text-xs text-gray-500">
                        {t('results.noMatchingTags')}
                      </div>
                    ) : (
                      filteredTagOptions.map(({ value, label, count }) => {
                        const isSelected = selectedTags.includes(value);
                        return (
                          <button
                            type="button"
                            key={value}
                            onClick={() => handleTagToggle(value)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-200 hover:bg-gray-700'
                            }`}
                          >
                            <span className="truncate">{label}</span>
                            <span
                              className={`ml-3 text-xs ${
                                isSelected ? 'text-blue-100' : 'text-gray-400'
                              }`}
                            >
                              {t('results.tagCount', { count })}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
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
