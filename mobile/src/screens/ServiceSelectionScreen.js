import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SERVICE_INFO } from '../utils/constants';
import { getShippingRates } from '../services/api';

export default function ServiceSelectionScreen({ navigation, route }) {
  const { fromAddress, toAddress, packageDetails } = route.params;

  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const result = await getShippingRates({
        originZIPCode: fromAddress.ZIPCode,
        destinationZIPCode: toAddress.ZIPCode,
        weight: packageDetails.weight,
        dimensions: packageDetails.dimensions,
      });

      if (result.success && result.rates) {
        setRates(result.rates);
        // Auto-select first option
        if (result.rates.length > 0) {
          setSelectedService(result.rates[0]);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch shipping rates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!selectedService) {
      Alert.alert('Select Service', 'Please select a shipping service');
      return;
    }

    navigation.navigate('Payment', {
      fromAddress,
      toAddress,
      packageDetails,
      selectedService: selectedService.mailClass,
      price: selectedService.totalPrice,
      deliveryDays: selectedService.deliveryDays,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching shipping rates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Shipment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>From:</Text>
            <Text style={styles.summaryValue}>
              {fromAddress.city}, {fromAddress.state} {fromAddress.ZIPCode}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>To:</Text>
            <Text style={styles.summaryValue}>
              {toAddress.city}, {toAddress.state} {toAddress.ZIPCode}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Weight:</Text>
            <Text style={styles.summaryValue}>
              {(packageDetails.weight / 16).toFixed(2)} lb
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select Shipping Service</Text>

        {rates.map((rate) => {
          const serviceInfo = SERVICE_INFO[rate.mailClass] || {
            name: rate.productName,
            description: `Delivery in ${rate.deliveryDays} days`,
          };
          const isSelected = selectedService?.productId === rate.productId;

          return (
            <TouchableOpacity
              key={rate.productId}
              style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
              onPress={() => setSelectedService(rate)}
            >
              <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceName, isSelected && styles.serviceNameSelected]}>
                    {serviceInfo.name}
                  </Text>
                  <Text style={styles.serviceDescription}>{serviceInfo.description}</Text>
                  <Text style={styles.deliveryTime}>{rate.deliveryDays} business days</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={[styles.price, isSelected && styles.priceSelected]}>
                    ${rate.totalPrice.toFixed(2)}
                  </Text>
                </View>
              </View>
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {rates.length === 0 && (
          <View style={styles.noRatesContainer}>
            <Text style={styles.noRatesText}>
              No shipping rates available for this route.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchRates}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        {selectedService && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>${selectedService.totalPrice.toFixed(2)}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.nextButton, !selectedService && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedService}
        >
          <Text style={styles.nextButtonText}>Continue to Payment</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.gray,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  summaryLabel: {
    width: 60,
    fontSize: 14,
    color: COLORS.gray,
  },
  summaryValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.grayDark,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.grayDark,
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  serviceCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F7FF',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.grayDark,
    marginBottom: 4,
  },
  serviceNameSelected: {
    color: COLORS.primary,
  },
  serviceDescription: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 4,
  },
  deliveryTime: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '500',
  },
  priceContainer: {
    justifyContent: 'center',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.grayDark,
  },
  priceSelected: {
    color: COLORS.primary,
  },
  selectedIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    alignItems: 'center',
  },
  selectedText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  noRatesContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noRatesText: {
    color: COLORS.gray,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: COLORS.gray,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.grayLight,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
