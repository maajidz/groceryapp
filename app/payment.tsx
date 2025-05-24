import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <View style={styles.accordionItem}>
      <Pressable style={styles.accordionHeader} onPress={() => setExpanded(!expanded)}>
        <ThemedText style={styles.accordionTitle}>{title}</ThemedText>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={22} color={Colors.light.text} />
      </Pressable>
      {expanded && <View style={styles.accordionContent}>{children}</View>}
    </View>
  );
};

const PREFILLED_UPI = '7006179928@pthdfc';

export default function PaymentScreen() {
  const router = useRouter();
  const [selectedUpi, setSelectedUpi] = useState<'prefilled' | 'new' | string>('prefilled'); // 'prefilled', 'new', or custom UPI ID string
  // Add state for new UPI input if needed

  const handlePayNow = () => {
    // In a real app, integrate with a payment gateway
    Alert.alert(
      'Payment Simulation',
      'Payment Successful! (Simulated)',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/tracking'), // Navigate to tracking page
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Select Payment Method</ThemedText>
        <View style={{width: 24}} />{/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <AccordionItem title="Wallets">
          <ThemedText style={styles.placeholderText}>Wallet options (e.g., Paytm, PhonePe wallet) would be listed here.</ThemedText>
        </AccordionItem>
        
        <AccordionItem title="Add credit or debit cards">
          <ThemedText style={styles.placeholderText}>Form to add card details would be here.</ThemedText>
        </AccordionItem>

        <AccordionItem title="Netbanking">
          <ThemedText style={styles.placeholderText}>List of banks for netbanking would be here.</ThemedText>
        </AccordionItem>

        <AccordionItem title="Add new UPI ID" defaultExpanded={true}>
            <Pressable 
                style={styles.upiOptionRow}
                onPress={() => setSelectedUpi('prefilled')}
            >
                <MaterialCommunityIcons 
                    name={selectedUpi === 'prefilled' ? 'radiobox-marked' : 'radiobox-blank'} 
                    size={24} 
                    color={selectedUpi === 'prefilled' ? Colors.light.tint : Colors.light.muted}
                />
                <View style={styles.upiIconContainerBig}>
                    <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.png'}} style={styles.upiLogoBig} />
                </View>
                <View style={{flex:1}}>
                    <ThemedText style={styles.upiIdText}>{PREFILLED_UPI}</ThemedText>
                    <ThemedText style={styles.upiSubtitle}>Please press continue to complete the purchase.</ThemedText>
                </View>
            </Pressable>
            
            <Pressable 
                style={styles.upiOptionRow}
                onPress={() => setSelectedUpi('new')}
            >
                 <MaterialCommunityIcons 
                    name={selectedUpi === 'new' ? 'radiobox-marked' : 'radiobox-blank'} 
                    size={24} 
                    color={selectedUpi === 'new' ? Colors.light.tint : Colors.light.muted}
                />
                <ThemedText style={styles.addUpiText}>Add new UPI</ThemedText>
            </Pressable>
            
            {selectedUpi === 'new' && (
                <View style={styles.newUpiInputContainer}>
                    {/* TextInput for new UPI ID would go here */}
                    <ThemedText style={styles.placeholderText}>Input for new UPI ID here.</ThemedText>
                </View>
            )}

            <View style={styles.upiAppsContainer}>
                {/* Replace with actual local images if available */}
                <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Google_Pay_Logo.svg/1200px-Google_Pay_Logo.svg.png'}} style={styles.upiAppLogo} />
                <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/1200px-PhonePe_Logo.svg.png'}} style={styles.upiAppLogo} />
                <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/BHIM_SVG_Logo.svg/1200px-BHIM_SVG_Logo.svg.png'}} style={styles.upiAppLogo} />
                <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo.svg/1200px-Paytm_Logo.svg.png'}} style={styles.upiAppLogo} />
            </View>
        </AccordionItem>

      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.payButton} onPress={handlePayNow}>
          <ThemedText style={styles.payButtonText}>Pay Now</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: Colors.light.text },
  scrollViewContent: { paddingVertical: 10, paddingHorizontal: 15, paddingBottom: 80 },
  accordionItem: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  accordionTitle: { fontSize: 16, fontWeight: '500', color: Colors.light.text },
  accordionContent: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.light.muted,
    textAlign: 'center',
    paddingVertical: 10,
  },
  upiOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  upiIconContainerBig: {
    width: 40, 
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    // borderWidth:1, borderColor:'red'
  },
  upiLogoBig: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  upiIdText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
  },
  upiSubtitle: {
    fontSize: 12,
    color: Colors.light.muted,
  },
  addUpiText: {
    fontSize: 15,
    color: Colors.light.text,
    marginLeft: 10,
  },
  newUpiInputContainer: {
    marginVertical: 10,
    paddingLeft: 34, // Align with text next to radio button
  },
  upiAppsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginTop: 10,
  },
  upiAppLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  footer: {
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  payButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: Colors.dark.text, // White text on tint
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 