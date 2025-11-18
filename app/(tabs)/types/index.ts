// app/(tabs)/types/index.ts

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'admin' | 'super-admin';
  joinDate: string;
  loyaltyPoints: number;
  cinemaId?: string;
}

export interface Movie {
  id: number;
  title: string;
  cast: string[];
  director: string;
  genre: string;
  language: string;
  duration: number;
  rating: number;
  description: string;
  poster: string;
  releaseDate: string;
  endDate: string;
  status: 'now-showing' | 'coming-soon';
}

export interface Cinema {
  id: string;
  name: string;
  location: string;
  screens: number;
  capacity: number;
  rows: number;
  columns: number;
}

export interface Showtime {
  id: number;
  movieId: number;
  cinemaId: string;
  date: string;
  time: string;
  price: number;
  bookedSeats: string[];
}

export interface Booking {
  id: number;
  userId: number;
  showtimeId: number;
  seats: string[];
  total: number;
  status: 'confirmed' | 'cancelled';
  bookingDate: string;
}

export interface AdminRequest {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  cinema: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CurrentBooking {
  movie: Movie | null;
  cinema: Cinema | null;
  showtime: Showtime | null;
  seats: string[];
  total: number;
}

export interface AppState {
  currentUser: User | null;
  currentView: string;
  movies: Movie[];
  cinemas: Cinema[];
  showtimes: Showtime[];
  bookings: Booking[];
  users: User[];
  adminRequests: AdminRequest[];
  currentBooking: CurrentBooking;
}