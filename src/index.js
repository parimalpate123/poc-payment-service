/**
 * Payment Service - POC for Auto-Remediation Testing
 * 
 * This service handles payment processing operations.
 * It's designed to demonstrate auto-remediation capabilities.
 */

const express = require('express');
const axios = require('axios');
const { promisify } = require('util');
const app = express();

// Payment gateway configuration
const paymentGatewayConfig = {
  baseURL: process.env.PAYMENT_GATEWAY_URL || 'https://api.payment-gateway.com',
  timeout: 30000, // 30 seconds timeout
  headers: { 'Authorization': `Bearer ${process.env.PAYMENT_GATEWAY_API_KEY}` }
};
const PORT = process.env.PORT || 3000;

app.use(express.json());

const axiosInstance = axios.create(paymentGatewayConfig);
const delay = promisify(setTimeout);

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
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await axiosInstance.post('/process-payment', {
        amount,
        currency,
        paymentMethod
      });

      return {
        id: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
        paymentMethod: response.data.paymentMethod,
        status: response.data.status,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      if (error.response && error.response.status >= 500) {
        retries++;
        console.error(`Payment gateway error (attempt ${retries}):`, error.message);
        await delay(1000 * retries); // Exponential backoff
      } else if (error.code === 'ECONNABORTED') {
        retries++;
        console.error(`Payment gateway timeout (attempt ${retries}):`, error.message);
        await delay(1000 * retries); // Exponential backoff
      } else {
        throw error; // Rethrow client errors or other issues
      }
    }
  }

  throw new Error('Payment processing failed after multiple attempts');
}
}

// Simulate payment status retrieval
async function getPaymentStatus(paymentId) {
  // Simulate potential issues:
  // - Database query timeout
  // - Cache miss handling
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return {
    id: paymentId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    timestamp: new Date().toISOString()
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});

module.exports = app;
