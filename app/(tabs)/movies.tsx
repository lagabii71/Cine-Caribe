import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme
} from 'react-native';
import { useShoppingCart } from '../ShoppingCartContext';
// Types
interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  overview: string;
  release_date: string;
  genre_ids: number[];
}

interface BookingItem {
  id: string;
  movie: Movie;
  showtime: string;
  seats: string[];
  total: number;
  cinema: string;
}

// Shopping Cart Context (you'll need to create this)

const { width: screenWidth } = Dimensions.get('window');

// TMDB API Configuration
const TMDB_API_KEY = '4694d05ccce51daf7b381a75831fe8f9';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

// Sample cinemas and showtimes
const CINEMAS = [
  { id: '1', name: 'Downtown Cinema', location: 'City Center' },
  { id: '2', name: 'Mall Cinema', location: 'Shopping Mall' },
  { id: '3', name: 'Premium Cinema', location: 'Entertainment District' },
];

const SHOWTIMES = ['10:00 AM', '1:30 PM', '4:00 PM', '7:00 PM', '9:30 PM'];

// Custom colors matching your aesthetic
const CUSTOM_COLORS = {
  primary: '#0c1e33', // Dark blue from your header
  secondary: '#1e3a5c', // Lighter blue
  accent: '#4a90e2', // Bright blue for highlights
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  background: '#0c1e33',
  card: '#1a2d44',
  border: '#2d4a66',
};



export default function Movies() {
  const colorScheme = useColorScheme();
  const { addToCart, cart } = useShoppingCart();
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<'now-playing' | 'upcoming'>('now-playing');
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Booking states
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedShowtime, setSelectedShowtime] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seatPrice] = useState(12.50);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      
      const nowPlayingResponse = await fetch(
        `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`
      );
      const nowPlayingData = await nowPlayingResponse.json();
      
      const upcomingResponse = await fetch(
        `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`
      );
      const upcomingData = await upcomingResponse.json();
      
      setNowPlaying(nowPlayingData.results || []);
      setUpcoming(upcomingData.results || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
      Alert.alert('Error', 'Failed to load movies. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const searchMovies = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`
      );
      const data = await response.json();
      setSearchResults(data.results || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching movies:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchMovies(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchMovies]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMovies();
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSearchItemPress = (movie: Movie) => {
    setSearchQuery(movie.title);
    setShowSearchResults(false);
    Keyboard.dismiss();
    startBookingProcess(movie);
  };

  const startBookingProcess = (movie: Movie) => {
    setSelectedMovie(movie);
    setSelectedCinema('');
    setSelectedShowtime('');
    setSelectedSeats([]);
    setShowBookingModal(true);
  };

  const handleSeatSelection = (seat: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seat)) {
        return prev.filter(s => s !== seat);
      } else {
        return [...prev, seat];
      }
    });
  };

  const generateSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seatsPerRow = 8;
    const seats = [];

    for (let row of rows) {
      for (let i = 1; i <= seatsPerRow; i++) {
        seats.push(`${row}${i}`);
      }
    }
    return seats;
  };

  const addToShoppingCart = () => {
    if (!selectedMovie || !selectedCinema || !selectedShowtime || selectedSeats.length === 0) {
      Alert.alert('Error', 'Please select cinema, showtime, and at least one seat.');
      return;
    }

    const cinema = CINEMAS.find(c => c.id === selectedCinema);
    const bookingItem: BookingItem = {
      id: Date.now().toString(),
      movie: selectedMovie,
      showtime: selectedShowtime,
      seats: [...selectedSeats],
      total: selectedSeats.length * seatPrice,
      cinema: cinema?.name || 'Unknown Cinema',
    };

    addToCart(bookingItem);
    setShowBookingModal(false);
    Alert.alert(
      'Added to Cart',
      `Added ${selectedSeats.length} ticket(s) for ${selectedMovie.title} to your cart.`,
      [{ text: 'OK' }]
    );
  };

  const renderSearchItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={[styles.searchItem, { backgroundColor: CUSTOM_COLORS.card }]}
      onPress={() => handleSearchItemPress(item)}
    >
      <Image
        source={{ 
          uri: item.poster_path 
            ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
            : 'https://via.placeholder.com/100x150/1a2d44/ffffff?text=No+Image'
        }}
        style={styles.searchPoster}
        contentFit="cover"
      />
      <View style={styles.searchInfo}>
        <Text style={[styles.searchTitle, { color: CUSTOM_COLORS.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.searchYear, { color: CUSTOM_COLORS.textSecondary }]}>
          {item.release_date ? new Date(item.release_date).getFullYear() : 'TBA'}
        </Text>
        <Text style={[styles.searchRating, { color: CUSTOM_COLORS.accent }]}>
          ⭐ {item.vote_average.toFixed(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity 
      style={[styles.movieCard, { backgroundColor: CUSTOM_COLORS.card }]}
      onPress={() => startBookingProcess(item)}
    >
      <Image
        source={{ 
          uri: item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : 'https://via.placeholder.com/300x450/1a2d44/ffffff?text=No+Image'
        }}
        style={styles.poster}
        contentFit="cover"
      />
      <View style={styles.movieInfo}>
        <Text style={[styles.title, { color: CUSTOM_COLORS.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.metaContainer}>
          <Text style={[styles.rating, { color: CUSTOM_COLORS.accent }]}>
            ⭐ {item.vote_average.toFixed(1)}
          </Text>
          <Text style={[styles.releaseDate, { color: CUSTOM_COLORS.textSecondary }]}>
            {new Date(item.release_date).getFullYear()}
          </Text>
        </View>
        <Text style={[styles.description, { color: CUSTOM_COLORS.textSecondary }]} numberOfLines={3}>
          {item.overview || 'No description available.'}
        </Text>
        <TouchableOpacity 
          style={[styles.bookButton, { backgroundColor: CUSTOM_COLORS.accent }]}
          onPress={() => startBookingProcess(item)}
        >
          <Text style={styles.bookButtonText}>Book Tickets</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const currentData = activeSection === 'now-playing' ? nowPlaying : upcoming;

  if (loading && !refreshing) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: CUSTOM_COLORS.primary, dark: CUSTOM_COLORS.primary }}
        headerImage={<View />}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CUSTOM_COLORS.accent} />
          <ThemedText style={[styles.loadingText, { color: CUSTOM_COLORS.text }]}>
            Loading movies...
          </ThemedText>
        </View>
      </ParallaxScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: CUSTOM_COLORS.primary }}>
      {/* Search Results Modal */}
      <Modal
        visible={showSearchResults}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSearchResults(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSearchResults(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.searchResultsContainer, { backgroundColor: CUSTOM_COLORS.primary }]}>
                <View style={styles.searchHeader}>
                  <Text style={[styles.searchResultsTitle, { color: CUSTOM_COLORS.text }]}>
                    Search Results
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setShowSearchResults(false)}
                    style={styles.closeButton}
                  >
                    <Text style={[styles.closeButtonText, { color: CUSTOM_COLORS.text }]}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                {searchLoading ? (
                  <View style={styles.searchLoading}>
                    <ActivityIndicator size="small" color={CUSTOM_COLORS.accent} />
                    <Text style={[styles.searchLoadingText, { color: CUSTOM_COLORS.text }]}>
                      Searching...
                    </Text>
                  </View>
                ) : searchResults.length > 0 ? (
                  <FlatList
                    data={searchResults}
                    renderItem={renderSearchItem}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    style={styles.searchResultsList}
                  />
                ) : (
                  <View style={styles.noResults}>
                    <Text style={[styles.noResultsText, { color: CUSTOM_COLORS.textSecondary }]}>
                      No movies found for &quot;{searchQuery}&quot;
                    </Text>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.bookingContainer, { backgroundColor: CUSTOM_COLORS.primary }]}>
            <View style={styles.bookingHeader}>
              <Text style={[styles.bookingTitle, { color: CUSTOM_COLORS.text }]}>
                Book Tickets - {selectedMovie?.title}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowBookingModal(false)}
                style={styles.closeButton}
              >
                <Text style={[styles.closeButtonText, { color: CUSTOM_COLORS.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.bookingContent}>
              {/* Cinema Selection */}
              <View style={styles.bookingSection}>
                <Text style={[styles.sectionTitle, { color: CUSTOM_COLORS.text }]}>
                  Select Cinema
                </Text>
                <View style={styles.optionsContainer}>
                  {CINEMAS.map(cinema => (
                    <TouchableOpacity
                      key={cinema.id}
                      style={[
                        styles.optionButton,
                        { backgroundColor: CUSTOM_COLORS.card, borderColor: CUSTOM_COLORS.border },
                        selectedCinema === cinema.id && [styles.selectedOption, { backgroundColor: CUSTOM_COLORS.accent }]
                      ]}
                      onPress={() => setSelectedCinema(cinema.id)}
                    >
                      <Text style={[
                        styles.optionText,
                        { color: selectedCinema === cinema.id ? CUSTOM_COLORS.primary : CUSTOM_COLORS.text }
                      ]}>
                        {cinema.name}
                      </Text>
                      <Text style={[
                        styles.optionSubtext,
                        { color: selectedCinema === cinema.id ? CUSTOM_COLORS.primary : CUSTOM_COLORS.textSecondary }
                      ]}>
                        {cinema.location}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Showtime Selection */}
              <View style={styles.bookingSection}>
                <Text style={[styles.sectionTitle, { color: CUSTOM_COLORS.text }]}>
                  Select Showtime
                </Text>
                <View style={styles.optionsContainer}>
                  {SHOWTIMES.map(time => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeButton,
                        { backgroundColor: CUSTOM_COLORS.card, borderColor: CUSTOM_COLORS.border },
                        selectedShowtime === time && [styles.selectedOption, { backgroundColor: CUSTOM_COLORS.accent }]
                      ]}
                      onPress={() => setSelectedShowtime(time)}
                    >
                      <Text style={[
                        styles.timeText,
                        { color: selectedShowtime === time ? CUSTOM_COLORS.primary : CUSTOM_COLORS.text }
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Seat Selection */}
              <View style={styles.bookingSection}>
                <Text style={[styles.sectionTitle, { color: CUSTOM_COLORS.text }]}>
                  Select Seats (${seatPrice} each)
                </Text>
                <View style={styles.seatsContainer}>
                  <View style={[styles.screen, { backgroundColor: CUSTOM_COLORS.border }]}>
                    <Text style={[styles.screenText, { color: CUSTOM_COLORS.textSecondary }]}>SCREEN</Text>
                  </View>
                  <View style={styles.seatsGrid}>
                    {generateSeats().map(seat => (
                      <TouchableOpacity
                        key={seat}
                        style={[
                          styles.seat,
                          { backgroundColor: CUSTOM_COLORS.card, borderColor: CUSTOM_COLORS.border },
                          selectedSeats.includes(seat) && [styles.selectedSeat, { backgroundColor: CUSTOM_COLORS.accent }]
                        ]}
                        onPress={() => handleSeatSelection(seat)}
                      >
                        <Text style={[
                          styles.seatText,
                          { color: selectedSeats.includes(seat) ? CUSTOM_COLORS.primary : CUSTOM_COLORS.text }
                        ]}>
                          {seat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Booking Summary */}
              {selectedSeats.length > 0 && (
                <View style={[styles.summarySection, { backgroundColor: CUSTOM_COLORS.card }]}>
                  <Text style={[styles.sectionTitle, { color: CUSTOM_COLORS.text }]}>
                    Booking Summary
                  </Text>
                  <View style={styles.summaryItem}>
                    <Text style={{ color: CUSTOM_COLORS.text }}>Seats:</Text>
                    <Text style={{ color: CUSTOM_COLORS.text }}>{selectedSeats.join(', ')}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={{ color: CUSTOM_COLORS.text }}>Tickets:</Text>
                    <Text style={{ color: CUSTOM_COLORS.text }}>{selectedSeats.length}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={{ color: CUSTOM_COLORS.text }}>Total:</Text>
                    <Text style={{ color: CUSTOM_COLORS.accent, fontWeight: 'bold' }}>
                      ${(selectedSeats.length * seatPrice).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={[styles.bookingFooter, { borderTopColor: CUSTOM_COLORS.border }]}>
              <TouchableOpacity
                style={[
                  styles.addToCartButton,
                  { backgroundColor: selectedSeats.length > 0 ? CUSTOM_COLORS.accent : CUSTOM_COLORS.border }
                ]}
                onPress={addToShoppingCart}
                disabled={selectedSeats.length === 0}
              >
                <Text style={styles.addToCartText}>
                  Add to Cart ({selectedSeats.length} tickets)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ParallaxScrollView
        headerBackgroundColor={{ light: CUSTOM_COLORS.primary, dark: CUSTOM_COLORS.primary }}
        headerImage={<View/>}
      >
        <View style={styles.container}>
          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: CUSTOM_COLORS.primary }]}>
            <TextInput
              style={[styles.searchInput, { 
                color: CUSTOM_COLORS.text, 
                backgroundColor: CUSTOM_COLORS.card,
                borderColor: CUSTOM_COLORS.border 
              }]}
              placeholder="Search movies..."
              placeholderTextColor={CUSTOM_COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => {
                if (searchQuery.trim() && searchResults.length > 0) {
                  setShowSearchResults(true);
                }
              }}
            />
            {searchQuery ? (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
              >
                <Text style={[styles.clearButtonText, { color: CUSTOM_COLORS.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.searchIcon, { color: CUSTOM_COLORS.textSecondary }]}>🔍</Text>
            )}
          </View>

          {/* Section Toggle */}
          <View style={[styles.sectionToggle, { backgroundColor: CUSTOM_COLORS.card }]}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeSection === 'now-playing' && [styles.activeToggle, { backgroundColor: CUSTOM_COLORS.accent }]
              ]}
              onPress={() => setActiveSection('now-playing')}
            >
              <Text 
                style={[
                  styles.toggleText, 
                  { color: activeSection === 'now-playing' ? CUSTOM_COLORS.primary : CUSTOM_COLORS.text }
                ]}
              >
                Now Playing
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeSection === 'upcoming' && [styles.activeToggle, { backgroundColor: CUSTOM_COLORS.accent }]
              ]}
              onPress={() => setActiveSection('upcoming')}
            >
              <Text 
                style={[
                  styles.toggleText, 
                  { color: activeSection === 'upcoming' ? CUSTOM_COLORS.primary : CUSTOM_COLORS.text }
                ]}
              >
                Coming Soon
              </Text>
            </TouchableOpacity>
          </View>

          {/* Movies List */}
          <FlatList
            data={currentData}
            renderItem={renderMovieItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            onRefresh={onRefresh}
            refreshing={refreshing}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: CUSTOM_COLORS.textSecondary }]}>
                  No movies found.
                </Text>
              </View>
            }
          />
        </View>
      </ParallaxScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchIcon: {
    fontSize: 16,
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 30, 51, 0.9)',
    justifyContent: 'flex-end',
  },
  searchResultsContainer: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchResultsList: {
    flex: 1,
  },
  searchItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  searchPoster: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 12,
  },
  searchInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  searchYear: {
    fontSize: 14,
    marginBottom: 4,
  },
  searchRating: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  searchLoadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  // Section Toggle
  sectionToggle: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 25,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeToggle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Movie List
  listContainer: {
    paddingBottom: 20,
  },
  movieCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  poster: {
    width: '100%',
    height: 200,
  },
  movieInfo: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  releaseDate: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  bookButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#0c1e33',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  // Booking Modal
  bookingContainer: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d4a66',
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  bookingContent: {
    flex: 1,
    padding: 16,
  },
  bookingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: 'transparent',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionSubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  seatsContainer: {
    alignItems: 'center',
  },
  screen: {
    width: '80%',
    padding: 8,
    borderRadius: 4,
    marginBottom: 20,
  },
  screenText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  seatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  seat: {
    width: 30,
    height: 30,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  selectedSeat: {
    borderColor: 'transparent',
  },
  seatText: {
    fontSize: 10,
    fontWeight: '600',
  },
  summarySection: {
    padding: 16,
    borderRadius: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bookingFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  addToCartButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#0c1e33',
    fontWeight: 'bold',
    fontSize: 16,
  },
});