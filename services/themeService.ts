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

type ThemeCriteria =
  | { kind: 'century'; startYear: number; endYear: number }
  | { kind: 'city'; city: string }
  | { kind: 'tag'; tag: string }
  | { kind: 'curated' };

function getThemeCriteria(slug: string): ThemeCriteria {
  if (slug.startsWith('century-')) {
    const yearPart = slug.slice('century-'.length);
    const startYear = Number.parseInt(yearPart, 10);
    if (Number.isFinite(startYear)) {
      const currentYear = new Date().getFullYear();
      const endYear = Math.min(startYear + 99, currentYear);
      return { kind: 'century', startYear, endYear };
    }
  }

  if (slug.startsWith('city-')) {
    const cityPart = slug.slice('city-'.length);
    const city = cityPart.replace(/-/g, ' ').trim();
    if (city) return { kind: 'city', city };
  }

  if (slug.startsWith('tag-')) {
    const tag = slug.slice('tag-'.length).replace(/-/g, ' ').trim();
    if (tag) return { kind: 'tag', tag };
  }

  return { kind: 'curated' };
}

function getCandidateTags(tag: string): string[] {
  const base = tag.trim();
  if (!base) return [];

  const baseVariants = new Set<string>([base]);
  baseVariants.add(base.replace(/-/g, ' ').trim());
  baseVariants.add(base.replace(/ /g, '-').trim());

  const candidates = new Set<string>();
  for (const variant of baseVariants) {
    if (!variant) continue;

    candidates.add(variant);
    candidates.add(`tag:${variant}`);
    candidates.add(`subject:${variant}`);

    if (!variant.endsWith('s')) {
      candidates.add(`${variant}s`);
      candidates.add(`tag:${variant}s`);
      candidates.add(`subject:${variant}s`);
    }
  }

  if (base === 'woman') {
    candidates.add('women');
    candidates.add('tag:women');
    candidates.add('subject:women');
  }

  if (base === 'sky') {
    candidates.add('skies');
    candidates.add('tag:skies');
    candidates.add('subject:skies');
  }

  return Array.from(candidates);
}

function escapeIlike(value: string): string {
  return value.replace(/%/g, '').replace(/,/g, '').trim();
}

function convertArtworkRowToArtwork(row: Pick<
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
>): Artwork {
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
    imageUrl:
      row.image_url ||
      'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: row.description || 'No description available',
    movement: movement || 'Unknown Movement',
    medium: medium || 'Unknown Medium',
    tags
  };
}

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
  private static async getDerivedThemeArtworks(criteria: ThemeCriteria, limit: number) {
    if (criteria.kind === 'curated') {
      return { artworks: [] as Artwork[], count: 0 };
    }

    const selectColumns = `
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
    `;

    if (criteria.kind === 'century') {
      const query = supabase
        .from('artworks')
        .select(selectColumns, { count: 'exact' })
        .gte('creation_year', criteria.startYear)
        .lte('creation_year', criteria.endYear)
        .order('map_display_priority', { ascending: false })
        .order('creation_year', { ascending: true })
        .limit(limit);

      const { data, error, count } = await query;
      if (error) {
        console.error('Error fetching derived theme artworks:', error);
        return { artworks: [] as Artwork[], count: 0 };
      }

      const rows = (data || []) as Array<Pick<
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
      >>;

      return {
        artworks: rows.map(convertArtworkRowToArtwork),
        count: count || 0
      };
    }

    if (criteria.kind === 'city') {
      const city = escapeIlike(criteria.city);
      const query = supabase
        .from('artworks')
        .select(selectColumns, { count: 'exact' })
        .ilike('city', city ? `%${city}%` : criteria.city)
        .order('map_display_priority', { ascending: false })
        .order('creation_year', { ascending: true })
        .limit(limit);

      const { data, error, count } = await query;
      if (error) {
        console.error('Error fetching derived theme artworks:', error);
        return { artworks: [] as Artwork[], count: 0 };
      }

      const rows = (data || []) as Array<Pick<
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
      >>;

      return {
        artworks: rows.map(convertArtworkRowToArtwork),
        count: count || 0
      };
    }

    if (criteria.kind === 'tag') {
      const candidateTags = getCandidateTags(criteria.tag);

      for (const candidateTag of candidateTags) {
        const query = supabase
          .from('artworks')
          .select(selectColumns, { count: 'exact' })
          .filter('tags', 'cs', JSON.stringify([candidateTag]))
          .order('map_display_priority', { ascending: false })
          .order('creation_year', { ascending: true })
          .limit(limit);

        const { data, error, count } = await query;
        if (error) {
          console.error('Error fetching derived theme artworks:', error);
          continue;
        }

        if (!count) continue;

        const rows = (data || []) as Array<Pick<
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
        >>;

        return {
          artworks: rows.map(convertArtworkRowToArtwork),
          count: count || 0
        };
      }

      const term = escapeIlike(criteria.tag.replace(/-/g, ' '));
      if (!term) {
        return { artworks: [] as Artwork[], count: 0 };
      }

      const query = supabase
        .from('artworks')
        .select(selectColumns, { count: 'exact' })
        .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
        .order('map_display_priority', { ascending: false })
        .order('creation_year', { ascending: true })
        .limit(limit);

      const { data, error, count } = await query;
      if (error) {
        console.error('Error fetching derived theme artworks:', error);
        return { artworks: [] as Artwork[], count: 0 };
      }

      const rows = (data || []) as Array<Pick<
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
      >>;

      return {
        artworks: rows.map(convertArtworkRowToArtwork),
        count: count || 0
      };
    }
    return { artworks: [] as Artwork[], count: 0 };
  }

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
          const { count: curatedCount, error: curatedCountError } = await supabase
            .from('theme_artworks')
            .select('*', { count: 'exact', head: true })
            .eq('theme_id', theme.id);

          if (curatedCountError) {
            console.error('Error fetching artwork count for theme:', theme.id, curatedCountError);
          }

          if (curatedCount && curatedCount > 0) {
            return convertToTheme(theme, undefined, curatedCount);
          }

          const criteria = getThemeCriteria(theme.slug);
          if (criteria.kind !== 'curated') {
            const derived = await this.getDerivedThemeArtworks(criteria, 1);
            return convertToTheme(theme, undefined, derived.count);
          }

          return convertToTheme(theme, undefined, 0);
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

      const criteria = getThemeCriteria(theme.slug);

      const { count: curatedCount, error: curatedCountError } = await supabase
        .from('theme_artworks')
        .select('*', { count: 'exact', head: true })
        .eq('theme_id', theme.id);

      if (curatedCountError) {
        console.error('Error fetching artwork count for theme:', theme.id, curatedCountError);
      }

      if (curatedCount && curatedCount > 0) {
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
          .order('display_order', { ascending: true })
          .limit(48);

        if (artworksError) {
          console.error('Error fetching theme artworks:', artworksError);
          return convertToTheme(theme, [], curatedCount);
        }

        const artworks: Artwork[] = ((themeArtworks || []) as unknown as ThemeArtworkJoinRow[])
          .filter((ta): ta is ThemeArtworkJoinRow & { artworks: NonNullable<ThemeArtworkJoinRow['artworks']> } =>
            Boolean(ta.artworks)
          )
          .map(({ artworks: artwork }) => convertArtworkRowToArtwork(artwork));

        return convertToTheme(theme, artworks, curatedCount);
      }

      if (criteria.kind !== 'curated') {
        const derived = await this.getDerivedThemeArtworks(criteria, 48);
        return convertToTheme(theme, derived.artworks, derived.count);
      }

      return convertToTheme(theme, [], 0);
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
