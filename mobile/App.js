import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { validateAddress, getShippingRates, createTransaction, processPayment } from './src/services/api';
import { SERVICE_INFO, PACKAGE_CONTENTS } from './src/utils/constants';

const COLORS = {
  primary: '#004B87',
  white: '#FFFFFF',
  background: '#F5F5F5',
  gray: '#6B7280',
  grayDark: '#374151',
  grayLight: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
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
          onPress={() => onNavigate('addressFrom')}
        >
          <Text style={styles.primaryButtonText}>Ship New Package</Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.step}>1. Enter sender & recipient addresses</Text>
          <Text style={styles.step}>2. Enter package details</Text>
          <Text style={styles.step}>3. Select shipping speed & pay</Text>
          <Text style={styles.step}>4. Show QR code at USPS counter</Text>
        </View>
      </View>
    </View>
  );
}

// Address From Screen
function AddressFromScreen({ onNavigate, onBack }) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    city: '',
    state: '',
    ZIPCode: '',
    phone: '',
  });

  const handleNext = async () => {
    if (!address.firstName || !address.lastName || !address.streetAddress ||
        !address.city || !address.state || !address.ZIPCode) {
      Alert.alert('Missing Info', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const result = await validateAddress(address);
      if (result.success) {
        onNavigate('addressTo', { fromAddress: result.standardizedAddress || address });
      } else {
        Alert.alert('Invalid Address', result.message || 'Please check the address');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to validate address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="Sender Address" onBack={onBack} />
      <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={address.firstName}
              onChangeText={(t) => setAddress({ ...address, firstName: t })}
              placeholder="John"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={address.lastName}
              onChangeText={(t) => setAddress({ ...address, lastName: t })}
              placeholder="Doe"
            />
          </View>
        </View>

        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={styles.input}
          value={address.streetAddress}
          onChangeText={(t) => setAddress({ ...address, streetAddress: t })}
          placeholder="123 Main St"
        />

        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.input}
          value={address.city}
          onChangeText={(t) => setAddress({ ...address, city: t })}
          placeholder="Miami"
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              value={address.state}
              onChangeText={(t) => setAddress({ ...address, state: t.toUpperCase() })}
              placeholder="FL"
              maxLength={2}
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>ZIP Code *</Text>
            <TextInput
              style={styles.input}
              value={address.ZIPCode}
              onChangeText={(t) => setAddress({ ...address, ZIPCode: t })}
              placeholder="33189"
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
        </View>

        <Text style={styles.label}>Phone (optional)</Text>
        <TextInput
          style={styles.input}
          value={address.phone}
          onChangeText={(t) => setAddress({ ...address, phone: t })}
          placeholder="(305) 555-1234"
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Next: Recipient Address</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Address To Screen
function AddressToScreen({ onNavigate, onBack, data }) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    city: '',
    state: '',
    ZIPCode: '',
    phone: '',
  });

  const handleNext = async () => {
    if (!address.firstName || !address.lastName || !address.streetAddress ||
        !address.city || !address.state || !address.ZIPCode) {
      Alert.alert('Missing Info', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const result = await validateAddress(address);
      if (result.success) {
        onNavigate('package', { ...data, toAddress: result.standardizedAddress || address });
      } else {
        Alert.alert('Invalid Address', result.message || 'Please check the address');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to validate address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="Recipient Address" onBack={onBack} />
      <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={address.firstName}
              onChangeText={(t) => setAddress({ ...address, firstName: t })}
              placeholder="Jane"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={address.lastName}
              onChangeText={(t) => setAddress({ ...address, lastName: t })}
              placeholder="Smith"
            />
          </View>
        </View>

        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={styles.input}
          value={address.streetAddress}
          onChangeText={(t) => setAddress({ ...address, streetAddress: t })}
          placeholder="456 Oak Ave"
        />

        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.input}
          value={address.city}
          onChangeText={(t) => setAddress({ ...address, city: t })}
          placeholder="New York"
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              value={address.state}
              onChangeText={(t) => setAddress({ ...address, state: t.toUpperCase() })}
              placeholder="NY"
              maxLength={2}
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>ZIP Code *</Text>
            <TextInput
              style={styles.input}
              value={address.ZIPCode}
              onChangeText={(t) => setAddress({ ...address, ZIPCode: t })}
              placeholder="10001"
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
        </View>

        <Text style={styles.label}>Phone (optional)</Text>
        <TextInput
          style={styles.input}
          value={address.phone}
          onChangeText={(t) => setAddress({ ...address, phone: t })}
          placeholder="(212) 555-5678"
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Next: Package Details</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Package Screen
function PackageScreen({ onNavigate, onBack, data }) {
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('oz');
  const [length, setLength] = useState('6');
  const [width, setWidth] = useState('6');
  const [height, setHeight] = useState('6');
  const [contents, setContents] = useState('merchandise');
  const [declaredValue, setDeclaredValue] = useState('');
  const [showContentsDropdown, setShowContentsDropdown] = useState(false);

  const handleNext = () => {
    if (!weight) {
      Alert.alert('Missing Info', 'Please enter package weight');
      return;
    }

    // Convert weight to ounces for API
    const weightNum = parseFloat(weight);
    const weightInOunces = weightUnit === 'lb' ? weightNum * 16 : weightNum;

    const packageDetails = {
      weight: weightInOunces,
      dimensions: {
        length: parseFloat(length) || 6,
        width: parseFloat(width) || 6,
        height: parseFloat(height) || 6,
      },
      contents,
      declaredValue: parseFloat(declaredValue) || 0,
    };

    onNavigate('services', { ...data, packageDetails });
  };

  const selectedContentsLabel = PACKAGE_CONTENTS.find(c => c.id === contents)?.label || 'Select...';

  return (
    <View style={styles.screen}>
      <Header title="Package Details" onBack={onBack} />
      <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Package Weight *</Text>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="16"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitButton, weightUnit === 'oz' && styles.unitButtonActive]}
              onPress={() => setWeightUnit('oz')}
            >
              <Text style={[styles.unitButtonText, weightUnit === 'oz' && styles.unitButtonTextActive]}>oz</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, weightUnit === 'lb' && styles.unitButtonActive]}
              onPress={() => setWeightUnit('lb')}
            >
              <Text style={[styles.unitButtonText, weightUnit === 'lb' && styles.unitButtonTextActive]}>lb</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Dimensions (inches)</Text>
        <View style={styles.row}>
          <View style={styles.third}>
            <TextInput
              style={styles.input}
              value={length}
              onChangeText={setLength}
              placeholder="L"
              keyboardType="decimal-pad"
            />
            <Text style={styles.dimLabel}>Length</Text>
          </View>
          <View style={styles.third}>
            <TextInput
              style={styles.input}
              value={width}
              onChangeText={setWidth}
              placeholder="W"
              keyboardType="decimal-pad"
            />
            <Text style={styles.dimLabel}>Width</Text>
          </View>
          <View style={styles.third}>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="H"
              keyboardType="decimal-pad"
            />
            <Text style={styles.dimLabel}>Height</Text>
          </View>
        </View>

        <Text style={styles.label}>Package Contents</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowContentsDropdown(!showContentsDropdown)}
        >
          <Text style={styles.dropdownText}>{selectedContentsLabel}</Text>
          <Text style={styles.dropdownArrow}>{showContentsDropdown ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showContentsDropdown && (
          <View style={styles.dropdownList}>
            {PACKAGE_CONTENTS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.dropdownItem, contents === item.id && styles.dropdownItemActive]}
                onPress={() => {
                  setContents(item.id);
                  setShowContentsDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, contents === item.id && styles.dropdownItemTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Declared Value (optional)</Text>
        <View style={styles.currencyInput}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={[styles.input, { flex: 1, marginTop: 0 }]}
            value={declaredValue}
            onChangeText={setDeclaredValue}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>Get Shipping Rates</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Service Selection Screen
function ServiceSelectionScreen({ onNavigate, onBack, data }) {
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const result = await getShippingRates({
        originZIP: data.fromAddress.ZIPCode,
        destinationZIP: data.toAddress.ZIPCode,
        weight: data.packageDetails.weight,
        length: data.packageDetails.dimensions.length,
        width: data.packageDetails.dimensions.width,
        height: data.packageDetails.dimensions.height,
      });

      if (result.success && result.rates) {
        setRates(result.rates);
      } else {
        Alert.alert('Error', 'Failed to get shipping rates');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to get shipping rates');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!selectedService) {
      Alert.alert('Select Service', 'Please select a shipping service');
      return;
    }

    const rate = rates.find(r => r.service === selectedService);
    onNavigate('payment', {
      ...data,
      selectedService,
      price: rate.price,
      deliveryDays: rate.deliveryDays,
    });
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header title="Select Service" onBack={onBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Getting shipping rates...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title="Select Service" onBack={onBack} />
      <ScrollView style={styles.content}>
        {rates.map((rate) => {
          const serviceInfo = SERVICE_INFO[rate.service] || { name: rate.service, description: '' };
          const isSelected = selectedService === rate.service;

          return (
            <TouchableOpacity
              key={rate.service}
              style={[styles.rateCard, isSelected && styles.rateCardSelected]}
              onPress={() => setSelectedService(rate.service)}
            >
              <View style={styles.rateHeader}>
                <Text style={[styles.rateName, isSelected && styles.rateNameSelected]}>
                  {serviceInfo.name}
                </Text>
                <Text style={[styles.ratePrice, isSelected && styles.ratePriceSelected]}>
                  ${rate.price.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.rateDelivery}>
                Delivery: {rate.deliveryDays} business days
              </Text>
              <Text style={styles.rateDescription}>{serviceInfo.description}</Text>
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.primaryButton, !selectedService && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!selectedService}
        >
          <Text style={styles.primaryButtonText}>Continue to Payment</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Payment Screen
function PaymentScreen({ onNavigate, onBack, data }) {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ').substring(0, 19) : '';
  };

  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handlePayment = async () => {
    if (!cardNumber || !expiry || !cvc || !cardName) {
      Alert.alert('Missing Info', 'Please fill in all payment fields');
      return;
    }

    try {
      setLoading(true);

      // Create transaction first
      const transactionData = {
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        packageDetails: data.packageDetails,
        serviceType: data.selectedService,
        price: data.price,
      };

      const txResult = await createTransaction(transactionData);

      if (!txResult.success) {
        throw new Error(txResult.message || 'Failed to create transaction');
      }

      // Process payment
      const paymentResult = await processPayment(txResult.transaction.id, {
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiry,
        cvc,
        cardName,
      });

      if (paymentResult.success) {
        onNavigate('confirm', {
          ...data,
          transaction: paymentResult.transaction,
        });
      } else {
        throw new Error(paymentResult.message || 'Payment failed');
      }
    } catch (error) {
      Alert.alert('Payment Error', error.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const serviceInfo = SERVICE_INFO[data.selectedService] || { name: data.selectedService };

  return (
    <View style={styles.screen}>
      <Header title="Payment" onBack={onBack} />
      <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service:</Text>
            <Text style={styles.summaryValue}>{serviceInfo.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery:</Text>
            <Text style={styles.summaryValue}>{data.deliveryDays} business days</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>From:</Text>
            <Text style={styles.summaryValue}>{data.fromAddress.city}, {data.fromAddress.state}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>To:</Text>
            <Text style={styles.summaryValue}>{data.toAddress.city}, {data.toAddress.state}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${data.price.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Form */}
        <Text style={styles.sectionTitle}>Payment Details</Text>

        <Text style={styles.label}>Name on Card</Text>
        <TextInput
          style={styles.input}
          value={cardName}
          onChangeText={setCardName}
          placeholder="John Doe"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          value={cardNumber}
          onChangeText={(t) => setCardNumber(formatCardNumber(t))}
          placeholder="1234 5678 9012 3456"
          keyboardType="number-pad"
          maxLength={19}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Expiry</Text>
            <TextInput
              style={styles.input}
              value={expiry}
              onChangeText={(t) => setExpiry(formatExpiry(t))}
              placeholder="MM/YY"
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>CVC</Text>
            <TextInput
              style={styles.input}
              value={cvc}
              onChangeText={setCvc}
              placeholder="123"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Pay ${data.price.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Confirmation Screen
function ConfirmScreen({ onNavigate, data }) {
  const serviceInfo = SERVICE_INFO[data.selectedService] || { name: data.selectedService };

  return (
    <View style={styles.screen}>
      <Header title="Confirmation" />
      <ScrollView style={styles.content}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.title}>Ready to Ship!</Text>
        <Text style={styles.subtitle}>
          Show this QR code at your local USPS counter
        </Text>

        {/* QR Code */}
        {data.transaction?.qrCode ? (
          <View style={styles.qrContainer}>
            <Image
              source={{ uri: data.transaction.qrCode }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrText}>QR CODE</Text>
          </View>
        )}

        {/* Transaction Details */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Transaction Details</Text>
          {data.transaction?.id && (
            <Text style={styles.transactionId}>ID: {data.transaction.id}</Text>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service:</Text>
            <Text style={styles.detailValue}>{serviceInfo.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>${data.price.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery:</Text>
            <Text style={styles.detailValue}>{data.deliveryDays} business days</Text>
          </View>
        </View>

        {/* Address Summary */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Shipping Details</Text>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>From:</Text>
            <Text style={styles.addressText}>
              {data.fromAddress.firstName} {data.fromAddress.lastName}
            </Text>
            <Text style={styles.addressText}>{data.fromAddress.streetAddress}</Text>
            <Text style={styles.addressText}>
              {data.fromAddress.city}, {data.fromAddress.state} {data.fromAddress.ZIPCode}
            </Text>
          </View>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>To:</Text>
            <Text style={styles.addressText}>
              {data.toAddress.firstName} {data.toAddress.lastName}
            </Text>
            <Text style={styles.addressText}>{data.toAddress.streetAddress}</Text>
            <Text style={styles.addressText}>
              {data.toAddress.city}, {data.toAddress.state} {data.toAddress.ZIPCode}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => onNavigate('home')}
        >
          <Text style={styles.primaryButtonText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
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
      {screen === 'addressFrom' && <AddressFromScreen onNavigate={navigate} onBack={goBack} />}
      {screen === 'addressTo' && <AddressToScreen onNavigate={navigate} onBack={goBack} data={navData} />}
      {screen === 'package' && <PackageScreen onNavigate={navigate} onBack={goBack} data={navData} />}
      {screen === 'services' && <ServiceSelectionScreen onNavigate={navigate} onBack={goBack} data={navData} />}
      {screen === 'payment' && <PaymentScreen onNavigate={navigate} onBack={goBack} data={navData} />}
      {screen === 'confirm' && <ConfirmScreen onNavigate={navigate} data={navData} />}
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
    fontWeight: 'bold',
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
    marginBottom: 20,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  third: {
    width: '31%',
  },
  dimLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  unitToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    overflow: 'hidden',
  },
  unitButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  unitButtonActive: {
    backgroundColor: COLORS.primary,
  },
  unitButtonText: {
    fontSize: 16,
    color: COLORS.grayDark,
  },
  unitButtonTextActive: {
    color: COLORS.white,
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.grayDark,
  },
  dropdownArrow: {
    fontSize: 12,
    color: COLORS.gray,
  },
  dropdownList: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    marginTop: 4,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primary + '10',
  },
  dropdownItemText: {
    fontSize: 16,
    color: COLORS.grayDark,
  },
  dropdownItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    color: COLORS.grayDark,
    marginRight: 8,
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
  },
  rateCard: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.grayLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rateCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rateName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.grayDark,
  },
  rateNameSelected: {
    color: COLORS.primary,
  },
  ratePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.grayDark,
  },
  ratePriceSelected: {
    color: COLORS.primary,
  },
  rateDelivery: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  rateDescription: {
    fontSize: 13,
    color: COLORS.gray,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  selectedBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.grayDark,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.grayDark,
    fontWeight: '500',
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.grayDark,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.grayDark,
    marginBottom: 8,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 40,
    color: COLORS.white,
  },
  qrContainer: {
    alignSelf: 'center',
    marginVertical: 20,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrImage: {
    width: 200,
    height: 200,
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
  transactionId: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.grayDark,
    fontWeight: '500',
  },
  addressBlock: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.grayDark,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
});
