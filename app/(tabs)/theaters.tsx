import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppState } from './AppStateContext';

export default function TheatersScreen() {
  const { state } = useAppState();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Our Cinemas</Text>
        {state.cinemas.map(cinema => (
          <View key={cinema.id} style={styles.cinemaCard}>
            <Text style={styles.cinemaName}>{cinema.name}</Text>
            <Text style={styles.cinemaLocation}>{cinema.location}</Text>
            <View style={styles.cinemaStats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{cinema.screens}</Text>
                <Text style={styles.statLabel}>Screens</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{cinema.capacity}</Text>
                <Text style={styles.statLabel}>Capacity</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>75%</Text>
                <Text style={styles.statLabel}>Occupancy</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewMoviesButton}>
              <Text style={styles.viewMoviesText}>View Movies</Text>
            </TouchableOpacity>
          </View>
        ))}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#141414',
  },
  cinemaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cinemaName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cinemaLocation: {
    color: '#666',
    marginBottom: 12,
  },
  cinemaStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e50914',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  viewMoviesButton: {
    backgroundColor: '#e50914',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewMoviesText: {
    color: 'white',
    fontWeight: 'bold',
  },
});