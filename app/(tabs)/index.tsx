import ShimmerPlaceholder from '@/components/ShimmerPlaceholder'; // Import ShimmerPlaceholder
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors'; // Import Colors
import { useCart } from '@/contexts/CartContext'; // Import useCart
import { getAllProducts, Product } from '@/data/products'; // Updated import for products
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router'; // Import Link
import React, { useEffect, useMemo, useState } from 'react'; // Added useState & useEffect
import { FlatList, Image, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView
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

// Type for the new top filter categories
interface TopFilterCategory {
  id: string;
  name: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'] | React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconType: 'Ionicons' | 'MaterialCommunityIcons';
}

// Data for the new top filter categories based on the second screenshot
const topFilterCategories: TopFilterCategory[] = [
  { id: 'all', name: 'All', iconName: 'grid-outline', iconType: 'Ionicons' },
  { id: 'summer', name: 'Summer', iconName: 'sunny-outline', iconType: 'Ionicons' }, // New category from screenshot
  { id: 'electronics', name: 'Electronics', iconName: 'headset-outline', iconType: 'Ionicons' },
  { id: 'beauty', name: 'Beauty', iconName: 'sparkles-outline', iconType: 'Ionicons' }, // Changed icon
  { id: 'decor', name: 'Decor', iconName: 'color-palette-outline', iconType: 'Ionicons' }, // Changed icon
  { id: 'kitchen', name: 'Kitchen', iconName: 'restaurant-outline', iconType: 'Ionicons' }, // Changed icon
  // Add more categories as needed, e.g., Fashion, Toys, Books etc.
];

export default function HomeScreen() {
  const router = useRouter();
  const { cart, addItemToCart, decrementItemFromCart, totalCartItems, totalCartPrice } = useCart();
  const [activeTopFilter, setActiveTopFilter] = useState<string>(topFilterCategories[0]?.id || 'all'); // For active state

  const [allDisplayProducts, setAllDisplayProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const { width: windowWidth } = useWindowDimensions(); // Get window width for banner shimmer

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
    <Pressable style={[dynamicStyles.categoryItemContainer, {backgroundColor: cardBackgroundColor}]}>
      {/* Use imageMap for category images */}
      <Image source={categoryImages[item.imageFileName]} style={styles.categoryImage} resizeMode="contain" />
      <ThemedText style={dynamicStyles.categoryName}>{item.name}</ThemedText>
    </Pressable>
  );

  const renderTopFilterCategoryItem = ({ item }: { item: TopFilterCategory }) => (
    <Pressable 
      style={[
        dynamicStyles.topFilterItemContainer,
        item.id === activeTopFilter && dynamicStyles.topFilterItemActive
      ]}
      onPress={() => setActiveTopFilter(item.id)} // Set active filter
    >
      {item.iconType === 'Ionicons' ? (
        <Ionicons name={item.iconName as any} size={22} color={item.id === activeTopFilter ? themedPrimaryColor : themedMutedTextColor} />
      ) : (
        <MaterialCommunityIcons name={item.iconName as any} size={22} color={item.id === activeTopFilter ? themedPrimaryColor : themedMutedTextColor} />
      )}
      <ThemedText 
        style={[
          dynamicStyles.topFilterItemText,
          item.id === activeTopFilter && dynamicStyles.topFilterItemTextActive
        ]}
      >
        {item.name}
        {item.name === "Summer" && <ThemedText style={dynamicStyles.newBadgeText}> New</ThemedText>} 
      </ThemedText>
      {item.name === "Summer" && <View style={dynamicStyles.newBadgeIndicator} />} 
    </Pressable>
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    const cartItem = cart.find(ci => ci.id === item.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;
    
    const imageFilename = item.imageFileNames?.[0];
    const imageSource = imageFilename ? productImages[imageFilename as ProductImageKeys] : undefined;

    let shimmerHeight: number = 110;
    if (styles.productImageContainer && typeof styles.productImageContainer.height === 'number') {
      shimmerHeight = styles.productImageContainer.height;
    }

    // Calculate shimmer width based on the productItemContainer's width
    // dynamicStyles.productItemContainer.width is windowWidth * 0.37
    // However, ShimmerPlaceholder is inside productImageContainer, which has width '100%'
    // Let's make shimmer width effectively the full width of its direct parent (productImageContainer)
    // We might need to pass the actual calculated width of productItemContainer if '100%' for shimmer is an issue.
    // For now, let's assume ShimmerPlaceholder can take numeric width, and we want it to be full width of productItemContainer.
    // The actual width of productItemContainer is determined by dynamicStyles.productItemContainer.width.
    // Let's try to use a fixed width for shimmer for now, matching image's intended space.
    const productItemCalculatedWidth = windowWidth * 0.37; // Width of the whole card
    const shimmerWidth = productItemCalculatedWidth - 20; // Subtract padding of productItemContainer (10 on each side)

    return (
      <Link href={{ pathname: "/products/[id]", params: { id: item.id } }} asChild>
        <Pressable style={[dynamicStyles.productItemContainer, {backgroundColor: cardBackgroundColor, borderColor: themedBorderColor}]}>
          <View style={styles.productImageContainer}> 
            {imageSource ? (
              <Image source={imageSource} style={styles.productImage} resizeMode="contain" />
            ) : (
              <ShimmerPlaceholder width={shimmerWidth} height={shimmerHeight} borderRadius={8} />
            )}
          </View>
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
                <Pressable onPress={() => decrementItemFromCart(item)} style={styles.quantityButton}>
                  <Ionicons name="remove" size={16} color={themedPrimaryColor} />
              </Pressable>
                <ThemedText style={[dynamicStyles.quantityText, {color: themedPrimaryColor}]}>{quantityInCart}</ThemedText>
              <Pressable onPress={() => addItemToCart(item)} style={styles.quantityButton}>
                  <Ionicons name="add" size={16} color={themedPrimaryColor} />
              </Pressable>
            </View>
          ) : (
              <Pressable style={[dynamicStyles.addButton, {borderColor: themedPrimaryColor, backgroundColor: cardBackgroundColor}] } onPress={() => addItemToCart(item)}>
                <ThemedText style={[dynamicStyles.addButtonText, {color: themedPrimaryColor}]}>ADD</ThemedText>
            </Pressable>
          )}
        </View>
      </Pressable>
      </Link>
    );
  };

  // Define dynamic styles. These no longer need to call useThemeColor or depend on colorScheme.
  const dynamicStyles = StyleSheet.create({
    safeAreaContainer: { // New style for SafeAreaView
      flex: 1,
      backgroundColor: Colors.light.background,
    },
    outerContainer: { /* This style might become redundant or only used for inner ScrollView bg if needed */
      flex: 1, 
      backgroundColor: Colors.light.background 
    },
    mainHeaderContainer: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingHorizontal: 15, 
      paddingBottom: 12, 
      backgroundColor: Colors.light.background, 
      elevation: 3,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      zIndex: 10 
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
      marginBottom: 10, 
      paddingHorizontal: 12, 
      paddingVertical: Platform.OS === 'ios' ? 12 : 12, 
      elevation: 2,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    searchPlaceholderText: { 
      fontSize: 15, 
      color: themedMutedTextColor, 
      flex: 1 
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: themedTextColor,
      marginBottom: 10,
      paddingHorizontal: 15,
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
    },
    categoryName: { 
      fontSize: 12.5, 
      textAlign: 'center', 
      color: themedTextColor, 
      fontWeight: '500', 
      lineHeight: 16 
    },
    productItemContainer: {
      width: windowWidth * 0.37, // Slightly adjusted width to show ~2.5 items
      marginRight: 10, // Gap between cards
      marginBottom: 15,
      borderRadius: 12,
      padding: 10,
      borderWidth: 1, // Subtle border
      elevation: 1, // Subtle shadow for Android
      shadowColor: '#000000', // Subtle shadow for iOS
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    deliveryTimeText: { 
      fontSize: 10.5, 
      marginLeft: 3, 
      fontWeight: 'bold' 
    },
    productName: { 
      fontSize: 14,
      fontWeight: '500',
      color: themedTextColor, 
      marginTop: 8, 
      marginBottom: 4, 
      minHeight: 38,
    },
    productWeight: { 
      fontSize: 12,
      marginBottom: 6, 
    },
    productPrice: { 
      fontSize: 15,
      fontWeight: 'bold', 
      color: themedTextColor 
    },
    productOldPrice: { 
      fontSize: 12, 
      textDecorationLine: 'line-through', 
      marginLeft: 6, 
    },
    addButton: {
      borderWidth: 1.5,
      borderRadius: 20,
      paddingVertical: 7,
      paddingHorizontal: 18,
      alignItems: 'center', 
      justifyContent: 'center',
      marginTop: 5,
    },
    addButtonText: { 
      fontSize: 14,
      fontWeight: 'bold', 
    },
    quantityControlContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderRadius: 20,
      paddingHorizontal: 5,
    },
    quantityControlContainerColumnMode: {
        paddingVertical: 3,
    },
    quantityButton: {
      padding: 6,
    },
    quantityText: {
      fontSize: 14,
      fontWeight: 'bold',
      marginHorizontal: 10,
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
      paddingTop: 12, // Explicit paddingTop
      paddingBottom: Platform.OS === 'ios' ? 28 : 16, // Added more paddingBottom, especially for iOS home indicator
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
    topFilterContainer: {
      backgroundColor: Colors.light.background, 
      marginBottom: 10, 
      elevation: 1.5,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1.5,
      zIndex: 5
    },
    topFilterItemContainer: {
      alignItems: 'center',
      marginRight: 20,
      paddingVertical: 5,
    },
    topFilterItemActive: {
      borderBottomWidth: 2,
      borderBottomColor: themedPrimaryColor,
    },
    topFilterItemText: {
      fontSize: 13,
      color: themedMutedTextColor,
      marginTop: 4,
      fontWeight: '500',
    },
    topFilterItemTextActive: {
      color: themedPrimaryColor,
      fontWeight: 'bold',
    },
    newBadgeText: {
      color: 'red',
      fontSize: 10,
      fontWeight: 'bold',
    },
    newBadgeIndicator: {
        position: 'absolute',
        top: -1,
        right: -3,
        backgroundColor: 'red',
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    cartBadge: {
      position: 'absolute',
      right: -8,
      top: -5,
      backgroundColor: Colors.light.tint,
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cartBadgeText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
    },
    contentContainerStyle: { // Added for FlatList content container
      paddingLeft: 15, // Start first card with padding
      paddingRight: 5, // Ensure last card's marginRight (10) doesn't get cut off
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safeAreaContainer}>
      {/* Main Header */}
      <View style={dynamicStyles.mainHeaderContainer}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="location-outline" size={20} color={headerIconsColor} style={{marginRight: 6}}/>
          <View>
                <ThemedText style={dynamicStyles.headerTitle}>Delivering in 30 mins</ThemedText>
                <ThemedText style={dynamicStyles.locationText}>Your Location <Ionicons name="chevron-down-outline" size={12} color={themedMutedTextColor}/></ThemedText>
            </View>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Pressable style={{marginRight:18}} onPress={() => router.push('/search' as any)}>
            <Ionicons name="search-outline" size={24} color={headerIconsColor}/>
          </Pressable>
          <Pressable onPress={() => router.push('/cart' as any)}>
            <Ionicons name="cart-outline" size={26} color={headerIconsColor}/>
            {totalCartItems > 0 && (
                <View style={dynamicStyles.cartBadge}>
                    <ThemedText style={dynamicStyles.cartBadgeText}>{totalCartItems}</ThemedText>
                </View>
            )}
            </Pressable>
          </View>
      </View>

      {/* Search Bar */}
        <Pressable 
        style={dynamicStyles.searchBarContainer} 
        onPress={() => router.push('/search' as any)}
        >
        <Ionicons name="search-outline" size={20} color={themedMutedTextColor} style={{marginRight: 8}}/>
        <ThemedText style={dynamicStyles.searchPlaceholderText}>Search for atta, dal, coke and more</ThemedText>
        </Pressable>

      {/* Top Filter Categories Horizontal Scroller */}
      <View style={dynamicStyles.topFilterContainer}>
        <FlatList
          data={topFilterCategories}
          renderItem={renderTopFilterCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15, paddingVertical:10 }}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollViewContainer}>
        {/* Banner Image */}
        {!isLoadingProducts ? (
        <Pressable style={styles.bannerContainer}>
            <Image source={bannerImages[bannerImageFileName]} style={styles.bannerImage} resizeMode="cover"/>
        </Pressable>
        ) : (
          <View style={styles.bannerContainer}>
            <ShimmerPlaceholder width={windowWidth - 30} height={150} borderRadius={10} style={{marginHorizontal:15}} />
          </View>
        )}

        {/* Shop By Category */}
        <View style={styles.sectionContainer}>
          <ThemedText type="title" style={[dynamicStyles.sectionTitle, { paddingLeft: 15 }]}>Shop by category</ThemedText>
          <FlatList data={categoriesData} renderItem={renderCategoryItem} keyExtractor={(item) => item.id} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListContainer} />
        </View>

        {/* Hot Deals */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderContainer}>
            <ThemedText type="title" style={dynamicStyles.sectionTitle}>Hot deals</ThemedText>
            <Pressable><ThemedText style={dynamicStyles.seeAllText}>see all</ThemedText></Pressable>
          </View>
          {isLoadingProducts && hotDeals.length === 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListContainer}>
              {[1,2,3].map(i => 
                <View key={`hot-deal-shimmer-${i}`} style={[dynamicStyles.productItemContainer, {backgroundColor: cardBackgroundColor, borderColor: themedBorderColor}]}>
                  <ShimmerPlaceholder width={120} height={100} borderRadius={8} style={{marginBottom: 8}}/>
                  <ShimmerPlaceholder width={112} height={15} borderRadius={4} style={{marginBottom: 4}} />
                  <ShimmerPlaceholder width={84} height={12} borderRadius={4} style={{marginBottom: 8}} />
                  <ShimmerPlaceholder width={140} height={30} borderRadius={20} />
                </View>
              )}
            </ScrollView>
          ) : (
            <FlatList
              data={hotDeals}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id + '_hot'}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={dynamicStyles.contentContainerStyle}
            />
          )}
        </View>

        {/* Your daily fresh needs */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderContainer}>
            <ThemedText type="title" style={dynamicStyles.sectionTitle}>Your daily fresh needs</ThemedText>
            <Pressable><ThemedText style={dynamicStyles.seeAllText}>see all</ThemedText></Pressable>
          </View>
          {isLoadingProducts && dailyNeeds.length === 0 ? (
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalListContainer}>
             {[1,2,3].map(i => 
               <View key={`daily-needs-shimmer-${i}`} style={[dynamicStyles.productItemContainer, {backgroundColor: cardBackgroundColor, borderColor: themedBorderColor}]}>
                 <ShimmerPlaceholder width={120} height={100} borderRadius={8} style={{marginBottom: 8}}/>
                 <ShimmerPlaceholder width={112} height={15} borderRadius={4} style={{marginBottom: 4}} />
                 <ShimmerPlaceholder width={84} height={12} borderRadius={4} style={{marginBottom: 8}} />
                 <ShimmerPlaceholder width={140} height={30} borderRadius={20} />
               </View>
             )}
           </ScrollView>
          ) : (
            <FlatList
              data={dailyNeeds}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id + '_daily'}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={dynamicStyles.contentContainerStyle}
            />
          )}
        </View>

        <View style={{ height: totalCartItems > 0 ? 80 : 20 }} /> 
      </ScrollView>
      
      {totalCartItems > 0 && (
        <View style={dynamicStyles.cartPreviewContainer}>
          <View>
            <ThemedText style={dynamicStyles.cartPreviewText}>{totalCartItems} Item{totalCartItems > 1 ? 's' : ''}</ThemedText>
            <ThemedText style={dynamicStyles.cartPreviewPrice}>₹{totalCartPrice.toFixed(2)}</ThemedText>
          </View>
          <Pressable style={dynamicStyles.viewCartButton} onPress={() => router.push('/cart')}>
            <ThemedText style={dynamicStyles.viewCartButtonText}>View Cart</ThemedText>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

// Static styles that don't depend on theme colors directly
const styles = StyleSheet.create({
  scrollViewContainer: { flex: 1 },
  scrollContentContainer: { paddingBottom: 80 }, 
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  searchIcon: { marginRight: 10 }, 
  bannerContainer: { marginHorizontal: 15, marginBottom: 25, borderRadius: 12, overflow: 'hidden' },
  bannerImage: { width: '100%', height: 130 },
  sectionContainer: { marginBottom: 25 },
  sectionHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 15 },
  horizontalListContainer: { paddingLeft: 15, paddingRight: 5 },
  categoryImage: { width: '100%', height: 70, borderRadius: 8, marginBottom: 8 },
  productImageContainer: {
    width: '100%',
    height: 110,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  productImage: { 
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: { position: 'absolute', top: 0, left: 0, paddingHorizontal: 7, paddingVertical: 4, borderTopLeftRadius: 12, borderBottomRightRadius: 8 },
  discountText: { fontSize: 9.5, fontWeight: 'bold' },
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
