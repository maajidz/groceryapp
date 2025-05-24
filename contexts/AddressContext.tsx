import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Address {
  houseNo: string;
  floor?: string;
  area: string; // Covers Area / Sector / Locality
  landmark?: string;
  name: string; // User's name for delivery
  addressType: 'Home' | 'Work' | 'Hotel' | 'Other';
  // Add other fields from your screenshot like the pre-filled search/map pin if needed for logic
  // For now, focusing on the form fields.
}

interface AddressContextType {
  address: Address | null;
  setAddress: (address: Address | null) => void;
  isLoadingAddress: boolean;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

const ADDRESS_STORAGE_KEY = 'user_address';

export const AddressProvider = ({ children }: { children: ReactNode }) => {
  const [address, _setAddress] = useState<Address | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);

  useEffect(() => {
    const loadAddress = async () => {
      try {
        const storedAddress = await AsyncStorage.getItem(ADDRESS_STORAGE_KEY);
        if (storedAddress) {
          _setAddress(JSON.parse(storedAddress));
        }
      } catch (e) {
        console.error("[AddressContext] Failed to load address from storage");
      } finally {
        setIsLoadingAddress(false);
      }
    };
    loadAddress();
  }, []);

  const setAddress = async (newAddress: Address | null) => {
    setIsLoadingAddress(true);
    try {
      if (newAddress) {
        await AsyncStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(newAddress));
      } else {
        await AsyncStorage.removeItem(ADDRESS_STORAGE_KEY);
      }
      _setAddress(newAddress);
    } catch (e) {
      console.error("[AddressContext] Failed to save address to storage");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  return (
    <AddressContext.Provider value={{ address, setAddress, isLoadingAddress }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = (): AddressContextType => {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
}; 