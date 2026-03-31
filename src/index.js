/**
 * Payment Service - POC for Auto-Remediation Testing
 * 
 * This service handles payment processing operations.
 * It's designed to demonstrate auto-remediation capabilities.
 */

const express = require('express');
const axios = require('axios');
const { default: rateLimit } = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Configure rate limiter
const aiModelLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests to AI model API, please try again later.'
});

// AI model API configuration
const aiModelConfig = {
  baseURL: process.env.AI_MODEL_API_URL || 'https://api.ai-model.com',
  timeout: 5000,
  headers: { 'Authorization': `Bearer ${process.env.AI_MODEL_API_KEY}` }
};

// Payment processing endpoint
app.post('/api/v1/payments', aiModelLimiter, async (req, res) => {
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
      // Simulate AI model API call
      const aiModelResponse = await axios.post(`${aiModelConfig.baseURL}/process`, {
        amount,
        currency,
        paymentMethod
      }, {
        headers: aiModelConfig.headers,
        timeout: aiModelConfig.timeout
      });

      // Process the AI model response
      return {
        id: `PAY-${Date.now()}`,
        amount,
        currency,
        paymentMethod,
        status: 'completed',
        aiModelResult: aiModelResponse.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      retries++;
      if (error.response && error.response.status === 429) {
        // Rate limit error, wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      } else if (retries === maxRetries) {
        // Max retries reached, throw error
        throw new Error(`Payment processing failed after ${maxRetries} retries: ${error.message}`);
      }
    }
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
