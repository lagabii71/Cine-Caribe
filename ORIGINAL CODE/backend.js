function startBookingProcess(movie, showtimeId) {
    const showtime = state.showtimes.find(st => st.id === showtimeId);
    const cinema = state.cinemas.find(c => c.id === showtime.cinemaId);

    if (!state.currentUser) {
        showNotification('Please login to book tickets', 'error');
        showView('login');
        return;
    }

    // Store current booking info
    state.currentBooking.movie = movie;
    state.currentBooking.showtime = showtime;
    state.currentBooking.cinema = cinema;
    state.currentBooking.seats = [];
    state.currentBooking.total = 0;

    // Update booking summary
    document.getElementById('booking-movie-title').textContent = `${movie.title} - ${cinema.name}`;
    document.getElementById('summary-movie').textContent = movie.title;
    document.getElementById('summary-cinema').textContent = cinema.name;
    document.getElementById('summary-showtime').textContent = `${showtime.date} at ${showtime.time}`;
    document.getElementById('summary-price').textContent = `$${showtime.price}`;

    // Reset summary
    document.getElementById('summary-seats').textContent = 'None selected';
    document.getElementById('summary-tickets').textContent = '0';
    document.getElementById('summary-total').textContent = '$0';

    // Render seats
    renderSeats();

    showView('booking');
}

function renderSeats() {
    const container = document.getElementById('seats-container');
    const cinema = state.currentBooking.cinema;
    const showtime = state.currentBooking.showtime;
    const rows = cinema.rows;
    const cols = cinema.columns;
    
    let seatsHTML = '';
    
    // Create seat layout
    for (let i = 0; i < rows; i++) {
        const rowLetter = String.fromCharCode(65 + i); // A, B, C, ...
        seatsHTML += '<div class="seat-row">';
        for (let j = 1; j <= cols; j++) {
            const seatId = `${rowLetter}${j}`;
            const isOccupied = showtime.bookedSeats && showtime.bookedSeats.includes(seatId);
            const isVip = i < 2; // First two rows are VIP
            
            let seatClass = 'seat';
            if (isOccupied) seatClass += ' occupied';
            if (isVip) seatClass += ' vip';
            if (state.currentBooking.seats.includes(seatId)) seatClass += ' selected';
            
            seatsHTML += `<div class="${seatClass}" data-seat="${seatId}">${seatId}</div>`;
        }
        seatsHTML += '</div>';
    }
    
    container.innerHTML = seatsHTML;
    
    // Add event listeners to seats
    container.querySelectorAll('.seat:not(.occupied)').forEach(seat => {
        seat.addEventListener('click', function() {
            const seatId = this.getAttribute('data-seat');
            toggleSeatSelection(seatId);
        });
    });
}

function toggleSeatSelection(seatId) {
    const index = state.currentBooking.seats.indexOf(seatId);
    if (index === -1) {
        // Add seat
        state.currentBooking.seats.push(seatId);
    } else {
        // Remove seat
        state.currentBooking.seats.splice(index, 1);
    }
    
    // Update UI
    const seatElement = document.querySelector(`.seat[data-seat="${seatId}"]`);
    if (seatElement) {
        seatElement.classList.toggle('selected');
    }
    
    // Update booking summary
    updateBookingSummary();
}

function updateBookingSummary() {
    const seatsCount = state.currentBooking.seats.length;
    const price = state.currentBooking.showtime.price;
    const total = seatsCount * price;
    
    state.currentBooking.total = total;
    
    document.getElementById('summary-seats').textContent = 
        state.currentBooking.seats.length > 0 ? state.currentBooking.seats.join(', ') : 'None selected';
    document.getElementById('summary-tickets').textContent = seatsCount;
    document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
}

function confirmBooking() {
    if (state.currentBooking.seats.length === 0) {
        showNotification('Please select at least one seat', 'error');
        return;
    }
    
    // Check if user is logged in
    if (!state.currentUser) {
        showNotification('Please login to book tickets', 'error');
        showView('login');
        return;
    }
    
    // Create new booking
    const newBooking = {
        id: Date.now(),
        userId: state.currentUser.id,
        showtimeId: state.currentBooking.showtime.id,
        seats: [...state.currentBooking.seats],
        total: state.currentBooking.total,
        status: 'confirmed',
        bookingDate: new Date().toISOString().split('T')[0]
    };
    
    // Update showtime booked seats
    const showtimeIndex = state.showtimes.findIndex(st => st.id === state.currentBooking.showtime.id);
    if (showtimeIndex !== -1) {
        // Initialize bookedSeats array if it doesn't exist
        if (!state.showtimes[showtimeIndex].bookedSeats) {
            state.showtimes[showtimeIndex].bookedSeats = [];
        }
        // Add the new booked seats
        state.showtimes[showtimeIndex].bookedSeats.push(...state.currentBooking.seats);
    }
    
    // Add booking to state
    state.bookings.push(newBooking);
    
    // Update user loyalty points (1 point per dollar)
    const userIndex = state.users.findIndex(u => u.id === state.currentUser.id);
    if (userIndex !== -1) {
        state.users[userIndex].loyaltyPoints = (state.users[userIndex].loyaltyPoints || 0) + Math.floor(state.currentBooking.total);
    }
    
    // Save to storage
    saveDataToStorage();
    
    showNotification(`Booking confirmed! Your booking ID is ${newBooking.id}. Total: $${newBooking.total.toFixed(2)}`, 'success');
    
    // Reset current booking
    state.currentBooking = {
        movie: null,
        cinema: null,
        showtime: null,
        seats: [],
        total: 0
    };
    
    // Go to user dashboard
    showView('user-dashboard');
}if (state.showtimes.length === 0) {
    state.showtimes = [
        { 
            id: 1, 
            movieId: 436270, // Black Adam (example ID)
            cinemaId: 'cinema-1', 
            date: '2023-12-15',
            time: '14:30', 
            price: 12.5,
            bookedSeats: ['A1', 'A2', 'B5', 'C3'] // Make sure this exists
        },
        { 
            id: 2, 
            movieId: 436270, // Black Adam
            cinemaId: 'cinema-2', 
            date: '2023-12-15',
            time: '18:00', 
            price: 14.5,
            bookedSeats: ['A3', 'B2'] // Make sure this exists
        },
        // ... other showtimes
    ];
}

// Main Application Controller
class MovieBookingApp {
  constructor() {
    // Initialize services
    this.authService = new AuthService();
    this.movieService = new MovieService();
    this.cinemaService = new CinemaService();
    this.showtimeService = new ShowtimeService(this.movieService, this.cinemaService);
    this.bookingService = new BookingService(this.authService, this.showtimeService);
    this.analyticsService = new AnalyticsService(
      this.bookingService, 
      this.movieService, 
      this.cinemaService, 
      this.authService
    );
    this.dashboardService = new DashboardService(
      this.analyticsService,
      this.bookingService,
      this.authService
    );

    // Current state
    this.currentView = 'home';
    this.currentBooking = null;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderCurrentView();
    this.updateUI();
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('[data-view]').forEach(element => {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        this.showView(element.dataset.view);
      });
    });

    // Authentication
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
      this.handleLogout();
    });

    // Booking
    document.getElementById('confirm-booking').addEventListener('click', () => {
      this.confirmBooking();
    });

    // Admin actions
    document.getElementById('add-movie-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddMovie();
    });

    // ... more event listeners
  }

  showView(viewName) {
    this.currentView = viewName;
    this.renderCurrentView();
  }

  renderCurrentView() {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });

    // Show current view
    document.getElementById(`${this.currentView}-view`).classList.add('active');

    // Render view-specific content
    switch(this.currentView) {
      case 'home':
        this.renderHomeView();
        break;
      case 'movies':
        this.renderMoviesView();
        break;
      case 'movie-details':
        this.renderMovieDetailsView();
        break;
      case 'booking':
        this.renderBookingView();
        break;
      case 'user-dashboard':
        this.renderUserDashboard();
        break;
      case 'admin-dashboard':
        this.renderAdminDashboard();
        break;
      case 'super-admin-dashboard':
        this.renderSuperAdminDashboard();
        break;
    }
  }

  async handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const user = this.authService.login(email, password);
      this.updateUI();
      this.showView('home');
      this.showNotification('Login successful!', 'success');
    } catch (error) {
      this.showNotification(error.message, 'error');
    }
  }

  async handleRegister() {
    const formData = {
      name: document.getElementById('register-name').value,
      email: document.getElementById('register-email').value,
      phone: document.getElementById('register-phone').value,
      password: document.getElementById('register-password').value
    };

    try {
      const user = this.authService.register(formData);
      this.authService.login(user.email, formData.password);
      this.updateUI();
      this.showView('home');
      this.showNotification('Registration successful!', 'success');
    } catch (error) {
      this.showNotification(error.message, 'error');
    }
  }

  handleLogout() {
    this.authService.logout();
    this.updateUI();
    this.showView('home');
    this.showNotification('Logged out successfully', 'info');
  }

  startBookingProcess(movieId, showtimeId) {
    const movie = this.movieService.getMovieById(movieId);
    const showtime = this.showtimeService.getShowtimeById(showtimeId);

    this.currentBooking = {
      movie,
      showtime,
      selectedSeats: []
    };

    this.showView('booking');
    this.renderSeatSelection();
  }

  async confirmBooking() {
    if (!this.currentBooking || this.currentBooking.selectedSeats.length === 0) {
      this.showNotification('Please select at least one seat', 'error');
      return;
    }

    try {
      const booking = this.bookingService.createBooking({
        showtimeId: this.currentBooking.showtime.id,
        seats: this.currentBooking.selectedSeats
      });

      this.showNotification(`Booking confirmed! ID: ${booking.id}`, 'success');
      this.currentBooking = null;
      this.showView('user-dashboard');
    } catch (error) {
      this.showNotification(error.message, 'error');
    }
  }

  updateUI() {
    const user = this.authService.currentUser;
    
    // Update auth buttons
    document.getElementById('loginBtn').classList.toggle('d-none', !!user);
    document.getElementById('registerBtn').classList.toggle('d-none', !!user);
    document.getElementById('logoutBtn').classList.toggle('d-none', !user);
    
    // Update admin buttons based on role
    if (user) {
      document.getElementById('adminBtn').classList.toggle('d-none', user.role !== 'admin');
      document.getElementById('superAdminBtn').classList.toggle('d-none', user.role !== 'super-admin');
    }
  }

  showNotification(message, type = 'info') {
    // Create and show notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // View rendering methods would be implemented here
  renderHomeView() {
    const nowShowing = this.movieService.getAllMovies({ status: 'now-showing' });
    const comingSoon = this.movieService.getAllMovies({ status: 'coming-soon' });
    
    // Render carousels
    this.renderCarousel('now-showing-carousel', nowShowing);
    this.renderCarousel('coming-soon-carousel', comingSoon);
  }

  renderMoviesView(filters = {}) {
    const movies = this.movieService.getAllMovies(filters);
    // Render movies grid
  }

  renderMovieDetailsView(movieId) {
    const movie = this.movieService.getMovieById(movieId);
    const showtimes = this.showtimeService.getShowtimes({ movieId: movieId });
    // Render movie details and showtimes
  }

  renderBookingView() {
    // Render seat selection interface
    this.renderSeatSelection();
  }

  renderSeatSelection() {
    const showtime = this.currentBooking.showtime;
    const layout = showtime.seatLayout;
    
    // Generate seat layout HTML and add event listeners
  }

  renderUserDashboard() {
    if (!this.authService.currentUser) return;
    
    const dashboard = this.dashboardService.getUserDashboard(this.authService.currentUser.id);
    // Render user dashboard
  }

  renderAdminDashboard() {
    if (!this.authService.currentUser || this.authService.currentUser.role !== 'admin') return;
    
    const cinemaId = this.authService.currentUser.cinemaId;
    const dashboard = this.dashboardService.getAdminDashboard(cinemaId);
    // Render admin dashboard
  }

  renderSuperAdminDashboard() {
    if (!this.authService.currentUser || this.authService.currentUser.role !== 'super-admin') return;
    
    const dashboard = this.dashboardService.getSuperAdminDashboard();
    // Render super admin dashboard
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MovieBookingApp();
});

// Analytics Service
class AnalyticsService {
  constructor(bookingService, movieService, cinemaService, userService) {
    this.bookingService = bookingService;
    this.movieService = movieService;
    this.cinemaService = cinemaService;
    this.userService = userService;
  }

  getRevenueAnalytics(timeframe = 'monthly') {
    const bookings = this.bookingService.getAllBookings();
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    
    let data = [];
    
    if (timeframe === 'monthly') {
      // Group by month
      const monthlyData = {};
      confirmedBookings.forEach(booking => {
        const month = booking.bookingDate.substring(0, 7); // YYYY-MM
        if (!monthlyData[month]) {
          monthlyData[month] = 0;
        }
        monthlyData[month] += booking.total;
      });
      
      data = Object.keys(monthlyData).map(month => ({
        period: month,
        revenue: monthlyData[month]
      }));
    } else if (timeframe === 'weekly') {
      // Group by week
      const weeklyData = {};
      confirmedBookings.forEach(booking => {
        const week = this.getWeekNumber(new Date(booking.bookingDate));
        const key = `Week ${week}`;
        if (!weeklyData[key]) {
          weeklyData[key] = 0;
        }
        weeklyData[key] += booking.total;
      });
      
      data = Object.keys(weeklyData).map(week => ({
        period: week,
        revenue: weeklyData[week]
      }));
    }
    
    return data;
  }

  getMoviePerformance() {
    const movies = this.movieService.getAllMovies();
    const bookings = this.bookingService.getAllBookings();
    
    return movies.map(movie => {
      const movieBookings = bookings.filter(booking => 
        booking.showtime.movieId === movie.id && booking.status === 'confirmed'
      );
      
      const revenue = movieBookings.reduce((sum, booking) => sum + booking.total, 0);
      const ticketsSold = movieBookings.reduce((sum, booking) => sum + booking.seats.length, 0);
      
      return {
        movie: movie.title,
        revenue,
        ticketsSold,
        averageRating: movie.rating
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }

  getCinemaPerformance() {
    const cinemas = this.cinemaService.getAllCinemas();
    const bookings = this.bookingService.getAllBookings();
    
    return cinemas.map(cinema => {
      const cinemaBookings = bookings.filter(booking => 
        booking.showtime.cinemaId === cinema.id && booking.status === 'confirmed'
      );
      
      const revenue = cinemaBookings.reduce((sum, booking) => sum + booking.total, 0);
      const occupancyRate = this.calculateOccupancyRate(cinema.id);
      
      return {
        cinema: cinema.name,
        revenue,
        occupancyRate,
        totalBookings: cinemaBookings.length
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }

  calculateOccupancyRate(cinemaId) {
    const cinema = this.cinemaService.getCinemaById(cinemaId);
    const cinemaShowtimes = this.showtimeService.getShowtimes({ cinemaId });
    
    let totalSeats = 0;
    let bookedSeats = 0;
    
    cinemaShowtimes.forEach(showtime => {
      totalSeats += cinema.rows * cinema.columns;
      bookedSeats += showtime.bookedSeats.length;
    });
    
    return totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;
  }

  getUserAnalytics() {
    const users = this.userService.getAllUsers();
    const bookings = this.bookingService.getAllBookings();
    
    const userStats = users.map(user => {
      const userBookings = bookings.filter(booking => booking.userId === user.id);
      const totalSpent = userBookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, booking) => sum + booking.total, 0);
      
      return {
        user: user.name,
        joinDate: user.joinDate,
        totalBookings: userBookings.length,
        totalSpent,
        loyaltyPoints: user.loyaltyPoints || 0
      };
    });
    
    return {
      totalUsers: users.length,
      activeUsers: users.filter(user => 
        bookings.some(booking => booking.userId === user.id)
      ).length,
      userStats: userStats.sort((a, b) => b.totalSpent - a.totalSpent)
    };
  }

  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}

// Dashboard Service
class DashboardService {
  constructor(analyticsService, bookingService, userService) {
    this.analyticsService = analyticsService;
    this.bookingService = bookingService;
    this.userService = userService;
  }

  getAdminDashboard(cinemaId = null) {
    const filters = cinemaId ? { cinemaId } : {};
    const bookings = this.bookingService.getAllBookings(filters);
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = confirmedBookings.filter(b => b.bookingDate === today);
    
    const revenueData = this.analyticsService.getRevenueAnalytics('monthly');
    const moviePerformance = this.analyticsService.getMoviePerformance();
    const cinemaPerformance = this.analyticsService.getCinemaPerformance();
    
    return {
      stats: {
        totalBookings: confirmedBookings.length,
        todayBookings: todayBookings.length,
        totalRevenue: confirmedBookings.reduce((sum, b) => sum + b.total, 0),
        todayRevenue: todayBookings.reduce((sum, b) => sum + b.total, 0),
        averageTicketPrice: confirmedBookings.length > 0 ? 
          confirmedBookings.reduce((sum, b) => sum + b.total, 0) / confirmedBookings.length : 0
      },
      charts: {
        revenue: revenueData,
        moviePerformance: moviePerformance.slice(0, 5), // Top 5 movies
        cinemaPerformance: cinemaPerformance.slice(0, 5) // Top 5 cinemas
      }
    };
  }

  getSuperAdminDashboard() {
    const adminDashboard = this.getAdminDashboard();
    const userAnalytics = this.analyticsService.getUserAnalytics();
    const pendingAdminRequests = this.userService.getPendingAdminRequests();
    
    return {
      ...adminDashboard,
      userStats: userAnalytics,
      pendingAdminRequests: pendingAdminRequests.length,
      totalAdmins: this.userService.getAllUsers().filter(u => u.role === 'admin').length
    };
  }

  getUserDashboard(userId) {
    const userBookings = this.bookingService.getUserBookings(userId);
    const confirmedBookings = userBookings.filter(b => b.status === 'confirmed');
    const user = this.userService.getUserById(userId);
    
    return {
      userInfo: {
        name: user.name,
        email: user.email,
        joinDate: user.joinDate,
        loyaltyPoints: user.loyaltyPoints || 0
      },
      bookingStats: {
        totalBookings: confirmedBookings.length,
        totalSpent: confirmedBookings.reduce((sum, b) => sum + b.total, 0),
        favoriteGenre: this.getFavoriteGenre(confirmedBookings),
        lastBooking: confirmedBookings.length > 0 ? 
          confirmedBookings[confirmedBookings.length - 1] : null
      },
      recentBookings: confirmedBookings.slice(-5).reverse() // Last 5 bookings
    };
  }

  getFavoriteGenre(bookings) {
    const genreCount = {};
    bookings.forEach(booking => {
      const genre = booking.showtime.movie.genre;
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
    
    return Object.keys(genreCount).reduce((a, b) => 
      genreCount[a] > genreCount[b] ? a : b, '');
  }
}// Booking Service
class BookingService {
  constructor(authService, showtimeService) {
    this.authService = authService;
    this.showtimeService = showtimeService;
    this.bookings = this.loadFromStorage('bookings') || [];
  }

  createBooking(bookingData) {
    const { showtimeId, seats } = bookingData;
    
    // Check if user is logged in
    if (!this.authService.currentUser) {
      throw new Error('User must be logged in to make a booking');
    }

    // Check seat availability
    const availability = this.showtimeService.checkSeatAvailability(showtimeId, seats);
    if (!availability.available) {
      throw new Error(`Seats ${availability.unavailableSeats.join(', ')} are not available`);
    }

    const showtime = this.showtimeService.getShowtimeById(showtimeId);
    if (!showtime) throw new Error('Showtime not found');

    // Calculate total price
    const total = this.calculateTotal(showtime, seats);

    // Create booking
    const newBooking = {
      id: Date.now(),
      userId: this.authService.currentUser.id,
      showtimeId,
      seats,
      total,
      status: 'confirmed',
      bookingDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'paid'
    };

    // Reserve seats
    this.showtimeService.reserveSeats(showtimeId, seats);

    this.bookings.push(newBooking);
    this.saveToStorage('bookings', this.bookings);

    // Update user loyalty points
    this.updateLoyaltyPoints(this.authService.currentUser.id, total);

    return {
      ...newBooking,
      showtime: showtime,
      user: this.authService.currentUser
    };
  }

  calculateTotal(showtime, seats) {
    let total = 0;
    
    seats.forEach(seatId => {
      // Find seat in layout to get price
      for (const row of showtime.seatLayout) {
        const seat = row.find(s => s.id === seatId);
        if (seat) {
          total += seat.price;
          break;
        }
      }
    });

    return total;
  }

  getUserBookings(userId) {
    const userBookings = this.bookings.filter(booking => booking.userId === userId);
    
    return userBookings.map(booking => ({
      ...booking,
      showtime: this.showtimeService.getShowtimeById(booking.showtimeId)
    }));
  }

  getAllBookings(filters = {}) {
    let filteredBookings = [...this.bookings];

    if (filters.cinemaId) {
      filteredBookings = filteredBookings.filter(booking => {
        const showtime = this.showtimeService.getShowtimeById(booking.showtimeId);
        return showtime.cinemaId === filters.cinemaId;
      });
    }

    if (filters.status) {
      filteredBookings = filteredBookings.filter(booking => booking.status === filters.status);
    }

    if (filters.date) {
      filteredBookings = filteredBookings.filter(booking => booking.bookingDate === filters.date);
    }

    return filteredBookings.map(booking => ({
      ...booking,
      showtime: this.showtimeService.getShowtimeById(booking.showtimeId),
      user: this.authService.users.find(u => u.id === booking.userId)
    }));
  }

  cancelBooking(bookingId) {
    const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) throw new Error('Booking not found');

    const booking = this.bookings[bookingIndex];
    
    // Only allow cancellation if showtime hasn't passed
    const showtime = this.showtimeService.getShowtimeById(booking.showtimeId);
    const showtimeDateTime = new Date(`${showtime.startDate} ${showtime.time}`);
    
    if (new Date() > showtimeDateTime) {
      throw new Error('Cannot cancel booking for past showtime');
    }

    // Update booking status
    this.bookings[bookingIndex].status = 'cancelled';
    
    // Free up seats
    this.showtimeService.cancelSeatReservation(booking.showtimeId, booking.seats);
    
    // Deduct loyalty points
    this.updateLoyaltyPoints(booking.userId, -booking.total);

    this.saveToStorage('bookings', this.bookings);
    return this.bookings[bookingIndex];
  }

  updateLoyaltyPoints(userId, amount) {
    const points = Math.floor(amount); // 1 point per dollar spent
    this.authService.updateUser(userId, {
      loyaltyPoints: (this.authService.users.find(u => u.id === userId).loyaltyPoints || 0) + points
    });
  }

  getBookingStats() {
    const totalBookings = this.bookings.length;
    const confirmedBookings = this.bookings.filter(b => b.status === 'confirmed').length;
    const cancelledBookings = this.bookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = this.bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, booking) => sum + booking.total, 0);

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
      cancellationRate: (cancelledBookings / totalBookings) * 100 || 0
    };
  }

  loadFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
} // Showtime Service
class ShowtimeService {
  constructor(movieService, cinemaService) {
    this.movieService = movieService;
    this.cinemaService = cinemaService;
    this.showtimes = this.loadFromStorage('showtimes') || [];
    this.initSampleShowtimes();
  }

  initSampleShowtimes() {
    if (this.showtimes.length === 0) {
      this.showtimes = [
        { 
          id: 1, 
          movieId: 1, 
          cinemaId: 'cinema-1', 
          startDate: '2023-06-15', 
          endDate: '2023-06-30',
          time: '14:30', 
          price: 12.5,
          screen: 1,
          seatLayout: this.cinemaService.generateSeatLayout(10, 12),
          bookedSeats: []
        },
        // ... more sample showtimes
      ];
      this.saveToStorage('showtimes', this.showtimes);
    }
  }

  getShowtimes(filters = {}) {
    let filteredShowtimes = [...this.showtimes];

    if (filters.movieId) {
      filteredShowtimes = filteredShowtimes.filter(st => st.movieId === filters.movieId);
    }

    if (filters.cinemaId) {
      filteredShowtimes = filteredShowtimes.filter(st => st.cinemaId === filters.cinemaId);
    }

    if (filters.date) {
      filteredShowtimes = filteredShowtimes.filter(st => 
        st.startDate <= filters.date && st.endDate >= filters.date
      );
    }

    return filteredShowtimes.map(showtime => ({
      ...showtime,
      movie: this.movieService.getMovieById(showtime.movieId),
      cinema: this.cinemaService.getCinemaById(showtime.cinemaId)
    }));
  }

  getShowtimeById(id) {
    const showtime = this.showtimes.find(st => st.id === id);
    if (!showtime) return null;

    return {
      ...showtime,
      movie: this.movieService.getMovieById(showtime.movieId),
      cinema: this.cinemaService.getCinemaById(showtime.cinemaId)
    };
  }

  addShowtime(showtimeData) {
    const cinema = this.cinemaService.getCinemaById(showtimeData.cinemaId);
    if (!cinema) throw new Error('Cinema not found');

    const newShowtime = {
      id: Date.now(),
      ...showtimeData,
      seatLayout: this.cinemaService.generateSeatLayout(cinema.rows, cinema.columns),
      bookedSeats: []
    };

    this.showtimes.push(newShowtime);
    this.saveToStorage('showtimes', this.showtimes);
    return newShowtime;
  }

  updateShowtime(id, updates) {
    const showtimeIndex = this.showtimes.findIndex(st => st.id === id);
    if (showtimeIndex === -1) throw new Error('Showtime not found');

    this.showtimes[showtimeIndex] = { ...this.showtimes[showtimeIndex], ...updates };
    this.saveToStorage('showtimes', this.showtimes);
    return this.showtimes[showtimeIndex];
  }

  deleteShowtime(id) {
    const showtimeIndex = this.showtimes.findIndex(st => st.id === id);
    if (showtimeIndex === -1) throw new Error('Showtime not found');

    const deletedShowtime = this.showtimes.splice(showtimeIndex, 1)[0];
    this.saveToStorage('showtimes', this.showtimes);
    return deletedShowtime;
  }

  checkSeatAvailability(showtimeId, seats) {
    const showtime = this.showtimes.find(st => st.id === showtimeId);
    if (!showtime) throw new Error('Showtime not found');

    const unavailableSeats = seats.filter(seat => 
      showtime.bookedSeats.includes(seat)
    );

    return {
      available: unavailableSeats.length === 0,
      unavailableSeats
    };
  }

  reserveSeats(showtimeId, seats) {
    const showtimeIndex = this.showtimes.findIndex(st => st.id === showtimeId);
    if (showtimeIndex === -1) throw new Error('Showtime not found');

    // Check if seats are available
    const availability = this.checkSeatAvailability(showtimeId, seats);
    if (!availability.available) {
      throw new Error(`Seats ${availability.unavailableSeats.join(', ')} are already booked`);
    }

    // Reserve seats
    this.showtimes[showtimeIndex].bookedSeats.push(...seats);
    this.saveToStorage('showtimes', this.showtimes);

    return this.showtimes[showtimeIndex];
  }

  cancelSeatReservation(showtimeId, seats) {
    const showtimeIndex = this.showtimes.findIndex(st => st.id === showtimeId);
    if (showtimeIndex === -1) throw new Error('Showtime not found');

    // Remove seats from booked seats
    this.showtimes[showtimeIndex].bookedSeats = this.showtimes[showtimeIndex].bookedSeats.filter(
      seat => !seats.includes(seat)
    );

    this.saveToStorage('showtimes', this.showtimes);
    return this.showtimes[showtimeIndex];
  }

  loadFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
} // Cinema Service
class CinemaService {
  constructor() {
    this.cinemas = this.loadFromStorage('cinemas') || [];
    this.initSampleCinemas();
  }

  initSampleCinemas() {
    if (this.cinemas.length === 0) {
      this.cinemas = [
        { 
          id: 'cinema-1', 
          name: 'PVR Cinemas - Downtown', 
          location: '123 Main St',
          screens: 12,
          capacity: 1200,
          rows: 10,
          columns: 12,
          amenities: ['Dolby Atmos', '3D', 'Food Court', 'Parking']
        },
        // ... more sample cinemas
      ];
      this.saveToStorage('cinemas', this.cinemas);
    }
  }

  getAllCinemas() {
    return this.cinemas;
  }

  getCinemaById(id) {
    return this.cinemas.find(cinema => cinema.id === id);
  }

  addCinema(cinemaData) {
    const newCinema = {
      id: `cinema-${Date.now()}`,
      ...cinemaData
    };

    this.cinemas.push(newCinema);
    this.saveToStorage('cinemas', this.cinemas);
    return newCinema;
  }

  updateCinema(id, updates) {
    const cinemaIndex = this.cinemas.findIndex(c => c.id === id);
    if (cinemaIndex === -1) throw new Error('Cinema not found');

    this.cinemas[cinemaIndex] = { ...this.cinemas[cinemaIndex], ...updates };
    this.saveToStorage('cinemas', this.cinemas);
    return this.cinemas[cinemaIndex];
  }

  deleteCinema(id) {
    const cinemaIndex = this.cinemas.findIndex(c => c.id === id);
    if (cinemaIndex === -1) throw new Error('Cinema not found');

    const deletedCinema = this.cinemas.splice(cinemaIndex, 1)[0];
    this.saveToStorage('cinemas', this.cinemas);
    return deletedCinema;
  }

  generateSeatLayout(rows, columns, vipRows = 2) {
    const layout = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      const rowLetter = String.fromCharCode(65 + i);
      
      for (let j = 1; j <= columns; j++) {
        const seatId = `${rowLetter}${j}`;
        const seat = {
          id: seatId,
          row: rowLetter,
          number: j,
          type: i < vipRows ? 'vip' : 'standard',
          price: i < vipRows ? 15 : 12, // VIP seats cost more
          isAvailable: true
        };
        row.push(seat);
      }
      layout.push(row);
    }
    return layout;
  }

  loadFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}// Movie Service
class MovieService {
  constructor() {
    this.movies = this.loadFromStorage('movies') || [];
    this.initSampleMovies();
  }

  initSampleMovies() {
    if (this.movies.length === 0) {
      this.movies = [
        {
          id: 1,
          title: "The Matrix Resurrections",
          cast: ["Keanu Reeves", "Carrie-Anne Moss", "Yahya Abdul-Mateen II"],
          director: "Lana Wachowski",
          genre: "sci-fi",
          language: "english",
          duration: 148,
          rating: 7.5,
          description: "Return to a world of two realities...",
          poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          releaseDate: "2023-03-01",
          endDate: "2023-04-01",
          status: "now-showing"
        },
        // ... more sample movies
      ];
      this.saveToStorage('movies', this.movies);
    }
  }

  getAllMovies(filters = {}) {
    let filteredMovies = [...this.movies];

    // Apply filters
    if (filters.genre) {
      filteredMovies = filteredMovies.filter(movie => movie.genre === filters.genre);
    }

    if (filters.language) {
      filteredMovies = filteredMovies.filter(movie => movie.language === filters.language);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredMovies = filteredMovies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.description.toLowerCase().includes(searchTerm) ||
        movie.cast.some(actor => actor.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.status) {
      filteredMovies = filteredMovies.filter(movie => movie.status === filters.status);
    }

    return filteredMovies;
  }

  getMovieById(id) {
    return this.movies.find(movie => movie.id === id);
  }

  addMovie(movieData) {
    const newMovie = {
      id: Date.now(),
      ...movieData,
      status: new Date(movieData.releaseDate) <= new Date() ? 'now-showing' : 'coming-soon'
    };

    this.movies.push(newMovie);
    this.saveToStorage('movies', this.movies);
    return newMovie;
  }

  updateMovie(id, updates) {
    const movieIndex = this.movies.findIndex(m => m.id === id);
    if (movieIndex === -1) throw new Error('Movie not found');

    this.movies[movieIndex] = { ...this.movies[movieIndex], ...updates };
    
    // Update status based on release date
    if (updates.releaseDate) {
      this.movies[movieIndex].status = new Date(updates.releaseDate) <= new Date() ? 'now-showing' : 'coming-soon';
    }

    this.saveToStorage('movies', this.movies);
    return this.movies[movieIndex];
  }

  deleteMovie(id) {
    const movieIndex = this.movies.findIndex(m => m.id === id);
    if (movieIndex === -1) throw new Error('Movie not found');

    const deletedMovie = this.movies.splice(movieIndex, 1)[0];
    this.saveToStorage('movies', this.movies);
    return deletedMovie;
  }

  loadFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
} // Authentication Service
class AuthService {
  constructor() {
    this.currentUser = null;
    this.users = this.loadFromStorage('users') || [];
    this.initAdminUser();
  }

  initAdminUser() {
    // Check if admin user exists
    const adminExists = this.users.some(user => user.role === 'super-admin');
    if (!adminExists) {
      const adminUser = {
        id: 1,
        name: 'Super Admin',
        email: 'superadmin@moviebooking.com',
        phone: '1234567890',
        password: 'superadmin123',
        role: 'super-admin',
        joinDate: new Date().toISOString().split('T')[0]
      };
      this.users.push(adminUser);
      this.saveToStorage('users', this.users);
    }
  }

  register(userData) {
    // Validate input
    if (!userData.name || !userData.email || !userData.password) {
      throw new Error('All fields are required');
    }

    // Check if user already exists
    if (this.users.find(u => u.email === userData.email)) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      ...userData,
      role: 'user',
      joinDate: new Date().toISOString().split('T')[0],
      loyaltyPoints: 0
    };

    this.users.push(newUser);
    this.saveToStorage('users', this.users);
    return newUser;
  }

  login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    this.currentUser = user;
    this.saveToStorage('currentUser', user);
    return user;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  updateUser(userId, updates) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.saveToStorage('users', this.users);

    // Update current user if it's the same user
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = this.users[userIndex];
      this.saveToStorage('currentUser', this.currentUser);
    }
  }

  requestAdminRole(userId, cinemaInfo) {
    const adminRequests = this.loadFromStorage('adminRequests') || [];
    
    const request = {
      id: Date.now(),
      userId,
      ...cinemaInfo,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    adminRequests.push(request);
    this.saveToStorage('adminRequests', adminRequests);
    return request;
  }

  approveAdminRequest(requestId, cinemaId) {
    const adminRequests = this.loadFromStorage('adminRequests') || [];
    const requestIndex = adminRequests.findIndex(req => req.id === requestId);
    
    if (requestIndex === -1) throw new Error('Request not found');

    // Update request status
    adminRequests[requestIndex].status = 'approved';
    this.saveToStorage('adminRequests', adminRequests);

    // Update user role
    const request = adminRequests[requestIndex];
    this.updateUser(request.userId, { 
      role: 'admin', 
      cinemaId: cinemaId 
    });

    return request;
  }

  rejectAdminRequest(requestId) {
    const adminRequests = this.loadFromStorage('adminRequests') || [];
    const requestIndex = adminRequests.findIndex(req => req.id === requestId);
    
    if (requestIndex === -1) throw new Error('Request not found');

    adminRequests[requestIndex].status = 'rejected';
    this.saveToStorage('adminRequests', adminRequests);
    
    return adminRequests[requestIndex];
  }

  loadFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}