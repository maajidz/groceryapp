import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

// Define the structure of a product (simplified, ensure it matches your actual product structure)
interface Product {
  id: string;
  name: string;
  price: string; // e.g., '₹49'
  oldPrice?: string; // e.g., '₹65'
  image: string;
  weight?: string;
  // Add any other product properties you need
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  setCart: Dispatch<SetStateAction<CartItem[]>>; // Allow direct cart modification if needed for complex cases
  addItemToCart: (product: Product) => void;
  decrementItemFromCart: (product: Product) => void;
  removeItemFromCart: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  getItemQuantity: (productId: string) => number;
  clearCart: () => void;
  totalCartItems: number;
  totalCartPrice: number;
  totalSavings: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addItemToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const decrementItemFromCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity > 1) {
          // If quantity > 1, decrement it
          return prevCart.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
          );
        } else {
          // If quantity is 1, remove the item
          return prevCart.filter(item => item.id !== product.id);
        }
      }      
      return prevCart; // If item not found, return cart as is
    });
  };

  const removeItemFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item // Ensure quantity doesn't go below 0
      ).filter(item => item.quantity > 0) // Remove item if quantity becomes 0
    );
  };

  const getItemQuantity = (productId: string): number => {
    const item = cart.find(cartItem => cartItem.id === productId);
    return item ? item.quantity : 0;
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const parsePrice = (priceStr: string): number => {
    return parseFloat(priceStr.replace('₹', '').replace(/,/g, ''));
  };

  const totalCartPrice = cart.reduce((sum, item) => {
    const priceNumber = parsePrice(item.price);
    return sum + priceNumber * item.quantity;
  }, 0);

  const totalSavings = cart.reduce((sum, item) => {
    if (item.oldPrice) {
      const oldPriceNumber = parsePrice(item.oldPrice);
      const currentPriceNumber = parsePrice(item.price);
      const itemSaving = (oldPriceNumber - currentPriceNumber) * item.quantity;
      return sum + (itemSaving > 0 ? itemSaving : 0);
    }
    return sum;
  }, 0);

  return (
    <CartContext.Provider value={{
      cart, 
      setCart, 
      addItemToCart, 
      decrementItemFromCart, // Added this line
      removeItemFromCart, 
      updateItemQuantity, 
      getItemQuantity, 
      clearCart,
      totalCartItems, 
      totalCartPrice, 
      totalSavings 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
