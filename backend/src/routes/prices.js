const express = require('express');
const router = express.Router();
const usps = require('../services/usps');

/**
 * POST /api/prices
 * Get available shipping options and prices
 */
router.post('/', async (req, res) => {
  try {
    const {
      originZIPCode,
      destinationZIPCode,
      weight,
      dimensions,
      mailClass
    } = req.body;

    if (!originZIPCode || !destinationZIPCode || !weight) {
      return res.status(400).json({
        error: 'Missing required fields: originZIPCode, destinationZIPCode, weight'
      });
    }

    const prices = await usps.getDomesticPrices({
      originZIPCode,
      destinationZIPCode,
      weight,
      dimensions: dimensions || { length: 6, width: 6, height: 6 },
      mailClass
    });

    res.json({
      success: true,
      rates: prices
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
