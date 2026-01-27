/**
 * Payment Service - POC for Auto-Remediation Testing
 * 
 * This service handles payment processing operations.
 * It's designed to demonstrate auto-remediation capabilities.
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Payment gateway configuration
const paymentGatewayConfig = {
  baseURL: process.env.PAYMENT_GATEWAY_URL || 'https://api.payment-gateway.com',
  timeout: 5000, // 5 seconds timeout
  retries: 3
};

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
    console.error('Payment processing error:', error);
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
    console.error('Error fetching payment:', error);
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
  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error('Invalid amount');
  }
  if (!currency || typeof currency !== 'string') {
    throw new Error('Invalid currency');
  }
  if (!paymentMethod || typeof paymentMethod !== 'string') {
    throw new Error('Invalid payment method');
  }

  const paymentId = uuidv4();
  let retries = paymentGatewayConfig.retries;

  while (retries > 0) {
    try {
      // Simulate external payment gateway call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.2) { // 20% chance of failure
            reject(new Error('Payment gateway timeout'));
          } else {
            resolve();
          }
        }, Math.random() * paymentGatewayConfig.timeout);
      });

      return {
        id: paymentId,
        amount,
        currency,
        paymentMethod,
        status: 'completed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      retries--;
      if (retries === 0) {
        throw error;
      }
      console.log(`Payment processing failed, retrying... (${paymentGatewayConfig.retries - retries} attempt)`);
    }
  }
}

// Simulate payment status retrieval
async function getPaymentStatus(paymentId) {
  if (!paymentId || typeof paymentId !== 'string') {
    throw new Error('Invalid payment ID');
  }

  try {
    // Simulate database query with potential timeout
    const result = await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.1) { // 10% chance of timeout
          reject(new Error('Database query timeout'));
        } else {
          resolve({
            id: paymentId,
            status: 'completed',
            amount: 100.00,
            currency: 'USD',
            timestamp: new Date().toISOString()
          });
        }
      }, Math.random() * 1000); // Random delay up to 1 second
    });

    return result;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw new Error('Failed to retrieve payment status');
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});

module.exports = app;
