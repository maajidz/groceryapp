import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useCart, CartItem } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

const DELIVERY_CHARGE = 25;
const HANDLING_CHARGE = 2;

export default function CartScreen() {
  const router = useRouter();
  const { cart, updateItemQuantity, totalCartItems, totalCartPrice, totalSavings } = useCart();
  const { isAuthenticated } = useAuth(); // Get authentication state

  const calculatedItemsTotal = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('₹', ''));
    return sum + price * item.quantity;
  }, 0);

  const actualDeliveryCharge = totalCartPrice > 0 ? DELIVERY_CHARGE : 0;
  const actualHandlingCharge = totalCartPrice > 0 ? HANDLING_CHARGE : 0;
  const grandTotal = totalCartPrice + actualDeliveryCharge + actualHandlingCharge;

  const handleProceed = () => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      // User is authenticated, proceed to checkout or next step
      Alert.alert('Checkout', 'Proceeding to checkout (not yet implemented).');
      console.log('User is authenticated, proceed to checkout with cart:', cart);
      // Example: router.push('/checkout'); 
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItemContainer}>
      <Image source={{ uri: item.image }} style={styles.cartItemImage} resizeMode="contain" />
      <View style={styles.cartItemDetails}>
        <ThemedText style={styles.cartItemName} numberOfLines={2}>{item.name}</ThemedText>
        {item.weight && <ThemedText style={styles.cartItemWeight}>{item.weight}</ThemedText>}
        <View style={styles.cartItemPriceRow}>
          <ThemedText style={styles.cartItemPrice}>{item.price}</ThemedText>
          {item.oldPrice && <ThemedText style={styles.cartItemOldPrice}>{item.oldPrice}</ThemedText>}
        </View>
      </View>
      <View style={styles.quantityControlContainer}>
        <TouchableOpacity onPress={() => updateItemQuantity(item.id, item.quantity - 1)} style={styles.quantityButton}>
          <Ionicons name="remove-circle-outline" size={28} color="#00A877" />
        </TouchableOpacity>
        <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>
        <TouchableOpacity onPress={() => updateItemQuantity(item.id, item.quantity + 1)} style={styles.quantityButton}>
          <Ionicons name="add-circle-outline" size={28} color="#00A877" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.headerContainer}>
        <ThemedText style={styles.headerTitle}>My Cart</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Ionicons name="cart-outline" size={80} color="#cccccc" />
          <ThemedText style={styles.emptyCartText}>Your cart is empty!</ThemedText>
          <ThemedText style={styles.emptyCartSubText}>Looks like you haven't added anything to your cart yet.</ThemedText>
          <TouchableOpacity style={styles.shopNowButton} onPress={() => router.replace('/(tabs)')}>
            <ThemedText style={styles.shopNowButtonText}>Shop Now</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollViewContent} contentContainerStyle={styles.scrollContentContainerPadded}>
          {totalSavings > 0 && (
            <View style={styles.savingsBanner}>
              <ThemedText style={styles.savingsBannerText}>Your total savings</ThemedText>
              <ThemedText style={styles.savingsBannerAmount}>₹{totalSavings.toFixed(2)}</ThemedText>
            </View>
          )}

          <View style={styles.deliveryInfoContainer}>
            <Ionicons name="alarm-outline" size={24} color="#000" />
            <View style={styles.deliveryTextContainer}>
              <ThemedText style={styles.deliveryTitle}>Delivery in 8 minutes</ThemedText>
              <ThemedText style={styles.deliverySubtitle}>Shipment of {totalCartItems} item{totalCartItems > 1 ? 's' : ''}</ThemedText>
            </View>
          </View>

          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} 
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            style={styles.cartItemsList}
          />

          <View style={styles.billDetailsContainer}>
            <ThemedText style={styles.billTitle}>Bill details</ThemedText>
            <View style={styles.billRow}>
              <View style={styles.billRowLeft}>
                <Ionicons name="list-outline" size={18} color="#555" style={styles.billIcon} />
                <ThemedText style={styles.billText}>Items total</ThemedText>
                {totalSavings > 0 && <ThemedText style={styles.billSavedAmount}>(Saved ₹{totalSavings.toFixed(2)})</ThemedText>}
              </View>
              <View style={styles.billRowRightPrices}>
                {totalSavings > 0 && <ThemedText style={styles.billOriginalPrice}>₹{(calculatedItemsTotal + totalSavings).toFixed(2)}</ThemedText>}
                <ThemedText style={styles.billFinalPrice}>₹{calculatedItemsTotal.toFixed(2)}</ThemedText>
              </View>
            </View>
            <View style={styles.billRow}>
              <View style={styles.billRowLeft}>
                 <Ionicons name="bicycle-outline" size={18} color="#555" style={styles.billIcon} />
                <ThemedText style={styles.billText}>Delivery charge</ThemedText>
                <Ionicons name="information-circle-outline" size={14} color="#888" style={styles.infoIcon}/>
              </View>
              {actualDeliveryCharge === 0 && totalCartPrice > 0 ? (
                <ThemedText style={[styles.billFinalPrice, styles.freeDelivery]}>FREE</ThemedText>
              ) : (
                <ThemedText style={styles.billFinalPrice}>₹{actualDeliveryCharge.toFixed(2)}</ThemedText>
              )}
            </View>
            <View style={styles.billRow}>
              <View style={styles.billRowLeft}>
                <Ionicons name="bag-handle-outline" size={18} color="#555" style={styles.billIcon} />
                <ThemedText style={styles.billText}>Handling charge</ThemedText>
                <Ionicons name="information-circle-outline" size={14} color="#888" style={styles.infoIcon}/>
              </View>
              <ThemedText style={styles.billFinalPrice}>₹{actualHandlingCharge.toFixed(2)}</ThemedText>
            </View>
            <View style={styles.grandTotalRow}>
              <ThemedText style={styles.grandTotalText}>Grand total</ThemedText>
              <ThemedText style={styles.grandTotalPrice}>₹{grandTotal.toFixed(2)}</ThemedText>
            </View>
          </View>
        </ScrollView>
      )}

      {cart.length > 0 && (
        <View style={styles.proceedButtonContainer}>
          <View style={styles.proceedPriceInfo}>
            <ThemedText style={styles.proceedTotalPrice}>₹{grandTotal.toFixed(2)}</ThemedText>
            <ThemedText style={styles.proceedTotalLabel}>TOTAL</ThemedText>
          </View>
          <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
            <ThemedText style={styles.proceedButtonText}>
              {isAuthenticated ? 'Proceed to Checkout' : 'Login to Proceed'}
            </ThemedText>
            <Ionicons name="chevron-forward-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 25 : 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  closeButton: { padding: 5 },
  scrollViewContent: { flex: 1 }, // For the main scrollable area
  scrollContentContainerPadded: { paddingBottom: 80 }, // Padding for the sticky proceed button
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: { fontSize: 20, fontWeight: '600', color: '#333', marginTop: 20 },
  emptyCartSubText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, marginBottom: 25 },
  shopNowButton: { backgroundColor: '#00A877', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
  shopNowButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  savingsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD', 
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 8,
  },
  savingsBannerText: { fontSize: 15, color: '#0D47A1', fontWeight: '600' }, 
  savingsBannerAmount: { fontSize: 15, color: '#0D47A1', fontWeight: 'bold' },
  deliveryInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
    elevation: 1, 
    shadowColor: '#000', 
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  deliveryTextContainer: { marginLeft: 12 },
  deliveryTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  deliverySubtitle: { fontSize: 13, color: '#555555', marginTop: 2 },
  cartItemsList: {
    marginHorizontal: 15,
    marginTop: 10,
    // No fixed height, should grow with content within ScrollView
  },
  cartItemContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 10, // Reduced horizontal padding for more space
    borderRadius: 8,
    alignItems: 'center',
  },
  itemSeparator: {
    height: 10,
    backgroundColor: '#F5F5F5', // Separator color matches background
    marginHorizontal: 15, // Align with card margins
  },
  cartItemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  cartItemDetails: { flex: 1, justifyContent: 'center' },
  cartItemName: { fontSize: 14, fontWeight: '600', color: '#202020', marginBottom: 2 },
  cartItemWeight: { fontSize: 12, color: '#666666', marginBottom: 4 },
  cartItemPriceRow: { flexDirection: 'row', alignItems: 'center' },
  cartItemPrice: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  cartItemOldPrice: { fontSize: 12, color: '#808080', textDecorationLine: 'line-through', marginLeft: 8 },
  quantityControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    borderColor: '#00A877',
    borderWidth: 1.5,
    borderRadius: 8,
    // paddingVertical: 0, // Adjusted for icon buttons
    // paddingHorizontal: 0,
  },
  quantityButton: { paddingHorizontal: 8, paddingVertical: 4 }, 
  quantityText: { fontSize: 15, fontWeight: 'bold', color: '#00A877', marginHorizontal: 10 }, 
  billDetailsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 20, 
    borderRadius: 8,
  },
  billTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1A1A1A' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  billRowLeft: {flexDirection: 'row', alignItems: 'center'},
  billIcon: {marginRight: 8},
  billText: { fontSize: 14, color: '#444444' },
  billSavedAmount: { fontSize: 13, color: '#00A877', marginLeft: 6, fontWeight: '500' },
  billRowRightPrices: {flexDirection: 'row', alignItems: 'baseline'},
  billOriginalPrice: {fontSize: 13, color: '#808080', textDecorationLine: 'line-through', marginRight: 8},
  billFinalPrice: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  freeDelivery: { color: '#00A877', fontWeight: 'bold'},
  infoIcon: { marginLeft: 4},
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 12, marginTop: 8 },
  grandTotalText: { fontSize: 17, fontWeight: 'bold', color: '#1A1A1A' },
  grandTotalPrice: { fontSize: 17, fontWeight: 'bold', color: '#1A1A1A' },
  proceedButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00A877',
    paddingVertical: 10,
    paddingHorizontal: 15,
    // Ensure it's above any native tab bar if one were visible
    // position: 'absolute', bottom: 0, left: 0, right: 0, // Make it sticky if not using portal/modal for cart
  },
  proceedPriceInfo: {},
  proceedTotalPrice: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  proceedTotalLabel: { color: '#E0E0E0', fontSize: 11, fontWeight: '500' }, 
  proceedButton: { flexDirection: 'row', alignItems: 'center' },
  proceedButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginRight: 6 },
});
