// app/(tabs)/theaters.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const CUSTOM_COLORS = {
  primary: '#0c1e33',
  secondary: '#1e3a5c',
  accent: '#4a90e2',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  background: '#0c1e33',
  card: '#1a2d44',
  border: '#2d4a66',
};

// Sample theater data - you can replace with real API data
const THEATERS = [
  {
    id: '1',
    name: 'Downtown Cinema',
    location: '123 Main St, City Center',
    distance: '0.5 miles',
    image: 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=500',
    amenities: ['IMAX', 'Dolby Atmos', 'Recliner Seats', 'Food Court'],
    showtimes: ['10:00 AM', '1:30 PM', '4:00 PM', '7:00 PM', '9:30 PM'],
    phone: '(555) 123-4567',
    website: 'https://downtowncinema.example.com',
  },
  {
    id: '2',
    name: 'Mall Cinema',
    location: '456 Shopping Mall Blvd',
    distance: '2.1 miles',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500',
    amenities: ['4DX', '3D', 'VIP Lounge', 'Bar'],
    showtimes: ['11:00 AM', '2:30 PM', '5:00 PM', '8:00 PM', '10:30 PM'],
    phone: '(555) 987-6543',
    website: 'https://mallcinema.example.com',
  },
  {
    id: '3',
    name: 'Premium Cinema',
    location: '789 Luxury Ave, Entertainment District',
    distance: '3.5 miles',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w-500',
    amenities: ['Dolby Cinema', 'Butler Service', 'Gourmet Dining', 'Private Boxes'],
    showtimes: ['12:00 PM', '3:30 PM', '6:00 PM', '9:00 PM', '11:30 PM'],
    phone: '(555) 456-7890',
    website: 'https://premiumcinema.example.com',
  },
  {
    id: '4',
    name: 'Classic Theater',
    location: '321 Historic Blvd',
    distance: '1.8 miles',
    image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w-500',
    amenities: ['Retro Style', 'Art House Films', 'Coffee Bar', 'Bookstore'],
    showtimes: ['10:30 AM', '2:00 PM', '5:30 PM', '8:00 PM'],
    phone: '(555) 234-5678',
    website: 'https://classictheater.example.com',
  },
];

export default function TheatersScreen() {
  const [selectedTheater, setSelectedTheater] = useState(THEATERS[0]);
  const [selectedShowtime, setSelectedShowtime] = useState('');

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url);
  };

  const handleDirections = (theater: any) => {
    // This would open maps with the theater location
    const address = encodeURIComponent(theater.location);
    Linking.openURL(`https://maps.google.com/?q=${address}`);
  };

  const renderTheaterItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.theaterCard,
        selectedTheater.id === item.id && styles.selectedTheaterCard
      ]}
      onPress={() => {
        setSelectedTheater(item);
        setSelectedShowtime('');
      }}
    >
      <Image source={{ uri: item.image }} style={styles.theaterImage} />
      <View style={styles.theaterInfo}>
        <Text style={styles.theaterName}>{item.name}</Text>
        <View style={styles.theaterMeta}>
          <MaterialIcons name="location-on" size={14} color={CUSTOM_COLORS.accent} />
          <Text style={styles.theaterLocation}>{item.location}</Text>
        </View>
        <View style={styles.theaterMeta}>
          <MaterialIcons name="directions-walk" size={14} color={CUSTOM_COLORS.textSecondary} />
          <Text style={styles.theaterDistance}>{item.distance}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAmenity = (amenity: string) => (
    <View key={amenity} style={styles.amenityTag}>
      <Text style={styles.amenityText}>{amenity}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Theaters</Text>
        <Text style={styles.headerSubtitle}>Select a theater to view details</Text>
      </View>

      {/* Theater List */}
      <View style={styles.theaterListContainer}>
        <FlatList
          data={THEATERS}
          renderItem={renderTheaterItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.theaterList}
        />
      </View>

      {/* Selected Theater Details */}
      <ScrollView style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <Text style={styles.detailsTitle}>{selectedTheater.name}</Text>
          <Text style={styles.detailsLocation}>{selectedTheater.location}</Text>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesContainer}>
            {selectedTheater.amenities.map(renderAmenity)}
          </View>
        </View>

        {/* Today's Showtimes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Showtimes</Text>
          <View style={styles.showtimesContainer}>
            {selectedTheater.showtimes.map((time) => (
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

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact & Information</Text>
          <View style={styles.contactContainer}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleCall(selectedTheater.phone)}
            >
              <MaterialIcons name="phone" size={20} color={CUSTOM_COLORS.accent} />
              <Text style={styles.contactText}>{selectedTheater.phone}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleWebsite(selectedTheater.website)}
            >
              <MaterialIcons name="public" size={20} color={CUSTOM_COLORS.accent} />
              <Text style={styles.contactText}>Visit Website</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleDirections(selectedTheater)}
            >
              <MaterialIcons name="directions" size={20} color={CUSTOM_COLORS.accent} />
              <Text style={styles.contactText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        {selectedShowtime && (
          <View style={styles.actionSection}>
            <Text style={styles.actionTitle}>
              Selected: {selectedShowtime} at {selectedTheater.name}
            </Text>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => {
                // This would navigate to movies screen with preselected theater
                console.log('Book tickets at:', selectedTheater.name, selectedShowtime);
              }}
            >
              <Text style={styles.bookButtonText}>Book Tickets for {selectedShowtime}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CUSTOM_COLORS.primary,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },
  theaterListContainer: {
    height: 140,
  },
  theaterList: {
    paddingHorizontal: 16,
  },
  theaterCard: {
    width: 300,
    backgroundColor: CUSTOM_COLORS.card,
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
  },
  selectedTheaterCard: {
    borderWidth: 2,
    borderColor: CUSTOM_COLORS.accent,
  },
  theaterImage: {
    width: '100%',
    height: 80,
  },
  theaterInfo: {
    padding: 12,
  },
  theaterName: {
    color: CUSTOM_COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  theaterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  theaterLocation: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  theaterDistance: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
  },
  detailsHeader: {
    marginBottom: 24,
  },
  detailsTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailsLocation: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 14,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    backgroundColor: CUSTOM_COLORS.secondary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  amenityText: {
    color: CUSTOM_COLORS.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  showtimesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  showtimeButton: {
    backgroundColor: CUSTOM_COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: CUSTOM_COLORS.border,
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
  contactContainer: {
    backgroundColor: CUSTOM_COLORS.card,
    borderRadius: 12,
    padding: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CUSTOM_COLORS.border,
  },
  contactText: {
    color: CUSTOM_COLORS.text,
    fontSize: 16,
    marginLeft: 12,
  },
  actionSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  actionTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: CUSTOM_COLORS.accent,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  bookButtonText: {
    color: CUSTOM_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});