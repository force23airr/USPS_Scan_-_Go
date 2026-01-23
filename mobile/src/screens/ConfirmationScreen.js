import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { COLORS } from '../utils/constants';

export default function ConfirmationScreen({ navigation, route }) {
  const { transaction, serviceName, deliveryDays } = route.params;

  const handleDone = () => {
    // Navigate back to home and reset the stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.successIcon}>
        <Text style={styles.checkmark}>✓</Text>
      </View>

      <Text style={styles.title}>You're All Set!</Text>
      <Text style={styles.subtitle}>
        Show this QR code at your local USPS counter for instant drop-off
      </Text>

      <View style={styles.qrContainer}>
        {transaction.qrCode ? (
          <Image
            source={{ uri: transaction.qrCode }}
            style={styles.qrCode}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrPlaceholderText}>QR Code</Text>
          </View>
        )}
        <Text style={styles.transactionId}>
          ID: {transaction.id.substring(0, 8).toUpperCase()}
        </Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Shipment Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Service</Text>
          <Text style={styles.detailValue}>{serviceName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Est. Delivery</Text>
          <Text style={styles.detailValue}>{deliveryDays} business days</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Paid</Text>
          <Text style={[styles.detailValue, styles.priceValue]}>
            ${transaction.price?.toFixed(2)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.addressSection}>
          <Text style={styles.addressLabel}>From:</Text>
          <Text style={styles.addressText}>
            {transaction.fromAddress?.firstName} {transaction.fromAddress?.lastName}
          </Text>
          <Text style={styles.addressText}>
            {transaction.fromAddress?.streetAddress}
          </Text>
          <Text style={styles.addressText}>
            {transaction.fromAddress?.city}, {transaction.fromAddress?.state}{' '}
            {transaction.fromAddress?.ZIPCode}
          </Text>
        </View>

        <View style={styles.addressSection}>
          <Text style={styles.addressLabel}>To:</Text>
          <Text style={styles.addressText}>
            {transaction.toAddress?.firstName} {transaction.toAddress?.lastName}
          </Text>
          <Text style={styles.addressText}>
            {transaction.toAddress?.streetAddress}
          </Text>
          <Text style={styles.addressText}>
            {transaction.toAddress?.city}, {transaction.toAddress?.state}{' '}
            {transaction.toAddress?.ZIPCode}
          </Text>
        </View>
      </View>

      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>What's Next?</Text>
        <View style={styles.instruction}>
          <Text style={styles.instructionNumber}>1</Text>
          <Text style={styles.instructionText}>
            Go to your nearest USPS Post Office
          </Text>
        </View>
        <View style={styles.instruction}>
          <Text style={styles.instructionNumber}>2</Text>
          <Text style={styles.instructionText}>
            Show this QR code to the clerk
          </Text>
        </View>
        <View style={styles.instruction}>
          <Text style={styles.instructionNumber}>3</Text>
          <Text style={styles.instructionText}>
            Hand over your package and get your receipt
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save QR Code to Photos</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 40,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.grayDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  qrContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  qrPlaceholderText: {
    color: COLORS.gray,
    fontSize: 18,
  },
  transactionId: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray,
    fontFamily: 'monospace',
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.grayDark,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  priceValue: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayLight,
    marginVertical: 16,
  },
  addressSection: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 14,
    color: COLORS.grayDark,
    lineHeight: 20,
  },
  instructionsCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.grayDark,
    marginBottom: 16,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.grayDark,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    marginTop: 12,
    padding: 16,
  },
  saveButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
