import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useAddress } from '@/contexts/AddressContext';
import { useAuth } from '@/contexts/AuthContext';
import { CartItem, useCart } from '@/contexts/CartContext';
import { ProductImageKeys, productImages } from '@/utils/imageMap';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DELIVERY_CHARGE_VALUE = 30;
const HANDLING_CHARGE_VALUE = 9;
const SMALL_CART_FEE_VALUE = 20;
const SMALL_CART_THRESHOLD = 100;

export default function CartScreen() {
  const router = useRouter();
  const { cart, updateItemQuantity, totalCartItems, totalCartPrice } = useCart(); // Removed clearCart as it's not used in this view now
  const { isAuthenticated } = useAuth();
  const { address, isLoadingAddress } = useAddress();

  const subTotal = totalCartPrice;
  const deliveryCharge = cart.length > 0 ? DELIVERY_CHARGE_VALUE : 0;
  const handlingCharge = cart.length > 0 ? HANDLING_CHARGE_VALUE : 0;
  const smallCartCharge = (cart.length > 0 && subTotal < SMALL_CART_THRESHOLD && subTotal > 0) ? SMALL_CART_FEE_VALUE : 0;
  const savedAmount = 10; // Assuming this is a general saving

  const grandTotalCalculation = subTotal - savedAmount + deliveryCharge + handlingCharge + smallCartCharge;

  const [isDonationChecked, setIsDonationChecked] = React.useState(true);
  const finalGrandTotal = isDonationChecked && cart.length > 0 ? grandTotalCalculation + 1 : grandTotalCalculation;

  const handleProceed = () => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!address) {
      router.push('/address' as any);
    } else {
      router.push('/payment' as any);
    }
  };

  let proceedButtonText = 'Login to Proceed';
  if (isAuthenticated) {
    if (!address) {
      proceedButtonText = 'Add Address';
    } else {
      proceedButtonText = 'Proceed To Pay';
    }
  }
  if (isLoadingAddress && cart.length > 0) {
    proceedButtonText = 'Loading...';
  }

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItemContainer}>
      <Image 
        source={item.imageFileNames?.[0] ? productImages[item.imageFileNames[0] as ProductImageKeys] : {uri: 'https://via.placeholder.com/60x60.png?text=No+Image'}} 
        style={styles.cartItemImage} 
        resizeMode="contain" 
      />
      <View style={styles.cartItemDetails}>
        <ThemedText style={styles.cartItemName} numberOfLines={1}>{item.name}</ThemedText>
        <ThemedText style={styles.cartItemWeight}>{item.weight || '0.95-1.05 kg'}</ThemedText>
        <View style={styles.cartItemPriceRow}>
          <ThemedText style={styles.cartItemPrice}>₹{item.price}</ThemedText>
          {item.oldPrice && <ThemedText style={styles.cartItemOldPrice}>₹{item.oldPrice}</ThemedText>}
        </View>
      </View>
      <View style={styles.quantityControlContainer}>
        <Pressable onPress={() => updateItemQuantity(item.id, item.quantity - 1)} style={styles.quantityButton}>
          <Ionicons name="remove" size={20} color={Colors.light.tint} />
        </Pressable>
        <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>
        <Pressable onPress={() => updateItemQuantity(item.id, item.quantity + 1)} style={styles.quantityButton}>
          <Ionicons name="add" size={20} color={Colors.light.tint} />
        </Pressable>
      </View>
    </View>
  );

  if (isLoadingAddress && cart.length > 0 && !address) { // Show loading only if address is being fetched and not yet available
    return (
        <SafeAreaView style={[styles.container, styles.centeredLoadingContainer, {flex:1}]}>
            <ActivityIndicator size="large" color={Colors.light.tint} />
            <ThemedText>Loading address information...</ThemedText>
        </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, {flex:1}]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.headerContainer}>
        <ThemedText style={styles.headerTitle}>My Cart</ThemedText>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Colors.light.text} />
        </Pressable>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Ionicons name="cart-outline" size={80} color="#cccccc" />
          <ThemedText style={styles.emptyCartText}>Your cart is empty!</ThemedText>
          <ThemedText style={styles.emptyCartSubText}>Add items to your cart to see them here.</ThemedText>
          <Pressable style={styles.shopNowButton} onPress={() => router.replace('/(tabs)')}>
            <ThemedText style={styles.shopNowButtonText}>Shop Now</ThemedText>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContentContainerPadded}>
            <View style={styles.sectionCard}>
                <View style={styles.deliveryTimeRow}>
                    <MaterialCommunityIcons name="timer-sand-empty" size={24} color={Colors.light.text} />
                    <View style={{marginLeft: 10}}>
                        <ThemedText style={styles.deliveryTimeTitle}>Delivery in 8 minutes</ThemedText>
                        <ThemedText style={styles.deliveryTimeSubtitle}>Shipment of {totalCartItems} item{totalCartItems !== 1 ? 's' : ''}</ThemedText>
                    </View>
            </View>
                {cart.map((item, index) => <View key={item.id + index}>{renderCartItem({item})}</View>)} 
          </View>

            <View style={styles.sectionCard}>
                <ThemedText style={styles.sectionTitle}>Bill details</ThemedText>
            <View style={styles.billRow}>
                    <ThemedText style={styles.billTextLeft}>Sub total</ThemedText>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        {savedAmount > 0 && <ThemedText style={styles.billSavedTag}>Saved ₹{savedAmount}</ThemedText>}
                        <ThemedText style={styles.billTextRightStriked}>₹{(subTotal).toFixed(2)}</ThemedText> 
                        <ThemedText style={styles.billTextRight}>₹{(subTotal - savedAmount).toFixed(2)}</ThemedText>
              </View>
            </View>
            <View style={styles.billRow}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <ThemedText style={styles.billTextLeft}>Delivery charge</ThemedText>
                        <Ionicons name="information-circle-outline" size={14} color={Colors.light.muted} style={{marginLeft: 4}}/>
                    </View>
                    <ThemedText style={styles.billTextRight}>₹{deliveryCharge.toFixed(2)}</ThemedText>
                </View>
                <View style={styles.billRow}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <ThemedText style={styles.billTextLeft}>Handling charge</ThemedText>
                        <Ionicons name="information-circle-outline" size={14} color={Colors.light.muted} style={{marginLeft: 4}}/>
                    </View>
                    <ThemedText style={styles.billTextRight}>₹{handlingCharge.toFixed(2)}</ThemedText>
                </View>
                {smallCartCharge > 0 && (
                     <View style={styles.billRow}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <ThemedText style={styles.billTextLeft}>Small cart charge</ThemedText>
                            <Ionicons name="information-circle-outline" size={14} color={Colors.light.muted} style={{marginLeft: 4}}/>
                        </View>
                        <ThemedText style={styles.billTextRight}>₹{smallCartCharge.toFixed(2)}</ThemedText>
              </View>
              )}
                 <View style={[styles.billRow, styles.grandTotalRow]}>
                    <ThemedText style={styles.grandTotalTextLeft}>Grand total</ThemedText>
                    <ThemedText style={styles.grandTotalTextRight}>₹{grandTotalCalculation.toFixed(2)}</ThemedText>
                </View>
            </View>

            <View style={[styles.sectionCard, styles.donationSection]}>
                <Image source={{ uri: 'https://jLilerflLtmoeスキンケア.com/shared/img/transfer/img_nodata_01.png' }} style={styles.donationImage} />
                <View style={styles.donationTextContainer}>
                    <ThemedText style={styles.donationTitle}>Feeding India donation</ThemedText>
                    <ThemedText style={styles.donationSubtitle}>Working towards a malnutrition free India. Feeding India... <ThemedText style={styles.readMore}>read more</ThemedText></ThemedText>
                </View>
                <View style={styles.donationCheckboxContainer}>
                    <ThemedText style={styles.donationAmount}>₹1</ThemedText>
                    <Pressable onPress={() => setIsDonationChecked(!isDonationChecked)} 
                        style={[styles.checkboxBase, isDonationChecked && styles.checkboxChecked]}>
                        {isDonationChecked && <Ionicons name="checkmark" size={16} color={Colors.dark.text} />}
                    </Pressable>
              </View>
            </View>
            {/* Footer section for proceed button, address etc. is now part of FloatingCartView or directly below for this page */}
            <View style={styles.cartScreenFooterContainer}>
                 {isAuthenticated && address && cart.length > 0 && (
                    <View style={styles.deliveryAddressContainer}>
                        <Ionicons name="location-outline" size={20} color={Colors.light.tint} />
                        <ThemedText style={styles.deliveryAddressText} numberOfLines={1}>
                            Delivering to <ThemedText style={{fontWeight: 'bold'}}>{address.addressType} - {address.houseNo}, {address.area.split(',')[0]}</ThemedText>
                        </ThemedText>
                        <Pressable onPress={() => router.push('/address' as any)}>
                            <ThemedText style={styles.changeAddressButton}>Change</ThemedText>
                        </Pressable>
                    </View>
                )}
                <View style={styles.totalSummaryContainer}>
                    <View style={styles.proceedPriceContainer}>
                        <ThemedText style={styles.grandTotalFooterText}>₹{finalGrandTotal.toFixed(2)}</ThemedText>
                        <ThemedText style={styles.proceedTotalLabel}>GRAND TOTAL</ThemedText>
                    </View>
                    <Pressable 
                        style={[styles.proceedButton, (isLoadingAddress && cart.length > 0 && !address) && styles.proceedButtonLoading ]}
                        onPress={handleProceed} 
                        disabled={(isLoadingAddress && cart.length > 0 && !address) || cart.length === 0}
                    >
                        <ThemedText style={styles.proceedButtonText}>{proceedButtonText}</ThemedText>
                        {!(isLoadingAddress && cart.length > 0 && !address) && cart.length > 0 && <Ionicons name="chevron-forward-outline" size={20} color={Colors.dark.text} style={{marginLeft: 5}} />}
                    </Pressable>
                </View>
            </View>

          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

// Styles are largely the same, just removing footer specific styles that are now in FloatingCartView.tsx
// and adding styles for the new cartScreenFooterContainer
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centeredLoadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.background, 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.light.text },
  closeButton: { padding: 5 }, 
  scrollContentContainerPadded: { paddingHorizontal: 15, paddingBottom: 20 }, 
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyCartText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyCartSubText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 25,
  },
  shopNowButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  shopNowButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionCard: {
    backgroundColor: Colors.light.background, 
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2.62,
    elevation: 3,
  },
  deliveryTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  deliveryTimeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  deliveryTimeSubtitle: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  cartItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.light.border, 
  },
  cartItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  cartItemName: { fontSize: 15, fontWeight: '500', color: Colors.light.text, marginBottom: 3 },
  cartItemWeight: { fontSize: 12, color: Colors.light.muted, marginBottom: 4 },
  cartItemPriceRow: { flexDirection: 'row', alignItems: 'center' },
  cartItemPrice: { fontSize: 14, fontWeight: 'bold', color: Colors.light.text },
  cartItemOldPrice: { fontSize: 12, color: Colors.light.muted, textDecorationLine: 'line-through', marginLeft: 6 },
  quantityControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 20,
  },
  quantityButton: {
    padding: 8, 
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  billTextLeft: { fontSize: 14, color: Colors.light.text },
  billTextRight: { fontSize: 14, color: Colors.light.text, fontWeight: '500' },
  billTextRightStriked: { fontSize: 13, color: Colors.light.muted, textDecorationLine: 'line-through', marginRight: 6 },
  billSavedTag: {
      backgroundColor: '#E6F6F1', 
      color: Colors.light.tint,
      fontSize: 11,
      fontWeight: 'bold',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginRight: 8
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginTop: 8,
    paddingTop: 10,
  },
  grandTotalTextLeft: { fontSize: 16, fontWeight: 'bold', color: Colors.light.text },
  grandTotalTextRight: { fontSize: 16, fontWeight: 'bold', color: Colors.light.text },
  donationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, 
  },
  donationImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: Colors.light.border, 
  },
  donationTextContainer: {
    flex: 1,
  },
  donationTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.light.text, marginBottom: 2 },
  donationSubtitle: { fontSize: 11, color: Colors.light.muted, lineHeight: 15 },
  readMore: { color: Colors.light.tint, fontWeight: 'bold', fontSize: 11 },
  donationCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10, 
  },
  donationAmount: { fontSize: 14, fontWeight: 'bold', color: Colors.light.text, marginRight: 8 },
  checkboxBase: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.light.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  // Styles for the footer content that remains on the cart page itself
  cartScreenFooterContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 25 : 12, 
    backgroundColor: Colors.light.background, 
  },
  deliveryAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  deliveryAddressText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: Colors.light.text,
  },
  changeAddressButton: {
    color: Colors.light.tint,
    fontWeight: 'bold',
    fontSize: 13,
    paddingLeft: 10, 
  },
  totalSummaryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  proceedPriceContainer: {
      alignItems: 'flex-start',
  },
  grandTotalFooterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  proceedTotalLabel: {
      fontSize: 10,
      color: Colors.light.muted,
      fontWeight: '600',
      textTransform: 'uppercase' // Make it explicit that this is the grand total for the cart screen
  },
  proceedButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 150, 
  },
  proceedButtonLoading: {
      backgroundColor: Colors.light.muted, 
  },
  proceedButtonText: { color: Colors.dark.text, fontSize: 16, fontWeight: 'bold' },
});
