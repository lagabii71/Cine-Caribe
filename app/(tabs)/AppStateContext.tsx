// app/(tabs)/contexts/AppStateContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AppState, Cinema, Movie, Showtime, User } from './types';

interface AppStateContextType {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  showView: (viewName: string) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    currentView: 'home',
    movies: [],
    cinemas: [],
    showtimes: [],
    bookings: [],
    users: [],
    adminRequests: [],
    currentBooking: {
      movie: null,
      cinema: null,
      showtime: null,
      seats: [],
      total: 0
    }
  });

  // Load sample data on component mount
  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    // Sample cinemas
    const sampleCinemas: Cinema[] = [
      {
        id: 'cinema-1',
        name: 'Caribbean Cinemas - San Patricio',
        location: 'San Patricio Plaza, Guaynabo',
        screens: 8,
        capacity: 1200,
        rows: 10,
        columns: 12
      },
      {
        id: 'cinema-2',
        name: 'Caribbean Cinemas - Plaza Las Américas',
        location: 'Plaza Las Américas, San Juan',
        screens: 12,
        capacity: 1800,
        rows: 12,
        columns: 15
      },
      {
        id: 'cinema-3',
        name: 'Caribbean Cinemas - Mayagüez Mall',
        location: 'Mayagüez Mall, Mayagüez',
        screens: 6,
        capacity: 900,
        rows: 8,
        columns: 10
      }
    ];

    // Sample users
    const sampleUsers: User[] = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password',
        role: 'user',
        joinDate: '2023-01-15',
        loyaltyPoints: 150
      },
      {
        id: 2,
        name: 'Cinema Manager',
        email: 'manager@example.com',
        phone: '+1234567891',
        password: 'password',
        role: 'admin',
        joinDate: '2023-02-01',
        loyaltyPoints: 0,
        cinemaId: 'cinema-1'
      },
      {
        id: 3,
        name: 'Super Admin',
        email: 'admin@example.com',
        phone: '+1234567892',
        password: 'password',
        role: 'super-admin',
        joinDate: '2023-01-01',
        loyaltyPoints: 0
      }
    ];

    // Sample movies
    const sampleMovies: Movie[] = [
      {
        id: 1,
        title: 'Avatar: The Way of Water',
        cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
        director: 'James Cameron',
        genre: 'sci-fi',
        language: 'english',
        duration: 192,
        rating: 7.6,
        description: 'Jake Sully lives with his newfound family formed on the planet of Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their planet.',
        poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
        releaseDate: '2022-12-16',
        endDate: '2023-02-16',
        status: 'now-showing'
      },
      {
        id: 2,
        title: 'Black Panther: Wakanda Forever',
        cast: ['Letitia Wright', 'Lupita Nyong\'o', 'Danai Gurira'],
        director: 'Ryan Coogler',
        genre: 'action',
        language: 'english',
        duration: 161,
        rating: 7.1,
        description: 'Queen Ramonda, Shuri, M\'Baku, Okoye and the Dora Milaje fight to protect their nation from intervening world powers in the wake of King T\'Challa\'s death.',
        poster: 'https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg',
        releaseDate: '2022-11-11',
        endDate: '2023-01-11',
        status: 'now-showing'
      },
      {
        id: 3,
        title: 'The Batman',
        cast: ['Robert Pattinson', 'Zoë Kravitz', 'Jeffrey Wright'],
        director: 'Matt Reeves',
        genre: 'action',
        language: 'english',
        duration: 176,
        rating: 7.8,
        description: 'When the Riddler, a sadistic serial killer, begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption and question his family\'s involvement.',
        poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        releaseDate: '2022-03-04',
        endDate: '2023-05-04',
        status: 'now-showing'
      }
    ];

    // Sample showtimes
    const sampleShowtimes: Showtime[] = [
      {
        id: 1,
        movieId: 1,
        cinemaId: 'cinema-1',
        date: '2024-01-15',
        time: '14:30',
        price: 12.5,
        bookedSeats: ['A1', 'A2', 'B5']
      },
      {
        id: 2,
        movieId: 1,
        cinemaId: 'cinema-2',
        date: '2024-01-15',
        time: '18:00',
        price: 14.5,
        bookedSeats: ['A3', 'B2']
      }
    ];

    setState(prev => ({
      ...prev,
      cinemas: sampleCinemas,
      users: sampleUsers,
      movies: sampleMovies,
      showtimes: sampleShowtimes
    }));
  };

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const showView = (viewName: string) => {
    updateState({ currentView: viewName });
  };

  return (
    <AppStateContext.Provider value={{ state, updateState, showView }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

;