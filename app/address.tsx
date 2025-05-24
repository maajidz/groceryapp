import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Address, useAddress } from '@/contexts/AddressContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const addressTypes: Address['addressType'][] = ['Home', 'Work', 'Hotel', 'Other'];

// Static prefill data as per instructions
const PREFILLED_AREA = 'Batla House, Jamia Nagar, Okhla, New Delhi';
const PREFILLED_NAME = 'Abdul Majid Zargar';
const PREFILLED_HOUSE_NO = 'D-168'; // From search bar example in screenshot
const PREFILLED_SEARCH_TEXT = 'D-168, Batla House, Jamia Nagar, Okhla, New Delhi';

export default function AddressScreen() {
  const router = useRouter();
  const { address: currentAddress, setAddress, isLoadingAddress } = useAddress();

  const [houseNo, setHouseNo] = useState(currentAddress?.houseNo || PREFILLED_HOUSE_NO);
  const [floor, setFloor] = useState(currentAddress?.floor || '');
  const [area, setArea] = useState(currentAddress?.area || PREFILLED_AREA);
  const [landmark, setLandmark] = useState(currentAddress?.landmark || '');
  const [name, setName] = useState(currentAddress?.name || PREFILLED_NAME);
  const [selectedAddressType, setSelectedAddressType] = useState<Address['addressType']>(currentAddress?.addressType || 'Home');
  const [searchText, setSearchText] = useState(PREFILLED_SEARCH_TEXT);

  useEffect(() => {
    if (currentAddress) {
        setHouseNo(currentAddress.houseNo);
        setFloor(currentAddress.floor || '');
        setArea(currentAddress.area);
        setLandmark(currentAddress.landmark || '');
        setName(currentAddress.name);
        setSelectedAddressType(currentAddress.addressType);
        // Potentially update searchText if map pin changes, for now it's static after initial prefill
    }
  }, [currentAddress]);

  const handleSaveAddress = () => {
    if (!houseNo.trim() || !area.trim() || !name.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields (*).');
      return;
    }
    const newAddress: Address = {
      houseNo: houseNo.trim(),
      floor: floor.trim(),
      area: area.trim(),
      landmark: landmark.trim(),
      name: name.trim(),
      addressType: selectedAddressType,
    };
    setAddress(newAddress);
    console.log('[AddressScreen] Address Saved:', newAddress);
    router.push('/payment' as any); // Navigate to payment page
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Confirm map pin location</ThemedText>
        <View style={{width: 24}} />{/* Spacer */}
      </View>

      {/* Simulated Map Pin Search Area - Non-functional map */}
      <View style={styles.mapSearchContainer}>
        <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.light.muted} style={{marginRight: 5}} />
            <TextInput 
                placeholder="Search for area, street name..." 
                style={styles.searchInput} 
                value={searchText}
                onChangeText={setSearchText} // In a real scenario, this would interact with a map/autocomplete
            />
            {searchText !== "" && (
                <Pressable onPress={() => setSearchText('')}>
                    <Ionicons name="close-circle" size={20} color={Colors.light.muted} />
                </Pressable>
            )}
        </View>
        {/* Placeholder for map view */}
        <View style={styles.mapPlaceholder}>
            <MaterialCommunityIcons name="map-marker-outline" size={40} color={Colors.light.tint} />
            <ThemedText style={{marginTop: 5, color: Colors.light.muted}}>Map functionality not implemented</ThemedText>
        </View>
      </View>

      <View style={styles.bottomSheetContainer}>
        <View style={styles.bottomSheetHeader}>
            <ThemedText style={styles.bottomSheetTitle}>Enter complete address</ThemedText>
            <Pressable onPress={() => router.back()} >{/* Or navigate to cart */}
                <Ionicons name="close" size={24} color={Colors.light.text} />
            </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <ThemedText style={styles.label}>Save address as *</ThemedText>
          <View style={styles.addressTypeContainer}>
            {addressTypes.map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.addressTypeButton,
                  selectedAddressType === type && styles.addressTypeButtonSelected,
                ]}
                onPress={() => setSelectedAddressType(type)}
              >
                <Ionicons 
                    name={type === 'Home' ? 'home-outline' : type === 'Work' ? 'briefcase-outline' : type === 'Hotel' ? 'bed-outline' : 'ellipse-outline'}
                    size={18} 
                    color={selectedAddressType === type ? Colors.light.tint : Colors.light.muted}
                    style={{marginRight: 6}}
                />
                <ThemedText
                  style={[
                    styles.addressTypeButtonText,
                    selectedAddressType === type && styles.addressTypeButtonTextSelected,
                  ]}
                >
                  {type}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <ThemedText style={styles.label}>Flat / House no / Building name *</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter flat, house no, or building"
            value={houseNo}
            onChangeText={setHouseNo}
          />

          <ThemedText style={styles.label}>Floor (optional)</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter floor number"
            value={floor}
            onChangeText={setFloor}
          />

          <ThemedText style={styles.label}>Area / Sector / Locality *</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter area, sector, or locality"
            value={area}
            onChangeText={setArea} // User can edit prefill
          />

          <ThemedText style={styles.label}>Nearby landmark (optional)</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="E.g. Opposite Apollo hospital"
            value={landmark}
            onChangeText={setLandmark}
          />
          
          <View style={styles.separator} />

          <ThemedText style={styles.subHeader}>Enter your details for seamless delivery experience</ThemedText>
          <ThemedText style={styles.label}>Your name *</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName} // User can edit prefill
          />
        </ScrollView>
        <Pressable 
            style={[styles.saveButton, isLoadingAddress && styles.saveButtonDisabled]}
            onPress={handleSaveAddress} 
            disabled={isLoadingAddress}
        >
            <ThemedText style={styles.saveButtonText}>{isLoadingAddress ? 'Saving...' : 'Save Address'}</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.muted, // Background for map area as per screenshot
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
    paddingTop: Platform.OS === 'android' ? 10 : 0, // Adjusted for SafeAreaView
    backgroundColor: Colors.light.background, // Header part of the SafeAreaView background
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: Colors.light.text },
  mapSearchContainer: {
    padding:15,
    backgroundColor: Colors.light.background, // white for the search bar area
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0', // Light grey for search bar
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    marginLeft: 5,
  },
  mapPlaceholder: {
    height: 150, // Adjust as needed
    backgroundColor: '#E9E9E9', // Grey placeholder for map
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  bottomSheetContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 15, 
  },
   bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  bottomSheetTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.light.text },
  scrollViewContent: { paddingBottom: 20 },
  label: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 6,
    marginTop: 15,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F7F7F7', // Slightly off-white for inputs
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 15,
    color: Colors.light.text,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  addressTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addressTypeButtonSelected: {
    backgroundColor: '#E6F6F1', // Light tint background
    borderColor: Colors.light.tint,
  },
  addressTypeButtonText: {
    fontSize: 14,
    color: Colors.light.muted,
  },
  addressTypeButtonTextSelected: {
    color: Colors.light.tint,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 20,
  },
  subHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 20 : 10, // Padding for home indicator
  },
  saveButtonDisabled: {
    backgroundColor: Colors.light.muted,
  },
  saveButtonText: {
    color: Colors.dark.text, // White text on tint
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 