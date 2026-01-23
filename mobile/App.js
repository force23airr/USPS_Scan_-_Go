import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const COLORS = {
  primary: '#004B87',
  white: '#FFFFFF',
  background: '#F5F5F5',
  gray: '#6B7280',
  grayDark: '#374151',
  grayLight: '#E5E7EB',
};

// Simple Header Component
function Header({ title, onBack }) {
  return (
    <View style={styles.header}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      {onBack && <View style={styles.backButton} />}
    </View>
  );
}

// Home Screen
function HomeScreen({ onNavigate }) {
  return (
    <View style={styles.screen}>
      <Header title="USPS Scan & Go" />
      <View style={styles.content}>
        <Text style={styles.title}>Skip the Line</Text>
        <Text style={styles.subtitle}>
          Pre-fill your shipping info and get a QR code for instant drop-off
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => onNavigate('address')}
        >
          <Text style={styles.primaryButtonText}>Ship New Package</Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.step}>1. Enter addresses & package details</Text>
          <Text style={styles.step}>2. Select shipping speed & pay</Text>
          <Text style={styles.step}>3. Show QR code at USPS counter</Text>
          <Text style={styles.step}>4. Drop off & go!</Text>
        </View>
      </View>
    </View>
  );
}

// Address Screen
function AddressScreen({ onNavigate, onBack }) {
  const [fromAddress, setFromAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  });

  const handleNext = () => {
    if (!fromAddress.street || !fromAddress.city || !fromAddress.state || !fromAddress.zip) {
      Alert.alert('Missing Info', 'Please fill in all address fields');
      return;
    }
    onNavigate('package', { fromAddress });
  };

  return (
    <View style={styles.screen}>
      <Header title="Shipping Address" onBack={onBack} />
      <ScrollView style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fromAddress.name}
          onChangeText={(t) => setFromAddress({ ...fromAddress, name: t })}
          placeholder="John Doe"
        />

        <Text style={styles.label}>Street Address</Text>
        <TextInput
          style={styles.input}
          value={fromAddress.street}
          onChangeText={(t) => setFromAddress({ ...fromAddress, street: t })}
          placeholder="123 Main St"
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={fromAddress.city}
          onChangeText={(t) => setFromAddress({ ...fromAddress, city: t })}
          placeholder="Miami"
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={fromAddress.state}
              onChangeText={(t) => setFromAddress({ ...fromAddress, state: t.toUpperCase() })}
              placeholder="FL"
              maxLength={2}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>ZIP Code</Text>
            <TextInput
              style={styles.input}
              value={fromAddress.zip}
              onChangeText={(t) => setFromAddress({ ...fromAddress, zip: t })}
              placeholder="33189"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>Next: Package Details</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Package Screen
function PackageScreen({ onNavigate, onBack, data }) {
  const [weight, setWeight] = useState('');

  const handleNext = () => {
    if (!weight) {
      Alert.alert('Missing Info', 'Please enter package weight');
      return;
    }
    onNavigate('confirm', { ...data, weight });
  };

  return (
    <View style={styles.screen}>
      <Header title="Package Details" onBack={onBack} />
      <View style={styles.content}>
        <Text style={styles.label}>Package Weight (lbs)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="1.5"
          keyboardType="decimal-pad"
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>Get Shipping Rates</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Confirmation Screen
function ConfirmScreen({ onBack, onNavigate, data }) {
  return (
    <View style={styles.screen}>
      <Header title="Confirmation" />
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.title}>Ready to Ship!</Text>
        <Text style={styles.subtitle}>
          Show this screen at your local USPS counter
        </Text>

        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrText}>QR CODE</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Shipment Details</Text>
          <Text style={styles.step}>From: {data?.fromAddress?.city}, {data?.fromAddress?.state}</Text>
          <Text style={styles.step}>Weight: {data?.weight} lbs</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => onNavigate('home')}
        >
          <Text style={styles.primaryButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Main App with state-based navigation
export default function App() {
  const [screen, setScreen] = useState('home');
  const [navData, setNavData] = useState({});
  const [history, setHistory] = useState(['home']);

  const navigate = (newScreen, data = {}) => {
    setNavData({ ...navData, ...data });
    setScreen(newScreen);
    if (newScreen !== 'home') {
      setHistory([...history, newScreen]);
    } else {
      setHistory(['home']);
      setNavData({});
    }
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setScreen(newHistory[newHistory.length - 1]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {screen === 'home' && <HomeScreen onNavigate={navigate} />}
      {screen === 'address' && <AddressScreen onNavigate={navigate} onBack={goBack} />}
      {screen === 'package' && <PackageScreen onNavigate={navigate} onBack={goBack} data={navData} />}
      {screen === 'confirm' && <ConfirmScreen onNavigate={navigate} onBack={goBack} data={navData} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    width: 60,
  },
  backText: {
    color: COLORS.white,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    color: COLORS.grayDark,
    marginBottom: 12,
  },
  step: {
    fontSize: 14,
    color: COLORS.grayDark,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.grayDark,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  half: {
    width: '48%',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 40,
    color: COLORS.white,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
    borderRadius: 12,
  },
  qrText: {
    color: COLORS.gray,
    fontSize: 18,
  },
});
