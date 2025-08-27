// SEO utility functions

export const generatePageTitle = (
  baseTitle: string,
  location?: string,
  timeRange?: { start: number; end: number },
  artist?: string,
  movement?: string
): string => {
  const parts = [];
  
  if (location) parts.push(location);
  if (timeRange && (timeRange.start !== 1400 || timeRange.end !== 2024)) {
    parts.push(`${timeRange.start}-${timeRange.end}年`);
  }
  if (artist) parts.push(artist);
  if (movement) parts.push(movement);
  
  if (parts.length > 0) {
    return `${parts.join(' ')} 艺术作品 | ${baseTitle}`;
  }
  
  return baseTitle;
};

export const generatePageDescription = (
  baseDescription: string,
  location?: string,
  timeRange?: { start: number; end: number },
  artworkCount?: number
): string => {
  const parts = [];
  
  if (location) parts.push(location);
  if (timeRange && (timeRange.start !== 1400 || timeRange.end !== 2024)) {
    parts.push(`${timeRange.start}-${timeRange.end}年间`);
  }
  
  if (parts.length > 0) {
    const context = parts.join('、');
    const countText = artworkCount ? `发现${artworkCount}件` : '探索';
    return `${countText}${context}的艺术作品，通过交互式地图和时间轴深入了解艺术历史。`;
  }
  
  return baseDescription;
};

export const generateKeywords = (
  baseKeywords: string,
  location?: string,
  timeRange?: { start: number; end: number },
  artist?: string,
  movement?: string
): string => {
  const additionalKeywords = [];
  
  if (location) additionalKeywords.push(location, `${location}艺术`, `${location}艺术品`);
  if (artist) additionalKeywords.push(artist, `${artist}作品`);
  if (movement) additionalKeywords.push(movement, `${movement}艺术`);
  if (timeRange) {
    const period = getPeriodName(timeRange.start, timeRange.end);
    if (period) additionalKeywords.push(period, `${period}艺术`);
  }
  
  return [baseKeywords, ...additionalKeywords].join(',');
};

export const getPeriodName = (start: number, end: number): string | null => {
  const periods = [
    { name: '古代艺术', start: -3000, end: 500 },
    { name: '中世纪艺术', start: 500, end: 1400 },
    { name: '文艺复兴', start: 1400, end: 1600 },
    { name: '巴洛克艺术', start: 1600, end: 1750 },
    { name: '新古典主义', start: 1750, end: 1850 },
    { name: '印象派', start: 1850, end: 1900 },
    { name: '现代艺术', start: 1900, end: 1980 },
    { name: '当代艺术', start: 1980, end: 2024 }
  ];
  
  const matchingPeriod = periods.find(period => 
    start >= period.start && end <= period.end
  );
  
  return matchingPeriod?.name || null;
};

export const generateCanonicalUrl = (
  baseUrl: string,
  location?: string,
  timeRange?: { start: number; end: number },
  artist?: string,
  movement?: string
): string => {
  const params = new URLSearchParams();
  
  if (location) params.set('location', location);
  if (timeRange && (timeRange.start !== 1400 || timeRange.end !== 2024)) {
    params.set('start', timeRange.start.toString());
    params.set('end', timeRange.end.toString());
  }
  if (artist) params.set('artist', artist);
  if (movement) params.set('movement', movement);
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

// Generate meta robots content based on page state
export const generateRobotsContent = (
  hasContent: boolean,
  isLoading: boolean,
  hasError: boolean
): string => {
  if (hasError || isLoading) {
    return 'noindex, nofollow';
  }
  
  if (!hasContent) {
    return 'noindex, follow';
  }
  
  return 'index, follow';
};