export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: number;
  period: string;
  location: {
    country: string;
    city: string;
    coordinates: [number, number]; // [lng, lat]
  };
  imageUrl: string;
  description: string;
  movement: string;
  medium: string;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface Location {
  country: string;
  city: string;
  coordinates?: [number, number];
  artworkCount?: number;
}

export interface HistoricalPeriod {
  name: string;
  start: number;
  end: number;
  color: string;
}