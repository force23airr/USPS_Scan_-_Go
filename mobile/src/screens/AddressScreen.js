import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../utils/constants';
import { validateAddress } from '../services/api';

export default function AddressScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('to'); // 'from' or 'to'
  const [loading, setLoading] = useState(false);

  const [fromAddress, setFromAddress] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    secondaryAddress: '',
    city: '',
    state: '',
    ZIPCode: '',
    phone: '',
  });

  const [toAddress, setToAddress] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    secondaryAddress: '',
    city: '',
    state: '',
    ZIPCode: '',
    phone: '',
  });

  const currentAddress = activeTab === 'from' ? fromAddress : toAddress;
  const setCurrentAddress = activeTab === 'from' ? setFromAddress : setToAddress;

  const updateField = (field, value) => {
    setCurrentAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateCurrentAddress = async () => {
    const addr = currentAddress;
    if (!addr.streetAddress || !addr.city || !addr.state || !addr.ZIPCode) {
      Alert.alert('Missing Information', 'Please fill in all required address fields');
      return false;
    }

    setLoading(true);
    try {
      const result = await validateAddress({
        streetAddress: addr.streetAddress,
        secondaryAddress: addr.secondaryAddress,
        city: addr.city,
        state: addr.state,
        ZIPCode: addr.ZIPCode,
      });

      if (result.success && result.address) {
        // Update with validated/standardized address
        setCurrentAddress(prev => ({
          ...prev,
          streetAddress: result.address.streetAddress,
          city: result.address.city,
          state: result.address.state,
          ZIPCode: result.address.ZIPCode,
        }));
        return true;
      }
    } catch (error) {
      Alert.alert('Address Validation', 'Could not validate address. Please check and try again.');
      return false;
    } finally {
      setLoading(false);
    }
    return true;
  };

  const handleNext = async () => {
    if (activeTab === 'from') {
      const valid = await validateCurrentAddress();
      if (valid) {
        setActiveTab('to');
      }
    } else {
      const valid = await validateCurrentAddress();
      if (valid) {
        // Both addresses filled, proceed to package details
        navigation.navigate('PackageDetails', {
          fromAddress,
          toAddress,
        });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'from' && styles.activeTab]}
          onPress={() => setActiveTab('from')}
        >
          <Text style={[styles.tabText, activeTab === 'from' && styles.activeTabText]}>
            From (Sender)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'to' && styles.activeTab]}
          onPress={() => setActiveTab('to')}
        >
          <Text style={[styles.tabText, activeTab === 'to' && styles.activeTabText]}>
            To (Recipient)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={currentAddress.firstName}
              onChangeText={(v) => updateField('firstName', v)}
              placeholder="John"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={currentAddress.lastName}
              onChangeText={(v) => updateField('lastName', v)}
              placeholder="Doe"
            />
          </View>
        </View>

        <Text style={styles.label}>Street Address *</Text>
        <TextInput
          style={styles.input}
          value={currentAddress.streetAddress}
          onChangeText={(v) => updateField('streetAddress', v)}
          placeholder="123 Main St"
        />

        <Text style={styles.label}>Apt, Suite, Unit (Optional)</Text>
        <TextInput
          style={styles.input}
          value={currentAddress.secondaryAddress}
          onChangeText={(v) => updateField('secondaryAddress', v)}
          placeholder="Apt 4B"
        />

        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.input}
          value={currentAddress.city}
          onChangeText={(v) => updateField('city', v)}
          placeholder="Miami"
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              value={currentAddress.state}
              onChangeText={(v) => updateField('state', v.toUpperCase())}
              placeholder="FL"
              maxLength={2}
              autoCapitalize="characters"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>ZIP Code *</Text>
            <TextInput
              style={styles.input}
              value={currentAddress.ZIPCode}
              onChangeText={(v) => updateField('ZIPCode', v)}
              placeholder="33189"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        <Text style={styles.label}>Phone (Optional)</Text>
        <TextInput
          style={styles.input}
          value={currentAddress.phone}
          onChangeText={(v) => updateField('phone', v)}
          placeholder="305-555-1234"
          keyboardType="phone-pad"
        />

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.nextButtonText}>
              {activeTab === 'from' ? 'Next: Recipient Address' : 'Next: Package Details'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
  },
  halfInput: {
    flex: 1,
    marginRight: 6,
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
  spacer: {
    height: 100,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
