import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SERVICE_INFO } from '../utils/constants';
import { createTransaction, processPayment } from '../services/api';

export default function PaymentScreen({ navigation, route }) {
  const {
    fromAddress,
    toAddress,
    packageDetails,
    selectedService,
    price,
    deliveryDays,
  } = route.params;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  // Card form state (simplified for MVP)
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const serviceName = SERVICE_INFO[selectedService]?.name || selectedService;

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handlePayment = async () => {
    // Validate card details (simplified)
    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        Alert.alert('Invalid Card', 'Please enter a valid card number');
        return;
      }
      if (!expiry || expiry.length < 5) {
        Alert.alert('Invalid Expiry', 'Please enter a valid expiry date');
        return;
      }
      if (!cvc || cvc.length < 3) {
        Alert.alert('Invalid CVC', 'Please enter a valid CVC');
        return;
      }
    }

    setLoading(true);

    try {
      // Step 1: Create transaction
      const transactionResult = await createTransaction({
        fromAddress,
        toAddress,
        weight: packageDetails.weight,
        dimensions: packageDetails.dimensions,
        contents: packageDetails.contents,
        declaredValue: packageDetails.declaredValue,
        hazmatScreening: packageDetails.hazmatScreening,
        selectedService,
        price,
      });

      if (!transactionResult.success) {
        throw new Error('Failed to create transaction');
      }

      const transaction = transactionResult.transaction;

      // Step 2: Process payment
      const paymentResult = await processPayment(transaction.id, {
        paymentMethod,
        // In production, you'd use Stripe/payment processor tokens
        // Never send raw card data to your backend
      });

      if (!paymentResult.success) {
        throw new Error('Payment failed');
      }

      // Navigate to confirmation with QR code
      navigation.navigate('Confirmation', {
        transaction: paymentResult.transaction,
        serviceName,
        deliveryDays,
      });
    } catch (error) {
      Alert.alert('Payment Error', error.message || 'Payment could not be processed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.orderSummary}>
        <Text style={styles.summaryTitle}>Order Summary</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service</Text>
          <Text style={styles.summaryValue}>{serviceName}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <Text style={styles.summaryValue}>{deliveryDays} business days</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Recipient</Text>
          <Text style={styles.summaryValue}>
            {toAddress.firstName} {toAddress.lastName}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>${price.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Payment Method</Text>

        <View style={styles.methodButtons}>
          <TouchableOpacity
            style={[styles.methodButton, paymentMethod === 'card' && styles.methodButtonActive]}
            onPress={() => setPaymentMethod('card')}
          >
            <Text style={[styles.methodText, paymentMethod === 'card' && styles.methodTextActive]}>
              Credit/Debit Card
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodButton, paymentMethod === 'apple' && styles.methodButtonActive]}
            onPress={() => setPaymentMethod('apple')}
          >
            <Text style={[styles.methodText, paymentMethod === 'apple' && styles.methodTextActive]}>
              Apple Pay
            </Text>
          </TouchableOpacity>
        </View>

        {paymentMethod === 'card' && (
          <View style={styles.cardForm}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={(t) => setCardNumber(formatCardNumber(t))}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={19}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Expiry</Text>
                <TextInput
                  style={styles.input}
                  value={expiry}
                  onChangeText={(t) => setExpiry(formatExpiry(t))}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>CVC</Text>
                <TextInput
                  style={styles.input}
                  value={cvc}
                  onChangeText={setCvc}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Name on Card</Text>
            <TextInput
              style={styles.input}
              value={cardName}
              onChangeText={setCardName}
              placeholder="John Doe"
              autoCapitalize="words"
            />
          </View>
        )}

        {paymentMethod === 'apple' && (
          <View style={styles.applePayContainer}>
            <Text style={styles.applePayText}>
              Click below to pay with Apple Pay
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.payButtonText}>
            Pay ${price.toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.secureText}>
        Your payment is secure and encrypted
      </Text>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  orderSummary: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.grayDark,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  divider: {
    height: 1,
    backgroundColor: COLORS.grayLight,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.grayDark,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  paymentSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.grayDark,
    marginBottom: 16,
  },
  methodButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  methodButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.grayLight,
    alignItems: 'center',
  },
  methodButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F7FF',
  },
  methodText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  methodTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  cardForm: {
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.grayDark,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  halfInput: {
    flex: 1,
  },
  applePayContainer: {
    padding: 20,
    alignItems: 'center',
  },
  applePayText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secureText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});
