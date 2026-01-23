require('dotenv').config();
const express = require('express');
const cors = require('cors');

const addressRoutes = require('./routes/address');
const pricesRoutes = require('./routes/prices');
const transactionRoutes = require('./routes/transaction');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/address', addressRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/transaction', transactionRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'USPS Scan & Go API',
    version: '1.0.0',
    endpoints: {
      'POST /api/address/validate': 'Validate and standardize an address',
      'POST /api/prices': 'Get shipping rates for a package',
      'POST /api/transaction': 'Create a new shipping transaction',
      'GET /api/transaction/:id': 'Get transaction details',
      'POST /api/transaction/:id/payment': 'Mark transaction as paid',
      'POST /api/transaction/:id/verify': 'Verify transaction (kiosk/clerk)',
      'POST /api/transaction/:id/label': 'Create shipping label'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           USPS Scan & Go Backend Server                   ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}                  ║
║  API docs: http://localhost:${PORT}/api                      ║
║                                                           ║
║  Mode: ${process.env.USPS_CONSUMER_KEY ? 'LIVE (USPS credentials configured)' : 'MOCK (no credentials)'}       ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
