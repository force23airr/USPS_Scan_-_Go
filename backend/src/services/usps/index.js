const { getAccessToken, clearToken } = require('./oauth');
const { validateAddress } = require('./address');
const { getDomesticPrices } = require('./prices');
const { createLabel } = require('./labels');

module.exports = {
  // OAuth
  getAccessToken,
  clearToken,

  // Address API
  validateAddress,

  // Prices API
  getDomesticPrices,

  // Labels API (requires additional USPS approval)
  createLabel
};
