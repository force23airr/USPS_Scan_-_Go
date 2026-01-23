const axios = require('axios');
const config = require('../../config/usps');

let cachedToken = null;
let tokenExpiry = null;

/**
 * Get OAuth token from USPS API
 * Uses client credentials grant type
 * Caches token until expiry
 */
async function getAccessToken() {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return cachedToken;
  }

  // Check if credentials are configured
  if (!config.consumerKey || !config.consumerSecret) {
    console.warn('USPS credentials not configured - using mock mode');
    return 'MOCK_TOKEN';
  }

  try {
    const response = await axios.post(
      config.oauthUrl,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.consumerKey,
        client_secret: config.consumerSecret
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    cachedToken = response.data.access_token;
    // Token typically expires in 1 hour
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);

    return cachedToken;
  } catch (error) {
    console.error('Failed to get USPS OAuth token:', error.response?.data || error.message);
    throw new Error('USPS authentication failed');
  }
}

/**
 * Clear cached token (useful for testing or token refresh)
 */
function clearToken() {
  cachedToken = null;
  tokenExpiry = null;
}

module.exports = {
  getAccessToken,
  clearToken
};
