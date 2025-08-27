// URL parameter utilities for SEO-friendly URLs

export interface URLParams {
  location?: string;
  start?: number;
  end?: number;
  artist?: string;
  movement?: string;
}

// Parse URL search parameters into typed object
export const parseURLParams = (): URLParams => {
  if (typeof window === 'undefined') {
    return {}; // SSR 阶段返回默认空对象
  }
  
  const searchParams = new URLSearchParams(window.location.search);
  const params: URLParams = {};

  // Parse location
  const country = searchParams.get('country', '');
  if (country) {
    params.country = decodeURIComponent(country);
  }

  const city = searchParams.get('city', '');
  if (city) {
    params.city = decodeURIComponent(city);
  }

  // Parse time range
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  
  if (start) {
    const startYear = parseInt(start, 10);
    if (!isNaN(startYear) && startYear >= -3000 && startYear <= 2024) {
      params.start = startYear;
    }
  }

  if (end) {
    const endYear = parseInt(end, 10);
    if (!isNaN(endYear) && endYear >= -3000 && endYear <= 2024) {
      params.end = endYear;
    }
  }

  // Parse artist
  const artist = searchParams.get('artist');
  if (artist) {
    params.artist = decodeURIComponent(artist);
  }

  // Parse movement
  const movement = searchParams.get('movement');
  if (movement) {
    params.movement = decodeURIComponent(movement);
  }

  return params;
};

// Generate URL search string from parameters
export const generateURLParams = (params: URLParams): string => {
  const searchParams = new URLSearchParams();

  if (params.country) {
    searchParams.set('country', params.country);
  }

  if (params.city) {
    searchParams.set('city', params.city);
  }

  if (params.start !== undefined) {
    searchParams.set('start', params.start.toString());
  }

  if (params.end !== undefined) {
    searchParams.set('end', params.end.toString());
  }

  if (params.artist) {
    searchParams.set('artist', params.artist);
  }

  if (params.movement) {
    searchParams.set('movement', params.movement);
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Update browser URL without page reload
export const updateURL = (params: URLParams, replace: boolean = false) => {
  // const newURL = `${window.location.pathname}${generateURLParams(params)}`;
  
  // if (replace) {
  //   window.history.replaceState({}, '', newURL);
  // } else {
  //   window.history.pushState({}, '', newURL);
  // }
};

// Get initial state from URL parameters
export const getInitialStateFromURL = () => {
  const urlParams = parseURLParams();
    
  let location = undefined;
  if (urlParams.country || urlParams.city) {
    location = {
      country: urlParams.country || '',
      city: urlParams.city || ''
    };
  }

  return {
    timeRange: {
      start: urlParams.start || 1400,
      end: urlParams.end || 2024
    },
    chatQuery: {
      location,
      artist: urlParams.artist,
      movement: urlParams.movement,
      timeRange: (urlParams.start || urlParams.end) ? {
        start: urlParams.start || 1400,
        end: urlParams.end || 2024
      } : undefined
    }
  };
};

// Validate if current URL matches the expected parameters
export const validateURLParams = (expectedParams: URLParams): boolean => {
  const currentParams = parseURLParams();
  
  return (
    currentParams.country === expectedParams.country &&
    currentParams.city === expectedParams.city &&
    currentParams.start === expectedParams.start &&
    currentParams.end === expectedParams.end &&
    currentParams.artist === expectedParams.artist &&
    currentParams.movement === expectedParams.movement
  );
};