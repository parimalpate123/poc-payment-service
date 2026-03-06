/**
 * Payment Service - POC for Auto-Remediation Testing
 * 
 * This service handles payment processing operations.
 * It's designed to demonstrate auto-remediation capabilities.
 */

const express = require('express');
const winston = require('winston');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'payment-service' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Payment processing endpoint
app.post('/api/v1/payments', async (req, res) => {
  try {
    const { amount, currency, paymentMethod } = req.body;
    
    // Validate input
    if (!amount || !currency || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, currency, paymentMethod' 
      });
    }

    // Process payment
    const paymentResult = await processPayment(amount, currency, paymentMethod);
    
    res.status(200).json({
      success: true,
      paymentId: paymentResult.id,
      amount: paymentResult.amount,
      status: paymentResult.status
    });
  } catch (error) {
    logger.error('Payment processing error:', error);
    res.status(500).json({ 
      error: 'Payment processing failed',
      message: error.message 
    });
  }
});

// Get payment status
app.get('/api/v1/payments/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await getPaymentStatus(paymentId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.status(200).json(payment);
  } catch (error) {
    logger.error('Error fetching payment:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment status',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'payment-service',
    timestamp: new Date().toISOString()
  });
});

// Simulate payment processing
async function processPayment(amount, currency, paymentMethod) {
  logger.info(`Processing payment: amount=${amount}, currency=${currency}, paymentMethod=${paymentMethod}`);

  // Input validation
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    throw new Error('Invalid amount');
  }

  if (typeof currency !== 'string' || currency.trim().length !== 3) {
    throw new Error('Invalid currency');
  }

  if (typeof paymentMethod !== 'string' || !['credit_card', 'debit_card', 'paypal'].includes(paymentMethod)) {
    throw new Error('Invalid payment method');
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const paymentId = `PAY-${Date.now()}`;
  const status = 'completed';
  const timestamp = new Date().toISOString();

  logger.info(`Payment processed successfully: id=${paymentId}, status=${status}`);

  return {
    id: paymentId,
    amount,
    currency,
    paymentMethod,
    status,
    timestamp
  };
}

// Simulate payment status retrieval
async function getPaymentStatus(paymentId) {
  logger.info(`Fetching payment status for id=${paymentId}`);

  if (typeof paymentId !== 'string' || !paymentId.startsWith('PAY-')) {
    throw new Error('Invalid payment ID');
  }

  await new Promise(resolve => setTimeout(resolve, 50));
  
  const payment = {
    id: paymentId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    timestamp: new Date().toISOString()
  };

  logger.info(`Payment status fetched: id=${paymentId}, status=${payment.status}`);

  return payment;
}

// Start server
app.listen(PORT, () => {
  logger.info(`Payment service running on port ${PORT}`);
});

module.exports = app;
