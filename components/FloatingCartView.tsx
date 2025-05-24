import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useAddress } from '@/contexts/AddressContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import React from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    View
} from 'react-native';

const DELIVERY_CHARGE_VALUE = 30;
const HANDLING_CHARGE_VALUE = 9;
const SMALL_CART_FEE_VALUE = 20;
const SMALL_CART_THRESHOLD = 100;

export default function FloatingCartView() {
  const router = useRouter();
  const pathname = usePathname();
  const { cart, totalCartPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const { address, isLoadingAddress } = useAddress();

  // Calculate totals (similar to cart.tsx but simplified for the floating view)
  const subTotal = totalCartPrice;
  const deliveryCharge = cart.length > 0 ? DELIVERY_CHARGE_VALUE : 0;
  const handlingCharge = cart.length > 0 ? HANDLING_CHARGE_VALUE : 0;
  const smallCartCharge = (cart.length > 0 && subTotal < SMALL_CART_THRESHOLD && subTotal > 0) ? SMALL_CART_FEE_VALUE : 0;
  const savedAmount = 10; // Assuming this is a general saving, adjust if it's dynamic
  const grandTotalCalculation = subTotal - savedAmount + deliveryCharge + handlingCharge + smallCartCharge;
  // Assuming donation is not part of this floating view for simplicity, can be added if needed
  const finalGrandTotal = grandTotalCalculation;

  const handleProceed = () => {
    router.push('/cart');
  };

  const excludedRoutes = ['/cart', '/payment', '/tracking', '/login', '/address', '/otp'];
  if (cart.length === 0 || excludedRoutes.includes(pathname)) {
    return null;
  }

  let proceedButtonText = 'View Cart';

  return (
    <View style={styles.footerContainer}>
        {isAuthenticated && address && (
            <View style={styles.deliveryAddressContainer}>
                <Ionicons name="location-outline" size={20} color={Colors.light.tint} />
                <ThemedText style={styles.deliveryAddressText} numberOfLines={1}>
                    Delivering to <ThemedText style={{fontWeight: 'bold'}}>{address.addressType} - {address.houseNo}, {address.area.split(',')[0]}</ThemedText>
                </ThemedText>
                 {/* Removed Change button as this is a global component, change happens in cart or address page */}
            </View>
        )}
        <View style={styles.totalSummaryContainer}>
            <View style={styles.proceedPriceContainer}>
                <ThemedText style={styles.grandTotalFooterText}>₹{finalGrandTotal.toFixed(2)}</ThemedText>
                <ThemedText style={styles.proceedTotalLabel}>TOTAL ({cart.length} item{cart.length !==1 ? 's' : ''})</ThemedText>
            </View>
            <Pressable 
                style={[styles.proceedButton, isLoadingAddress && styles.proceedButtonLoading ]}
                onPress={handleProceed} 
                disabled={isLoadingAddress}
            >
                <ThemedText style={styles.proceedButtonText}>{proceedButtonText}</ThemedText>
                {!isLoadingAddress && <Ionicons name="chevron-forward-outline" size={20} color={Colors.dark.text} style={{marginLeft: 5}} />}
            </Pressable>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 25 : 12, 
    backgroundColor: Colors.light.background, 
    elevation: 10, // For Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000, // Ensure it's on top
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
