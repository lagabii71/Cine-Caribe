import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppState } from './AppStateContext';

type Movie = {
  id: string | number;
  title: string;
  description: string;
  genre: string;
  rating?: string | number;
  poster?: string;
};

export default function MoviesScreen() {
  const { state, updateState } = useAppState();
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  useEffect(() => {
    const filterMovies = () => {
      let filtered = state.movies;

      if (selectedGenre) {
        filtered = filtered.filter(movie => movie.genre === selectedGenre);
      }

      if (searchQuery) {
        filtered = filtered.filter(movie => 
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredMovies(filtered);
    };

    filterMovies();
  }, [state.movies, searchQuery, selectedGenre]);

  const handleMoviePress = (movie: Movie) => {
    updateState({ 
      currentBooking: { ...state.currentBooking, movie: movie as any },
      currentView: 'movie-details'
    });
  };

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity 
      style={styles.movieCard}
      onPress={() => handleMoviePress(item)}
    >
      <Image source={{ uri: item.poster }} style={styles.moviePoster} />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{item.title}</Text>
        <View style={styles.movieMeta}>
          <Text style={styles.movieGenre}>{item.genre}</Text>
          <Text style={styles.movieRating}>⭐ {item.rating}</Text>
        </View>
        <Text style={styles.movieDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => handleMoviePress(item)}
        >
          <Text style={styles.bookButtonText}>View Details & Book</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreFilter}>
          <TouchableOpacity 
            style={[styles.genreButton, !selectedGenre && styles.genreButtonActive]}
            onPress={() => setSelectedGenre('')}
          >
            <Text style={[styles.genreText, !selectedGenre && styles.genreTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.genreButton, selectedGenre === 'action' && styles.genreButtonActive]}
            onPress={() => setSelectedGenre('action')}
          >
            <Text style={[styles.genreText, selectedGenre === 'action' && styles.genreTextActive]}>
              Action
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.genreButton, selectedGenre === 'comedy' && styles.genreButtonActive]}
            onPress={() => setSelectedGenre('comedy')}
          >
            <Text style={[styles.genreText, selectedGenre === 'comedy' && styles.genreTextActive]}>
              Comedy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.genreButton, selectedGenre === 'drama' && styles.genreButtonActive]}
            onPress={() => setSelectedGenre('drama')}
          >
            <Text style={[styles.genreText, selectedGenre === 'drama' && styles.genreTextActive]}>
              Drama
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredMovies}
        renderItem={renderMovieItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.moviesList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  genreFilter: {
    flexDirection: 'row',
  },
  genreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  genreButtonActive: {
    backgroundColor: '#e50914',
  },
  genreText: {
    color: '#666',
    fontWeight: '500',
  },
  genreTextActive: {
    color: 'white',
  },
  moviesList: {
    padding: 16,
  },
  movieCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moviePoster: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  movieInfo: {
    padding: 16,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  movieMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  movieGenre: {
    color: '#666',
  },
  movieRating: {
    color: '#666',
    fontWeight: '600',
  },
  movieDescription: {
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  bookButton: {
    backgroundColor: '#e50914',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});