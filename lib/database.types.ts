export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      artworks: {
        Row: {
          id: string
          slug: string | null
          title: string
          artist_name: string | null
          creation_year: number | null
          period: string | null
          country: string | null
          region: string | null
          city: string | null
          latitude: number | null
          longitude: number | null
          description: string | null
          cultural_context: string | null
          tags: string[] | null
          image_url: string | null
          thumbnail_url: string | null
          map_display_priority: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug?: string | null
          title: string
          artist_name?: string | null
          creation_year?: number | null
          period?: string | null
          country?: string | null
          region?: string | null
          city?: string | null
          latitude?: number | null
          longitude?: number | null
          description?: string | null
          cultural_context?: string | null
          tags: string[] | null
          image_url?: string | null
          thumbnail_url?: string | null
          map_display_priority?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string | null
          title?: string
          artist_name?: string | null
          creation_year?: number | null
          period?: string | null
          country?: string | null
          region?: string | null
          city?: string | null
          latitude?: number | null
          longitude?: number | null
          description?: string | null
          cultural_context?: string | null
          tags: string[] | null
          image_url?: string | null
          thumbnail_url?: string | null
          map_display_priority?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      themes: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      theme_artworks: {
        Row: {
          theme_id: string
          artwork_id: string
          display_order: number | null
          created_at: string
        }
        Insert: {
          theme_id: string
          artwork_id: string
          display_order?: number | null
          created_at?: string
        }
        Update: {
          theme_id?: string
          artwork_id?: string
          display_order?: number | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_artwork_counts_by_country: {
        Args: { start_year?: number | null; end_year?: number | null }
        Returns: { country: string; count: number }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
