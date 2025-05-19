import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCart } from '@/contexts/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
// Assuming allProducts array is defined in a central place, e.g., data/products.ts
// For demonstration, let's define a mock product type and a way to get a product
// You should replace this with your actual product data fetching logic

// Mock product data (replace with your actual data source)
const allProducts = [
  { id: '1', name: 'Fresh Milk', price: '₹60', oldPrice: '₹65', image: 'https://via.placeholder.com/200x200.png?text=Milk', description: 'Pasteurized and homogenized full cream milk. Rich in calcium and vitamins. Perfect for your daily needs, from breakfast cereals to creamy coffees.' },
  { id: '2', name: 'Whole Wheat Bread', price: '₹45', image: 'https://via.placeholder.com/200x200.png?text=Bread', description: 'Soft and delicious whole wheat bread, packed with fiber. Ideal for sandwiches or toast.' },
  { id: '3', name: 'Lays Classic Salted Chips', price: '₹20', image: 'https://via.placeholder.com/200x200.png?text=Chips', description: 'Crispy and delicious classic salted potato chips. The perfect snack for any time of the day.' },
  { id: '4', name: 'Toor Dal', price: '₹120', oldPrice: '₹130', image: 'https://via.placeholder.com/200x200.png?text=Dal', description: 'Premium quality Toor Dal, rich in protein and essential nutrients. Easy to cook and digest.' },
  { id: '5', name: 'Maggi 2-Minute Noodles', price: '₹15', image: 'https://via.placeholder.com/200x200.png?text=Maggi', description: 'Your favorite instant noodles! Quick to prepare and delicious to eat. Masala flavor.' },
  // Add more mock products as needed
];

type Product = typeof allProducts[0];

const getProductById = (id: string): Product | undefined => {
  return allProducts.find(p => p.id === id);
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cart, addItemToCart, removeItemFromCart, updateItemQuantity, getItemQuantity } = useCart();

  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined for loading, null for not found

  useEffect(() => {
    if (id) {
      const foundProduct = getProductById(id);
      setProduct(foundProduct);
    }
  }, [id]);

  if (product === undefined) {
    return (
      <ThemedView style={styles.containerCentered}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading product...</ThemedText>
      </ThemedView>
    );
  }

  if (!product) {
    return (
      <ThemedView style={styles.containerCentered}>
        <ThemedText style={styles.title}>Product Not Found</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const quantityInCart = getItemQuantity(product.id);

  const handleAddItem = () => {
    addItemToCart(product);
  };

  const handleIncreaseQuantity = () => {
    updateItemQuantity(product.id, quantityInCart + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantityInCart > 1) {
      updateItemQuantity(product.id, quantityInCart - 1);
    } else {
      removeItemFromCart(product.id);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        
        <View style={styles.detailsContainer}>
          <ThemedText style={styles.productName}>{product.name}</ThemedText>
          
          <View style={styles.priceContainer}>
            <ThemedText style={styles.productPrice}>{product.price}</ThemedText>
            {product.oldPrice && (
              <ThemedText style={styles.productOldPrice}>{product.oldPrice}</ThemedText>
            )}
          </View>

          <ThemedText style={styles.productDescription}>{product.description}</ThemedText>

          <View style={styles.actionsContainer}>
            {quantityInCart > 0 ? (
              <View style={styles.quantityControlContainer}>
                <TouchableOpacity onPress={handleDecreaseQuantity} style={styles.quantityButton}>
                  <Ionicons name="remove-circle-outline" size={32} color="#00A877" />
                </TouchableOpacity>
                <ThemedText style={styles.quantityText}>{quantityInCart}</ThemedText>
                <TouchableOpacity onPress={handleIncreaseQuantity} style={styles.quantityButton}>
                  <Ionicons name="add-circle-outline" size={32} color="#00A877" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
                <ThemedText style={styles.addButtonText}>ADD TO CART</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      {router.canGoBack() && (
        <TouchableOpacity onPress={() => router.back()} style={styles.fixedBackButton}>
          <Ionicons name="arrow-back-circle" size={40} color="#00A877" />
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 80, // Space for fixed back button or cart summary
  },
  productImage: {
    width: '100%',
    aspectRatio: 1, // Square image
    resizeMode: 'contain',
  },
  detailsContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00A877', // Theme color
  },
  productOldPrice: {
    fontSize: 16,
    color: '#888',
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },
  productDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    lineHeight: 24,
  },
  actionsContainer: {
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#00A877',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#00A877',
    borderRadius: 8,
  },
  quantityButton: {
    paddingHorizontal: 20,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#00A877',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  fixedBackButton: {
    position: 'absolute',
    top: 40, // Adjust as per your header height or safe area
    left: 15,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 5,
  }
});
