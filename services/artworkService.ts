import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Artwork, TimeRange, Location } from '../types';
import { slugify, generateUniqueSlug } from '../utils/slugify';
import { normalizeTags } from '../utils/tags';

type ArtworkRow = Database['public']['Tables']['artworks']['Row'];
type ArtworkInsert = Database['public']['Tables']['artworks']['Insert'];
type ArtworkUpdate = Database['public']['Tables']['artworks']['Update'];
type ArtworkSlugRow = Pick<ArtworkRow, 'slug'>;
type ArtworkCountryRow = Pick<ArtworkRow, 'country'>;
type ArtworkArtistRow = Pick<ArtworkRow, 'artist_name'>;
type ArtworkTagsRow = Pick<ArtworkRow, 'tags'>;

type NonEmptyString = string & { __brand: 'NonEmptyString' };

function isNonEmptyString(value: unknown): value is NonEmptyString {
  return typeof value === 'string' && value.trim().length > 0;
}

// Convert database row to frontend Artwork type
const convertToArtwork = (row: ArtworkRow): Artwork => {
  const tags = normalizeTags(row.tags);
  const movementTag = tags.find(tag => tag.startsWith('movement:'));
  const mediumTag = tags.find(tag => tag.startsWith('medium:'));
  const movement = movementTag ? movementTag.replace('movement:', '').trim() : '';
  const medium = mediumTag ? mediumTag.replace('medium:', '').trim() : '';

  return {
    id: row.id,
    slug: row.slug || slugify(row.title),
    title: row.title,
    artist: row.artist_name || 'Unknown Artist',
    year: row.creation_year || 0,
    period: row.period || '',
    location: {
      country: row.country || 'Unknown Country',
      city: row.city || 'Unknown City',
      coordinates: [row.longitude || 0, row.latitude || 0] as [number, number]
    },
    imageUrl: row.image_url || 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: row.description || 'No description available',
    movement: movement || 'Unknown Movement',
    medium: medium || 'Unknown Medium',
    tags
  };
};

// Convert frontend Artwork to database insert format
const convertToInsert = (artwork: Partial<Artwork>): ArtworkInsert => {
  const baseTags = normalizeTags(artwork.tags);
  const movementTag = artwork.movement ? `movement:${artwork.movement}` : null;
  const mediumTag = artwork.medium ? `medium:${artwork.medium}` : null;
  const combinedTags = [...baseTags];

  if (movementTag) combinedTags.push(movementTag);
  if (mediumTag) combinedTags.push(mediumTag);

  const uniqueTags = Array.from(new Set(combinedTags));

  return {
    slug: artwork.slug ?? null,
    title: artwork.title || '',
    artist_name: artwork.artist ?? null,
    creation_year: artwork.year ?? null,
    period: artwork.period ?? null,
    country: artwork.location?.country ?? null,
    city: artwork.location?.city ?? null,
    latitude: artwork.location?.coordinates?.[1] ?? null,
    longitude: artwork.location?.coordinates?.[0] ?? null,
    description: artwork.description ?? null,
    image_url: artwork.imageUrl ?? null,
    tags: uniqueTags.length > 0 ? uniqueTags : null
  };
};

export class ArtworkService {
  // Get all artworks with optional filters
  static async getArtworks(filters?: {
    timeRange?: TimeRange;
    location?: Location;
    movement?: string;
    artist?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Artwork[]; count: number }> {
    try {
      let query = supabase
        .from('artworks')
        .select('*', { count: 'exact' })
        .order('map_display_priority', { ascending: false })
        .order('creation_year', { ascending: true });

      // Apply filters
      if (filters?.timeRange) {
        query = query
          .gte('creation_year', filters.timeRange.start)
          .lte('creation_year', filters.timeRange.end);
      }

      if (filters?.location) {
        query = query.eq('country', filters.location.country);
      }

      if (filters?.artist) {
        query = query.ilike('artist_name', `%${filters.artist}%`);
      }

      if (filters?.movement) {
        query = query.filter('tags', 'cs', JSON.stringify([`movement:${filters.movement}`]));
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching artworks:', error);
        throw error;
      }

      return {
        data: (data || []).map(convertToArtwork),
        count: count || 0
      };
    } catch (error) {
      console.error('Error in getArtworks:', error);
      return { data: [], count: 0 };
    }
  }

  // Get artwork by ID
  static async getArtworkById(id: string): Promise<Artwork | null> {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching artwork:', error);
        return null;
      }

      return data ? convertToArtwork(data) : null;
    } catch (error) {
      console.error('Error in getArtworkById:', error);
      return null;
    }
  }

  // Get artwork by slug
  static async getArtworkBySlug(slug: string): Promise<Artwork | null> {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching artwork by slug:', error);
        return null;
      }

      return data ? convertToArtwork(data) : null;
    } catch (error) {
      console.error('Error in getArtworkBySlug:', error);
      return null;
    }
  }

  // Get all artwork slugs for static generation
  static async getAllArtworkSlugs(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('slug')
        .not('slug', 'is', null);

      if (error) {
        console.error('Error fetching artwork slugs:', error);
        return [];
      }

      const rows = (data || []) as ArtworkSlugRow[];
      const slugs = rows.map(item => item.slug).filter(isNonEmptyString);
      return slugs;
    } catch (error) {
      console.error('Error in getAllArtworkSlugs:', error);
      return [];
    }
  }

  static async getArtworkCountsByCountry(filters?: {
    timeRange?: TimeRange;
  }): Promise<Database['public']['Functions']['get_artwork_counts_by_country']['Returns']> {
    try {
      type RpcArgs = Database['public']['Functions']['get_artwork_counts_by_country']['Args'];
      type RpcReturns = Database['public']['Functions']['get_artwork_counts_by_country']['Returns'];

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams();
        if (typeof filters?.timeRange?.start === 'number') {
          params.set('start_year', String(filters.timeRange.start));
        }
        if (typeof filters?.timeRange?.end === 'number') {
          params.set('end_year', String(filters.timeRange.end));
        }

        const response = await fetch(`/api/artworkCountsByCountry?${params.toString()}`, {
          method: 'GET',
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch counts: ${response.status}`);
        }

        const rows = (await response.json()) as RpcReturns;
        return rows;
      }

      const rpc = supabase.rpc as unknown as (
        fn: 'get_artwork_counts_by_country',
        args: RpcArgs
      ) => Promise<{ data: RpcReturns | null; error: unknown }>;

      const { data, error } = await rpc('get_artwork_counts_by_country', {
        start_year: filters?.timeRange?.start ?? null,
        end_year: filters?.timeRange?.end ?? null
      });

      if (error) {
        console.error('Error fetching artwork counts by country:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getArtworkCountsByCountry:', error);
      return [];
    }
  }

  // Get artworks by location
  static async getArtworksByLocation(location: Location, timeRange?: TimeRange): Promise<Artwork[]> {
    console.log("getArtworksByLocation", location);
    try {
      // 1. 如果有city参数且不为空，先尝试按city查询
      if (location.city && location.city.trim()) {
        console.log("Debug, here is city", location.city);
        let cityQuery = supabase
          .from('artworks')
          .select('*')
          .eq('country', location.country)
          .eq('city', location.city)
          .order('creation_year', { ascending: true });

        if (timeRange) {
          cityQuery = cityQuery
            .gte('creation_year', timeRange.start)
            .lte('creation_year', timeRange.end);
        }

        const { data: cityData, error: cityError } = await cityQuery;
        
        if (cityError) {
          console.error('Error fetching artworks by city:', cityError);
        } else if (cityData && cityData.length > 0) {
          // city查询有结果，直接返回
          return cityData.map(convertToArtwork);
        }
      }

      // 2. city为空或city查询无结果时，按country查询
      console.log("Debug, here is country", location.country);
      let countryQuery = supabase
        .from('artworks')
        .select('*')
        .eq('country', location.country)
        .order('creation_year', { ascending: true });

      if (timeRange) {
        countryQuery = countryQuery
          .gte('creation_year', timeRange.start)
          .lte('creation_year', timeRange.end);
      }

      const { data: countryData, error: countryError } = await countryQuery;
      
      if (countryError) {
        console.error('Error fetching artworks by country:', countryError);
        return [];
      }

      return (countryData || []).map(convertToArtwork);

    } catch (error) {
      console.error('Error in getArtworksByLocation:', error);
      return [];
    }
  }

  static async getArtworksByCountriesAndCityLoose(options: {
    countries: string[];
    city?: string;
    timeRange?: TimeRange;
    limit?: number;
  }): Promise<Artwork[]> {
    try {
      const { countries, city, timeRange, limit = 30 } = options;
      const uniqueCountries = Array.from(
        new Set(countries.map(value => value.trim()).filter(Boolean))
      );

      const quoteForOr = (value: string) => {
        const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return `"${escaped}"`;
      };

      const base = () => {
        let query = supabase
          .from('artworks')
          .select('*')
          .order('map_display_priority', { ascending: false })
          .order('creation_year', { ascending: true })
          .limit(limit);

        if (timeRange) {
          query = query
            .gte('creation_year', timeRange.start)
            .lte('creation_year', timeRange.end);
        }

        return query;
      };

      if (typeof city === 'string' && city.trim().length > 0) {
        const cityValue = quoteForOr(city.trim());
        const { data: cityData, error: cityError } = await base().or(
          `city.eq.${cityValue},country.eq.${cityValue}`
        );

        if (!cityError && cityData && cityData.length > 0) {
          return cityData.map(convertToArtwork);
        }
      }

      if (uniqueCountries.length === 0) return [];

      const { data: countryData, error: countryError } = await base().in('country', uniqueCountries);
      if (countryError) {
        console.error('Error fetching artworks by countries:', countryError);
        return [];
      }

      return (countryData || []).map(convertToArtwork);
    } catch (error) {
      console.error('Error in getArtworksByCountriesAndCityLoose:', error);
      return [];
    }
  }

  // Search artworks
  static async searchArtworks(searchTerm: string): Promise<Artwork[]> {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,artist_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('map_display_priority', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error searching artworks:', error);
        return [];
      }

      return (data || []).map(convertToArtwork);
    } catch (error) {
      console.error('Error in searchArtworks:', error);
      return [];
    }
  }

  // Get unique countries
  static async getCountries(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('country')
        .not('country', 'is', null);

      if (error) {
        console.error('Error fetching countries:', error);
        return [];
      }

      const rows = (data || []) as ArtworkCountryRow[];
      const countries = [...new Set(rows.map(item => item.country).filter(isNonEmptyString))];
      return countries.sort();
    } catch (error) {
      console.error('Error in getCountries:', error);
      return [];
    }
  }

  // Get unique artists
  static async getArtists(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('artist_name')
        .not('artist_name', 'is', null);

      if (error) {
        console.error('Error fetching artists:', error);
        return [];
      }

      const rows = (data || []) as ArtworkArtistRow[];
      const artists = [...new Set(rows.map(item => item.artist_name).filter(isNonEmptyString))];
      return artists.sort();
    } catch (error) {
      console.error('Error in getArtists:', error);
      return [];
    }
  }

  // Get unique movements
  static async getMovements(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('tags');

      if (error) {
        console.error('Error fetching movements:', error);
        return [];
      }

      const movements = new Set<string>();
      const rows = (data || []) as ArtworkTagsRow[];
      rows.forEach(item => {
        const tags = normalizeTags(item.tags);
        tags.forEach(tag => {
          if (tag.startsWith('movement:')) {
            movements.add(tag.replace('movement:', ''));
          }
        });
      });

      return Array.from(movements).sort();
    } catch (error) {
      console.error('Error in getMovements:', error);
      return [];
    }
  }
}
