require('dotenv').config();

module.exports = {
  consumerKey: process.env.USPS_CONSUMER_KEY,
  consumerSecret: process.env.USPS_CONSUMER_SECRET,

  // Base URLs for USPS APIs
  baseUrl: process.env.USPS_ENV === 'production'
    ? 'https://apis.usps.com'
    : 'https://apis-tem.usps.com', // TEM = Testing Environment for Mailers

  oauthUrl: 'https://apis.usps.com/oauth2/v3/token',

  // API endpoints
  endpoints: {
    addressValidation: '/addresses/v3/address',
    domesticPrices: '/prices/v3/base-rates/search',
    domesticLabel: '/labels/v3/label',
    tracking: '/tracking/v3/tracking'
  }
};
