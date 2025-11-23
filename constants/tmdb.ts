export const TMDB_CONFIG = {
  API_KEY: '4694d05ccce51daf7b381a75831fe8f9', // Replace with your actual API key
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
} as const;

export const TMDB_ENDPOINTS = {
  NOW_PLAYING: '/movie/now_playing',
  UPCOMING: '/movie/upcoming',
  POPULAR: '/movie/popular',
  TOP_RATED: '/movie/top_rated',
} as const;