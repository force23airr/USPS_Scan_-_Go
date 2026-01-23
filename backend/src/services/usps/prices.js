const axios = require('axios');
const config = require('../../config/usps');
const { getAccessToken } = require('./oauth');

// Mock pricing data matching USPS Domestic Prices API v3 structure
const MOCK_PRICES = [
  {
    productId: 'PRIORITY_MAIL',
    productName: 'Priority Mail',
    mailClass: 'PRIORITY_MAIL',
    totalPrice: 9.85,
    extraServices: [],
    zone: '4',
    deliveryDays: '1-3',
    deliveryDate: null
  },
  {
    productId: 'PRIORITY_MAIL_EXPRESS',
    productName: 'Priority Mail Express',
    mailClass: 'PRIORITY_MAIL_EXPRESS',
    totalPrice: 28.75,
    extraServices: [],
    zone: '4',
    deliveryDays: '1-2',
    deliveryDate: null
  },
  {
    productId: 'GROUND_ADVANTAGE',
    productName: 'USPS Ground Advantage',
    mailClass: 'USPS_GROUND_ADVANTAGE',
    totalPrice: 5.25,
    extraServices: [],
    zone: '4',
    deliveryDays: '2-5',
    deliveryDate: null
  },
  {
    productId: 'FIRST_CLASS_MAIL',
    productName: 'First-Class Mail',
    mailClass: 'FIRST_CLASS_MAIL',
    totalPrice: 4.50,
    extraServices: [],
    zone: '4',
    deliveryDays: '2-5',
    deliveryDate: null
  }
];

/**
 * Get pricing for a package based on origin, destination, and package details
 *
 * @param {Object} params - Pricing parameters
 * @param {string} params.originZIPCode - Origin ZIP code
 * @param {string} params.destinationZIPCode - Destination ZIP code
 * @param {number} params.weight - Weight in ounces
 * @param {Object} params.dimensions - Package dimensions
 * @param {number} params.dimensions.length - Length in inches
 * @param {number} params.dimensions.width - Width in inches
 * @param {number} params.dimensions.height - Height in inches
 * @param {string} params.mailClass - Optional: specific mail class to price
 * @returns {Array} Available services with pricing
 */
async function getDomesticPrices(params) {
  const token = await getAccessToken();

  // Use mock if no real credentials
  if (token === 'MOCK_TOKEN') {
    console.log('[MOCK] Getting prices for:', params);

    // Adjust mock prices based on weight
    const weightMultiplier = Math.max(1, params.weight / 16); // per pound
    return MOCK_PRICES.map(price => ({
      ...price,
      totalPrice: Math.round(price.totalPrice * weightMultiplier * 100) / 100
    }));
  }

  try {
    const response = await axios.post(
      `${config.baseUrl}${config.endpoints.domesticPrices}`,
      {
        originZIPCode: params.originZIPCode,
        destinationZIPCode: params.destinationZIPCode,
        weight: params.weight,
        length: params.dimensions?.length || 6,
        width: params.dimensions?.width || 6,
        height: params.dimensions?.height || 6,
        mailClass: params.mailClass || 'PRIORITY_MAIL',
        processingCategory: 'MACHINABLE',
        destinationEntryFacilityType: 'NONE',
        rateIndicator: 'DR', // Dimensional Rectangular
        priceType: 'RETAIL'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    return response.data.rates || response.data;
  } catch (error) {
    console.error('Pricing error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to get pricing');
  }
}

module.exports = {
  getDomesticPrices
};
