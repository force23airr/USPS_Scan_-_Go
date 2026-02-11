import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function validateAddress(address) {
  const response = await api.post('/address/validate', address);
  return response.data;
}

export async function getShippingRates(params) {
  const response = await api.post('/prices', params);
  return response.data;
}

export async function createTransaction(data) {
  const response = await api.post('/transaction', data);
  return response.data;
}

export async function getTransaction(transactionId) {
  const response = await api.get(`/transaction/${transactionId}`);
  return response.data;
}

export async function processPayment(transactionId, paymentData) {
  const response = await api.post(`/transaction/${transactionId}/payment`, paymentData);
  return response.data;
}

export async function verifyTransaction(transactionId) {
  const response = await api.post(`/transaction/${transactionId}/verify`);
  return response.data;
}

export async function createLabel(transactionId) {
  const response = await api.post(`/transaction/${transactionId}/label`);
  return response.data;
}

export default api;
