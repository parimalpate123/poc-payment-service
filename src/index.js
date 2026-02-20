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

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'payment-service' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '/tmp/payment-service.log' })
  ]
});

app.use(express.json());

// Payment processing endpoint
app.post('/api/v1/payments', async (req, res) => {
  try {
    const { amount, currency, paymentMethod } = req.body;
    
    // Validate input
    if (!amount || !currency || !paymentMethod) {
      logger.warn('Missing required fields', { amount, currency, paymentMethod });
      return res.status(400).json({ 
        error: 'Missing required fields: amount, currency, paymentMethod' 
      });
    }

    // Process payment
    const paymentResult = await processPayment(amount, currency, paymentMethod);
    
    logger.info('Payment processed successfully', { paymentId: paymentResult.id, amount: paymentResult.amount });
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
      logger.warn('Payment not found', { paymentId });
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    logger.info('Payment status retrieved', { paymentId, status: payment.status });
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
  logger.info('Health check requested');
  res.status(200).json({ 
    status: 'healthy',
    service: 'payment-service',
    timestamp: new Date().toISOString()
  });
});

// Simulate payment processing
async function processPayment(amount, currency, paymentMethod) {
  logger.debug('Processing payment', { amount, currency, paymentMethod });
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const result = {
    id: `PAY-${Date.now()}`,
    amount,
    currency,
    paymentMethod,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
  
  logger.debug('Payment processed', result);
  return result;
}

// Simulate payment status retrieval
async function getPaymentStatus(paymentId) {
  logger.debug('Retrieving payment status', { paymentId });
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const result = {
    id: paymentId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    timestamp: new Date().toISOString()
  };
  
  logger.debug('Payment status retrieved', result);
  return result;
}

// Start server
app.listen(PORT, () => {
  logger.info(`Payment service running on port ${PORT}`);
});

module.exports = app;
