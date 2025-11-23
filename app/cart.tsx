import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Image } from 'expo-image';
import React from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useShoppingCart } from './ShoppingCartContext';

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

export default function CartScreen() {
  const { cart, removeFromCart, clearCart, getCartTotal, getCartItemCount } = useShoppingCart();

  console.log('Cart screen - cart items:', cart); // Debug log

  const handleRemoveItem = (id: string, title: string) => {
    Alert.alert(
      'Remove Item',
      `Remove ${title} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => removeFromCart(id) },
      ]
    );
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    Alert.alert(
      'Checkout',
      `Proceed to checkout with ${getCartItemCount()} tickets totaling $${getCartTotal().toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Checkout', 
          onPress: () => {
            Alert.alert('Success', 'Your tickets have been booked!');
            clearCart();
          }
        },
      ]
    );
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={[styles.cartItem, { backgroundColor: CUSTOM_COLORS.card }]}>
      <Image
        source={{ 
          uri: item.movie.poster_path 
            ? `https://image.tmdb.org/t/p/w200${item.movie.poster_path}`
            : 'https://via.placeholder.com/100x150/1a2d44/ffffff?text=No+Image'
        }}
        style={styles.cartPoster}
        contentFit="cover"
      />
      <View style={styles.cartInfo}>
        <Text style={[styles.cartTitle, { color: CUSTOM_COLORS.text }]} numberOfLines={2}>
          {item.movie.title}
        </Text>
        <Text style={[styles.cartDetails, { color: CUSTOM_COLORS.textSecondary }]}>
          {item.cinema} • {item.showtime}
        </Text>
        <Text style={[styles.cartDetails, { color: CUSTOM_COLORS.textSecondary }]}>
          Seats: {item.seats.join(', ')}
        </Text>
        <Text style={[styles.cartPrice, { color: CUSTOM_COLORS.accent }]}>
          ${item.total.toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id, item.movie.title)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: CUSTOM_COLORS.primary, dark: CUSTOM_COLORS.primary }}
      headerImage={<View />}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={[styles.headerTitle, { color: CUSTOM_COLORS.text }]}>
            Shopping Cart ({getCartItemCount()} tickets)
          </ThemedText>
          {cart.length > 0 && (
            <TouchableOpacity onPress={() => clearCart()}>
              <Text style={[styles.clearText, { color: CUSTOM_COLORS.accent }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {cart.length === 0 ? (
          <View style={styles.emptyCart}>
            <Text style={[styles.emptyText, { color: CUSTOM_COLORS.textSecondary }]}>
              Your cart is empty
            </Text>
            <Text style={[styles.emptySubtext, { color: CUSTOM_COLORS.textSecondary }]}>
              Add some movies to get started!
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cartList}
            />
            <View style={styles.footer}>
              <View style={styles.totalContainer}>
                <Text style={[styles.totalLabel, { color: CUSTOM_COLORS.text }]}>
                  Total:
                </Text>
                <Text style={[styles.totalAmount, { color: CUSTOM_COLORS.accent }]}>
                  ${getCartTotal().toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.checkoutButton, { backgroundColor: CUSTOM_COLORS.accent }]}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearText: {
    fontSize: 14,
  },
  cartList: {
    paddingBottom: 100,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cartPoster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  cartInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cartDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  cartPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4444',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: CUSTOM_COLORS.border,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#0c1e33',
    fontWeight: 'bold',
    fontSize: 16,
  },
});