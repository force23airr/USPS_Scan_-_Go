const express = require('express');
const router = express.Router();
const transactionService = require('../services/transaction');
const usps = require('../services/usps');

/**
 * POST /api/transaction
 * Create a new shipping transaction
 */
router.post('/', async (req, res) => {
  try {
    const {
      fromAddress,
      toAddress,
      weight,
      dimensions,
      contents,
      declaredValue,
      hazmatScreening,
      selectedService,
      price
    } = req.body;

    // Validate required fields
    if (!fromAddress || !toAddress || !weight || !selectedService) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const transaction = await transactionService.createTransaction({
      fromAddress,
      toAddress,
      weight,
      dimensions,
      contents,
      declaredValue,
      hazmatScreening,
      selectedService,
      price
    });

    res.status(201).json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/transaction/:id
 * Get transaction details
 */
router.get('/:id', (req, res) => {
  try {
    const transaction = transactionService.getTransaction(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/transaction/:id/payment
 * Mark transaction as paid (simplified for MVP)
 */
router.post('/:id/payment', (req, res) => {
  try {
    const { paymentId, paymentMethod } = req.body;

    const transaction = transactionService.updateTransaction(req.params.id, {
      paymentId: paymentId || 'mock_payment_' + Date.now(),
      paymentStatus: 'paid',
      paymentMethod: paymentMethod || 'card'
    });

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/transaction/:id/verify
 * Verify transaction for kiosk/clerk (scans QR code)
 */
router.post('/:id/verify', (req, res) => {
  try {
    const result = transactionService.verifyTransaction(req.params.id);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        error: result.error,
        transaction: result.transaction
      });
    }

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/transaction/:id/label
 * Create shipping label for verified transaction
 */
router.post('/:id/label', async (req, res) => {
  try {
    const transaction = transactionService.getTransaction(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.paymentStatus !== 'paid') {
      return res.status(400).json({ error: 'Payment required before label creation' });
    }

    // Create label via USPS API
    const label = await usps.createLabel({
      fromAddress: transaction.fromAddress,
      toAddress: transaction.toAddress,
      mailClass: transaction.selectedService,
      weight: transaction.packageDetails.weight,
      dimensions: transaction.packageDetails.dimensions,
      price: transaction.price
    });

    // Update transaction with label info
    const updated = transactionService.updateTransaction(req.params.id, {
      trackingNumber: label.trackingNumber,
      labelId: label.labelId,
      status: 'labeled'
    });

    res.json({
      success: true,
      label,
      transaction: updated
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
