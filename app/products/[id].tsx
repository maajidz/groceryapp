
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCart } from '@/contexts/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors'; // Import Colors
import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor

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

  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined: loading, null: not found

  // Theme colors
  const colorScheme = useColorScheme() ?? 'light';
  const themedTextColor = useThemeColor({ light: Colors.light.text, dark: Colors.dark.text }, 'text');
  const themedBackgroundColor = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, 'background');
  const tintColor = useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'tint');
  const iconColor = useThemeColor({ light: Colors.light.icon, dark: Colors.dark.icon }, 'icon');
  const themedButtonTextColor = Colors[colorScheme].background; // For text on tinted buttons
  const themedMutedTextColor = useThemeColor({ light: '#555', dark: Colors.dark.icon }, 'text'); // For description, old price

  useEffect(() => {
    if (id) {
      const foundProduct = getProductById(id);
      setProduct(foundProduct || null); // If foundProduct is undefined (not found), set product to null
    } else {
      setProduct(null); // No ID provided, so product not found
    }
  }, [id]);

  if (product === undefined && id) { // Still loading (e.g. if id just changed and useEffect hasn't run yet for that new id)
    return (
      <ThemedView style={[styles.containerCentered, { backgroundColor: themedBackgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={{ color: themedTextColor }}>Loading product...</ThemedText>
      </ThemedView>
    );
  }

  if (!product) { // Product not found (either ID was bad, no ID, or getProductById returned null via useEffect)
    return (
      <ThemedView style={[styles.containerCentered, { backgroundColor: themedBackgroundColor }]}>
        <ThemedText style={[styles.title, { color: themedTextColor }]}>Product Not Found</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: tintColor }]}>
          <ThemedText style={[styles.backButtonText, { color: themedButtonTextColor }]}>Go Back</ThemedText>
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

  // Dynamic styles using theme colors
  const dynamicStyles = StyleSheet.create({
    productPrice: {
      color: tintColor,
    },
    productOldPrice: {
      color: themedMutedTextColor,
    },
    productDescription: {
      color: themedMutedTextColor,
    },
    addButton: {
      backgroundColor: tintColor,
    },
    addButtonText: {
      color: themedButtonTextColor,
    },
    quantityControlContainer: {
      borderColor: tintColor,
    },
    quantityButtonIcon: {
      color: tintColor,
    },
    quantityTextColor: {
      color: themedTextColor
    },
    fixedBackButtonIcon: {
      color: tintColor,
    },
    fixedBackButtonBackground: {
      backgroundColor: colorScheme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(50,50,50,0.7)',
    }
  });

  return (
    <ThemedView style={[styles.container, { backgroundColor: themedBackgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        
        <View style={styles.detailsContainer}>
          <ThemedText style={[styles.productName, { color: themedTextColor }]}>{product.name}</ThemedText>
          
          <View style={styles.priceContainer}>
            <ThemedText style={[styles.productPrice, dynamicStyles.productPrice]}>{product.price}</ThemedText>
            {product.oldPrice && (
              <ThemedText style={[styles.productOldPrice, dynamicStyles.productOldPrice]}>{product.oldPrice}</ThemedText>
            )}
          </View>

          <ThemedText style={[styles.productDescription, dynamicStyles.productDescription]}>{product.description}</ThemedText>

          <View style={styles.actionsContainer}>
            {quantityInCart > 0 ? (
              <View style={[styles.quantityControlContainer, dynamicStyles.quantityControlContainer]}>
                <TouchableOpacity onPress={handleDecreaseQuantity} style={styles.quantityButton}>
                  <Ionicons name="remove-circle-outline" size={32} style={dynamicStyles.quantityButtonIcon} />
                </TouchableOpacity>
                <ThemedText style={[styles.quantityText, dynamicStyles.quantityTextColor]}>{quantityInCart}</ThemedText>
                <TouchableOpacity onPress={handleIncreaseQuantity} style={styles.quantityButton}>
                  <Ionicons name="add-circle-outline" size={32} style={dynamicStyles.quantityButtonIcon} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.addButton, dynamicStyles.addButton]} onPress={handleAddItem}>
                <ThemedText style={[styles.addButtonText, dynamicStyles.addButtonText]}>ADD TO CART</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      {router.canGoBack() && (
        <TouchableOpacity onPress={() => router.back()} style={[styles.fixedBackButton, dynamicStyles.fixedBackButtonBackground]}>
          <Ionicons name="arrow-back-circle" size={40} style={dynamicStyles.fixedBackButtonIcon} />
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
    paddingBottom: 80, 
  },
  productImage: {
    width: '100%',
    aspectRatio: 1, 
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
    // color removed, will be handled by dynamicStyles
  },
  productOldPrice: {
    fontSize: 16,
    // color removed, will be handled by dynamicStyles
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },
  productDescription: {
    fontSize: 16,
    // color removed, will be handled by dynamicStyles
    marginBottom: 20,
    lineHeight: 24,
  },
  actionsContainer: {
    marginTop: 20,
  },
  addButton: {
    // backgroundColor removed, will be handled by dynamicStyles
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    // color removed, will be handled by dynamicStyles
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderWidth: 1,
    // borderColor removed, will be handled by dynamicStyles
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
    // color removed, will be handled by dynamicStyles
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  backButton: {
    // backgroundColor removed, will be handled by dynamicStyles
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  backButtonText: {
    // color removed, will be handled by dynamicStyles
    fontSize: 16,
  },
  fixedBackButton: {
    position: 'absolute',
    top: 40, 
    left: 15,
    zIndex: 10,
    // backgroundColor removed, will be handled by dynamicStyles
    borderRadius: 20,
    padding: 5,
  }
});
