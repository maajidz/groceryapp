import { ThemedText } from '@/components/ThemedText';
import { useCart } from '@/contexts/CartContext';
import { Product, allProducts } from '@/data/products'; // Import global Product type and allProducts
import { ProductImageKeys, productImages } from '@/utils/imageMap'; // Import productImages map
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useRouter } from 'expo-router'; // Import Link
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Keyboard, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'; // Added ScrollView, Changed TouchableOpacity to Pressable
import { SafeAreaView } from 'react-native-safe-area-context';

const COMMONLY_ORDERED = ['Milk', 'Bread', 'Lays Classic Salted Chips', 'Dal', 'Maggi 2-Minute Noodles', 'Oil', 'Tea'];

export default function SearchScreen() {
  const router = useRouter();
  const { cart, addItemToCart, updateItemQuantity, totalCartItems, totalCartPrice } = useCart(); 
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedProductsInGrid, setDisplayedProductsInGrid] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]); 

  useEffect(() => {
    setRecentSearches(['lassi', 'borosil set', 'plastic deep tray']);
  }, []);

  const saveRecentSearch = (query: string) => {
    if (!query || recentSearches.includes(query)) return;
    const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedSearches);
  };

  const clearRecentSearches = () => setRecentSearches([]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const lowerQuery = query.toLowerCase();
      const results = allProducts.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) || 
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      );
      setDisplayedProductsInGrid(results);
    } else {
      setDisplayedProductsInGrid([]);
    }
  };

  const executeSearchFromPill = (term: string) => {
    setSearchQuery(term);
    handleSearchChange(term); 
    saveRecentSearch(term);
    Keyboard.dismiss();
  };

  const renderRecentSearchItem = ({ item }: { item: string }) => (
    <Pressable style={styles.recentSearchChip} onPress={() => executeSearchFromPill(item)}>
      <ThemedText style={styles.recentSearchText}>{item}</ThemedText>
    </Pressable>
  );

  const renderCommonlyOrderedItem = ({ item }: { item: string }) => (
    <Pressable style={styles.recentSearchChip} onPress={() => executeSearchFromPill(item)}>
      <ThemedText style={styles.recentSearchText}>{item}</ThemedText>
    </Pressable>
  );

  const renderProductResultItem = ({ item }: { item: Product }) => {
    const cartItem = cart.find(ci => ci.id === item.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    const imageFilename = item.imageFileNames?.[0];
    const imageSource = imageFilename ? productImages[imageFilename as ProductImageKeys] : undefined;

    return (
      <Link href={{ pathname: "/products/[id]", params: { id: item.id } }} asChild>
        <Pressable style={styles.productResultItem}>
            {imageSource ? (
              <Image source={imageSource} style={styles.productResultImage} resizeMode="contain" />
            ) : (
              <View style={[styles.productResultImage, styles.productImagePlaceholder]} /> // Basic placeholder
            )}
            <View style={styles.productResultInfo}>
                <ThemedText style={styles.productResultName} numberOfLines={2}>{item.name}</ThemedText>
                <ThemedText style={styles.productResultWeight}>{item.weight}</ThemedText>
                <View style={styles.productResultPriceRow}>
                    <ThemedText style={styles.productResultPrice}>{item.price}</ThemedText>
                    {item.oldPrice && <ThemedText style={styles.productResultOldPrice}>{item.oldPrice}</ThemedText>}
                </View>
            </View>
            {quantityInCart > 0 ? (
                <View style={styles.quantityControlContainer}>
                    <Pressable onPress={() => updateItemQuantity(item.id, quantityInCart - 1)} style={styles.quantityButton}>
                        <Ionicons name="remove" size={16} color="#00A877" />
                    </Pressable>
                    <ThemedText style={styles.quantityText}>{quantityInCart}</ThemedText>
                    <Pressable onPress={() => addItemToCart(item)} style={styles.quantityButton}>
                        <Ionicons name="add" size={16} color="#00A877" />
                    </Pressable>
                </View>
            ) : (
                <Pressable style={styles.productResultAddButton} onPress={() => addItemToCart(item)}>
                    <ThemedText style={styles.productResultAddButtonText}>ADD</ThemedText>
                </Pressable>
            )}
        </Pressable>
      </Link>
  )};

  const showInitialState = searchQuery.length === 0;
  const showResults = searchQuery.length > 0 && displayedProductsInGrid.length > 0;
  const showNoResults = searchQuery.length > 0 && displayedProductsInGrid.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.searchHeader}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for atta dal and more"
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmitEditing={() => Keyboard.dismiss()} 
          autoFocus
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => { setSearchQuery(''); setDisplayedProductsInGrid([]); }} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </Pressable>
        )}
      </View>

      {/* Scrollable content area */}
      <ScrollView 
        style={styles.contentScrollView} 
        contentContainerStyle={styles.contentScrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {showInitialState && (
          <View style={styles.initialStateContainer}>
            {recentSearches.length > 0 ? (
              <View style={styles.recentSearchesContainer}>
                <View style={styles.recentSearchesHeader}>
                  <ThemedText style={styles.recentSearchesTitle}>Recent searches</ThemedText>
                  <Pressable onPress={clearRecentSearches}>
                    <ThemedText style={styles.clearRecentText}>clear</ThemedText>
                  </Pressable>
                </View>
                <View style={styles.recentSearchesChipsContainer}>
                  {recentSearches.map((item, index) => <View key={`recent-${index}`}>{renderRecentSearchItem({ item })}</View>)}
                </View>
              </View>
            ) : (
              <View style={styles.commonlyOrderedContainer}> 
                <ThemedText style={styles.recentSearchesTitle}>Try searching for</ThemedText>
                <View style={styles.recentSearchesChipsContainer}>
                  {COMMONLY_ORDERED.map((item, index) => <View key={`common-${index}`}>{renderCommonlyOrderedItem({ item })}</View>)}
                </View>
              </View>
            )}
          </View>
        )}

        {showResults && (
          <View style={styles.resultsContainer}>
              <ThemedText style={styles.resultsTitle}>Showing results for "{searchQuery}"</ThemedText>
              <FlatList
                  data={displayedProductsInGrid}
                  renderItem={renderProductResultItem}
                  keyExtractor={(item) => item.id + '-result'}
                  numColumns={2}
                  scrollEnabled={false} 
                  contentContainerStyle={styles.resultsListContainer}
              />
          </View>
        )}

        {showNoResults && (
          <View style={styles.emptyStateContainer}>
              <ThemedText>No results found for "{searchQuery}"</ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Cart Preview Bar - Copied from HomeScreen */}
      {totalCartItems > 0 && (
        <View style={styles.cartPreviewContainer}>
          <View>
            <ThemedText style={styles.cartPreviewText}>{totalCartItems} Item{totalCartItems > 1 ? 's' : ''}</ThemedText>
            <ThemedText style={styles.cartPreviewPrice}>₹{totalCartPrice.toFixed(2)}</ThemedText>
          </View>
          <Pressable style={styles.viewCartButton} onPress={() => router.push('/cart')}>
            <ThemedText style={styles.viewCartButtonText}>View Cart</ThemedText>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'android' ? 15 : 10, // Adjusted for SafeAreaView
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  backButton: { padding: 5, marginRight: 5 },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 8, backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 10, color: '#000000' },
  clearButton: { padding: 5, marginLeft: 5 },
  
  contentScrollView: { flex: 1 },
  contentScrollContainer: { paddingBottom: 80 },

  initialStateContainer: { padding: 15 },
  recentSearchesContainer: {},
  commonlyOrderedContainer: {},
  recentSearchesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  recentSearchesTitle:{ fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  clearRecentText: { fontSize: 14, color: '#007AFF' },
  recentSearchesChipsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  recentSearchChip: { backgroundColor: '#F0F0F0', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, marginRight: 8, marginBottom: 8 },
  recentSearchText: { fontSize: 13, color: '#333333' },
  
  resultsContainer: { flex: 1 }, 
  resultsTitle: { fontSize: 15, fontWeight: '600', paddingHorizontal: 15, paddingVertical: 12, color: '#333' },
  resultsListContainer: { paddingHorizontal: 10 },
  productResultItem: { flex: 0.5, backgroundColor: '#FFFFFF', borderRadius: 10, margin: 5, padding: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, borderWidth: 1, borderColor: '#F0F0F0', justifyContent:'space-between' },
  productResultImage: {
    width: '100%',
    height: 110,
    borderRadius: 8,
    marginBottom: 8,
  },
  productImagePlaceholder: { // Style for placeholder if image is missing
    backgroundColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  productResultInfo:{ flexGrow: 1 },
  productResultName: { fontSize: 13, fontWeight: '600', marginBottom: 2, minHeight: 30, color: '#202020' },
  productResultWeight:{ fontSize: 11, color: '#606060', marginBottom: 4 },
  productResultPriceRow:{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  productResultPrice:{ fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  productResultOldPrice:{ fontSize: 11, color: '#808080', textDecorationLine: 'line-through', marginLeft: 5 },
  productResultAddButton: { borderColor: '#00A877', borderWidth: 1.5, borderRadius: 6, paddingVertical: 8, alignItems: 'center', marginTop: 8 },
  productResultAddButtonText: { color: '#00A877', fontWeight: 'bold', fontSize: 13 },
  quantityControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
    borderColor: '#00A877',
    borderWidth: 1.5,
    borderRadius: 8,
    marginTop: 8, 
  },
  quantityButton: {
    paddingHorizontal: 10, 
    paddingVertical: 6, 
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00A877',
    paddingHorizontal: 12, 
  },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

  cartPreviewContainer: {
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
    shadowRadius: 3,
  },
  cartPreviewText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cartPreviewPrice: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00875F', 
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewCartButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 6,
  },
});
