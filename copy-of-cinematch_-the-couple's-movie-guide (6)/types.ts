
export interface Movie {
  id: string;
  title: string;
  year: number;
  synopsis: string;
  conversationalSynopsis: string;
  posterUrl: string;
  rottenTomatoesScore: string;
  trailerUrl: string;
  streamingPlatforms: StreamingInfo[];
  genres: string[];
  cast: string[];
  runtime: string;
}

export interface StreamingInfo {
  name: string;
  type: 'subscription' | 'free' | 'rent/buy';
  url?: string;
}

export type UserType = 'Ari' | 'Dara';

export interface AppState {
  seenMovies: Set<string>;
  watchlistAri: Set<string>;
  watchlistDara: Set<string>;
  dislikedMovies: Set<string>;
  activePlatforms: string[];
  selectedMood: string;
  yearRange: string;
  maxRuntime: string;
}

export enum ViewMode {
  DISCOVER = 'DISCOVER',
  WATCHLIST = 'WATCHLIST',
  MATCHES = 'MATCHES'
}
