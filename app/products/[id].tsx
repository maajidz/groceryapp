import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useCart } from '@/contexts/CartContext';
import { getProductByIdWithLocalImages, allProducts as originalAllProducts, Product as OriginalProduct, ProductWithLocalImages } from '@/data/products';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cart, addItemToCart, removeItemFromCart, updateItemQuantity, getItemQuantity } = useCart();

  const [product, setProduct] = useState<ProductWithLocalImages | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<OriginalProduct[]>([]);
  const [imageCarouselIndex, setImageCarouselIndex] = useState(0);

  const colorScheme = useColorScheme() ?? 'light';
  const themedTextColor = useThemeColor({ light: Colors.light.text, dark: Colors.dark.text }, 'text');
  const themedLightTextColor = Colors.light.text;
  const themedDarkTextColor = Colors.dark.text;
  const themedBackgroundColor = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, 'background');
  const cardBackgroundColor = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');
  const tintColor = useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'tint');
  const iconColor = useThemeColor({ light: Colors.light.icon, dark: Colors.dark.icon }, 'icon');
  const mutedTextColor = useThemeColor({ light: '#6c757d', dark: '#adb5bd'}, 'text');
  const greenColor = '#28a745';
  const lightGreenBackground = '#e9f7ef';

  const themedBorderColor = useThemeColor({ light: '#e0e0e0', dark: '#3a3a3c' }, 'icon');

  const flatListRef = useRef<FlatList<string | undefined>>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (id) {
        setIsLoading(true);
        const mainImageWidth = Math.floor(screenWidth * (Platform.OS === 'ios' ? 1 : 0.95));
        const mainImageHeight = Math.floor(mainImageWidth * 0.8);

        const foundProduct = await getProductByIdWithLocalImages(id, mainImageWidth, mainImageHeight);
        setProduct(foundProduct || null);
        
        if (foundProduct) {
          const filteredRelated = originalAllProducts.filter(
            p => p.category === foundProduct.category && p.id !== foundProduct.id
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
        message: `Check out this product: ${product.name} - ${product.price}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderImageCarouselItem = ({ item }: { item: string | undefined }) => {
    if (!item) {
      return <View style={styles.carouselImage}><ActivityIndicator color={tintColor}/></View>;
    }
    return <Image source={{ uri: item }} style={styles.carouselImage} />;
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setImageCarouselIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  if (isLoading) {
    return (
      <ThemedView style={[styles.containerCentered, { backgroundColor: themedBackgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={{ color: themedTextColor }}>Loading product details...</ThemedText>
      </ThemedView>
    );
  }

  if (!product) {
    return (
      <ThemedView style={[styles.containerCentered, { backgroundColor: themedBackgroundColor }]}>
        <ThemedText style={[styles.title, { color: themedTextColor }]}>Product Not Found</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={[styles.goBackButton, { backgroundColor: tintColor }]}>
          <ThemedText style={{ color: Colors.dark.text }}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const quantityInCart = getItemQuantity(product.id);

  const handleAddItem = (p: ProductWithLocalImages | OriginalProduct) => {
    addItemToCart(p as OriginalProduct);
  };

  const handleIncreaseQuantity = (productId: string) => {
    updateItemQuantity(productId, getItemQuantity(productId) + 1);
  };

  const handleDecreaseQuantity = (productId: string) => {
    const currentQuantity = getItemQuantity(productId);
    if (currentQuantity > 1) {
      updateItemQuantity(productId, currentQuantity - 1);
    } else {
      removeItemFromCart(productId);
    }
  };
  
  const renderRelatedProduct = ({ item }: { item: OriginalProduct }) => {
    const relatedItemQuantity = getItemQuantity(item.id);
    return (
      <View style={[styles.relatedProductCard, {backgroundColor: cardBackgroundColor}, dynamicStyles.relatedProductCard]}>
        {item.discount && (
          <View style={[styles.discountBadge, { backgroundColor: lightGreenBackground }]}>
            <ThemedText style={[styles.discountText, { color: greenColor }]}>{item.discount}</ThemedText>
          </View>
        )}
        <Image source={{ uri: item.images[0] }} style={styles.relatedProductImage} />
        <View style={styles.relatedProductInfo}>
            <ThemedText numberOfLines={1} style={[styles.relatedProductName, {color: themedTextColor}]}>{item.name}</ThemedText>
            <ThemedText style={[styles.relatedProductWeight, {color: mutedTextColor}]}>{item.deliveryTime}</ThemedText>
            <ThemedText style={[styles.relatedProductWeight, {color: mutedTextColor}]}>{item.weight}</ThemedText>
             <View style={styles.relatedProductPriceContainer}>
                <ThemedText style={[styles.relatedProductPrice, {color: themedTextColor}]}>{item.price}</ThemedText>
                {item.oldPrice && <ThemedText style={[styles.relatedProductOldPrice, {color: mutedTextColor}]}>{item.oldPrice}</ThemedText>}
            </View>
        </View>
        {relatedItemQuantity > 0 ? (
          <View style={styles.relatedQuantityControl}>
            <TouchableOpacity onPress={() => handleDecreaseQuantity(item.id)} style={styles.relatedQuantityButton}>
              <Ionicons name="remove" size={20} color={greenColor} />
            </TouchableOpacity>
            <ThemedText style={[styles.relatedQuantityText, {color: greenColor}]}>{relatedItemQuantity}</ThemedText>
            <TouchableOpacity onPress={() => handleIncreaseQuantity(item.id)} style={styles.relatedQuantityButton}>
              <Ionicons name="add" size={20} color={greenColor} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.relatedAddButton} onPress={() => handleAddItem(item as OriginalProduct)}>
            <ThemedText style={styles.relatedAddButtonText}>ADD</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const dynamicStyles = StyleSheet.create({
    header: {
      borderBottomColor: themedBorderColor,
    },
    brandContainer: {
      borderColor: themedBorderColor,
    },
    relatedProductCard: {
      borderColor: themedBorderColor,
    },
    attributeChipBackground: {
      backgroundColor: colorScheme === 'light' ? '#f0f0f0' : '#2c2c2e',
    }
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: themedBackgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <View style={[styles.header, dynamicStyles.header]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={28} color={iconColor} />
          </TouchableOpacity>
          <View style={styles.headerDeliveryInfo}>
            <ThemedText style={[styles.headerDeliveryTitle, {color: themedTextColor}]}>Delivery in {product?.deliveryTime || '...'}</ThemedText>
            <View style={styles.headerLocationContainer}>
              <ThemedText style={[styles.headerLocationText, {color: mutedTextColor}]}>Freedom Fighters Enclave...</ThemedText>
              <Ionicons name="chevron-down" size={16} color={mutedTextColor} />
            </View>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={26} color={iconColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.carouselContainer}>
          {product && product.localImages && product.localImages.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={product.localImages}
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
          {product && product.localImages && product.localImages.length > 1 && (
            <View style={styles.paginationContainer}>
              {product.localImages.map((_, index) => (
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
        
        {product && (
          <View style={[styles.sectionContainer, { backgroundColor: cardBackgroundColor}]}>
            <View style={styles.mainInfoRow}>
              <ThemedText style={[styles.productName, {color: themedTextColor}]}>{product.name}</ThemedText>
              <TouchableOpacity onPress={handleShare} style={styles.shareIconContainer}>
                <Ionicons name="share-social-outline" size={24} color={iconColor} />
              </TouchableOpacity>
            </View>
            
            <ThemedText style={[styles.deliveryTimeTextSmall, {color: mutedTextColor}]}>
               <MaterialCommunityIcons name="timer-sand-empty" size={14} color={mutedTextColor} /> {product.deliveryTime}
            </ThemedText>

            {product.brandLogoUrl && (
              <View style={[styles.brandContainer, dynamicStyles.brandContainer]}>
                  <Image source={{ uri: product.brandLogoUrl }} style={styles.brandLogo} />
                  <ThemedText style={[styles.brandName, { color: themedTextColor }]}>{product.brand}</ThemedText>
                  <TouchableOpacity style={styles.exploreProductsLink}>
                      <ThemedText style={[styles.exploreProductsText, { color: tintColor }]}>Explore all products</ThemedText>
                      <Ionicons name="chevron-forward" size={16} color={tintColor} />
                  </TouchableOpacity>
              </View>
            )}
            
            <ThemedText style={[styles.productWeight, {color: themedTextColor}]}>{product.weight}</ThemedText>

            <View style={styles.priceRow}>
              <ThemedText style={[styles.productPrice, {color: themedTextColor}]}>{product.price}</ThemedText>
              {product.oldPrice && <ThemedText style={[styles.productOldPrice, {color: mutedTextColor}]}>MRP {product.oldPrice}</ThemedText>}
              {product.discount && (
                <View style={[styles.discountTag, {backgroundColor: lightGreenBackground}]}>
                  <ThemedText style={[styles.discountText, {color: greenColor}]}>{product.discount}</ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={[styles.taxesText, {color: mutedTextColor}]}>(Inclusive of all taxes)</ThemedText>

            {quantityInCart > 0 ? (
              <View style={styles.quantityControl}>
                <TouchableOpacity onPress={() => handleDecreaseQuantity(product.id)} style={styles.quantityButton}>
                  <Ionicons name="remove" size={24} color={greenColor} />
                </TouchableOpacity>
                <ThemedText style={[styles.quantityText, {color: greenColor}]}>{quantityInCart}</ThemedText>
                <TouchableOpacity onPress={() => handleIncreaseQuantity(product.id)} style={styles.quantityButton}>
                  <Ionicons name="add" size={24} color={greenColor} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.addToCartButton, { backgroundColor: greenColor }]} onPress={() => handleAddItem(product)}>
                <ThemedText style={styles.addToCartButtonText}>Add to cart</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}

        {product && (product.attributes && product.attributes.length > 0 || product.description) && (
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
        
        {product && relatedProducts.length > 0 && (
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContentContainer: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'android' ? 15 : 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 5,
  },
  headerDeliveryInfo: {
    alignItems: 'center',
  },
  headerDeliveryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLocationText: {
    fontSize: 13,
  },
  carouselContainer: {
  },
  carouselImage: {
    width: screenWidth,
    height: screenWidth * 0.8,
    resizeMode: 'contain',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  carouselImagePlaceholder: {
    backgroundColor: '#f0f0f0',
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
  productName: {
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
    marginBottom: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
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
    borderWidth: 1,
    borderColor: '#28a745',
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
    fontSize: 12,
    marginBottom: 4,
  },
  relatedProductPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  relatedProductPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  relatedProductOldPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  relatedAddButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
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
    borderWidth: 1,
    borderColor: '#28a745',
    borderRadius: 6,
    paddingVertical: 4,
    marginTop: 'auto',
  },
  relatedQuantityButton: {
    paddingHorizontal: 10,
  },
  relatedQuantityText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
