import ShimmerPlaceholder from '@/components/ShimmerPlaceholder';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useCart } from '@/contexts/CartContext';
import { getProductById, allProducts as originalAllProducts, Product } from '@/data/products';
import { ProductImageKeys, productImages } from '@/utils/imageMap';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter, Stack } from 'expo-router'; // Added Stack
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

// Removed: export const options = { headerShown: false, };

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cart, addItemToCart, removeItemFromCart, updateItemQuantity, getItemQuantity } = useCart();

  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [imageCarouselIndex, setImageCarouselIndex] = useState(0);

  // Theme colors (forced light)
  const themedTextColor = Colors.light.text;
  const themedBackgroundColor = Colors.light.background;
  const cardBackgroundColor = '#ffffff'; // Explicit white for cards
  const tintColor = Colors.light.tint;
  const iconColor = Colors.light.icon;
  const mutedTextColor = Colors.light.muted; // Use from Colors constant
  const greenColor = Colors.light.tint; // Align with primary tint for consistency
  const lightGreenBackground = '#e9f7ef'; // Or generate from tintColor
  const themedBorderColor = Colors.light.border; // Use from Colors constant

  const flatListRef = useRef<FlatList<string>>(null);
  
  const dynamicStyles = StyleSheet.create({
    // header is removed as Stack.Screen header is used
    brandContainer: {
      borderColor: themedBorderColor,
    },
    relatedProductCard: {
      borderColor: themedBorderColor,
      backgroundColor: cardBackgroundColor,
    },
    attributeChipBackground: {
      backgroundColor: Colors.light.lightGray, // Use a color from your Colors constant
    }
  });

  const mainImageWidth = Math.floor(screenWidth * (Platform.OS === 'ios' ? 1 : 0.95));
  const mainImageHeight = Math.floor(mainImageWidth * 0.8);

  useEffect(() => {
    const fetchProductData = async () => {
    if (id) {
        setIsLoading(true);
      const foundProduct = getProductById(id);
        setProduct(foundProduct || null);
        
        if (foundProduct) {
          const filteredRelated = originalAllProducts.filter(
            (p: Product) => p.category === foundProduct.category && p.id !== foundProduct.id
          );
          setRelatedProducts(filteredRelated.slice(0, 10));
        } else {
          setRelatedProducts([]);
        }
    } else {
        setProduct(null);
        setRelatedProducts([]);
    }
      setIsLoading(false);
    };

    fetchProductData();
  }, [id]);

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Check out this product: ${product.name} - ₹${product.price}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderImageCarouselItem = ({ item: imageFileName }: { item: string }) => {
    const imageSource = productImages[imageFileName as ProductImageKeys];
    if (!imageSource) {
      console.error(`Image not found in map: ${imageFileName}`);
      return <View style={styles.carouselImage}><ActivityIndicator color={tintColor}/></View>;
    }
    return <Image source={imageSource} style={styles.carouselImage} />;
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setImageCarouselIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  if (isLoading || product === undefined) { // Keep shimmer if product is undefined during initial load
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themedBackgroundColor, flex:1 }]}>
         <Stack.Screen options={{ 
            title: "Loading Product...", 
            headerStyle: { backgroundColor: themedBackgroundColor },
            headerTintColor: themedTextColor,
            headerTitleStyle: { color: themedTextColor },
            headerBackTitle: "",
         }} />
        <ScrollView contentContainerStyle={styles.scrollContentContainerShimmer}>
          <View style={styles.carouselContainerShimmer}>
            <ShimmerPlaceholder width={mainImageWidth} height={mainImageHeight} />
          </View>
          <View style={[styles.sectionContainer, { backgroundColor: cardBackgroundColor, marginTop: 0 }]}>
            <ShimmerPlaceholder width={screenWidth * 0.8 * 0.9} height={24} borderRadius={4} style={{ marginBottom: 10 }} />
            <ShimmerPlaceholder width={screenWidth * 0.4 * 0.9} height={16} borderRadius={4} style={{ marginBottom: 15 }} />
            <View style={[styles.brandContainer, dynamicStyles.brandContainer, {paddingVertical: 10, marginBottom:10}]}>
                <ShimmerPlaceholder width={30} height={30} borderRadius={15} style={{marginRight: 8}}/>
                <ShimmerPlaceholder width={100} height={20} borderRadius={4} style={{flex:1}}/>
                <ShimmerPlaceholder width={80} height={16} borderRadius={4} />
             </View>
            <ShimmerPlaceholder width={screenWidth * 0.3 * 0.9} height={18} borderRadius={4} style={{ marginBottom: 12 }} />
            <View style={styles.priceRowShimmer}>
              <ShimmerPlaceholder width={100} height={28} borderRadius={4} style={{ marginRight: 8 }} />
              <ShimmerPlaceholder width={80} height={18} borderRadius={4} style={{ marginRight: 8 }} />
              <ShimmerPlaceholder width={60} height={20} borderRadius={4} />
            </View>
            <ShimmerPlaceholder width={screenWidth * 0.5 * 0.9} height={14} borderRadius={4} style={{ marginBottom: 20 }} />
            <ShimmerPlaceholder width={screenWidth * 0.9} height={50} borderRadius={8} />
          </View>
          <View style={[styles.sectionContainer, { backgroundColor: cardBackgroundColor, marginTop: 10 }]}>
            <ShimmerPlaceholder width={150} height={22} borderRadius={4} style={{ marginBottom: 15 }} />
            <ShimmerPlaceholder width={screenWidth * 0.9 * 0.9} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
            <ShimmerPlaceholder width={screenWidth * 0.8 * 0.9} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
            <ShimmerPlaceholder width={screenWidth * 0.95 * 0.9} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (product === null) { // product is explicitly null (not found)
    return (
      <SafeAreaView style={[styles.containerCentered, { backgroundColor: themedBackgroundColor }]}>
        <Stack.Screen options={{ title: "Not Found" }} />
        <ThemedText style={[styles.title, { color: themedTextColor }]}>Product Not Found</ThemedText>
        <Pressable onPress={() => router.back()} style={[styles.goBackButton, { backgroundColor: tintColor }]}>
          <ThemedText style={{ color: Colors.dark.text }}>Go Back</ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  // If product is available, render the details
  const quantityInCart = getItemQuantity(product.id);

  const handleAddItem = (p: Product) => addItemToCart(p);
  const handleIncreaseQuantity = (productId: string) => updateItemQuantity(productId, getItemQuantity(productId) + 1);
  const handleDecreaseQuantity = (productId: string) => {
    const currentQuantity = getItemQuantity(productId);
    if (currentQuantity > 1) {
      updateItemQuantity(productId, currentQuantity - 1);
    } else {
      removeItemFromCart(productId);
    }
  };

  const renderRelatedProduct = ({ item }: { item: Product }) => {
    const relatedItemQuantity = getItemQuantity(item.id);
    const relatedImageFilename = item.imageFileNames?.[0];
    const relatedImageSource = relatedImageFilename ? productImages[relatedImageFilename as ProductImageKeys] : undefined;
    const shimmerImageWidth = typeof styles.relatedProductImage.width === 'number' ? styles.relatedProductImage.width : 100; 
    const shimmerImageHeight = typeof styles.relatedProductImage.height === 'number' ? styles.relatedProductImage.height : 100;
    const shimmerImageBorderRadius = typeof styles.relatedProductImage.borderRadius === 'number' ? styles.relatedProductImage.borderRadius : 8;

    return (
      <Link href={{ pathname: "/products/[id]", params: { id: item.id } }} asChild>
        <Pressable style={[styles.relatedProductCard, dynamicStyles.relatedProductCard]}>
          {item.discount && (
            <View style={[styles.discountBadge, { backgroundColor: lightGreenBackground }]}>
              <ThemedText style={[styles.discountText, { color: greenColor }]}>{item.discount}</ThemedText>
            </View>
          )}
          {relatedImageSource ? (
            <Image source={relatedImageSource} style={styles.relatedProductImage} resizeMode="contain"/>
          ) : (
            <View style={styles.relatedProductImage}> 
              <ShimmerPlaceholder width={shimmerImageWidth * 0.9} height={shimmerImageHeight * 0.9} borderRadius={shimmerImageBorderRadius}/>
            </View>
          )}
          <ThemedText style={[styles.relatedProductName, {color: themedTextColor}]} numberOfLines={2}>{item.name}</ThemedText>
          <ThemedText style={[styles.relatedProductWeight, {color: mutedTextColor}]}>{item.weight}</ThemedText>
          <View style={styles.relatedProductPriceRow}>
            <ThemedText style={styles.relatedProductPrice}>₹{item.price}</ThemedText>
            {relatedItemQuantity > 0 ? (
              <View style={styles.relatedQuantityControl}>
                <Pressable onPress={() => handleDecreaseQuantity(item.id)} style={styles.relatedQuantityButton}>
                  <Ionicons name="remove" size={20} color={greenColor} />
                </Pressable>
                <ThemedText style={[styles.relatedQuantityText, {color: greenColor}]}>{relatedItemQuantity}</ThemedText>
                <Pressable onPress={() => handleIncreaseQuantity(item.id)} style={styles.relatedQuantityButton}>
                  <Ionicons name="add" size={20} color={greenColor} />
                </Pressable>
              </View>
            ) : (
              <Pressable style={[styles.relatedAddButton, {backgroundColor: greenColor}]} onPress={() => handleAddItem(item)}>
                <ThemedText style={styles.relatedAddButtonText}>ADD</ThemedText>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Link>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themedBackgroundColor, flex:1 }]}>
      <Stack.Screen 
        options={{ 
          title: product.name, 
          headerBackTitle: '', 
          headerStyle: { backgroundColor: themedBackgroundColor },
          headerTintColor: themedTextColor,
          headerTitleStyle: { color: themedTextColor, fontSize: 18 }, // Ensuring title style
        }} 
      />
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        {/* Custom Header View is REMOVED */}
        <View style={styles.carouselContainer}>
          {product.imageFileNames && product.imageFileNames.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={product.imageFileNames}
              renderItem={renderImageCarouselItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              getItemLayout={(_data, index) => (
                  {length: screenWidth, offset: screenWidth * index, index}
              )}
            />
          ) : (
            <View style={[styles.carouselImage, styles.carouselImagePlaceholder]}>
                <ActivityIndicator color={tintColor} size="large"/>
            </View>
          )}
          {product.imageFileNames && product.imageFileNames.length > 1 && (
            <View style={styles.paginationContainer}>
              {product.imageFileNames.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    { backgroundColor: index === imageCarouselIndex ? tintColor : '#C4C4C4' },
                  ]}
                />
              ))}
            </View>
          )}
        </View>
        
        <View style={[styles.sectionContainer, { backgroundColor: cardBackgroundColor}]}>
            <View style={styles.mainInfoRow}>
              {/* Product name here is now effectively the second header, so we remove it or make it less prominent */}
              {/* <ThemedText style={[styles.productName, {color: themedTextColor}]}>{product.name}</ThemedText> */}
              {/* To keep it but make it less prominent, you could reduce font size or change style */}
              <View style={{flex: 1}} />{/* This empty view will allow share icon to be on the right */}
              <Pressable onPress={handleShare} style={styles.shareIconContainer}>
                <Ionicons name="share-social-outline" size={24} color={iconColor} />
              </Pressable>
          </View>

            <ThemedText style={[styles.deliveryTimeTextSmall, {color: mutedTextColor}]}>
               <MaterialCommunityIcons name="timer-sand-empty" size={14} color={mutedTextColor} /> {product.deliveryTime}
            </ThemedText>

            {product.brandLogoUrl && (
              <View style={[styles.brandContainer, dynamicStyles.brandContainer]}>
                  <Image source={{ uri: product.brandLogoUrl }} style={styles.brandLogo} />
                  <ThemedText style={[styles.brandName, { color: themedTextColor }]}>{product.brand}</ThemedText>
                  <Pressable style={styles.exploreProductsLink}>
                      <ThemedText style={[styles.exploreProductsText, { color: tintColor }]}>Explore all products</ThemedText>
                      <Ionicons name="chevron-forward" size={16} color={tintColor} />
                  </Pressable>
              </View>
            )}
            
            <ThemedText style={[styles.productWeight, {color: themedTextColor}]}>{product.weight}</ThemedText>

            <View style={styles.priceRow}>
              <ThemedText style={[styles.productPrice, {color: themedTextColor}]}>₹{product.price}</ThemedText>
              {product.oldPrice && <ThemedText style={[styles.productOldPrice, {color: mutedTextColor}]}>MRP ₹{product.oldPrice}</ThemedText>}
              {product.discount && (
                <View style={[styles.discountTag, {backgroundColor: lightGreenBackground}]}>
                  <ThemedText style={[styles.discountText, {color: greenColor}]}>{product.discount}</ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={[styles.taxesText, {color: mutedTextColor}]}>(Inclusive of all taxes)</ThemedText>

            {quantityInCart > 0 ? (
              <View style={styles.quantityControl}>
                <Pressable onPress={() => handleDecreaseQuantity(product.id)} style={styles.quantityButton}>
                  <Ionicons name="remove" size={24} color={greenColor} />
                </Pressable>
                <ThemedText style={[styles.quantityText, {color: greenColor}]}>{quantityInCart}</ThemedText>
                <Pressable onPress={() => handleIncreaseQuantity(product.id)} style={styles.quantityButton}>
                  <Ionicons name="add" size={24} color={greenColor} />
                </Pressable>
              </View>
            ) : (
              <Pressable style={[styles.addToCartButton, { backgroundColor: greenColor }]} onPress={() => handleAddItem(product)}>
                <ThemedText style={styles.addToCartButtonText}>Add to cart</ThemedText>
              </Pressable>
            )}
          </View>

        { (product.attributes && product.attributes.length > 0 || product.description) && (
          <View style={[styles.sectionContainer, { backgroundColor: cardBackgroundColor, marginTop: 10 }]}>
            <ThemedText style={[styles.sectionTitle, {color: themedTextColor}]}>Product Details</ThemedText>
            {product.attributes && product.attributes.map((attr, index) => (
              <View key={index} style={[styles.attributeChip, dynamicStyles.attributeChipBackground]}>
                 <ThemedText style={[styles.attributeLabel, {color: themedTextColor}]}>{attr.label}</ThemedText>
                 <ThemedText style={[styles.attributeValue, {color: themedTextColor}]}>{attr.value}</ThemedText>
              </View>
            ))}
            {product.description && (
                <View style={styles.descriptionContainer}>
                    <ThemedText style={[styles.descriptionText, {color: mutedTextColor}]}>{product.description}</ThemedText>
                </View>
            )}
          </View>
        )}
        
        {relatedProducts.length > 0 && (
          <View style={[styles.sectionContainer, { backgroundColor: themedBackgroundColor, marginTop: 10, paddingHorizontal: 0 }]}>
            <ThemedText style={[styles.sectionTitle, {color: themedTextColor, paddingHorizontal: 15}]}>Top {relatedProducts.length} products in this category</ThemedText>
            <FlatList
              data={relatedProducts}
              renderItem={renderRelatedProduct}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedProductsList}
            />
        </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// Styles (ensure header style is removed or unused)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 30,
  },
  scrollContentContainerShimmer: {
    // paddingHorizontal: 15, // Removed to allow full width shimmer for carousel
    paddingBottom: 30,
  },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  goBackButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  // header style is removed as we use Stack.Screen header
  carouselContainer: {
    // No specific styles needed here now, defaults are fine
  },
  carouselContainerShimmer: {
    width: screenWidth, 
    alignItems: 'center', 
    marginBottom: 10, 
  },
  carouselImage: {
    width: screenWidth,
    height: screenWidth * 0.8,
    resizeMode: 'contain',
    backgroundColor: Colors.light.lightGray, // Light placeholder bg
    justifyContent: 'center',
    alignItems: 'center'
  },
  carouselImagePlaceholder: {
    backgroundColor: Colors.light.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  sectionContainer: {
    padding: 15,
  },
  mainInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: { // This was the style for the removed second header title
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  shareIconContainer: {
    paddingLeft: 10,
  },
  deliveryTimeTextSmall: {
    fontSize: 13,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // Added padding for spacing
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 10, // Added margin for spacing
  },
  brandLogo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginRight: 8,
    borderRadius: 15,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  exploreProductsLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exploreProductsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  productWeight: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceRowShimmer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, 
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 8,
  },
  productOldPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  taxesText: {
    fontSize: 11,
    marginBottom: 15,
  },
  addToCartButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5, // Made border slightly thicker
    // borderColor: '#28a745', // Color will be tintColor
    marginTop: 10,
    alignSelf: 'stretch',
  },
  quantityButton: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  attributeChip: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  attributeLabel: {
      fontSize: 14,
      fontWeight: '500',
      marginRight: 6,
  },
  attributeValue: {
      fontSize: 14,
  },
  descriptionContainer: {
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  relatedProductsList: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  relatedProductCard: {
    width: screenWidth / 2.5,
    marginRight: 10,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
  },
   discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  relatedProductImage: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    marginBottom: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.lightGray, // Added light bg for consistency
  },
  relatedProductInfo: {
    flex: 1,
  },
  relatedProductName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  relatedProductWeight: {
    fontSize: 11,
    // color: Colors.light.muted, // Already applied inline
    marginBottom: 4,
  },
  relatedProductPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  relatedProductPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    // color: Colors.light.text, // Should be tint for price
  },
  relatedAddButton: {
    // borderColor: Colors.light.tint, // Applied via direct backgroundColor
    paddingVertical: 6, // Adjusted padding
    paddingHorizontal: 12, // Added horizontal padding
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center', // Center text
    marginTop: 'auto',
  },
  relatedAddButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  relatedQuantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1.5, // Made border slightly thicker
    // borderColor: '#28a745', // Color will be tintColor
    borderRadius: 6,
    paddingVertical: 2, // Adjusted padding
    marginTop: 'auto',
  },
  relatedQuantityButton: {
    paddingHorizontal: 8, // Adjusted padding
  },
  relatedQuantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 6, // Adjusted margin
  },
});
