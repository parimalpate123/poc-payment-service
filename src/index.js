/**
 * Payment Service - POC for Auto-Remediation Testing
 * 
 * This service handles payment processing operations.
 * It's designed to demonstrate auto-remediation capabilities.
 */

const express = require('express');
const axios = require('axios');

// Payment gateway configuration
const paymentGatewayConfig = {
  baseURL: process.env.PAYMENT_GATEWAY_URL || 'https://api.payment-gateway.com',
  timeout: 5000,
  headers: { 'Authorization': `Bearer ${process.env.PAYMENT_GATEWAY_API_KEY || 'dummy-key'}` }
};

// Process payment
async function processPayment(amount, currency, paymentMethod) {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await axios.post('/process-payment', {
        amount,
        currency,
        paymentMethod
      }, paymentGatewayConfig);

      return {
        id: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
        paymentMethod: response.data.paymentMethod,
        status: response.data.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      retries++;
      if (retries >= maxRetries || !isRetryableError(error)) {
        throw new Error(`Payment processing failed: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, 100)); // Reduced wait time for testing
    }
  }
}

// Check if error is retryable
function isRetryableError(error) {
  return error.code === 'ECONNABORTED' || 
         (error.response && error.response.status >= 500);
}

// Simulate payment status retrieval
async function getPaymentStatus(paymentId) {
  try {
    const response = await axios.get(`/payment-status/${paymentId}`, paymentGatewayConfig);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw new Error('Failed to fetch payment status');
  }
}

function createApp() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

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

  return app;
}

// Only start the server if this file is run directly
if (require.main === module) {
  const app = createApp();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
  });
}

module.exports = {
  processPayment,
  getPaymentStatus,
  isRetryableError,
  createApp
};
