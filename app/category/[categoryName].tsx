import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { ProductImageKeys, productImages } from '@/utils/imageMap';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllProducts, Product } from '../../data/products'; // Changed import from originalAllProducts

export default function CategoryProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { categoryName } = params; // categoryName will be a string
  const colorScheme = useColorScheme();

  const [productsInCategory, setProductsInCategory] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (categoryName && typeof categoryName === 'string') {
      setIsLoading(true);
      const decodedCategoryName = decodeURIComponent(categoryName);
      const allProducts = getAllProducts(); // Call getAllProducts
      const filteredProducts = allProducts.filter(
        (p: Product) => p.category.toLowerCase() === decodedCategoryName.toLowerCase() // Added Product type to p
      );
      setProductsInCategory(filteredProducts);
      setIsLoading(false);
    } else {
      setProductsInCategory([]);
      setIsLoading(false);
    }
  }, [categoryName]);

  const themedBackgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;

  const renderProductItem = ({ item }: { item: Product }) => (
    <Pressable onPress={() => router.push(`/products/${item.id}`)} style={styles.productItemContainer}>
      <Image 
        source={item.imageFileNames?.[0] ? productImages[item.imageFileNames[0] as ProductImageKeys] : {uri: 'https://via.placeholder.com/150x150.png?text=No+Image'}} 
        style={styles.productImage}
        resizeMode="contain" 
      />
      <View style={styles.productInfoContainer}>
        <ThemedText style={styles.productName} numberOfLines={2}>{item.name}</ThemedText>
        <ThemedText style={styles.productPrice}>₹{item.price}</ThemedText>
        {item.oldPrice && (
          <ThemedText style={styles.productOldPrice}>₹{item.oldPrice}</ThemedText>
        )}
        <ThemedText style={styles.productWeight}>{item.weight || 'N/A'}</ThemedText>
      </View>
      {/* Add to cart button can be added here if needed, reusing logic from HomeScreen or ProductDetailScreen */}
    </Pressable>
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centeredContainer]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText style={{marginTop: 10}}>Loading products...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themedBackgroundColor }]} edges={['bottom', 'left', 'right']}>
      <Stack.Screen 
        options={{ 
          title: categoryName && typeof categoryName === 'string' ? decodeURIComponent(categoryName) : 'Category Products',
          headerBackTitle: '', 
        }}
      />
      {productsInCategory.length === 0 ? (
        <ThemedView style={[styles.container, styles.centeredContainer]}>
          <ThemedText>No products found in this category.</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={productsInCategory}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          numColumns={2} // Display in two columns, adjust as needed
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  productItemContainer: {
    flex: 1,
    margin: 8,
    backgroundColor: Colors.light.background, 
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
    maxWidth: '46%', 
  },
  productImage: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  productInfoContainer: {
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    minHeight: 36, 
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginTop: 4,
  },
  productOldPrice: {
    fontSize: 12,
    color: Colors.light.muted,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  productWeight: {
    fontSize: 12,
    color: Colors.light.muted,
    marginTop: 2,
  },
});
