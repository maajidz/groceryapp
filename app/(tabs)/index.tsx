import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCart } from '@/contexts/CartContext'; // Import useCart
import {
  hydrateProductWithLocalImages, // We'll use this to hydrate individual products for lists
  allProducts as originalAllProducts,
  Product as OriginalProduct,
  ProductWithLocalImages
} from '@/data/products'; // Import shared products and Product type
import { ensureImage } from '@/services/imageService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // For Shimmer effect
import { Link, useRouter } from 'expo-router'; // Import Link
import React, { useEffect, useMemo, useState } from 'react'; // Removed useState for cart
import { Dimensions, FlatList, Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder'; // Import ShimmerPlaceholder

const { width: screenWidth } = Dimensions.get('window');

// Original static data for categories - we'll hydrate their images
const staticCategories = [
  { id: '1', name: 'Vegetables & Fruits', originalImage: `https://via.placeholder.com/90x70.png/EFEFEF/AAAAAA&text=Fruits`, prompt: 'Vibrant assortment of fresh vegetables and fruits icon' },
  { id: '2', name: 'Dairy & Breakfast', originalImage: `https://via.placeholder.com/90x70.png/EFEFEF/AAAAAA&text=Dairy`, prompt: 'Milk carton and croissant for dairy and breakfast icon' },
  { id: '3', name: 'Munchies', originalImage: `https://via.placeholder.com/90x70.png/EFEFEF/AAAAAA&text=Munchies`, prompt: 'Bag of chips and cookies for munchies category icon' },
  { id: '4', name: 'Cold Drinks & Juices', originalImage: `https://via.placeholder.com/90x70.png/EFEFEF/AAAAAA&text=Drinks`, prompt: 'Soda can and juice box for cold drinks category icon' },
  { id: '5', name: 'Instant & Frozen Food', originalImage: `https://via.placeholder.com/90x70.png/EFEFEF/AAAAAA&text=Frozen`, prompt: 'Frozen pizza and instant noodles for instant food icon' },
  { id: '6', name: 'Spices', originalImage: `https://via.placeholder.com/90x70.png/EFEFEF/AAAAAA&text=Spices`, prompt: 'Assortment of colorful spices in bowls icon'},
];

const staticBanner = {
  originalImage: `https://via.placeholder.com/380x130.png/E0E0E0/AAAAAA&text=Grocery+Deals`,
  prompt: 'Vibrant promotional banner for grocery store, special offers, fresh produce, bright colors',
  id: 'homeBanner1'
};

// Type for hydrated category
interface HydratedCategory extends Omit<typeof staticCategories[0], 'originalImage'> {
  localImageUri?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { cart, addItemToCart, decrementItemFromCart, totalCartItems, totalCartPrice } = useCart();

  const [isLoading, setIsLoading] = useState(true);
  const [hydratedCategories, setHydratedCategories] = useState<HydratedCategory[]>([]);
  const [hydratedBannerUrl, setHydratedBannerUrl] = useState<string | undefined>(undefined);
  const [hydratedHotDeals, setHydratedHotDeals] = useState<ProductWithLocalImages[]>([]);
  const [hydratedDailyNeeds, setHydratedDailyNeeds] = useState<ProductWithLocalImages[]>([]);

  // Memoize original product lists to avoid re-filtering on every render
  const hotDealsProductIds = useMemo(() => ['h1', 'h2', 'h3'], []);
  const dailyNeedsProductIds = useMemo(() => ['d1', 'd2', 'd3'], []);

  useEffect(() => {
    const hydrateData = async () => {
      setIsLoading(true);

      // Hydrate Categories
      const categoryPromises = staticCategories.map(async (cat) => {
        const localImageUri = await ensureImage('category', cat.id, cat.prompt, undefined, 70, 70, cat.originalImage);
        return { ...cat, localImageUri };
      });
      const resolvedCategories = await Promise.all(categoryPromises);
      setHydratedCategories(resolvedCategories);

      // Hydrate Banner
      const bannerWidth = Math.floor(screenWidth - 30); // 15px padding on each side
      const bannerHeight = 130;
      const bannerUri = await ensureImage('banner', staticBanner.id, staticBanner.prompt, undefined, bannerWidth, bannerHeight, staticBanner.originalImage);
      setHydratedBannerUrl(bannerUri);

      // Hydrate Product Lists
      const productThumbWidth = 120;
      const productThumbHeight = 120;

      const hotDealsPromises = originalAllProducts
        .filter(p => hotDealsProductIds.includes(p.id))
        .map(p => hydrateProductWithLocalImages(p, productThumbWidth, productThumbHeight));
      
      const dailyNeedsPromises = originalAllProducts
        .filter(p => dailyNeedsProductIds.includes(p.id))
        .map(p => hydrateProductWithLocalImages(p, productThumbWidth, productThumbHeight));

      const resolvedHotDeals = await Promise.all(hotDealsPromises);
      const resolvedDailyNeeds = await Promise.all(dailyNeedsPromises);

      setHydratedHotDeals(resolvedHotDeals);
      setHydratedDailyNeeds(resolvedDailyNeeds);

      setIsLoading(false);
    };

    hydrateData();
  }, [hotDealsProductIds, dailyNeedsProductIds]); // Dependencies if IDs could change, though they are memoized static here

  const renderCategoryItem = ({ item }: { item: HydratedCategory }) => (
    <TouchableOpacity style={styles.categoryItemContainer}>
      <ShimmerPlaceholder 
        LinearGradient={LinearGradient}
        visible={!isLoading && !!item.localImageUri}
        style={styles.categoryImage}
      >
        {item.localImageUri && <Image source={{ uri: item.localImageUri }} style={styles.categoryImage} resizeMode="contain" />}
      </ShimmerPlaceholder>
      <ShimmerPlaceholder LinearGradient={LinearGradient} visible={!isLoading} style={styles.categoryNamePlaceholder}>
        <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
      </ShimmerPlaceholder>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: ProductWithLocalImages }) => {
    const cartItem = cart.find(ci => ci.id === item.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;
    const displayImage = item.localImages && item.localImages.length > 0 ? item.localImages[0] : item.images[0]; // Fallback to original placeholder

    return (
      <Link href={{ pathname: "/products/[id]", params: { id: item.id } }} asChild>
        <TouchableOpacity style={styles.productItemContainer}>
          <ShimmerPlaceholder 
            LinearGradient={LinearGradient} 
            visible={!isLoading && !!displayImage} 
            style={styles.productImage}
          >
            {displayImage && <Image source={{ uri: displayImage }} style={styles.productImage} resizeMode="contain" />}
          </ShimmerPlaceholder>

          {item.discount && (
            <View style={styles.discountBadge}>
              <ThemedText style={styles.discountText}>{item.discount}</ThemedText>
            </View>
          )}
          <View style={styles.deliveryTimeContainer}>
            <Ionicons name="timer-outline" size={14} color="#4A4A4A" />
             <ShimmerPlaceholder LinearGradient={LinearGradient} visible={!isLoading} style={styles.productTextPlaceholderShort}>
                <ThemedText style={styles.deliveryTimeText}>{item.deliveryTime}</ThemedText>
             </ShimmerPlaceholder>
          </View>
          <ShimmerPlaceholder LinearGradient={LinearGradient} visible={!isLoading} style={styles.productTextPlaceholder}>
            <ThemedText style={styles.productName} numberOfLines={2}>{item.name}</ThemedText>
          </ShimmerPlaceholder>
          <ShimmerPlaceholder LinearGradient={LinearGradient} visible={!isLoading} style={styles.productTextPlaceholderShort}>
            <ThemedText style={styles.productWeight}>{item.weight}</ThemedText>
          </ShimmerPlaceholder>
          
          <View style={[styles.productBottomContainer, quantityInCart > 0 && styles.productBottomContainerColumn]}>
            <View style={[styles.productPricingInfoContainerBase, quantityInCart === 0 && styles.productPricingInfoContainerRowMode]}> 
              <ShimmerPlaceholder LinearGradient={LinearGradient} visible={!isLoading} style={styles.productPricePlaceholder}>
                <ThemedText style={styles.productPrice}>{item.price}</ThemedText>
              </ShimmerPlaceholder>
              {item.oldPrice && 
                <ShimmerPlaceholder LinearGradient={LinearGradient} visible={!isLoading} style={styles.productOldPricePlaceholder}>
                    <ThemedText style={styles.productOldPrice}>{item.oldPrice}</ThemedText>
                </ShimmerPlaceholder>
              }
            </View>
            {/* Cart controls - no shimmer here as they depend on cart state, not initial load */}
            {quantityInCart > 0 ? (
              <View style={[styles.quantityControlContainer, quantityInCart > 0 && styles.quantityControlContainerColumnMode]}>
                <TouchableOpacity onPress={() => decrementItemFromCart(item as OriginalProduct)} style={styles.quantityButton}>
                  <Ionicons name="remove" size={16} color="#00A877" />
                </TouchableOpacity>
                <ThemedText style={styles.quantityText}>{quantityInCart}</ThemedText>
                <TouchableOpacity onPress={() => addItemToCart(item as OriginalProduct)} style={styles.quantityButton}>
                  <Ionicons name="add" size={16} color="#00A877" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={() => addItemToCart(item as OriginalProduct)}>
                 <ShimmerPlaceholder LinearGradient={LinearGradient} visible={!isLoading} style={styles.addButtonTextPlaceholder}>
                    <ThemedText style={styles.addButtonText}>ADD</ThemedText>
                 </ShimmerPlaceholder>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Link>
    );
  };
  
  // Shimmer for the entire initial screen content might be complex to get perfect.
  // Instead, each section (banner, categories, product lists) will handle its own shimmer state via `isLoading`.

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
          <ShimmerPlaceholder 
            LinearGradient={LinearGradient} 
            visible={!isLoading && !!hydratedBannerUrl} 
            style={styles.bannerImage}
          >
            {hydratedBannerUrl && <Image source={{ uri: hydratedBannerUrl }} style={styles.bannerImage} resizeMode="cover"/>}
          </ShimmerPlaceholder>
        </TouchableOpacity>

        <View style={styles.sectionContainer}>
          <ShimmerPlaceholder LinearGradient={LinearGradient} visible={!isLoading} style={styles.sectionTitlePlaceholder}>
            <ThemedText type="title" style={[styles.sectionTitle, { paddingLeft: 15 }]}>Shop by category</ThemedText>
          </ShimmerPlaceholder>
          <FlatList 
            data={isLoading ? Array(5).fill({}) : hydratedCategories} // Show 5 shimmer items while loading
            renderItem={renderCategoryItem} 
            keyExtractor={(item, index) => isLoading ? `shim-cat-${index}` : item.id} 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalListContainer} 
          />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderContainer}>
            <ShimmerPlaceholder LinearGradient={LinearGradient} visible={!isLoading} style={styles.sectionTitlePlaceholder}>
                <ThemedText type="title" style={styles.sectionTitle}>Hot deals</ThemedText>
            </ShimmerPlaceholder>
            <TouchableOpacity><ThemedText style={styles.seeAllText}>see all</ThemedText></TouchableOpacity>
          </View>
          <FlatList 
            data={isLoading ? Array(3).fill({}) : hydratedHotDeals} 
            renderItem={renderProductItem} 
            keyExtractor={(item, index) => isLoading ? `shim-hot-${index}` : item.id} 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalListContainer} 
          />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderContainer}>
             <ShimmerPlaceholder LinearGradient={LinearGradient} visible={!isLoading} style={styles.sectionTitlePlaceholder}>
                <ThemedText type="title" style={styles.sectionTitle}>Your daily fresh needs</ThemedText>
            </ShimmerPlaceholder>
            <TouchableOpacity><ThemedText style={styles.seeAllText}>see all</ThemedText></TouchableOpacity>
          </View>
          <FlatList 
            data={isLoading ? Array(3).fill({}) : hydratedDailyNeeds} 
            renderItem={renderProductItem} 
            keyExtractor={(item, index) => isLoading ? `shim-daily-${index}` : item.id} 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalListContainer} 
          />
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
  bannerImage: { width: '100%', height: 130, borderRadius: 12 },
  sectionContainer: { marginBottom: 25 },
  sectionHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 15 },
  sectionTitle: { fontSize: 19, fontWeight: 'bold', color: '#1A1A1A' },
  seeAllText: { fontSize: 14, color: '#00A877', fontWeight: '600' },
  horizontalListContainer: { paddingLeft: 15, paddingRight: 5 },
  categoryItemContainer: { width: 90, marginRight: 15, alignItems: 'center' },
  categoryImage: { width: '100%', height: 70, borderRadius: 8, marginBottom: 8, backgroundColor: '#E0E0E0' },
  categoryName: { fontSize: 12.5, textAlign: 'center', color: '#2C2C2C', fontWeight: '500', lineHeight: 16 },
  productItemContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginRight: 12, width: 145, elevation: 1.5, shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, borderWidth: 1, borderColor: '#F0F0F0', justifyContent: 'space-between' },
  productImage: { width: '100%', height: 110, borderRadius: 8, marginBottom: 10, backgroundColor: '#E0E0E0' },
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
  productOldPrice: { fontSize: 12, textDecorationLine: 'line-through', color: '#757575', marginLeft: 0, marginTop: 1 },
  addButton: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#00A877', borderRadius: 6, paddingVertical: 7, paddingHorizontal: 15, alignItems: 'center' },
  addButtonText: { color: '#00A877', fontSize: 13, fontWeight: 'bold' },
  quantityControlContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#00A877', borderRadius: 6, paddingVertical: 3, paddingHorizontal: 5, marginTop: 5 },
  quantityControlContainerColumnMode: { width: '100%', justifyContent: 'space-around', marginTop: 8 },
  quantityButton: { padding: 3 },
  quantityText: { fontSize: 13, fontWeight: 'bold', color: '#00A877', marginHorizontal: 8 },
  cartPreviewContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#00A877', paddingVertical: 12, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartPreviewText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
  cartPreviewPrice: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' },
  viewCartButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007F5E', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  viewCartButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginRight: 5 },
  categoryNamePlaceholder: { width: '80%', height: 16, borderRadius: 4, marginTop: 4, backgroundColor: '#E0E0E0' },
  productTextPlaceholder: { width: '100%', height: 18, borderRadius: 4, marginBottom: 4, backgroundColor: '#E0E0E0' },
  productTextPlaceholderShort: { width: '60%', height: 14, borderRadius: 4, marginBottom: 4, backgroundColor: '#E0E0E0' },
  productPricePlaceholder: { width: '40%', height: 20, borderRadius: 4, backgroundColor: '#E0E0E0' },
  productOldPricePlaceholder: { width: '30%', height: 16, borderRadius: 4, marginLeft: 5, backgroundColor: '#E0E0E0' },
  addButtonTextPlaceholder: { width: 40, height: 20, borderRadius: 4, backgroundColor: '#E0E0E0' },
  sectionTitlePlaceholder: { width: '50%', height: 24, borderRadius: 4, marginBottom: 15, backgroundColor: '#E0E0E0' },
});
