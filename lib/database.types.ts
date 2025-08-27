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
          tags: Json
          image_url: string | null
          thumbnail_url: string | null
          map_display_priority: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
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
          tags?: Json
          image_url?: string | null
          thumbnail_url?: string | null
          map_display_priority?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
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
          tags?: Json
          image_url?: string | null
          thumbnail_url?: string | null
          map_display_priority?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}