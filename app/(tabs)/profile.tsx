import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppState } from './AppStateContext';

// Fallback LinearGradient when 'expo-linear-gradient' is not installed
const LinearGradient: React.FC<any> = ({ colors = [], children, style }) => {
  const backgroundColor = Array.isArray(colors) && colors.length ? colors[0] : 'transparent';
  return <View style={[style, { backgroundColor }]}>{children}</View>;
};

export default function ProfileScreen() {
  const { state, updateState } = useAppState();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  // Edit form state
  const [editName, setEditName] = useState(state.currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(state.currentUser?.phone || '');
  const [editEmail, setEditEmail] = useState(state.currentUser?.email || '');

  const handleLogin = () => {
    setIsLoginModalVisible(true);
  };

  const handleLoginSubmit = () => {
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter email and password');
      return;
    }

    const user = state.users.find(u => 
      u.email.toLowerCase() === loginEmail.toLowerCase() && 
      u.password === loginPassword
    );

    if (user) {
      updateState({ currentUser: user });
      setIsLoginModalVisible(false);
      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
    } else {
      setLoginError('Invalid email or password');
    }
  };

  const handleRegister = () => {
    setIsRegisterModalVisible(true);
  };

  const handleRegisterSubmit = () => {
    // Validation
    if (!registerName || !registerEmail || !registerPhone || !registerPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Check if email already exists
    if (state.users.some(u => u.email.toLowerCase() === registerEmail.toLowerCase())) {
      Alert.alert('Error', 'Email already registered');
      return;
    }

  // Generate new user ID
      const newId = Math.max(...state.users.map(u => u.id)) + 1;
  
      const newUser = {
        id: newId,
        name: registerName,
        email: registerEmail,
        phone: registerPhone,
        password: registerPassword,
        role: 'user' as 'user',
        loyaltyPoints: 100, // Starting bonus
        joinDate: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        avatarColor: getRandomColor(),
      };
  
      updateState({ 
        currentUser: newUser,
        users: [...state.users, newUser]
      });
  
      setIsRegisterModalVisible(false);
      resetRegisterForm();
      Alert.alert('Success', 'Account created successfully! Welcome bonus: 100 points');
    };

  const handleEditProfile = () => {
    setEditName(state.currentUser?.name || '');
    setEditPhone(state.currentUser?.phone || '');
    setEditEmail(state.currentUser?.email || '');
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = () => {
    if (!editName || !editEmail || !editPhone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Check if email is being changed to another existing email
    if (editEmail !== state.currentUser?.email) {
      if (state.users.some(u => u.email.toLowerCase() === editEmail.toLowerCase() && u.id !== state.currentUser?.id)) {
        Alert.alert('Error', 'Email already in use by another account');
        return;
      }
    }

    const updatedUser = {
      ...state.currentUser!,
      name: editName,
      email: editEmail,
      phone: editPhone,
    };

    const updatedUsers = state.users.map(u => 
      u.id === state.currentUser?.id ? updatedUser : u
    );

    updateState({ 
      currentUser: updatedUser,
      users: updatedUsers
    });

    setIsEditModalVisible(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => updateState({ currentUser: null })
        }
      ]
    );
  };

  const resetRegisterForm = () => {
    setRegisterName('');
    setRegisterEmail('');
    setRegisterPhone('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
  };

  const getRandomColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#073B4C'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Guest/Login Screen
  if (!state.currentUser) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={['#0c1e33', '#1a365d']}
          style={styles.gradientBackground}
        >
          <ScrollView contentContainerStyle={styles.guestContainer}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="movie-filter" size={80} color="#FFD700" />
              <Text style={styles.welcomeTitle}>Welcome to</Text>
              <Text style={styles.appName}>Caribbean Cinemas</Text>
              <Text style={styles.welcomeSubtitle}>Experience the Magic</Text>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.featureCard}>
                <MaterialIcons name="confirmation-number" size={32} color="#FFD700" />
                <Text style={styles.featureTitle}>Book Tickets</Text>
                <Text style={styles.featureDesc}>Reserve your seats instantly</Text>
              </View>
              
              <View style={styles.featureCard}>
                <MaterialIcons name="local-movies" size={32} color="#FFD700" />
                <Text style={styles.featureTitle}>Exclusive Rewards</Text>
                <Text style={styles.featureDesc}>Earn points on every purchase</Text>
              </View>
              
              <View style={styles.featureCard}>
                <MaterialIcons name="fastfood" size={32} color="#FFD700" />
                <Text style={styles.featureTitle}>Order Snacks</Text>
                <Text style={styles.featureDesc}>Pre-order your favorite treats</Text>
              </View>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={[styles.loginButton, { backgroundColor: '#FFD700' }]} 
                onPress={handleLogin}
              >
                <MaterialIcons name="login" size={24} color="#000" />
                <Text style={[styles.loginButtonText, { color: '#000' }]}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.registerButton, { backgroundColor: 'transparent', borderColor: '#FFD700' }]} 
                onPress={handleRegister}
              >
                <MaterialIcons name="person-add" size={24} color="#FFD700" />
                <Text style={[styles.registerButtonText, { color: '#FFD700' }]}>Create Account</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.guestNote}>
              Join thousands of movie lovers enjoying premium cinema experience
            </Text>
          </ScrollView>
        </LinearGradient>

        {/* Login Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isLoginModalVisible}
          onRequestClose={() => setIsLoginModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Welcome Back</Text>
                <TouchableOpacity onPress={() => setIsLoginModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              {loginError ? (
                <View style={styles.errorContainer}>
                  <MaterialIcons name="error" size={20} color="#FF6B6B" />
                  <Text style={styles.errorText}>{loginError}</Text>
                </View>
              ) : null}

              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.background, 
                  color: theme.text,
                  borderColor: theme.icon 
                }]}
                placeholder="Email"
                placeholderTextColor="#888"
                value={loginEmail}
                onChangeText={setLoginEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.background, 
                  color: theme.text,
                  borderColor: theme.icon 
                }]}
                placeholder="Password"
                placeholderTextColor="#888"
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
              />

              <TouchableOpacity>
                <Text style={[styles.forgotPassword, { color: theme.tint }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: theme.tint }]}
                onPress={handleLoginSubmit}
              >
                <Text style={styles.submitButtonText}>Sign In</Text>
              </TouchableOpacity>

              <View style={styles.modalFooter}>
                <Text style={[styles.footerText, { color: theme.text }]}>
                  Don&apos;t have an account? 
                </Text>
                <TouchableOpacity onPress={() => {
                  setIsLoginModalVisible(false);
                  setIsRegisterModalVisible(true);
                }}>
                  <Text style={[styles.footerLink, { color: theme.tint }]}> Sign Up</Text>
                </TouchableOpacity>
              </View>

              {/* Demo Accounts */}
              <View style={styles.demoContainer}>
                <Text style={[styles.demoTitle, { color: theme.text }]}>Demo Accounts:</Text>
                <TouchableOpacity 
                  style={[styles.demoButton, { backgroundColor: theme.background }]}
                  onPress={() => {
                    setLoginEmail('admin@cinecaribe.com');
                    setLoginPassword('admin123');
                  }}
                >
                  <Text style={[styles.demoText, { color: theme.text }]}>Admin: admin@cinecaribe.com</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.demoButton, { backgroundColor: theme.background }]}
                  onPress={() => {
                    setLoginEmail('john@example.com');
                    setLoginPassword('john123');
                  }}
                >
                  <Text style={[styles.demoText, { color: theme.text }]}>User: john@example.com</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Register Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isRegisterModalVisible}
          onRequestClose={() => setIsRegisterModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <ScrollView style={[styles.modalContent, { backgroundColor: theme.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Create Account</Text>
                <TouchableOpacity onPress={() => setIsRegisterModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.background, 
                  color: theme.text,
                  borderColor: theme.icon 
                }]}
                placeholder="Full Name"
                placeholderTextColor="#888"
                value={registerName}
                onChangeText={setRegisterName}
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.background, 
                  color: theme.text,
                  borderColor: theme.icon 
                }]}
                placeholder="Email"
                placeholderTextColor="#888"
                value={registerEmail}
                onChangeText={setRegisterEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.background, 
                  color: theme.text,
                  borderColor: theme.icon 
                }]}
                placeholder="Phone Number"
                placeholderTextColor="#888"
                value={registerPhone}
                onChangeText={setRegisterPhone}
                keyboardType="phone-pad"
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.background, 
                  color: theme.text,
                  borderColor: theme.icon 
                }]}
                placeholder="Password"
                placeholderTextColor="#888"
                value={registerPassword}
                onChangeText={setRegisterPassword}
                secureTextEntry
              />

              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.background, 
                  color: theme.text,
                  borderColor: theme.icon 
                }]}
                placeholder="Confirm Password"
                placeholderTextColor="#888"
                value={registerConfirmPassword}
                onChangeText={setRegisterConfirmPassword}
                secureTextEntry
              />

              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: theme.tint }]}
                onPress={handleRegisterSubmit}
              >
                <Text style={styles.submitButtonText}>Create Account</Text>
              </TouchableOpacity>

              <View style={styles.modalFooter}>
                <Text style={[styles.footerText, { color: theme.text }]}>
                  Already have an account? 
                </Text>
                <TouchableOpacity onPress={() => {
                  setIsRegisterModalVisible(false);
                  setIsLoginModalVisible(true);
                }}>
                  <Text style={[styles.footerLink, { color: theme.tint }]}> Sign In</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  }

  // Logged In User Screen
  const userBookings = state.bookings.filter(booking => booking.userId === state.currentUser?.id);
  const watchedMovies = [...new Set(userBookings.map(b => b.showtimeId))].length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header with Gradient */}
        <LinearGradient
          colors={['#0c1e33', '#1a365d']}
          style={styles.profileHeader}
        >
          <View style={styles.profileTopBar}>
            <Text style={styles.profileHeaderTitle}>My Profile</Text>
            <TouchableOpacity onPress={handleLogout}>
              <MaterialIcons name="logout" size={24} color="#FFD700" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfoRow}>
            <View style={[styles.profileAvatar, { backgroundColor: (state.currentUser as any)?.avatarColor || '#FF6B6B' }]}>
              <Text style={styles.avatarText}>
                {getInitials(state.currentUser.name)}
              </Text>
              {state.currentUser.role !== 'user' && (
                <View style={[styles.roleBadge, styles.roleBadgeAbsolute]}>
                  <MaterialIcons 
                    name={state.currentUser.role === 'super-admin' ? 'star' : 'security'} 
                    size={12} 
                    color="#FFF" 
                  />
                </View>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{state.currentUser.name}</Text>
              <Text style={styles.userEmail}>{state.currentUser.email}</Text>
              <View style={styles.roleContainer}>
                <View style={[
                  styles.roleBadge,
                  state.currentUser.role === 'super-admin' && styles.superAdminBadge,
                  state.currentUser.role === 'admin' && styles.adminBadge,
                  state.currentUser.role === 'user' && styles.userBadge
                ]}>
                  <Text style={styles.roleText}>
                    {state.currentUser.role === 'super-admin' ? 'Super Admin' : 
                     state.currentUser.role === 'admin' ? 'Admin' : 'VIP Member'}
                  </Text>
                </View>
                <Text style={styles.joinDate}>Joined {state.currentUser.joinDate}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <MaterialIcons name="edit" size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.background }]}>
            <MaterialIcons name="confirmation-number" size={28} color="#4CAF50" />
            <Text style={[styles.statValue, { color: theme.text }]}>{userBookings.length}</Text>
            <Text style={[styles.statLabel, { color: theme.icon }]}>Bookings</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.background }]}>
            <MaterialIcons name="local-movies" size={28} color="#2196F3" />
            <Text style={[styles.statValue, { color: theme.text }]}>{watchedMovies}</Text>
            <Text style={[styles.statLabel, { color: theme.icon }]}>Movies</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.background }]}>
            <MaterialIcons name="loyalty" size={28} color="#FF9800" />
            <Text style={[styles.statValue, { color: theme.text }]}>{state.currentUser.loyaltyPoints}</Text>
            <Text style={[styles.statLabel, { color: theme.icon }]}>Points</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={20} color={theme.tint} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Information</Text>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <MaterialIcons name="phone" size={18} color={theme.icon} />
              <Text style={[styles.infoLabel, { color: theme.icon }]}>Phone</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{state.currentUser.phone}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <MaterialIcons name="email" size={18} color={theme.icon} />
              <Text style={[styles.infoLabel, { color: theme.icon }]}>Email</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{state.currentUser.email}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <MaterialIcons name="calendar-today" size={18} color={theme.icon} />
              <Text style={[styles.infoLabel, { color: theme.icon }]}>Member Since</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{state.currentUser.joinDate}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <MaterialIcons name="badge" size={18} color={theme.icon} />
              <Text style={[styles.infoLabel, { color: theme.icon }]}>Status</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>Active</Text>
            </View>
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="history" size={20} color={theme.tint} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: theme.tint }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {userBookings.slice(0, 3).map(booking => (
            <View key={booking.id} style={styles.bookingItem}>
              <MaterialIcons 
                name="movie" 
                size={24} 
                color={booking.status === 'confirmed' ? '#4CAF50' : '#FF5722'} 
              />
              <View style={styles.bookingInfo}>
                <Text style={[styles.bookingMovie, { color: theme.text }]}>Booking #{booking.id}</Text>
                <Text style={[styles.bookingDetails, { color: theme.icon }]}>
                  {booking.seats.length} seats • ${booking.total}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                booking.status === 'confirmed' ? styles.statusConfirmed : styles.statusCancelled
              ]}>
                <Text style={styles.statusText}>
                  {booking.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
          
          {userBookings.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="local-movies" size={48} color={theme.icon} />
              <Text style={[styles.emptyStateText, { color: theme.icon }]}>
                No bookings yet
              </Text>
              <TouchableOpacity style={[styles.bookNowButton, { backgroundColor: theme.tint }]}>
                <Text style={styles.bookNowText}>Book Your First Movie</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.background }]}>
            <MaterialIcons name="qr-code" size={24} color={theme.tint} />
            <Text style={[styles.actionTitle, { color: theme.text }]}>My Tickets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.background }]}>
            <MaterialIcons name="favorite" size={24} color="#FF6B6B" />
            <Text style={[styles.actionTitle, { color: theme.text }]}>Favorites</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.background }]}>
            <MaterialIcons name="notifications" size={24} color={theme.tint} />
            <Text style={[styles.actionTitle, { color: theme.text }]}>Notifications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.background }]}>
            <MaterialIcons name="help" size={24} color={theme.tint} />
            <Text style={[styles.actionTitle, { color: theme.text }]}>Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background, 
                color: theme.text,
                borderColor: theme.icon 
              }]}
              placeholder="Full Name"
              placeholderTextColor="#888"
              value={editName}
              onChangeText={setEditName}
            />

            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background, 
                color: theme.text,
                borderColor: theme.icon 
              }]}
              placeholder="Email"
              placeholderTextColor="#888"
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background, 
                color: theme.text,
                borderColor: theme.icon 
              }]}
              placeholder="Phone Number"
              placeholderTextColor="#888"
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
            />

            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: theme.tint }]}
              onPress={handleEditSubmit}
            >
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  guestContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 18,
    color: '#FFF',
    marginTop: 16,
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#CBD5E0',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
    width: '100%',
  },
  featureCard: {
    width: '30%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 12,
    color: '#CBD5E0',
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  guestNote: {
    fontSize: 14,
    color: '#CBD5E0',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleBadgeAbsolute: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#CBD5E0',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  superAdminBadge: {
    backgroundColor: '#DC3545',
  },
  adminBadge: {
    backgroundColor: '#FFC107',
  },
  userBadge: {
    backgroundColor: '#54B9C5',
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  joinDate: {
    fontSize: 12,
    color: '#CBD5E0',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: -30,
    paddingBottom: 0,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookingMovie: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookingDetails: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusConfirmed: {
    backgroundColor: '#E8F5E9',
  },
  statusCancelled: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  bookNowButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookNowText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  actionCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    margin: '1%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF6B6B',
    marginLeft: 8,
    fontSize: 14,
  },
  forgotPassword: {
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 16,
  },
  demoContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  demoButton: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
  },
});