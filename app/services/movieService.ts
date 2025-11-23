import { TMDB_CONFIG, TMDB_ENDPOINTS } from '@/constants/tmdb';

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  release_date: string;
  genre_ids: number[];
}

interface MoviesResponse {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
}

class MovieService {
  private baseUrl = TMDB_CONFIG.BASE_URL;
  private apiKey = TMDB_CONFIG.API_KEY;

  private async fetchFromTMDB(endpoint: string): Promise<MoviesResponse> {
    const response = await fetch(
      `${this.baseUrl}${endpoint}?api_key=${this.apiKey}&language=en-US&page=1`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    return response.json();
  }

  async getNowPlaying(): Promise<Movie[]> {
    const data = await this.fetchFromTMDB(TMDB_ENDPOINTS.NOW_PLAYING);
    return data.results;
  }

  async getUpcoming(): Promise<Movie[]> {
    const data = await this.fetchFromTMDB(TMDB_ENDPOINTS.UPCOMING);
    return data.results;
  }

  getPosterUrl(path: string | null, size: 'w200' | 'w300' | 'w400' | 'w500' = 'w500'): string {
    if (!path) {
      return 'https://via.placeholder.com/300x450/333333/ffffff?text=No+Image';
    }
    return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`;
  }
}

export const movieService = new MovieService();