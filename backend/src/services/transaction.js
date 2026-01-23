const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

// In-memory store for MVP (replace with PostgreSQL in production)
const transactions = new Map();

/**
 * Create a new transaction
 */
async function createTransaction(data) {
  const transaction = {
    id: uuidv4(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    // Addresses
    fromAddress: data.fromAddress,
    toAddress: data.toAddress,

    // Package details
    packageDetails: {
      weight: data.weight,
      dimensions: data.dimensions,
      contents: data.contents,
      declaredValue: data.declaredValue,
      hazmatScreening: data.hazmatScreening || false
    },

    // Service selection
    selectedService: data.selectedService,
    price: data.price,

    // Payment (will be populated after payment)
    paymentId: null,
    paymentStatus: 'unpaid',

    // USPS data (populated after label creation)
    trackingNumber: null,
    labelId: null,

    // QR code for in-store scanning
    qrCode: null
  };

  // Generate QR code with transaction ID
  transaction.qrCode = await generateQRCode(transaction.id);

  transactions.set(transaction.id, transaction);
  return transaction;
}

/**
 * Get transaction by ID
 */
function getTransaction(id) {
  return transactions.get(id);
}

/**
 * Update transaction
 */
function updateTransaction(id, updates) {
  const transaction = transactions.get(id);
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  const updated = {
    ...transaction,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  transactions.set(id, updated);
  return updated;
}

/**
 * Generate QR code containing transaction data
 */
async function generateQRCode(transactionId) {
  try {
    // QR code contains transaction ID for kiosk/clerk lookup
    const qrData = JSON.stringify({
      type: 'USPS_SCAN_GO',
      transactionId,
      version: '1.0'
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify transaction for kiosk/clerk
 */
function verifyTransaction(transactionId) {
  const transaction = transactions.get(transactionId);

  if (!transaction) {
    return { valid: false, error: 'Transaction not found' };
  }

  if (transaction.paymentStatus !== 'paid') {
    return { valid: false, error: 'Payment not completed', transaction };
  }

  return {
    valid: true,
    transaction,
    readyForLabel: true
  };
}

module.exports = {
  createTransaction,
  getTransaction,
  updateTransaction,
  verifyTransaction,
  generateQRCode
};
