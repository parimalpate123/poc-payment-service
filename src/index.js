/**
 * Payment Service - POC for Auto-Remediation Testing
 * 
 * This service handles payment processing operations.
 * It's designed to demonstrate auto-remediation capabilities.
 */

const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Payment gateway configuration
const paymentGatewayConfig = {
  baseURL: process.env.PAYMENT_GATEWAY_URL || 'https://api.payment-gateway.com',
  timeout: 5000, // 5 seconds timeout
  headers: { 'Authorization': `Bearer ${process.env.PAYMENT_GATEWAY_API_KEY}` }
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
    res.status(error.response?.status || 500).json({ 
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
    res.status(error.response?.status || 500).json({ 
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

// Process payment using payment gateway
async function processPayment(amount, currency, paymentMethod) {
  try {
    const response = await axios.post('/process', {
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
      timestamp: response.data.timestamp
    };
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Payment gateway timeout');
    }
    throw error;
  }
}

// Get payment status from payment gateway
async function getPaymentStatus(paymentId) {
  try {
    const response = await axios.get(`/status/${paymentId}`, paymentGatewayConfig);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Payment gateway timeout');
    }
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});

module.exports = app;
