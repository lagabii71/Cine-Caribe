import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppState } from './AppStateContext';

export default function ProfileScreen() {
  const { state, updateState } = useAppState();

  const handleLogin = () => {
    // For demo purposes, auto-login as John Doe
    const demoUser = state.users.find(user => user.id === 1);
    if (demoUser) {
      updateState({ currentUser: demoUser });
    }
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

  if (!state.currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>Welcome to Caribbean Cinemas</Text>
          <Text style={styles.loginSubtitle}>Login to access your profile and bookings</Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login / Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const userBookings = state.bookings.filter(booking => booking.userId === state.currentUser?.id);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>
              {state.currentUser.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{state.currentUser.name}</Text>
            <Text style={styles.userEmail}>{state.currentUser.email}</Text>
            <View style={[
              styles.roleBadge,
              state.currentUser.role === 'super-admin' && styles.superAdminBadge,
              state.currentUser.role === 'admin' && styles.adminBadge
            ]}>
              <Text style={styles.roleText}>
                {state.currentUser.role === 'super-admin' ? 'Super Admin' : 
                 state.currentUser.role === 'admin' ? 'Admin' : 'User'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userBookings.length}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {[...new Set(userBookings.map(b => b.showtimeId))].length}
            </Text>
            <Text style={styles.statLabel}>Movies Watched</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{state.currentUser.loyaltyPoints}</Text>
            <Text style={styles.statLabel}>Reward Points</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{state.currentUser.phone}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Member Since:</Text>
            <Text style={styles.infoValue}>{state.currentUser.joinDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          {userBookings.slice(0, 3).map(booking => (
            <View key={booking.id} style={styles.bookingItem}>
              <Text style={styles.bookingMovie}>Booking #{booking.id}</Text>
              <Text style={styles.bookingDetails}>
                {booking.seats.length} seats • ${booking.total}
              </Text>
              <Text style={[
                styles.bookingStatus,
                booking.status === 'confirmed' ? styles.statusConfirmed : styles.statusCancelled
              ]}>
                {booking.status}
              </Text>
            </View>
          ))}
          {userBookings.length === 0 && (
            <Text style={styles.noBookings}>No bookings yet</Text>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    padding: 16,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#e50914',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#666',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#54b9c5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  superAdminBadge: {
    backgroundColor: '#dc3545',
  },
  adminBadge: {
    backgroundColor: '#ffc107',
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e50914',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontWeight: '600',
    color: '#333',
  },
  infoValue: {
    color: '#666',
  },
  bookingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bookingMovie: {
    fontWeight: '600',
    marginBottom: 4,
  },
  bookingDetails: {
    color: '#666',
    marginBottom: 4,
  },
  bookingStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusConfirmed: {
    color: '#28a745',
  },
  statusCancelled: {
    color: '#dc3545',
  },
  noBookings: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 16,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});