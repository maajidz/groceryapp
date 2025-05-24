import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { ProductImageKeys, productImages } from '@/utils/imageMap';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, View } from 'react-native'; // Removed useColorScheme
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllProducts, Product } from '../../data/products';

export default function CategoryProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { categoryName } = params; 
  // const colorScheme = useColorScheme(); // Removed

  const [productsInCategory, setProductsInCategory] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (categoryName && typeof categoryName === 'string') {
      setIsLoading(true);
      const decodedCategoryName = decodeURIComponent(categoryName);
      const allProducts = getAllProducts(); 
      let filteredProducts: Product[];

      if (decodedCategoryName.toLowerCase() === "vegetables & fruits") {
        filteredProducts = allProducts.filter(
          (p: Product) => p.category.toLowerCase() === "vegetables & fruits"
        );
      } else {
        filteredProducts = allProducts.filter(
          (p: Product) => p.category.toLowerCase() === decodedCategoryName.toLowerCase()
        );
      }
      setProductsInCategory(filteredProducts);
      setIsLoading(false);
    } else {
      setProductsInCategory([]);
      setIsLoading(false);
    }
  }, [categoryName]);

  const themedBackgroundColor = Colors.light.background; // Forced light background

  const renderProductItem = ({ item }: { item: Product }) => (
    <Pressable onPress={() => router.push({ pathname: '/products/[id]', params: { id: item.id } })} style={[styles.productItemContainer, {backgroundColor: Colors.light.background}]}>
      <Image 
        source={item.imageFileNames?.[0] ? productImages[item.imageFileNames[0] as ProductImageKeys] : {uri: 'https://via.placeholder.com/150x150.png?text=No+Image'}} 
        style={styles.productImage}
        resizeMode="contain" 
      />
      <View style={styles.productInfoContainer}>
        <ThemedText style={[styles.productName, {color: Colors.light.text}]} numberOfLines={2}>{item.name}</ThemedText>
        <ThemedText style={styles.productPrice}>₹{item.price}</ThemedText> 
        {item.oldPrice && (
          <ThemedText style={[styles.productOldPrice, {color: Colors.light.muted}]}>MRP {item.oldPrice}</ThemedText>
        )}
        <ThemedText style={[styles.productWeight, {color: Colors.light.muted}]}>{item.weight || 'N/A'}</ThemedText>
      </View>
    </Pressable>
  );

  if (isLoading) {
    return (
      // Ensuring ThemedView and ThemedText use light theme properties
      <ThemedView style={[styles.container, styles.centeredContainer, {backgroundColor: Colors.light.background}]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText style={{marginTop: 10, color: Colors.light.text}}>Loading products...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themedBackgroundColor }]} edges={['bottom', 'left', 'right']}>
      <Stack.Screen 
        options={{ 
          title: categoryName && typeof categoryName === 'string' ? decodeURIComponent(categoryName) : 'Category Products',
          headerBackTitle: '', 
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
          headerTitleStyle: { color: Colors.light.text },
        }}
      />
      {productsInCategory.length === 0 ? (
        <ThemedView style={[styles.container, styles.centeredContainer, {backgroundColor: Colors.light.background}]}>
          <ThemedText style={{color: Colors.light.text}}>No products found in this category.</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={productsInCategory}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          numColumns={2} 
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          style={{backgroundColor: Colors.light.background}} // Ensure FlatList background is light
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
    // backgroundColor: Colors.light.background, // Already set inline now
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
    color: Colors.light.tint, // Price color remains tint
    marginTop: 4,
  },
  productOldPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  productWeight: {
    fontSize: 12,
    marginTop: 2,
  },
});
