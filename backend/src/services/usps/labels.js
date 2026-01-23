const axios = require('axios');
const config = require('../../config/usps');
const { getAccessToken } = require('./oauth');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a domestic shipping label
 * NOTE: Labels API requires additional USPS approval and Enterprise Payment Account
 *
 * @param {Object} params - Label parameters
 * @param {Object} params.fromAddress - Sender address
 * @param {Object} params.toAddress - Recipient address
 * @param {string} params.mailClass - Mail class (PRIORITY_MAIL, etc.)
 * @param {number} params.weight - Weight in ounces
 * @param {Object} params.dimensions - Package dimensions
 * @returns {Object} Label data including tracking number and label image
 */
async function createLabel(params) {
  const token = await getAccessToken();

  // Use mock if no real credentials
  if (token === 'MOCK_TOKEN') {
    console.log('[MOCK] Creating label for:', params);

    // Generate mock tracking number (format: 9400 1234 5678 9012 3456 78)
    const mockTrackingNumber = '9400' + Math.random().toString().slice(2, 22);

    return {
      labelId: uuidv4(),
      trackingNumber: mockTrackingNumber,
      mailClass: params.mailClass,
      labelImage: null, // Would be base64 PDF/PNG in real response
      labelImageType: 'PDF',
      price: params.price || 9.85,
      status: 'CREATED',
      createdAt: new Date().toISOString(),
      // Mock: In real implementation, this would be the actual label
      mockNote: 'This is a mock label - connect real USPS credentials for actual labels'
    };
  }

  try {
    const response = await axios.post(
      `${config.baseUrl}${config.endpoints.domesticLabel}`,
      {
        imageInfo: {
          imageType: 'PDF',
          labelType: '4X6LABEL'
        },
        toAddress: {
          firstName: params.toAddress.firstName,
          lastName: params.toAddress.lastName,
          streetAddress: params.toAddress.streetAddress,
          secondaryAddress: params.toAddress.secondaryAddress,
          city: params.toAddress.city,
          state: params.toAddress.state,
          ZIPCode: params.toAddress.ZIPCode,
          phone: params.toAddress.phone
        },
        fromAddress: {
          firstName: params.fromAddress.firstName,
          lastName: params.fromAddress.lastName,
          streetAddress: params.fromAddress.streetAddress,
          city: params.fromAddress.city,
          state: params.fromAddress.state,
          ZIPCode: params.fromAddress.ZIPCode
        },
        packageDescription: {
          weight: params.weight,
          length: params.dimensions?.length || 6,
          width: params.dimensions?.width || 6,
          height: params.dimensions?.height || 6,
          mailClass: params.mailClass,
          processingCategory: 'MACHINABLE',
          rateIndicator: 'DR'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Label creation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to create label');
  }
}

module.exports = {
  createLabel
};
