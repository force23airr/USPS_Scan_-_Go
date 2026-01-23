const express = require('express');
const router = express.Router();
const usps = require('../services/usps');

/**
 * POST /api/address/validate
 * Validate and standardize an address
 */
router.post('/validate', async (req, res) => {
  try {
    const { streetAddress, secondaryAddress, city, state, ZIPCode } = req.body;

    if (!streetAddress || !city || !state) {
      return res.status(400).json({
        error: 'Missing required fields: streetAddress, city, state'
      });
    }

    const result = await usps.validateAddress({
      streetAddress,
      secondaryAddress,
      city,
      state,
      ZIPCode
    });

    res.json({
      success: true,
      address: result.address,
      additionalInfo: result.addressAdditionalInfo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
