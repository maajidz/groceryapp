import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCart } from '@/contexts/CartContext'; // Import useCart
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router'; // Import Link
import React, { useMemo } from 'react'; // Removed useState for cart
import { FlatList, Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// --- Expanded Sample Data --- 
// (Assuming allProducts is defined as before or imported from a shared location)
const allProducts = [
  { id: 'h1', name: 'Catch Cumin Seeds / Jeera Seeds', category: 'Spices', brand: 'Catch', weight: '100 g', price: '₹49', oldPrice: '₹65', discount: '24% OFF', deliveryTime: '8 MINS', image: `https://via.placeholder.com/145x110.png/EFEFEF/AAAAAA&text=Cumin`, tags: ['spice', 'cumin', 'jeera', 'masala'] },
  { id: 'h2', name: 'Whole Farm Grocery Makhana', category: 'Snacks', brand: 'Whole Farm', weight: '100 g', price: '₹159', oldPrice: '₹210', discount: '24% OFF', deliveryTime: '8 MINS', image: `https://via.placeholder.com/145x110.png/EFEFEF/AAAAAA&text=Makhana`, tags: ['snack', 'makhana', 'fox nuts', 'healthy'] },
  { id: 'h3', name: 'Whole Farm Grocery Raisins', category: 'Dry Fruits', brand: 'Whole Farm', weight: '200 g', price: '₹88', oldPrice: '₹200', discount: '56% OFF', deliveryTime: '8 MINS', image: `https://via.placeholder.com/145x110.png/EFEFEF/AAAAAA&text=Raisins`, tags: ['dry fruit', 'raisins', 'kishmish'] },
  { id: 'd1', name: 'Sweet Corn - Packet', category: 'Vegetables', brand: 'Local', weight: '(180-200) g', price: '₹20', oldPrice: '₹45', discount: '56% OFF', deliveryTime: '8 MINS', image: `https://via.placeholder.com/145x110.png/EFEFEF/AAAAAA&text=Corn`, tags: ['vegetable', 'corn', 'sweet corn'] },
  { id: 'd2', name: 'Kiran Watermelon (Tarbuj)', category: 'Fruits', brand: 'Kiran', weight: '1 piece', price: '₹80', oldPrice: '₹100', discount: '23% OFF', deliveryTime: '8 MINS', image: `https://via.placeholder.com/145x110.png/EFEFEF/AAAAAA&text=Watermelon`, tags: ['fruit', 'watermelon', 'tarbuj'] },
  { id: 'd3', name: 'Baby Banana', category: 'Fruits', brand: 'Local', weight: '4 pieces', price: '₹30', oldPrice: '₹35', discount: '21% OFF', deliveryTime: '8 MINS', image: `https://via.placeholder.com/145x110.png/EFEFEF/AAAAAA&text=Banana`, tags: ['fruit', 'banana', 'baby banana'] },
  { id: 'p1', name: 'Amul Gold Milk', category: 'Dairy & Breakfast', brand: 'Amul', weight: '1 Litre', price: '₹70', deliveryTime: '8 MINS', image: `https://via.placeholder.com/145x110.png/EFEFEF/AAAAAA&text=Milk`, tags: ['dairy', 'milk', 'amul gold'] },
  { id: 'p2', name: 'Britannia Brown Bread', category: 'Dairy & Breakfast', brand: 'Britannia', weight: '400g', price: '₹50', deliveryTime: '8 MINS', image: `https://via.placeholder.com/145x110.png/EFEFEF/AAAAAA&text=Bread`, tags: ['bakery', 'bread', 'brown bread'] },
  { id: 'p3', name: 'Lays Classic Salted Chips', category: 'Munchies', brand: 'Lays', weight: '52g', price: '₹20', deliveryTime: '8 MINS', image: `https://via.placeholder.com/145x110.png/EFEFEF/AAAAAA&text=Chips`, tags: ['snack', 'chips', 'lays', 'potato'] },
  { id: 'p4', name: 'Coca-Cola Can', category: 'Cold Drinks & Juices', brand: 'Coca-Cola', weight: '300ml', price: '₹40', deliveryTime: '8 MINS', image: `https://via.placeholder.com/145x110.png/EFEFEF/AAAAAA&text=Coke`, tags: ['beverage', 'coke', 'soda', 'cold drink'] },
  { id: 'p5', name: 'Maggi 2-Minute Noodles', category: 'Instant & Frozen Food', brand: 'Maggi', weight: '70g', price: '₹14', deliveryTime: '8 MINS', image: `https://via.placeholder.com/145x110.png/EFEFEF/AAAAAA&text=Maggi`, tags: ['instant food', 'noodles', 'maggi'] },
];

const categories = [
  { id: '1', name: 'Vegetables & Fruits', image: `https://via.placeholder.com/90x70.png/EFEFEF/AAAAAA&text=Fruits` },
  { id: '2', name: 'Dairy & Breakfast', image: `https://via.placeholder.com/90x70.png/EFEFEF/AAAAAA&text=Dairy` },
  { id: '3', name: 'Munchies', image: `https://via.placeholder.com/90x70.png/EFEFEF/AAAAAA&text=Munchies` },
  { id: '4', name: 'Cold Drinks & Juices', image: `https://via.placeholder.com/90x70.png/EFEFEF/AAAAAA&text=Drinks` },
  { id: '5', name: 'Instant & Frozen Food', image: `https://via.placeholder.com/90x70.png/EFEFEF/AAAAAA&text=Frozen` },
  { id: '6', name: 'Spices', image: `https://via.placeholder.com/90x70.png/EFEFEF/AAAAAA&text=Spices`},
];

const bannerImageUrl = `https://via.placeholder.com/380x130.png/E0E0E0/AAAAAA&text=Grocery+Deals`;

export default function HomeScreen() {
  const router = useRouter();
  const { cart, addItemToCart, decrementItemFromCart, totalCartItems, totalCartPrice } = useCart(); // Added decrementItemFromCart

  const hotDeals = useMemo(() => allProducts.filter(p => ['h1', 'h2', 'h3'].includes(p.id)), []);
  const dailyNeeds = useMemo(() => allProducts.filter(p => ['d1', 'd2', 'd3'].includes(p.id)), []);

  const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity style={styles.categoryItemContainer}>
      <Image source={{ uri: item.image }} style={styles.categoryImage} resizeMode="contain" />
      <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: typeof allProducts[0] }) => {
    const cartItem = cart.find(ci => ci.id === item.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    return (
      <Link href={{ pathname: "/products/[id]", params: { id: item.id } }} asChild>
        <TouchableOpacity style={styles.productItemContainer}>
          <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="contain" />
          {item.discount && (
            <View style={styles.discountBadge}>
              <ThemedText style={styles.discountText}>{item.discount}</ThemedText>
            </View>
          )}
          <View style={styles.deliveryTimeContainer}>
            <Ionicons name="timer-outline" size={14} color="#4A4A4A" />
            <ThemedText style={styles.deliveryTimeText}>{item.deliveryTime}</ThemedText>
          </View>
          <ThemedText style={styles.productName} numberOfLines={2}>{item.name}</ThemedText>
          <ThemedText style={styles.productWeight}>{item.weight}</ThemedText>
          
          <View style={[
            styles.productBottomContainer,
            quantityInCart > 0 && styles.productBottomContainerColumn
          ]}>
            <View style={[
              styles.productPricingInfoContainerBase,
              quantityInCart === 0 && styles.productPricingInfoContainerRowMode
            ]}> 
              <ThemedText style={styles.productPrice}>{item.price}</ThemedText>
              {item.oldPrice && <ThemedText style={styles.productOldPrice}>{item.oldPrice}</ThemedText>}
            </View>
            {quantityInCart > 0 ? (
              <View style={[
                styles.quantityControlContainer,
                quantityInCart > 0 && styles.quantityControlContainerColumnMode
              ]}>
                <TouchableOpacity onPress={() => decrementItemFromCart(item)} style={styles.quantityButton}>
                  <Ionicons name="remove" size={16} color="#00A877" />
                </TouchableOpacity>
                <ThemedText style={styles.quantityText}>{quantityInCart}</ThemedText>
                <TouchableOpacity onPress={() => addItemToCart(item)} style={styles.quantityButton}>
                  <Ionicons name="add" size={16} color="#00A877" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={() => addItemToCart(item)}>
                <ThemedText style={styles.addButtonText}>ADD</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <ThemedView style={styles.outerContainer}> 
      <ScrollView 
        style={styles.scrollViewContainer} 
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.mainHeaderContainer}>
          <View>
            <ThemedText style={styles.headerTitle}>Delivery in 8 minutes</ThemedText>
            <TouchableOpacity style={styles.locationContainer}>
              <ThemedText style={styles.locationText}>Freedom Fighters Enclave, Sainik Fa...</ThemedText>
              <Ionicons name="chevron-down-outline" size={16} color="#000000" />
            </TouchableOpacity>
          </View>
          <Ionicons name="person-circle-outline" size={32} color="#000000" />
        </ThemedView>

        <TouchableOpacity 
          style={styles.searchBarContainer} 
          onPress={() => router.push('/search')}
        >
          <Ionicons name="search-outline" size={20} color="#808080" style={styles.searchIcon} />
          <ThemedText style={styles.searchPlaceholderText}>Search 'sugar'</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bannerContainer}>
          <Image source={{ uri: bannerImageUrl }} style={styles.bannerImage} resizeMode="cover"/>
        </TouchableOpacity>

        <View style={styles.sectionContainer}>
          <ThemedText type="title" style={[styles.sectionTitle, { paddingLeft: 15 }]}>Shop by category</ThemedText>
          <FlatList data={categories} renderItem={renderCategoryItem} keyExtractor={(item) => item.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListContainer} />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderContainer}>
            <ThemedText type="title" style={styles.sectionTitle}>Hot deals</ThemedText>
            <TouchableOpacity><ThemedText style={styles.seeAllText}>see all</ThemedText></TouchableOpacity>
          </View>
          <FlatList data={hotDeals} renderItem={renderProductItem} keyExtractor={(item) => item.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListContainer} />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderContainer}>
            <ThemedText type="title" style={styles.sectionTitle}>Your daily fresh needs</ThemedText>
            <TouchableOpacity><ThemedText style={styles.seeAllText}>see all</ThemedText></TouchableOpacity>
          </View>
          <FlatList data={dailyNeeds} renderItem={renderProductItem} keyExtractor={(item) => item.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListContainer} />
        </View>
      </ScrollView>
      
      {totalCartItems > 0 && (
        <View style={styles.cartPreviewContainer}>
          <View>
            <ThemedText style={styles.cartPreviewText}>{totalCartItems} Item{totalCartItems > 1 ? 's' : ''}</ThemedText>
            <ThemedText style={styles.cartPreviewPrice}>₹{totalCartPrice.toFixed(2)}</ThemedText>
          </View>
          <TouchableOpacity style={styles.viewCartButton} onPress={() => router.push('/cart')}>
            <ThemedText style={styles.viewCartButtonText}>View Cart</ThemedText>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

// Styles remain largely the same, with additions for quantity controls
const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollViewContainer: { flex: 1 },
  scrollContentContainer: { paddingBottom: 80 }, 
  mainHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: Platform.OS === 'android' ? 25 : 45, paddingBottom: 12, backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#000000' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  locationText: { fontSize: 13, color: '#333333', marginRight: 3 },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, marginHorizontal: 15, marginTop: 8, marginBottom: 20, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 12 }, 
  searchIcon: { marginRight: 10 }, 
  searchPlaceholderText: { fontSize: 15, color: '#808080', flex: 1 }, 
  bannerContainer: { marginHorizontal: 15, marginBottom: 25, borderRadius: 12, overflow: 'hidden', backgroundColor: '#E0E0E0' },
  bannerImage: { width: '100%', height: 130 },
  sectionContainer: { marginBottom: 25 },
  sectionHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 15 },
  sectionTitle: { fontSize: 19, fontWeight: 'bold', color: '#1A1A1A' },
  seeAllText: { fontSize: 14, color: '#00A877', fontWeight: '600' },
  horizontalListContainer: { paddingLeft: 15, paddingRight: 5 },
  categoryItemContainer: { width: 90, marginRight: 15, alignItems: 'center' },
  categoryImage: { width: '100%', height: 70, borderRadius: 8, marginBottom: 8 },
  categoryName: { fontSize: 12.5, textAlign: 'center', color: '#2C2C2C', fontWeight: '500', lineHeight: 16 },
  productItemContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginRight: 12, width: 145, elevation: 1.5, shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, borderWidth: 1, borderColor: '#F0F0F0', justifyContent: 'space-between' },
  productImage: { width: '100%', height: 110, borderRadius: 8, marginBottom: 10 },
  discountBadge: { position: 'absolute', top: 0, left: 0, backgroundColor: '#1E88E5', paddingHorizontal: 7, paddingVertical: 4, borderTopLeftRadius: 12, borderBottomRightRadius: 8 },
  discountText: { color: '#FFFFFF', fontSize: 9.5, fontWeight: 'bold' },
  deliveryTimeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  deliveryTimeText: { fontSize: 10.5, color: '#4A4A4A', marginLeft: 3, fontWeight: 'bold' },
  productName: { fontSize: 13.5, fontWeight: '600', color: '#202020', marginBottom: 3, lineHeight: 18 },
  productWeight: { fontSize: 11.5, color: '#606060', marginBottom: 8 },
  productBottomContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  productBottomContainerColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  productPricingInfoContainerBase: {
    flexDirection: 'column', 
    alignItems: 'flex-start',
  },
  productPricingInfoContainerRowMode: {
    flex: 1,
  },
  productPrice: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A' },
  productOldPrice: { fontSize: 11.5, color: '#808080', textDecorationLine: 'line-through' },
  addButton: { backgroundColor: '#FFFFFF', borderColor: '#00A877', borderWidth: 1.5, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#00A877', fontWeight: 'bold', fontSize: 13.5 },
  quantityControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#00A877',
    borderWidth: 1.5,
    borderRadius: 8,
  },
  quantityControlContainerColumnMode: {
    marginTop: 8,
  },
  quantityButton: {
    paddingHorizontal: 10,
    paddingVertical: 5, 
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00A877',
    paddingHorizontal: 8,
  },
  cartPreviewContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#00A877', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderTopLeftRadius: 12, borderTopRightRadius: 12, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  cartPreviewText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  cartPreviewPrice: { color: '#FFFFFF', fontSize: 12, fontWeight: '500', marginTop: 2 },
  viewCartButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00875F', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
  viewCartButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginRight: 6 },
});
