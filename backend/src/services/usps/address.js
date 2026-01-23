const axios = require('axios');
const config = require('../../config/usps');
const { getAccessToken } = require('./oauth');

// Mock response matching USPS Address API v3 structure
const MOCK_ADDRESS_RESPONSE = {
  firm: null,
  address: {
    streetAddress: '1600 PENNSYLVANIA AVE NW',
    streetAddressAbbreviation: '1600 PENNSYLVANIA AVE NW',
    secondaryAddress: null,
    city: 'WASHINGTON',
    cityAbbreviation: 'WASHINGTON',
    state: 'DC',
    postalCode: '20500',
    ZIPCode: '20500',
    ZIPPlus4: '0005',
    urbanization: null
  },
  addressAdditionalInfo: {
    deliveryPoint: '00',
    carrierRoute: 'C000',
    DPVConfirmation: 'Y',
    DPVCMRA: 'N',
    business: 'Y',
    centralDeliveryPoint: 'N',
    vacant: 'N'
  }
};

/**
 * Validate and standardize an address using USPS Address API v3
 *
 * @param {Object} address - Address to validate
 * @param {string} address.streetAddress - Street address line
 * @param {string} address.city - City name
 * @param {string} address.state - State code (2 letters)
 * @param {string} address.ZIPCode - ZIP code (5 digits)
 * @returns {Object} Validated and standardized address
 */
async function validateAddress(address) {
  const token = await getAccessToken();

  // Use mock if no real credentials
  if (token === 'MOCK_TOKEN') {
    console.log('[MOCK] Address validation for:', address);
    return {
      ...MOCK_ADDRESS_RESPONSE,
      address: {
        ...MOCK_ADDRESS_RESPONSE.address,
        streetAddress: address.streetAddress?.toUpperCase() || MOCK_ADDRESS_RESPONSE.address.streetAddress,
        city: address.city?.toUpperCase() || MOCK_ADDRESS_RESPONSE.address.city,
        state: address.state?.toUpperCase() || MOCK_ADDRESS_RESPONSE.address.state,
        ZIPCode: address.ZIPCode || MOCK_ADDRESS_RESPONSE.address.ZIPCode
      }
    };
  }

  try {
    const response = await axios.get(
      `${config.baseUrl}${config.endpoints.addressValidation}`,
      {
        params: {
          streetAddress: address.streetAddress,
          secondaryAddress: address.secondaryAddress,
          city: address.city,
          state: address.state,
          ZIPCode: address.ZIPCode
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Address validation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Address validation failed');
  }
}

module.exports = {
  validateAddress
};
