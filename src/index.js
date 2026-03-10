/**
 * Payment Service - POC for Auto-Remediation Testing
 * 
 * This service handles payment processing operations.
 * It's designed to demonstrate auto-remediation capabilities.
 */

const express = require('express');
const axios = require('axios');
const retry = require('async-retry');

const app = express();

app.use(express.json());

// Payment gateway configuration
const paymentGatewayConfig = {
  baseURL: process.env.PAYMENT_GATEWAY_URL || 'https://api.payment-gateway.com',
  timeout: 30000,
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

// Process payment using payment gateway
async function processPayment(amount, currency, paymentMethod) {
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount');
  }
  if (!currency || typeof currency !== 'string') {
    throw new Error('Invalid currency');
  }
  if (!paymentMethod || typeof paymentMethod !== 'string') {
    throw new Error('Invalid payment method');
  }

  return retry(async (bail) => {
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
        timestamp: response.data.timestamp
      };
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        bail(new Error(`Payment failed: ${error.response.data.message}`));
        return;
      }
      throw error;
    }
  }, {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 5000,
  });
}

// Get payment status from payment gateway
async function getPaymentStatus(paymentId) {
  if (!paymentId || typeof paymentId !== 'string') {
    throw new Error('Invalid payment ID');
  }

  return retry(async (bail) => {
    try {
      const response = await axios.get(`/payment-status/${paymentId}`, paymentGatewayConfig);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        bail(new Error(`Failed to fetch payment status: ${error.response.data.message}`));
        return;
      }
      throw error;
    }
  }, {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 5000,
  });
}

module.exports = app;
