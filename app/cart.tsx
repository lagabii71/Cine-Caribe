// app/cart.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
};

export default function CartScreen() {
  const router = useRouter();
  const { cart, removeFromCart, clearCart, getCartTotal, getItemCount } = useShoppingCart();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState({
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Cart Empty', 'Your cart is empty. Add some movies first!');
      return;
    }
    setShowCheckoutModal(true);
  };

  const processPayment = () => {
    // Validate form
    if (!checkoutInfo.name || !checkoutInfo.email || !checkoutInfo.phone || 
        !checkoutInfo.cardNumber || !checkoutInfo.expiry || !checkoutInfo.cvv) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'Booking Confirmed!',
        `Thank you ${checkoutInfo.name}! Your booking has been confirmed.\n\nTotal: $${getCartTotal().toFixed(2)}\nTickets: ${getItemCount()}\n\nA confirmation email has been sent to ${checkoutInfo.email}`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              setShowCheckoutModal(false);
              setCheckoutInfo({
                name: '',
                email: '',
                phone: '',
                cardNumber: '',
                expiry: '',
                cvv: '',
              });
              router.push('/(tabs)/movies');
            }
          }
        ]
      );
    }, 2000);
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemHeader}>
        <Text style={styles.movieTitle}>{item.movie.title}</Text>
        <TouchableOpacity 
          onPress={() => removeFromCart(item.id)}
          style={styles.removeButton}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.cartItemDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Cinema:</Text>
          <Text style={styles.detailValue}>{item.cinema}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Showtime:</Text>
          <Text style={styles.detailValue}>{item.showtime}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Seats:</Text>
          <Text style={styles.detailValue}>{item.seats.join(', ')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tickets:</Text>
          <Text style={styles.detailValue}>{item.seats.length}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.priceText}>${item.total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptyText}>
          Add some movies to your cart by booking tickets!
        </Text>
        <TouchableOpacity 
          style={styles.browseButton}
          onPress={() => router.push('/(tabs)/movies')}
        >
          <Text style={styles.browseButtonText}>Browse Movies</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <Text style={styles.headerSubtitle}>
            {getItemCount()} ticket{getItemCount() !== 1 ? 's' : ''} • ${getCartTotal().toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      {/* Cart Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>${getCartTotal().toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service Fee:</Text>
          <Text style={styles.summaryValue}>$2.50</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax:</Text>
          <Text style={styles.summaryValue}>
            ${(getCartTotal() * 0.08).toFixed(2)}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            ${(getCartTotal() + 2.50 + (getCartTotal() * 0.08)).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={() => {
            Alert.alert(
              'Clear Cart',
              'Are you sure you want to remove all items from your cart?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Clear', 
                  style: 'destructive',
                  onPress: clearCart
                }
              ]
            );
          }}
        >
          <Text style={styles.clearButtonText}>Clear Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>

      {/* Checkout Modal */}
      <Modal
        visible={showCheckoutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isProcessing && setShowCheckoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Checkout</Text>
              <TouchableOpacity 
                onPress={() => !isProcessing && setShowCheckoutModal(false)}
                disabled={isProcessing}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={cart}
              renderItem={({ item }) => (
                <View style={styles.checkoutItem}>
                  <Text style={styles.checkoutMovieTitle}>{item.movie.title}</Text>
                  <Text style={styles.checkoutItemDetails}>
                    {item.cinema} • {item.showtime} • {item.seats.length} ticket(s)
                  </Text>
                  <Text style={styles.checkoutItemPrice}>${item.total.toFixed(2)}</Text>
                </View>
              )}
              keyExtractor={(item) => item.id}
              style={styles.checkoutList}
              ListHeaderComponent={() => (
                <>
                  {/* Personal Information */}
                  <View style={styles.formSection}>
                    <Text style={styles.formTitle}>Personal Information</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name *"
                      placeholderTextColor={CUSTOM_COLORS.textSecondary}
                      value={checkoutInfo.name}
                      onChangeText={(text) => setCheckoutInfo(prev => ({ ...prev, name: text }))}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address *"
                      placeholderTextColor={CUSTOM_COLORS.textSecondary}
                      value={checkoutInfo.email}
                      onChangeText={(text) => setCheckoutInfo(prev => ({ ...prev, email: text }))}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Phone Number *"
                      placeholderTextColor={CUSTOM_COLORS.textSecondary}
                      value={checkoutInfo.phone}
                      onChangeText={(text) => setCheckoutInfo(prev => ({ ...prev, phone: text }))}
                      keyboardType="phone-pad"
                    />
                  </View>

                  {/* Payment Information */}
                  <View style={styles.formSection}>
                    <Text style={styles.formTitle}>Payment Information</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Card Number *"
                      placeholderTextColor={CUSTOM_COLORS.textSecondary}
                      value={checkoutInfo.cardNumber}
                      onChangeText={(text) => setCheckoutInfo(prev => ({ ...prev, cardNumber: text }))}
                      keyboardType="numeric"
                    />
                    <View style={styles.rowInputs}>
                      <TextInput
                        style={[styles.input, styles.halfInput]}
                        placeholder="MM/YY *"
                        placeholderTextColor={CUSTOM_COLORS.textSecondary}
                        value={checkoutInfo.expiry}
                        onChangeText={(text) => setCheckoutInfo(prev => ({ ...prev, expiry: text }))}
                      />
                      <TextInput
                        style={[styles.input, styles.halfInput]}
                        placeholder="CVV *"
                        placeholderTextColor={CUSTOM_COLORS.textSecondary}
                        value={checkoutInfo.cvv}
                        onChangeText={(text) => setCheckoutInfo(prev => ({ ...prev, cvv: text }))}
                        keyboardType="numeric"
                        secureTextEntry
                      />
                    </View>
                  </View>

                  <Text style={styles.orderSummaryTitle}>Order Summary</Text>
                </>
              )}
              ListFooterComponent={() => (
                <View style={styles.checkoutSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal:</Text>
                    <Text style={styles.summaryValue}>${getCartTotal().toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Service Fee:</Text>
                    <Text style={styles.summaryValue}>$2.50</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax:</Text>
                    <Text style={styles.summaryValue}>
                      ${(getCartTotal() * 0.08).toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>
                      ${(getCartTotal() + 2.50 + (getCartTotal() * 0.08)).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            />

            <View style={styles.modalActions}>
              {isProcessing ? (
                <View style={styles.processingContainer}>
                  <Text style={styles.processingText}>Processing payment...</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowCheckoutModal(false)}
                    disabled={isProcessing}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={processPayment}
                    disabled={isProcessing}
                  >
                    <Text style={styles.confirmButtonText}>Confirm Payment</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CUSTOM_COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: CUSTOM_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyText: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: CUSTOM_COLORS.accent,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  browseButtonText: {
    color: CUSTOM_COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: CUSTOM_COLORS.border,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: CUSTOM_COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: CUSTOM_COLORS.accent,
    fontSize: 14,
    marginTop: 4,
  },
  cartList: {
    padding: 16,
    paddingBottom: 16,
  },
  cartItem: {
    backgroundColor: CUSTOM_COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  movieTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: CUSTOM_COLORS.error,
    fontSize: 20,
    fontWeight: 'bold',
  },
  cartItemDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 14,
  },
  detailValue: {
    color: CUSTOM_COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  priceText: {
    color: CUSTOM_COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryContainer: {
    backgroundColor: CUSTOM_COLORS.card,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 16,
  },
  summaryValue: {
    color: CUSTOM_COLORS.text,
    fontSize: 16,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: CUSTOM_COLORS.border,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    color: CUSTOM_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    color: CUSTOM_COLORS.accent,
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  clearButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: CUSTOM_COLORS.error,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  clearButtonText: {
    color: CUSTOM_COLORS.error,
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutButton: {
    flex: 2,
    backgroundColor: CUSTOM_COLORS.accent,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: CUSTOM_COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
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
  },
  closeButtonText: {
    color: CUSTOM_COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkoutList: {
    flex: 1,
    padding: 20,
  },
  checkoutItem: {
    backgroundColor: CUSTOM_COLORS.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  checkoutMovieTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  checkoutItemDetails: {
    color: CUSTOM_COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  checkoutItemPrice: {
    color: CUSTOM_COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  formSection: {
    marginBottom: 24,
  },
  formTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: CUSTOM_COLORS.card,
    color: CUSTOM_COLORS.text,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CUSTOM_COLORS.border,
    marginBottom: 12,
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  orderSummaryTitle: {
    color: CUSTOM_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
  },
  checkoutSummary: {
    backgroundColor: CUSTOM_COLORS.card,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: CUSTOM_COLORS.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: CUSTOM_COLORS.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: CUSTOM_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: CUSTOM_COLORS.success,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: CUSTOM_COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  processingText: {
    color: CUSTOM_COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});