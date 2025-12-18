import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Theme, Artwork } from '../types';
import { slugify } from '../utils/slugify';
import { normalizeTags } from '../utils/tags';

type ThemeRow = Database['public']['Tables']['themes']['Row'];
type ThemeInsert = Database['public']['Tables']['themes']['Insert'];
type ArtworkRow = Database['public']['Tables']['artworks']['Row'];

type ThemeArtworkJoinRow = {
  display_order: number | null;
  artworks: Pick<
    ArtworkRow,
    | 'id'
    | 'slug'
    | 'title'
    | 'artist_name'
    | 'creation_year'
    | 'period'
    | 'country'
    | 'city'
    | 'latitude'
    | 'longitude'
    | 'description'
    | 'image_url'
    | 'tags'
  > | null;
};

// Convert database row to frontend Theme type
const convertToTheme = (row: ThemeRow, artworks?: Artwork[], artworkCount?: number): Theme => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  description: row.description || '',
  imageUrl: row.image_url || 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=800',
  artworks,
  artworkCount
});

// Convert frontend Theme to database insert format
const convertToInsert = (theme: Partial<Theme>): ThemeInsert => ({
  slug: theme.slug || slugify(theme.title || ''),
  title: theme.title || '',
  description: theme.description,
  image_url: theme.imageUrl
});

export class ThemeService {
  // Get all themes with artwork counts
  static async getAllThemes(): Promise<Theme[]> {
    try {
      const { data: themesData, error: themesError } = await supabase
        .from('themes')
        .select('*')
        .order('created_at', { ascending: false });

      if (themesError) {
        console.error('Error fetching themes:', themesError);
        throw themesError;
      }

      // Get artwork counts for each theme
      const themes = (themesData || []) as ThemeRow[];
      const themesWithCounts = await Promise.all(
        themes.map(async (theme) => {
          const { count, error: countError } = await supabase
            .from('theme_artworks')
            .select('*', { count: 'exact', head: true })
            .eq('theme_id', theme.id);

          if (countError) {
            console.error('Error fetching artwork count for theme:', theme.id, countError);
          }

          return convertToTheme(theme, undefined, count || 0);
        })
      );

      return themesWithCounts;
    } catch (error) {
      console.error('Error in getAllThemes:', error);
      return [];
    }
  }

  // Get theme by slug with associated artworks
  static async getThemeBySlug(slug: string): Promise<Theme | null> {
    try {
      // First, get the theme
      const { data: themeData, error: themeError } = await supabase
        .from('themes')
        .select('*')
        .eq('slug', slug)
        .single();

      if (themeError) {
        console.error('Error fetching theme:', themeError);
        return null;
      }

      const theme = (themeData || null) as ThemeRow | null;
      if (!theme) {
        return null;
      }

      // Then, get associated artworks
      const { data: themeArtworks, error: artworksError } = await supabase
        .from('theme_artworks')
        .select(`
          display_order,
          artworks (
            id,
            slug,
            title,
            artist_name,
            creation_year,
            period,
            country,
            city,
            latitude,
            longitude,
            description,
            image_url,
            tags
          )
        `)
        .eq('theme_id', theme.id)
        .order('display_order', { ascending: true });

      if (artworksError) {
        console.error('Error fetching theme artworks:', artworksError);
        return convertToTheme(theme, [], 0);
      }

      // Convert artworks to frontend format
      const artworks: Artwork[] = ((themeArtworks || []) as unknown as ThemeArtworkJoinRow[])
        .filter((ta): ta is ThemeArtworkJoinRow & { artworks: NonNullable<ThemeArtworkJoinRow['artworks']> } =>
          Boolean(ta.artworks)
        )
        .map(({ artworks: artwork }) => {
          const tags = normalizeTags(artwork.tags);
          const movementTag = tags.find(tag => tag.startsWith('movement:'));
          const mediumTag = tags.find(tag => tag.startsWith('medium:'));
          const movement = movementTag ? movementTag.replace('movement:', '').trim() : '';
          const medium = mediumTag ? mediumTag.replace('medium:', '').trim() : '';

          return {
            id: artwork.id,
            slug: artwork.slug || slugify(artwork.title),
            title: artwork.title,
            artist: artwork.artist_name || 'Unknown Artist',
            year: artwork.creation_year || 0,
            period: artwork.period || '',
            location: {
              country: artwork.country || 'Unknown Country',
              city: artwork.city || 'Unknown City',
              coordinates: [artwork.longitude || 0, artwork.latitude || 0] as [number, number]
            },
            imageUrl: artwork.image_url || 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=400',
            description: artwork.description || 'No description available',
            movement: movement || 'Unknown Movement',
            medium: medium || 'Unknown Medium',
            tags
          };
        });

      return convertToTheme(theme, artworks, artworks.length);
    } catch (error) {
      console.error('Error in getThemeBySlug:', error);
      return null;
    }
  }

  // Get all theme slugs for static generation
  static async getAllThemeSlugs(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('themes')
        .select('slug');

      if (error) {
        console.error('Error fetching theme slugs:', error);
        return [];
      }

      return ((data || []) as Array<Pick<ThemeRow, 'slug'>>).map(theme => theme.slug);
    } catch (error) {
      console.error('Error in getAllThemeSlugs:', error);
      return [];
    }
  }

  // Create a new theme
  static async createTheme(theme: Partial<Theme>): Promise<Theme | null> {
    try {
      const { data: themeData, error } = await supabase
        .from('themes')
        .insert(convertToInsert(theme))
        .select()
        .single();

      if (error) {
        console.error('Error creating theme:', error);
        throw error;
      }

      const created = (themeData || null) as ThemeRow | null;
      return created ? convertToTheme(created) : null;
    } catch (error) {
      console.error('Error in createTheme:', error);
      return null;
    }
  }

  // Add artwork to theme
  static async addArtworkToTheme(themeId: string, artworkId: string, displayOrder?: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('theme_artworks')
        .insert({
          theme_id: themeId,
          artwork_id: artworkId,
          display_order: displayOrder
        });

      if (error) {
        console.error('Error adding artwork to theme:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in addArtworkToTheme:', error);
      return false;
    }
  }

  // Remove artwork from theme
  static async removeArtworkFromTheme(themeId: string, artworkId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('theme_artworks')
        .delete()
        .eq('theme_id', themeId)
        .eq('artwork_id', artworkId);

      if (error) {
        console.error('Error removing artwork from theme:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in removeArtworkFromTheme:', error);
      return false;
    }
  }
}
