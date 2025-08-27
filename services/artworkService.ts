import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Artwork, TimeRange, Location } from '../types';

type ArtworkRow = Database['public']['Tables']['artworks']['Row'];
type ArtworkInsert = Database['public']['Tables']['artworks']['Insert'];
type ArtworkUpdate = Database['public']['Tables']['artworks']['Update'];

// Convert database row to frontend Artwork type
const convertToArtwork = (row: ArtworkRow): Artwork => ({
  id: row.id,
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
  movement: Array.isArray(row.tags) ? row.tags.find(tag => tag.includes('movement:'))?.replace('movement:', '') || 'Unknown Movement' : 'Unknown Movement',
  medium: Array.isArray(row.tags) ? row.tags.find(tag => tag.includes('medium:'))?.replace('medium:', '') || 'Unknown Medium' : 'Unknown Medium'
});

// Convert frontend Artwork to database insert format
const convertToInsert = (artwork: Partial<Artwork>): ArtworkInsert => ({
  title: artwork.title || '',
  artist_name: artwork.artist,
  creation_year: artwork.year,
  period: artwork.period,
  country: artwork.location?.country,
  city: artwork.location?.city,
  latitude: artwork.location?.coordinates?.[1],
  longitude: artwork.location?.coordinates?.[0],
  description: artwork.description,
  image_url: artwork.imageUrl,
  tags: [
    ...(artwork.movement ? [`movement:${artwork.movement}`] : []),
    ...(artwork.medium ? [`medium:${artwork.medium}`] : [])
  ]
});

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
        query = query.contains('tags', [`movement:${filters.movement}`]);
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

  static async getArtworkCountsByCountry(filters?: {
    timeRange?: TimeRange;
  }): Promise<{ [country: string]: number }> {
    try {
      const { data, error } = await supabase.rpc('get_artwork_counts_by_country', {
        start_year: filters?.timeRange?.start || null,
        end_year: filters?.timeRange?.end || null
      });

      if (error) {
        console.error('Error fetching artwork counts by country:', error);
        return {};
      }

      // Convert array result to object format
      const countryCounts: { [country: string]: number } = {};
      data.forEach((item: { country: string; count: number }) => {
        countryCounts[item.country] = item.count;
      });

      return countryCounts;
    } catch (error) {
      console.error('Error in getArtworkCountsByCountry:', error);
      return {};
    }
  }

  // Get artworks by location
  static async getArtworksByLocation(location: Location, timeRange?: TimeRange): Promise<Artwork[]> {
    console.log("getArtworksByLocation", location);
    try {
      let artworks: Artwork[] = [];

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

      const countries = [...new Set(data.map(item => item.country).filter(Boolean))];
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

      const artists = [...new Set(data.map(item => item.artist_name).filter(Boolean))];
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
      data.forEach(item => {
        if (Array.isArray(item.tags)) {
          item.tags.forEach((tag: string) => {
            if (tag.startsWith('movement:')) {
              movements.add(tag.replace('movement:', ''));
            }
          });
        }
      });

      return Array.from(movements).sort();
    } catch (error) {
      console.error('Error in getMovements:', error);
      return [];
    }
  }
}