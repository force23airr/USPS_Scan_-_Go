import axios from 'axios';

// Configure base URL - change this to your backend URL
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Validate an address with USPS
 */
export async function validateAddress(address) {
  const response = await api.post('/address/validate', address);
  return response.data;
}

/**
 * Get shipping rates for a package
 */
export async function getShippingRates(params) {
  const response = await api.post('/prices', params);
  return response.data;
}

/**
 * Create a new shipping transaction
 */
export async function createTransaction(data) {
  const response = await api.post('/transaction', data);
  return response.data;
}

/**
 * Get transaction by ID
 */
export async function getTransaction(transactionId) {
  const response = await api.get(`/transaction/${transactionId}`);
  return response.data;
}

/**
 * Process payment for a transaction
 */
export async function processPayment(transactionId, paymentData) {
  const response = await api.post(`/transaction/${transactionId}/payment`, paymentData);
  return response.data;
}

/**
 * Verify a transaction (for kiosk scanning)
 */
export async function verifyTransaction(transactionId) {
  const response = await api.post(`/transaction/${transactionId}/verify`);
  return response.data;
}

export default api;
