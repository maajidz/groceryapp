import ShimmerPlaceholder from '@/components/ShimmerPlaceholder'; // Import ShimmerPlaceholder
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors'; // Import Colors
import { useCart } from '@/contexts/CartContext'; // Import useCart
import { getAllProducts, Product } from '@/data/products'; // Updated import for products
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router'; // Import Link
import React, { useEffect, useMemo, useState } from 'react'; // Added useState & useEffect
import { FlatList, Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
// Import image maps
import { BannerImageKeys, bannerImages, CategoryImageKeys, categoryImages, ProductImageKeys, productImages } from '@/utils/imageMap';

// Updated categories to use filenames for mapping (or could store direct sources from map)
const categoriesData = [
  { id: '1', name: 'Vegetables & Fruits', imageFileName: 'cat_veg_fruits.png' as CategoryImageKeys },
  { id: '2', name: 'Dairy & Breakfast', imageFileName: 'cat_dairy_breakfast.png' as CategoryImageKeys },
  { id: '3', name: 'Munchies', imageFileName: 'cat_munchies.png' as CategoryImageKeys },
  { id: '4', name: 'Cold Drinks & Juices', imageFileName: 'cat_drinks_juices.png' as CategoryImageKeys },
  { id: '5', name: 'Instant & Frozen Food', imageFileName: 'cat_instant_frozen.png' as CategoryImageKeys },
  { id: '6', name: 'Spices', imageFileName: 'cat_spices.png' as CategoryImageKeys },
];

const bannerImageFileName: BannerImageKeys = 'main_banner.png';

export default function HomeScreen() {
  const router = useRouter();
  const { cart, addItemToCart, decrementItemFromCart, totalCartItems, totalCartPrice } = useCart();

  const [allDisplayProducts, setAllDisplayProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Define colors directly using Colors.light as theme is fixed
  const themedTextColor = Colors.light.text;
  const themedMutedTextColor = '#4A4A4A'; // Specific light mode muted text
  const themedPrimaryColor = Colors.light.tint;
  const cardBackgroundColor = Colors.light.background; // Or a specific light card color e.g. '#FFFFFF'
  const themedBorderColor = '#F0F0F0'; // Specific light mode border
  const searchBarBackgroundColor = '#F5F5F5'; // Specific light mode search bar bg
  const headerIconsColor = '#000000'; // Specific light mode header icon color

  useEffect(() => {
    setIsLoadingProducts(true);
    const products = getAllProducts();
    setAllDisplayProducts(products);
    setIsLoadingProducts(false);
  }, []);

  const hotDeals = useMemo(() => allDisplayProducts.filter(p => ['h1', 'h2', 'h3'].includes(p.id)), [allDisplayProducts]);
  const dailyNeeds = useMemo(() => allDisplayProducts.filter(p => ['d1', 'd2', 'd3'].includes(p.id)), [allDisplayProducts]);

  const renderCategoryItem = ({ item }: { item: typeof categoriesData[0] }) => (
    <TouchableOpacity style={[dynamicStyles.categoryItemContainer, {backgroundColor: cardBackgroundColor}]}>
      {/* Use imageMap for category images */}
      <Image source={categoryImages[item.imageFileName]} style={styles.categoryImage} resizeMode="contain" />
      <ThemedText style={dynamicStyles.categoryName}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    const cartItem = cart.find(ci => ci.id === item.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;
    
    const imageFilename = item.imageFileNames?.[0];
    // Use imageMap for product images
    const imageSource = imageFilename ? productImages[imageFilename as ProductImageKeys] : undefined;

    return (
      <Link href={{ pathname: "/products/[id]", params: { id: item.id } }} asChild>
        <TouchableOpacity style={[dynamicStyles.productItemContainer, {backgroundColor: cardBackgroundColor, borderColor: themedBorderColor}]}>
          {imageSource ? (
            <Image source={imageSource} style={styles.productImage} resizeMode="contain" />
          ) : (
            <ShimmerPlaceholder width={120} height={styles.productImage.height} borderRadius={styles.productImage.borderRadius} style={{marginBottom: styles.productImage.marginBottom}} />
          )}
          {item.discount && (
            <View style={[styles.discountBadge, {backgroundColor: themedPrimaryColor}]}>
              <ThemedText style={[styles.discountText, {color: Colors.dark.text /* White text on primary bg */}]}>{item.discount}</ThemedText>
            </View>
          )}
          <View style={styles.deliveryTimeContainer}>
            <Ionicons name="timer-outline" size={14} color={themedMutedTextColor} />
            <ThemedText style={[dynamicStyles.deliveryTimeText, {color: themedMutedTextColor}]}>{item.deliveryTime}</ThemedText>
          </View>
          <ThemedText style={dynamicStyles.productName} numberOfLines={2}>{item.name}</ThemedText>
          <ThemedText style={[dynamicStyles.productWeight, {color: themedMutedTextColor }]}>{item.weight}</ThemedText>
          
          <View style={[
            styles.productBottomContainer,
            quantityInCart > 0 && styles.productBottomContainerColumn
          ]}>
            <View style={[
              styles.productPricingInfoContainerBase,
              quantityInCart === 0 && styles.productPricingInfoContainerRowMode
            ]}> 
              <ThemedText style={dynamicStyles.productPrice}>{item.price}</ThemedText>
              {item.oldPrice && <ThemedText style={[dynamicStyles.productOldPrice, {color: themedMutedTextColor}]}>{item.oldPrice}</ThemedText>}
            </View>
            {quantityInCart > 0 ? (
              <View style={[
                dynamicStyles.quantityControlContainer,
                {borderColor: themedPrimaryColor},
                quantityInCart > 0 && styles.quantityControlContainerColumnMode
              ]}>
                <TouchableOpacity onPress={() => decrementItemFromCart(item)} style={styles.quantityButton}>
                  <Ionicons name="remove" size={16} color={themedPrimaryColor} />
                </TouchableOpacity>
                <ThemedText style={[dynamicStyles.quantityText, {color: themedPrimaryColor}]}>{quantityInCart}</ThemedText>
                <TouchableOpacity onPress={() => addItemToCart(item)} style={styles.quantityButton}>
                  <Ionicons name="add" size={16} color={themedPrimaryColor} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[dynamicStyles.addButton, {borderColor: themedPrimaryColor, backgroundColor: cardBackgroundColor}] } onPress={() => addItemToCart(item)}>
                <ThemedText style={[dynamicStyles.addButtonText, {color: themedPrimaryColor}]}>ADD</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  // Define dynamic styles. These no longer need to call useThemeColor or depend on colorScheme.
  const dynamicStyles = StyleSheet.create({
    outerContainer: { flex: 1, backgroundColor: Colors.light.background },
    mainHeaderContainer: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingHorizontal: 15, 
      paddingTop: Platform.OS === 'android' ? 25 : 45, 
      paddingBottom: 12, 
      backgroundColor: '#FFFFFF' // Explicitly light background for header
    },
    headerTitle: { 
      fontSize: 17, 
      fontWeight: 'bold', 
      color: themedTextColor 
    },
    locationText: { 
      fontSize: 13, 
      color: themedMutedTextColor, 
      marginRight: 3 
    },
    searchBarContainer: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: searchBarBackgroundColor, 
      borderRadius: 10, 
      marginHorizontal: 15, 
      marginTop: 8, 
      marginBottom: 20, 
      paddingHorizontal: 12, 
      paddingVertical: Platform.OS === 'ios' ? 12 : 12 
    },
    searchPlaceholderText: { 
      fontSize: 15, 
      color: themedMutedTextColor, 
      flex: 1 
    },
    sectionTitle: { 
      fontSize: 19, 
      fontWeight: 'bold', 
      color: themedTextColor 
    },
    seeAllText: { 
      fontSize: 14, 
      color: themedPrimaryColor, 
      fontWeight: '600' 
    },
    categoryItemContainer: {
      width: 90, 
      marginRight: 15, 
      alignItems: 'center',
      padding: 8,
      borderRadius: 8,
      // backgroundColor will be applied inline
    },
    categoryName: { 
      fontSize: 12.5, 
      textAlign: 'center', 
      color: themedTextColor, 
      fontWeight: '500', 
      lineHeight: 16 
    },
    productItemContainer: {
      borderRadius: 12, 
      padding: 12, 
      marginRight: 12, 
      width: 145, 
      elevation: 1.5, 
      shadowColor: '#000000', // Standard shadow for light theme
      shadowOffset: { width: 0, height: 1 }, 
      shadowOpacity: 0.08, 
      shadowRadius: 3, 
      borderWidth: 1, 
      justifyContent: 'space-between' 
      // backgroundColor and borderColor applied inline
    },
    deliveryTimeText: { 
      fontSize: 10.5, 
      marginLeft: 3, 
      fontWeight: 'bold' 
      // color applied inline
    },
    productName: { 
      fontSize: 13.5, 
      fontWeight: '600', 
      color: themedTextColor, 
      marginBottom: 3, 
      lineHeight: 18 
    },
    productWeight: { 
      fontSize: 11.5, 
      marginBottom: 8 
      // color applied inline
    },
    productPrice: { 
      fontSize: 15, 
      fontWeight: 'bold', 
      color: themedTextColor 
    },
    productOldPrice: { 
      fontSize: 11.5, 
      textDecorationLine: 'line-through' 
      // color applied inline
    },
    addButton: { // borderColor and backgroundColor applied inline
      borderWidth: 1.5, 
      borderRadius: 8, 
      paddingVertical: 7, 
      paddingHorizontal: 18, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },
    addButtonText: { // color applied inline
      fontWeight: 'bold', 
      fontSize: 13.5 
    },
    quantityControlContainer: { // borderColor applied inline
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderRadius: 8,
    },
    quantityText: { // color applied inline
      fontSize: 14,
      fontWeight: 'bold',
      paddingHorizontal: 8,
    },
    cartPreviewContainer: { // Specific branding colors, kept as is
      position: 'absolute', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      backgroundColor: '#00A877', 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingVertical: 12, 
      paddingHorizontal: 20, 
      borderTopLeftRadius: 12, 
      borderTopRightRadius: 12, 
      elevation: 8, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: -2 }, 
      shadowOpacity: 0.1, 
      shadowRadius: 3 
    },
     cartPreviewText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
     cartPreviewPrice: { color: '#FFFFFF', fontSize: 12, fontWeight: '500', marginTop: 2 },
     viewCartButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00875F', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
     viewCartButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginRight: 6 },
  });

  return (
    <ThemedView style={dynamicStyles.outerContainer}> 
      <ScrollView 
        style={styles.scrollViewContainer} 
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={dynamicStyles.mainHeaderContainer}>
          <View>
            <ThemedText style={dynamicStyles.headerTitle}>Delivery in 8 minutes</ThemedText>
            <TouchableOpacity style={styles.locationContainer}>
              <ThemedText style={dynamicStyles.locationText}>Freedom Fighters Enclave, Sainik Fa...</ThemedText>
              <Ionicons name="chevron-down-outline" size={16} color={headerIconsColor} />
            </TouchableOpacity>
          </View>
          <Ionicons name="person-circle-outline" size={32} color={headerIconsColor} />
        </ThemedView>

        <TouchableOpacity 
          style={dynamicStyles.searchBarContainer} 
          onPress={() => router.push('/search')}
        >
          <Ionicons name="search-outline" size={20} color={themedMutedTextColor} style={styles.searchIcon} />
          <ThemedText style={dynamicStyles.searchPlaceholderText}>Search 'sugar'</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.bannerContainer, {backgroundColor: cardBackgroundColor}]}>
          {/* Use imageMap for banner image */}
          <Image source={bannerImages[bannerImageFileName]} style={styles.bannerImage} resizeMode="cover"/>
        </TouchableOpacity>

        <View style={styles.sectionContainer}>
          <ThemedText type="title" style={[dynamicStyles.sectionTitle, { paddingLeft: 15 }]}>Shop by category</ThemedText>
          {/* Use categoriesData which maps to categoryImages */}
          <FlatList data={categoriesData} renderItem={renderCategoryItem} keyExtractor={(item) => item.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListContainer} />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderContainer}>
            <ThemedText type="title" style={dynamicStyles.sectionTitle}>Hot deals</ThemedText>
            <TouchableOpacity><ThemedText style={dynamicStyles.seeAllText}>see all</ThemedText></TouchableOpacity>
          </View>
          {isLoadingProducts ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListContainer}>
              {[1, 2, 3].map(idx => (
                <View key={idx} style={dynamicStyles.productItemContainer}>
                  <ShimmerPlaceholder width={120} height={110} borderRadius={8} style={{ marginBottom: 10 }} />
                  <ShimmerPlaceholder width={100} height={18} borderRadius={4} style={{ marginBottom: 3 }} />
                  <ShimmerPlaceholder width={60} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
                  <View style={styles.productBottomContainer}>
                    <ShimmerPlaceholder width={50} height={20} borderRadius={4} />
                    <ShimmerPlaceholder width={60} height={30} borderRadius={6} />
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <FlatList data={hotDeals} renderItem={renderProductItem} keyExtractor={(item) => item.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListContainer} />
          )}
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderContainer}>
            <ThemedText type="title" style={dynamicStyles.sectionTitle}>Your daily fresh needs</ThemedText>
            <TouchableOpacity><ThemedText style={dynamicStyles.seeAllText}>see all</ThemedText></TouchableOpacity>
          </View>
          {isLoadingProducts ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListContainer}>
              {[1, 2, 3].map(idx => (
                <View key={idx} style={dynamicStyles.productItemContainer}>
                  <ShimmerPlaceholder width={120} height={110} borderRadius={8} style={{ marginBottom: 10 }} />
                  <ShimmerPlaceholder width={100} height={18} borderRadius={4} style={{ marginBottom: 3 }} />
                  <ShimmerPlaceholder width={60} height={14} borderRadius={4} style={{ marginBottom: 8 }} />
                  <View style={styles.productBottomContainer}>
                    <ShimmerPlaceholder width={50} height={20} borderRadius={4} />
                    <ShimmerPlaceholder width={60} height={30} borderRadius={6} />
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <FlatList data={dailyNeeds} renderItem={renderProductItem} keyExtractor={(item) => item.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListContainer} />
          )}
        </View>
      </ScrollView>
      
      {totalCartItems > 0 && (
        <View style={dynamicStyles.cartPreviewContainer}>
          <View>
            <ThemedText style={dynamicStyles.cartPreviewText}>{totalCartItems} Item{totalCartItems > 1 ? 's' : ''}</ThemedText>
            <ThemedText style={dynamicStyles.cartPreviewPrice}>₹{totalCartPrice.toFixed(2)}</ThemedText>
          </View>
          <TouchableOpacity style={dynamicStyles.viewCartButton} onPress={() => router.push('/cart')}>
            <ThemedText style={dynamicStyles.viewCartButtonText}>View Cart</ThemedText>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

// Static styles that don't depend on theme colors directly
const styles = StyleSheet.create({
  scrollViewContainer: { flex: 1 },
  scrollContentContainer: { paddingBottom: 80 }, 
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  searchIcon: { marginRight: 10 }, 
  bannerContainer: { marginHorizontal: 15, marginBottom: 25, borderRadius: 12, overflow: 'hidden' /* backgroundColor set dynamically in dynamicStyles */ },
  bannerImage: { width: '100%', height: 130 },
  sectionContainer: { marginBottom: 25 },
  sectionHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 15 },
  horizontalListContainer: { paddingLeft: 15, paddingRight: 5 },
  categoryImage: { width: '100%', height: 70, borderRadius: 8, marginBottom: 8 },
  productImage: { width: '100%', height: 110, borderRadius: 8, marginBottom: 10 },
  productImagePlaceholder: { // This is for Shimmer, its own colors are fine
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: { /* backgroundColor set dynamically */ position: 'absolute', top: 0, left: 0, paddingHorizontal: 7, paddingVertical: 4, borderTopLeftRadius: 12, borderBottomRightRadius: 8 },
  discountText: { /* color set dynamically */ fontSize: 9.5, fontWeight: 'bold' },
  deliveryTimeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
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
  quantityControlContainerColumnMode: {
    marginTop: 8,
  },
  quantityButton: {
    paddingHorizontal: 10,
    paddingVertical: 5, 
  },
});
