// app/index.tsx (Home screen)
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useShoppingCart } from '../ShoppingCartContext';

const CUSTOM_COLORS = {
  primary: '#0c1e33',
  secondary: '#1e3a5c',
  accent: '#4a90e2',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  background: '#0c1e33',
  card: '#1a2d44',
  border: '#2d4a66',
  searchBg: '#1a2d44',
  searchText: '#ffffff',
  searchBorder: '#2d4a66',
};

// TMDB API Configuration
const TMDB_API_KEY = '4694d05ccce51daf7b381a75831fe8f9';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Sample cinemas and showtimes for booking
const CINEMAS = [
  { id: '1', name: 'Downtown Cinema', location: 'City Center' },
  { id: '2', name: 'Mall Cinema', location: 'Shopping Mall' },
  { id: '3', name: 'Premium Cinema', location: 'Entertainment District' },
];

const SHOWTIMES = ['10:00 AM', '1:30 PM', '4:00 PM', '7:00 PM', '9:30 PM'];

// Component for Movie Detail & Booking Modal
const MovieDetailModal = ({ 
  movie, 
  visible, 
  onClose 
}: { 
  movie: any, 
  visible: boolean, 
  onClose: () => void 
}) => {
  const router = useRouter();
  const { addToCart } = useShoppingCart();
  
  const [activeTab, setActiveTab] = useState<'info' | 'booking'>('info');
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedShowtime, setSelectedShowtime] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false); // Nuevo estado para controlar visibilidad
  const seatPrice = 12.50;

  // Don't render anything if no movie is selected
  if (!movie) {
    return null;
  }

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

  const handleSeatSelection = (seat: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seat)) {
        return prev.filter(s => s !== seat);
      } else {
        return [...prev, seat];
      }
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const bookTickets = () => {
    if (!selectedCinema || !selectedShowtime || selectedSeats.length === 0) {
      Alert.alert('Error', 'Please select cinema, showtime, and at least one seat.');
      return;
    }

    const cinema = CINEMAS.find(c => c.id === selectedCinema);
    
    // Create the booking item
    const bookingItem = {
      movie: {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
      },
      cinema: cinema?.name || 'Unknown Cinema',
      showtime: selectedShowtime,
      date: selectedDate.toISOString(),
      seats: [...selectedSeats],
      total: selectedSeats.length * seatPrice,
    };

    // Add to cart
    addToCart(bookingItem);
    
    // Show success message with rewards points
    const pointsEarned = selectedSeats.length * 10;
    Alert.alert(
      'Added to Cart!',
      `✅ Successfully added ${selectedSeats.length} ticket(s) for "${movie.title}" to your cart.\n\n🎟️ You've earned ${pointsEarned} reward points!\n💰 Your points will be added to your account.`,
      [
        { 
          text: 'Continue Browsing', 
          onPress: () => {
            // Reset selections
            setSelectedCinema('');
            setSelectedShowtime('');
            setSelectedSeats([]);
            setActiveTab('info');
            setShowDatePicker(false);
          }
        },
        { 
          text: 'View Cart', 
          onPress: () => {
            onClose();
            router.push('/cart');
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{movie.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'info' && styles.activeTabButton
              ]}
              onPress={() => {
                setActiveTab('info');
                setShowDatePicker(false);
              }}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'info' && styles.activeTabText
              ]}>
                Movie Info
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'booking' && styles.activeTabButton
              ]}
              onPress={() => {
                setActiveTab('booking');
                setShowDatePicker(false);
              }}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'booking' && styles.activeTabText
              ]}>
                Book Tickets
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Movie Info Tab */}
            {activeTab === 'info' && (
              <View style={styles.infoTab}>
                <Image
                  source={{ 
                    uri: movie.backdrop_path 
                      ? `${TMDB_IMAGE_BASE}/w780${movie.backdrop_path}`
                      : 'https://via.placeholder.com/780x439/1a2d44/ffffff?text=No+Image'
                  }}
                  style={styles.modalImage}
                  contentFit="cover"
                />
                
                <View style={styles.infoSection}>
                  <Text style={styles.infoTitle}>Overview</Text>
                  <Text style={styles.infoText}>
                    {movie.overview || 'No description available.'}
                  </Text>
                </View>

                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Rating</Text>
                    <Text style={styles.detailValue}>
                      ★ {movie.vote_average?.toFixed(1) || 'N/A'}/10
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Release Date</Text>
                    <Text style={styles.detailValue}>
                      {movie.release_date || 'TBA'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Language</Text>
                    <Text style={styles.detailValue}>
                      {movie.original_language?.toUpperCase() || 'EN'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Popularity</Text>
                    <Text style={styles.detailValue}>
                      {Math.round(movie.popularity || 0)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Booking Tab */}
            {activeTab === 'booking' && (
              <View style={styles.bookingTab}>
                {/* Calendar - Date Selection */}
                <View style={styles.bookingSection}>
                  <Text style={styles.sectionTitle}>Select Date</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(!showDatePicker)}
                  >
                    <Text style={styles.dateButtonText}>📅 {formatDate(selectedDate)}</Text>
                    <Text style={styles.dateButtonSubtext}>
                      {showDatePicker ? 'Tap to hide calendar' : 'Tap to change date'}
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Custom Date Picker - Solo se muestra cuando showDatePicker es true */}
                  {showDatePicker && (
                    <CustomDatePicker
                      selectedDate={selectedDate}
                      onDateChange={(date) => {
                        setSelectedDate(date);
                        setShowDatePicker(false);
                      }}
                      minDate={new Date()}
                      maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
                    />
                  )}
                </View>

                {/* Resto del código de Booking Tab... */}
                {/* Cinema Selection */}
                <View style={styles.bookingSection}>
                  <Text style={styles.sectionTitle}>Select Cinema</Text>
                  <View style={styles.cinemaContainer}>
                    {CINEMAS.map(cinema => (
                      <TouchableOpacity
                        key={cinema.id}
                        style={[
                          styles.cinemaButton,
                          selectedCinema === cinema.id && styles.selectedCinemaButton
                        ]}
                        onPress={() => setSelectedCinema(cinema.id)}
                      >
                        <Text style={[
                          styles.cinemaName,
                          selectedCinema === cinema.id && styles.selectedCinemaText
                        ]}>
                          {cinema.name}
                        </Text>
                        <Text style={[
                          styles.cinemaLocation,
                          selectedCinema === cinema.id && styles.selectedCinemaText
                        ]}>
                          {cinema.location}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Showtime Selection */}
                <View style={styles.bookingSection}>
                  <Text style={styles.sectionTitle}>Select Showtime</Text>
                  <View style={styles.showtimeContainer}>
                    {SHOWTIMES.map(time => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.showtimeButton,
                          selectedShowtime === time && styles.selectedShowtimeButton
                        ]}
                        onPress={() => setSelectedShowtime(time)}
                      >
                        <Text style={[
                          styles.showtimeText,
                          selectedShowtime === time && styles.selectedShowtimeText
                        ]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Seat Selection */}
                <View style={styles.bookingSection}>
                  <Text style={styles.sectionTitle}>
                    Select Seats (${seatPrice.toFixed(2)} each)
                  </Text>
                  <View style={styles.seatsContainer}>
                    <View style={styles.screenIndicator}>
                      <Text style={styles.screenText}>SCREEN</Text>
                    </View>
                    <View style={styles.seatsGrid}>
                      {generateSeats().map(seat => (
                        <TouchableOpacity
                          key={seat}
                          style={[
                            styles.seatButton,
                            selectedSeats.includes(seat) && styles.selectedSeatButton
                          ]}
                          onPress={() => handleSeatSelection(seat)}
                        >
                          <Text style={[
                            styles.seatText,
                            selectedSeats.includes(seat) && styles.selectedSeatText
                          ]}>
                            {seat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Booking Summary */}
                {(selectedCinema || selectedShowtime || selectedSeats.length > 0) && (
                  <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Booking Summary</Text>
                    
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Date:</Text>
                      <Text style={styles.summaryValue}>{formatDate(selectedDate)}</Text>
                    </View>
                    
                    {selectedCinema && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Cinema:</Text>
                        <Text style={styles.summaryValue}>
                          {CINEMAS.find(c => c.id === selectedCinema)?.name}
                        </Text>
                      </View>
                    )}
                    
                    {selectedShowtime && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Showtime:</Text>
                        <Text style={styles.summaryValue}>{selectedShowtime}</Text>
                      </View>
                    )}
                    
                    {selectedSeats.length > 0 && (
                      <>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Seats:</Text>
                          <Text style={styles.summaryValue}>
                            {selectedSeats.join(', ')}
                          </Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Tickets:</Text>
                          <Text style={styles.summaryValue}>{selectedSeats.length}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Total:</Text>
                          <Text style={styles.summaryTotal}>
                            ${(selectedSeats.length * seatPrice).toFixed(2)}
                          </Text>
                        </View>
                        <View style={[styles.summaryRow, styles.rewardsRow]}>
                          <Text style={styles.summaryLabel}>Reward Points:</Text>
                          <Text style={styles.rewardsText}>
                            +{selectedSeats.length * 10} points
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            {activeTab === 'booking' && (
              <TouchableOpacity
                style={[
                  styles.bookButton,
                  (!selectedCinema || !selectedShowtime || selectedSeats.length === 0) && 
                  styles.bookButtonDisabled
                ]}
                onPress={bookTickets}
                disabled={!selectedCinema || !selectedShowtime || selectedSeats.length === 0}
              >
                <Text style={styles.bookButtonText}>
                  Book Now (${selectedSeats.length > 0 ? (selectedSeats.length * seatPrice).toFixed(2) : '0.00'})
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.closeActionButton}
              onPress={() => {
                setShowDatePicker(false);
                onClose();
              }}
            >
              <Text style={styles.closeActionText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Custom Date Picker Component - CORREGIDO
const CustomDatePicker = ({ 
  selectedDate, 
  onDateChange,
  minDate = new Date(),
  maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
}: { 
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  // Generate days for the current month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigate months
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Check if date is selectable
  const isDateSelectable = (date: Date) => {
    // Set hours to 0 for accurate comparison
    const minDateCopy = new Date(minDate);
    const maxDateCopy = new Date(maxDate);
    const dateCopy = new Date(date);
    
    minDateCopy.setHours(0, 0, 0, 0);
    maxDateCopy.setHours(0, 0, 0, 0);
    dateCopy.setHours(0, 0, 0, 0);
    
    return dateCopy >= minDateCopy && dateCopy <= maxDateCopy;
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if date is selected
  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const selectable = isDateSelectable(date);
      const today = isToday(date);
      const selected = isSelected(date);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            today && styles.calendarDayToday,
            selected && styles.calendarDaySelected,
            !selectable && styles.calendarDayDisabled
          ]}
          onPress={() => {
            if (selectable) {
              onDateChange(date);
            }
          }}
          disabled={!selectable}
        >
          <Text style={[
            styles.calendarDayText,
            today && styles.calendarDayTodayText,
            selected && styles.calendarDaySelectedText,
            !selectable && styles.calendarDayDisabledText
          ]}>
            {day}
          </Text>
          {today && !selected && <View style={styles.todayIndicator} />}
        </TouchableOpacity>
      );
    }

    return days;
  };

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.customDatePickerContainer}>
      <View style={styles.calendarContainer}>
        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthNavButton}>
            <Text style={styles.monthNavText}>‹</Text>
          </TouchableOpacity>
          
          <Text style={styles.calendarTitle}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          
          <TouchableOpacity onPress={goToNextMonth} style={styles.monthNavButton}>
            <Text style={styles.monthNavText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Week Days */}
        <View style={styles.weekDaysContainer}>
          {weekDays.map((day) => (
            <Text key={day} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>

        {/* Calendar Days Grid */}
        <View style={styles.calendarGrid}>
          {renderCalendarDays()}
        </View>

        {/* Footer Actions */}
        <View style={styles.calendarFooter}>
          <TouchableOpacity
            style={styles.todayButton}
            onPress={() => {
              const today = new Date();
              if (isDateSelectable(today)) {
                onDateChange(today);
              }
            }}
          >
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.closeCalendarButton}
            onPress={() => onDateChange(selectedDate)} // Just pass the current selected date
          >
            <Text style={styles.closeCalendarText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
export default function HomeScreen() {
  const router = useRouter();
  const [nowPlayingMovies, setNowPlayingMovies] = useState<any[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<any[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTablet, setIsTablet] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [showMovieModal, setShowMovieModal] = useState(false);
  
  const featuredFlatListRef = useRef<FlatList<any> | null>(null);
  const slideInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const screenWidth = Dimensions.get('window').width;

  // Check screen size for responsive layout
  const checkScreenSize = () => {
    const { width } = Dimensions.get('window');
    setIsTablet(width >= 768); // Tablet/PC breakpoint
  };

  // Fetch now playing movies from TMDB
  const fetchNowPlaying = async () => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`
      );
      const data = await response.json();
      const movies = data.results?.slice(0, 10) || [];
      setNowPlayingMovies(movies);
      
      // Set featured movies from now playing (top 5 for rotating slideshow)
      setFeaturedMovies(movies.slice(0, 5));
      
      return movies;
    } catch (error) {
      console.error('Error fetching now playing movies:', error);
      setNowPlayingMovies([]);
      return [];
    }
  };

  // Fetch upcoming movies from TMDB
  const fetchUpcoming = async () => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`
      );
      const data = await response.json();
      const movies = data.results?.slice(0, 10) || [];
      setUpcomingMovies(movies);
      return movies;
    } catch (error) {
      console.error('Error fetching upcoming movies:', error);
      setUpcomingMovies([]);
      return [];
    }
  };

  // Combine and filter movies for search
  const getAllMovies = () => {
    return [...nowPlayingMovies, ...upcomingMovies];
  };

  // Search function
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredMovies([]);
      return;
    }

    const allMovies = getAllMovies();
    const filtered = allMovies.filter(movie =>
      movie?.title?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMovies(filtered);
  };

  // Auto-rotate featured movies slideshow
  const startSlideshow = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }

    slideInterval.current = setInterval(() => {
      setActiveSlide(prev => {
        const next = prev + 1;
        return next >= Math.min(featuredMovies.length, 5) ? 0 : next;
      });
      
      if (featuredFlatListRef.current && featuredMovies.length > 0) {
        const nextIndex = (activeSlide + 1) % Math.min(featuredMovies.length, 5);
        featuredFlatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }
    }, 4000);
  };

  // Handle slide change
  const handleSlideChange = (index: number) => {
    setActiveSlide(index);
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
    startSlideshow();
  };

  // Initialize data
  useEffect(() => {
    checkScreenSize();
    const dimsSubscription = Dimensions.addEventListener('change', checkScreenSize);

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchNowPlaying(), fetchUpcoming()]);
      setLoading(false);
    };

    fetchData();

    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
      dimsSubscription?.remove?.();
    };
  }, []);

  // Start slideshow when featured movies are loaded
  useEffect(() => {
    if (featuredMovies.length > 0) {
      startSlideshow();
    }
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [featuredMovies]);

  // Open movie detail modal
  const openMovieDetail = (movie: any) => {
    setSelectedMovie(movie);
    setShowMovieModal(true);
  };

  // Navigate to movies booking page
  const navigateToMoviesPage = () => {
    router.push('./movies');
  };

  // Render featured movie slide
  const renderFeaturedSlide = ({ item, index }: { item: any; index: number }) => {
    if (!item) return null;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.featuredSlide}
        onPress={() => openMovieDetail(item)}
      >
        <Image
          source={{ 
            uri: item.backdrop_path 
              ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}`
              : 'https://via.placeholder.com/1280x720/1a2d44/ffffff?text=No+Image'
          }}
          style={styles.featuredImage}
          contentFit="cover"
        />
        <View style={styles.featuredOverlay} />
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle}>{item.title}</Text>
          <View style={styles.featuredInfo}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>★ {item.vote_average?.toFixed(1) || 'N/A'}</Text>
            </View>
            <Text style={styles.featuredSubtitle}>
              {item.release_date?.split('-')[0] || 'N/A'} • {item.original_language?.toUpperCase() || 'EN'}
            </Text>
          </View>
          <Text style={styles.featuredOverview} numberOfLines={2}>
            {item.overview || 'No description available.'}
          </Text>
          <View style={styles.featuredActions}>
            <TouchableOpacity 
              style={styles.bookNowButton}
              onPress={() => openMovieDetail(item)}
            >
              <Text style={styles.bookNowText}>Book Now</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => openMovieDetail(item)}
            >
              <Text style={styles.infoButtonText}>More Info</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render movie grid item
  const renderMovieItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => openMovieDetail(item)}
    >
      <Image
        source={{ 
          uri: item.poster_path 
            ? `${TMDB_IMAGE_BASE}/w342${item.poster_path}`
            : 'https://via.placeholder.com/342x513/1a2d44/ffffff?text=No+Image'
        }}
        style={styles.moviePoster}
        contentFit="cover"
      />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.movieDetails}>
          <Text style={styles.movieRating}>★ {item.vote_average?.toFixed(1) || 'N/A'}</Text>
          <Text style={styles.movieYear}>
            {item.release_date?.split('-')[0] || 'N/A'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.movieBookButton}
          onPress={() => openMovieDetail(item)}
        >
          <Text style={styles.movieBookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CUSTOM_COLORS.accent} />
        <Text style={styles.loadingText}>Loading movies...</Text>
      </View>
    );
  }

  return (
    <>
      <MovieDetailModal
        movie={selectedMovie}
        visible={showMovieModal}
        onClose={() => setShowMovieModal(false)}
      />

      <ParallaxScrollView
        headerBackgroundColor={{ light: CUSTOM_COLORS.primary, dark: CUSTOM_COLORS.primary }}
        headerImage={
          <View style={styles.featuredContainer}>
            {/* Rotating featured movies at the top */}
            <FlatList
              ref={featuredFlatListRef}
              data={featuredMovies.slice(0, 5)}
              renderItem={renderFeaturedSlide}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                handleSlideChange(index);
              }}
              keyExtractor={(item) => `featured-${item.id}`}
            />
            
            {/* Pagination dots */}
            {featuredMovies.length > 0 && (
              <View style={styles.pagination}>
                {featuredMovies.slice(0, 5).map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.paginationDot,
                      { backgroundColor: index === activeSlide ? CUSTOM_COLORS.accent : 'rgba(255,255,255,0.5)' }
                    ]}
                    onPress={() => {
                      featuredFlatListRef.current?.scrollToIndex({ index, animated: true });
                      handleSlideChange(index);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        }
      >
        <View style={styles.container}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Now Playing & Coming Soon movies..."
              placeholderTextColor={CUSTOM_COLORS.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery ? (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.searchIcon}>🔍</Text>
            )}
          </View>

          {/* Search Results */}
          {searchQuery.trim() !== '' && (
            <View style={styles.searchResults}>
              <Text style={styles.sectionTitle}>Search Results ({filteredMovies.length})</Text>
              {filteredMovies.length > 0 ? (
                <View style={[
                  styles.movieGrid,
                  isTablet && styles.movieGridTablet
                ]}>
                  {filteredMovies.map((item) => (
                    <View 
                      key={`search-${item.id}`} 
                      style={[
                        styles.movieCardWrapper,
                        isTablet ? styles.movieCardTablet : styles.movieCardPhone
                      ]}
                    >
                      {renderMovieItem({ item })}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noResults}>{`No movies found for "${searchQuery}"`}</Text>
              )}
            </View>
          )}

          {/* Now Playing Movies */}
          {searchQuery.trim() === '' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Now Playing in Theaters</Text>
                <TouchableOpacity onPress={navigateToMoviesPage}>
                  <Text style={styles.seeAllButton}>See All</Text>
                </TouchableOpacity>
              </View>
              
              {nowPlayingMovies.length > 0 ? (
                <View style={[
                  styles.movieGrid,
                  isTablet && styles.movieGridTablet
                ]}>
                  {nowPlayingMovies.map((item) => (
                    <View 
                      key={`now-${item.id}`} 
                      style={[
                        styles.movieCardWrapper,
                        isTablet ? styles.movieCardTablet : styles.movieCardPhone
                      ]}
                    >
                      {renderMovieItem({ item })}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noResults}>No movies currently playing</Text>
              )}

              {/* Coming Soon Movies */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Coming Soon</Text>
                <TouchableOpacity onPress={navigateToMoviesPage}>
                  <Text style={styles.seeAllButton}>See All</Text>
                </TouchableOpacity>
              </View>
              
              {upcomingMovies.length > 0 ? (
                <View style={[
                  styles.movieGrid,
                  isTablet && styles.movieGridTablet
                ]}>
                  {upcomingMovies.map((item) => (
                    <View 
                      key={`upcoming-${item.id}`} 
                      style={[
                        styles.movieCardWrapper,
                        isTablet ? styles.movieCardTablet : styles.movieCardPhone
                      ]}
                    >
                      {renderMovieItem({ item })}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noResults}>No upcoming movies</Text>
              )}
            </>
          )}
        </View>
      </ParallaxScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  // Loading styles
  loadingContainer: {
    flex: 1,
    backgroundColor: CUSTOM_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: CUSTOM_COLORS.textSecondary,
    marginTop: 12,
    fontSize: 16,
  },

  // Container
  container: {
    flex: 1,
    padding: 16,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },

  // Featured Movies Slider
  featuredContainer: {
    height: 500,
    position: 'relative',
  },
  featuredSlide: {
    width: Dimensions.get('window').width,
    height: 500,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 30, 51, 0.7)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 32,
    backgroundColor: 'rgba(12, 30, 51, 0.9)',
  },
  featuredTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    backgroundColor: CUSTOM_COLORS.accent,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  ratingText: {
    color: CUSTOM_COLORS.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  featuredSubtitle: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 16,
  },
  featuredOverview: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  featuredActions: {
    flexDirection: 'row',
    gap: 12,
  },
  bookNowButton: {
    backgroundColor: CUSTOM_COLORS.accent,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  bookNowText: {
    color: CUSTOM_COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: CUSTOM_COLORS.accent,
  },
  infoButtonText: {
    color: CUSTOM_COLORS.accent,
    fontWeight: 'bold',
    fontSize: 16,
  },
  pagination: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: CUSTOM_COLORS.searchBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: CUSTOM_COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: CUSTOM_COLORS.searchText,
    padding: 16,
    fontSize: 16,
    height: 56,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchIcon: {
    fontSize: 18,
    color: CUSTOM_COLORS.textSecondary,
    padding: 8,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 32,
  },
  sectionTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  seeAllButton: {
    color: CUSTOM_COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  },

  // Movie Grid
  movieGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  movieGridTablet: {
    justifyContent: 'flex-start',
  },
  movieCardWrapper: {
    marginBottom: 24,
  },
  movieCardPhone: {
    width: '48%',
  },
  movieCardTablet: {
    width: '23%',
    marginRight: '2%',
  },
  movieCard: {
    backgroundColor: CUSTOM_COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    height: 380,
  },
  moviePoster: {
    width: '100%',
    height: 250,
  },
  movieInfo: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  movieTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  movieDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  movieRating: {
    color: CUSTOM_COLORS.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  movieYear: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 14,
  },
  movieBookButton: {
    backgroundColor: CUSTOM_COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  movieBookButtonText: {
    color: CUSTOM_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },

  // Search Results
  searchResults: {
    marginBottom: 24,
  },
  noResults: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 60,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 30, 51, 0.95)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    backgroundColor: CUSTOM_COLORS.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: CUSTOM_COLORS.border,
  },
  modalTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: CUSTOM_COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: CUSTOM_COLORS.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: CUSTOM_COLORS.accent,
  },
  tabText: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: CUSTOM_COLORS.accent,
  },
  modalContent: {
    flex: 1,
  },
  infoTab: {
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 20,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: CUSTOM_COLORS.card,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  detailLabel: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  detailValue: {
    color: CUSTOM_COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Booking Tab Styles
  bookingTab: {
    padding: 20,
  },
  bookingSection: {
    marginBottom: 28,
  },
  // Date Selection Styles
  dateButton: {
    backgroundColor: CUSTOM_COLORS.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: CUSTOM_COLORS.border,
  },
  dateButtonText: {
    color: CUSTOM_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateButtonSubtext: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 14,
  },
  // Custom Date Picker Styles
  customDatePickerContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: CUSTOM_COLORS.primary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: CUSTOM_COLORS.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calendarContainer: {
    width: '100%',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: CUSTOM_COLORS.card,
  },
  monthNavText: {
    color: CUSTOM_COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  calendarTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekDayText: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarDayEmpty: {
    width: 40,
    height: 40,
    margin: 4,
  },
  calendarDay: {
    width: 40,
    height: 40,
    margin: 4,
    borderRadius: 20,
    backgroundColor: CUSTOM_COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: CUSTOM_COLORS.accent,
  },
  calendarDaySelected: {
    backgroundColor: CUSTOM_COLORS.accent,
  },
  calendarDayDisabled: {
    backgroundColor: CUSTOM_COLORS.border,
    opacity: 0.5,
  },
  calendarDayText: {
    color: CUSTOM_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  calendarDayTodayText: {
    color: CUSTOM_COLORS.accent,
  },
  calendarDaySelectedText: {
    color: CUSTOM_COLORS.primary,
    fontWeight: 'bold',
  },
  calendarDayDisabledText: {
    color: CUSTOM_COLORS.textSecondary,
  },
  todayIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CUSTOM_COLORS.accent,
  },
  calendarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: CUSTOM_COLORS.border,
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: CUSTOM_COLORS.accent,
    borderRadius: 8,
  },
  todayButtonText: {
    color: CUSTOM_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  closeCalendarButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: CUSTOM_COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CUSTOM_COLORS.border,
  },
  closeCalendarText: {
    color: CUSTOM_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  cinemaContainer: {
    gap: 12,
  },
  cinemaButton: {
    backgroundColor: CUSTOM_COLORS.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCinemaButton: {
    backgroundColor: CUSTOM_COLORS.accent,
    borderColor: CUSTOM_COLORS.accent,
  },
  cinemaName: {
    color: CUSTOM_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cinemaLocation: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 14,
  },
  selectedCinemaText: {
    color: CUSTOM_COLORS.primary,
  },
  showtimeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  showtimeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: CUSTOM_COLORS.card,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedShowtimeButton: {
    backgroundColor: CUSTOM_COLORS.accent,
    borderColor: CUSTOM_COLORS.accent,
  },
  showtimeText: {
    color: CUSTOM_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedShowtimeText: {
    color: CUSTOM_COLORS.primary,
  },
  seatsContainer: {
    alignItems: 'center',
  },
  screenIndicator: {
    width: '80%',
    backgroundColor: CUSTOM_COLORS.border,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  screenText: {
    color: CUSTOM_COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  seatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  seatButton: {
    width: 36,
    height: 36,
    backgroundColor: CUSTOM_COLORS.card,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSeatButton: {
    backgroundColor: CUSTOM_COLORS.accent,
    borderColor: CUSTOM_COLORS.accent,
  },
  seatText: {
    color: CUSTOM_COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  selectedSeatText: {
    color: CUSTOM_COLORS.primary,
  },
  summaryContainer: {
    backgroundColor: CUSTOM_COLORS.card,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  summaryTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rewardsRow: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  summaryLabel: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 15,
  },
  summaryValue: {
    color: CUSTOM_COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  summaryTotal: {
    color: CUSTOM_COLORS.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  rewardsText: {
    color: CUSTOM_COLORS.accent,
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: CUSTOM_COLORS.border,
    gap: 12,
  },
  bookButton: {
    backgroundColor: CUSTOM_COLORS.accent,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: CUSTOM_COLORS.border,
    opacity: 0.7,
  },
  bookButtonText: {
    color: CUSTOM_COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeActionButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: CUSTOM_COLORS.border,
  },
  closeActionText: {
    color: CUSTOM_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});