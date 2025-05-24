import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    LayoutAnimation,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    UIManager,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface TipButtonProps {
  amount: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
}

const TipButton: React.FC<TipButtonProps> = ({ amount, emoji, selected, onPress }) => {
  return (
    <Pressable 
      style={[styles.tipButton, selected && styles.tipButtonSelected]}
      onPress={onPress}
    >
      <ThemedText style={[styles.tipEmoji, selected && styles.tipEmojiSelected]}>{emoji}</ThemedText>
      <ThemedText style={[styles.tipAmount, selected && styles.tipAmountSelected]}>₹{amount}</ThemedText>
    </Pressable>
  );
};

interface InstructionOptionProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  subLabel?: string;
  isCheckbox?: boolean;
  isChecked?: boolean;
  onToggle?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const InstructionOption: React.FC<InstructionOptionProps> = (
    { icon, label, subLabel, isCheckbox, isChecked, onToggle, isFirst, isLast }
) => {
  return (
    <Pressable 
        style={[styles.instructionOptionRow, isFirst && styles.instructionOptionFirst, isLast && styles.instructionOptionLast]}
        onPress={onToggle}
    >
      <Ionicons name={icon} size={24} color={Colors.light.text} style={styles.instructionIcon} />
      <View style={styles.instructionTextContainer}>
        <ThemedText style={styles.instructionLabel}>{label}</ThemedText>
        {subLabel && <ThemedText style={styles.instructionSubLabel}>{subLabel}</ThemedText>}
      </View>
      {isCheckbox && (
        <Pressable onPress={onToggle} style={[styles.checkboxBase, isChecked && styles.checkboxChecked]}>
          {isChecked && <Ionicons name="checkmark" size={16} color={Colors.dark.text} />}
        </Pressable>
      )}
    </Pressable>
  );
};

export default function TrackingScreen() {
  const router = useRouter();
  const [selectedTip, setSelectedTip] = useState<string | null>(null);
  const [instructionsExpanded, setInstructionsExpanded] = useState(true);
  const [instructionChecks, setInstructionChecks] = useState({
    noRing: false,
    petAtHome: false,
    leaveAtDoor: false,
  });

  // Location state
  const [currentLatitude, setCurrentLatitude] = useState<number | null>(28.6139); // Default Delhi lat
  const [currentLongitude, setCurrentLongitude] = useState<number | null>(77.2090); // Default Delhi long
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationErrorMsg('Permission to access location was denied. Showing default location.');
        Alert.alert(
          'Location Permission Denied',
          'Please enable location services in your settings to see your current location on the map.'
        );
        // Keep default coordinates if permission denied
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setCurrentLatitude(location.coords.latitude);
        setCurrentLongitude(location.coords.longitude);
        setLocationErrorMsg(null); // Clear any previous error
      } catch (error) {
        console.error("Error fetching location: ", error);
        setLocationErrorMsg("Couldn't fetch current location. Showing default location.");
        // Keep default coordinates on error
      }
    })();
  }, []);

  const toggleInstructions = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setInstructionsExpanded(!instructionsExpanded);
  };

  const handleInstructionCheck = (key: keyof typeof instructionChecks) => {
    setInstructionChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tipOptions = [
    { amount: '20', emoji: '😊' },
    { amount: '30', emoji: '😄' },
    { amount: '50', emoji: '🤩' },
    { amount: 'Other', emoji: '👋' },
  ];

  // Define map parameters
  const mapZoom = 15;
  const mapWidth = 600;
  const mapHeight = 300;
  const apiKey = "AIzaSyDg7d0P1wuQ99oFAzJ_9-xRWx6uCzH2PWo"; // User's API key
  
  // Use dynamic lat/long if available, otherwise default
  const displayLatitude = currentLatitude || 28.6139;
  const displayLongitude = currentLongitude || 77.2090;

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${displayLatitude},${displayLongitude}&zoom=${mapZoom}&size=${mapWidth}x${mapHeight}&markers=color:red%7C${displayLatitude},${displayLongitude}&key=${apiKey}`;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.headerContainer}>
        <Pressable onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
        </Pressable>
        <View style={styles.headerTextContainer}>
          <ThemedText style={styles.headerSubtitle}>Order is on the way</ThemedText>
          <ThemedText style={styles.headerTitle}>Arriving soon</ThemedText>
        </View>
        <View style={styles.headerRightPlaceholder} />{/* To balance the back button */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        {/* Map Placeholder */}
        <View style={styles.mapPlaceholderContainer}>
          {locationErrorMsg && 
            <View style={styles.locationErrorContainer}>
                <ThemedText style={styles.locationErrorText}>{locationErrorMsg}</ThemedText>
            </View>
          }
          <Image 
            source={{ uri: staticMapUrl }} 
            style={styles.mapImage}
            resizeMode="cover"
            onError={(e) => console.log('Map Image Load Error:', e.nativeEvent.error)}
          />
           <View style={styles.mapMarker}>
            {/* Using a scooter icon for the delivery partner */}
            <MaterialCommunityIcons name="motorbike" size={30} color={Colors.light.tint} /> 
          </View>
          <View style={styles.googleLogoContainer}>
            <Image 
                source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/753px-Google_%22G%22_Logo.svg.png'}}
                style={styles.googleLogo}
                resizeMode="contain"
            />
          </View>
        </View>
        
        {/* Delivery Partner Info */}
        <View style={styles.cardContainer}>
          <View style={styles.partnerInfoRow}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1999/1999628.png' }} // Placeholder avatar
              style={styles.partnerAvatar}
            />
            <ThemedText style={styles.partnerName}>I'm Mo, your delivery partner</ThemedText>
            <Pressable style={styles.callButton}>
              <Ionicons name="call-outline" size={24} color={Colors.light.tint} />
            </Pressable>
          </View>
          <View style={styles.statusMessageContainer}>
            <ThemedText style={styles.statusMessageText}>
              I have picked up your order, and I am on the way to your location
            </ThemedText>
          </View>
        </View>

        {/* Tip Section */}
        <View style={styles.cardContainer}>
          <View style={styles.tipHeaderRow}>
            <View style={styles.tipTextContainer}>
              <ThemedText style={styles.tipTitle}>Delivering happiness at your doorstep!</ThemedText>
              <ThemedText style={styles.tipSubtitle}>Thank them by leaving a tip</ThemedText>
            </View>
            <Image 
              source={{uri: 'https://assets.materialup.com/uploads/08f3db38-28ba-46a1-ac9f-469c7837c5ca/preview.png'}} // Placeholder delivery illustration
              style={styles.tipIllustration}
              resizeMode="contain"
            />
          </View>
          <View style={styles.tipButtonsContainer}>
            {tipOptions.map((option) => (
              <TipButton 
                key={option.amount}
                amount={option.amount}
                emoji={option.emoji}
                selected={selectedTip === option.amount}
                onPress={() => setSelectedTip(option.amount)}
              />
            ))}
          </View>
        </View>

        {/* Kindness Reminder Section */}
        <View style={styles.kindnessReminderContainer}>
            <Ionicons name="sunny-outline" size={24} color="#FFC107" style={styles.kindnessIcon} />
            <ThemedText style={styles.kindnessText}>
                It's a hot day! Show some kindness by offering a glass of water to your delivery partner
            </ThemedText>
        </View>

        {/* Delivery Instructions Section */}
        <View style={styles.cardContainer}>
            <Pressable style={styles.instructionsHeader} onPress={toggleInstructions}>
                <Ionicons name="mic-outline" size={26} color={Colors.light.text} />
                <View style={styles.instructionsHeaderTextContainer}>
                    <ThemedText style={styles.instructionsTitle}>Add delivery instructions</ThemedText>
                    <ThemedText style={styles.instructionsSubtitle}>Help your delivery partner reach you faster</ThemedText>
                </View>
                <Ionicons name={instructionsExpanded ? "chevron-up-outline" : "chevron-down-outline"} size={24} color={Colors.light.muted} />
            </Pressable>

            {instructionsExpanded && (
                <View style={styles.instructionsContent}>
                    <InstructionOption 
                        icon="recording-outline" 
                        label="Record audio instructions" 
                        subLabel="Press here to record" 
                        onToggle={() => alert('Record audio (not implemented)')}
                        isFirst
                    />
                    <InstructionOption 
                        icon="notifications-off-outline" 
                        label="Don't ring the bell" 
                        isCheckbox 
                        isChecked={instructionChecks.noRing} 
                        onToggle={() => handleInstructionCheck('noRing')}
                    />
                    <InstructionOption 
                        icon="paw-outline" 
                        label="Pet at home" 
                        subLabel="Keep your furry friend safe"
                        isCheckbox 
                        isChecked={instructionChecks.petAtHome} 
                        onToggle={() => handleInstructionCheck('petAtHome')}
                     />
                    <InstructionOption 
                        icon="home-outline"
                        label="Leave at the door" 
                        isCheckbox 
                        isChecked={instructionChecks.leaveAtDoor} 
                        onToggle={() => handleInstructionCheck('leaveAtDoor')}
                        isLast
                    />
                </View>
            )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background, // Changed from ThemedView background
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 15 : 10, // Adjusted for SafeAreaView
    paddingBottom: 12,
    paddingHorizontal: 15,
    backgroundColor: Colors.light.tint, // Header background color
  },
  backButton: {
    padding: 5,
  },
  headerTextContainer: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.dark.text, // White text on green header
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark.text, // White text
  },
  headerRightPlaceholder: {
    width: 24 + 10, // approx width of back button + padding
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  mapPlaceholderContainer: {
    height: 300, 
    backgroundColor: '#E0E0E0', // Light grey for map area
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative' // For absolute positioning of marker/logo
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapMarker: {
    position: 'absolute',
    // Adjust top/left to position marker appropriately on the placeholder image
    top: '45%', 
    left: '48%',
    // Adding a small circle behind the marker like in the screenshot
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  googleLogoContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  googleLogo: {
    width: 50, // slightly larger for visibility
    height: 20, // slightly larger for visibility
  },
  cardContainer: {
    backgroundColor: Colors.light.background, // White card
    margin: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  partnerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  partnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#E0E0E0', // Placeholder bg for avatar
  },
  partnerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  callButton: {
    padding: 5,
  },
  statusMessageContainer: {
    backgroundColor: '#E6F6F1', // Light green background from screenshot (similar to Colors.light.tint with opacity)
    padding: 12,
    borderRadius: 8,
  },
  statusMessageText: {
    fontSize: 14,
    color: Colors.light.tint, // Darker green text
    fontWeight: '500',
  },
  // Tip Section Styles
  tipHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 2,
  },
  tipSubtitle: {
    fontSize: 13,
    color: Colors.light.muted,
  },
  tipIllustration: {
    width: 80,
    height: 60,
    marginLeft: 10,
  },
  tipButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F0F0F0', // Default background for tip buttons
    alignItems: 'center',
    minWidth: 70, // Ensure buttons have some width
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tipButtonSelected: {
    backgroundColor: Colors.light.tint, // Green for selected
    borderColor: Colors.light.tint,
  },
  tipEmoji: {
    fontSize: 18,
  },
  tipEmojiSelected: {
    // Emoji color doesn't change much with text color, so this might not be needed
    // or could use a specific colored emoji set if available
  },
  tipAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginTop: 2,
  },
  tipAmountSelected: {
    color: Colors.dark.text, // White text on green background
  },
  // Kindness Reminder Section Styles
  kindnessReminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4', // Light yellow background
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
    padding: 15,
  },
  kindnessIcon: {
    marginRight: 10,
  },
  kindnessText: {
    flex: 1,
    fontSize: 13,
    color: '#795548', // Brownish text color for contrast on yellow
    lineHeight: 18,
  },
  // Delivery Instructions Styles
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  instructionsHeaderTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  instructionsSubtitle: {
    fontSize: 13,
    color: Colors.light.muted,
    marginTop: 2,
  },
  instructionsContent: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  instructionOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  instructionOptionFirst: {
    // No special style for first yet, but can add if needed (e.g. no top border if content has border)
  },
  instructionOptionLast: {
    borderBottomWidth: 0,
  },
  instructionIcon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  instructionTextContainer: {
    flex: 1,
  },
  instructionLabel: {
    fontSize: 15,
    color: Colors.light.text,
  },
  instructionSubLabel: {
    fontSize: 12,
    color: Colors.light.muted,
    marginTop: 2,
  },
  checkboxBase: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.light.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkboxChecked: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  locationErrorContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
    zIndex: 10, // Ensure it's above the map image
  },
  locationErrorText: {
    color: 'white',
    textAlign: 'center',
  },
}); 