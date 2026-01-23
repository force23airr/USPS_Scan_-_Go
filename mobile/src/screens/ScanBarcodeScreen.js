import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS } from '../utils/constants';

export default function ScanBarcodeScreen({ navigation }) {
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleSubmit = () => {
    if (!trackingNumber.trim()) {
      Alert.alert('Enter Tracking Number', 'Please enter a tracking number to continue');
      return;
    }

    Alert.alert(
      'Tracking Number Entered',
      `Tracking: ${trackingNumber}\n\nThis package already has a label. Would you like to track it or ship a new package?`,
      [
        {
          text: 'Track Package',
          onPress: () => {
            Alert.alert('Coming Soon', 'Package tracking will be available in the next update');
          },
        },
        {
          text: 'New Shipment',
          onPress: () => navigation.navigate('Address'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter Tracking Number</Text>
        <Text style={styles.subtitle}>
          Camera scanning coming soon. For now, enter your tracking number manually.
        </Text>

        <TextInput
          style={styles.input}
          value={trackingNumber}
          onChangeText={setTrackingNumber}
          placeholder="e.g., 9400111899223456789012"
          placeholderTextColor={COLORS.gray}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Look Up Package</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.newShipmentButton}
          onPress={() => navigation.navigate('Address')}
        >
          <Text style={styles.newShipmentText}>Ship a New Package</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.grayDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.grayLight,
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.gray,
    fontSize: 14,
  },
  newShipmentButton: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  newShipmentText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
