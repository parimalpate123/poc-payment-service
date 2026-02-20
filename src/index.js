/**
 * Payment Service - POC for Auto-Remediation Testing
 * 
 * This service handles payment processing operations.
 * It's designed to demonstrate auto-remediation capabilities.
 */

const express = require('express');
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

// Simulated database for storing payments
const paymentsDb = new Map();

// Process payment
async function processPayment(amount, currency, paymentMethod) {
  // Validate input
  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount');
  }
  if (typeof currency !== 'string' || currency.length !== 3) {
    throw new Error('Invalid currency');
  }
  if (typeof paymentMethod !== 'string' || !['credit_card', 'paypal', 'bank_transfer'].includes(paymentMethod)) {
    throw new Error('Invalid payment method');
  }

  // Simulate potential issues
  const randomFactor = Math.random();
  if (randomFactor < 0.1) {
    throw new Error('Simulated database connection timeout');
  } else if (randomFactor < 0.2) {
    throw new Error('Simulated external payment gateway timeout');
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const paymentId = `PAY-${Date.now()}`;
  const payment = {
    id: paymentId,
    amount,
    currency,
    paymentMethod,
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  // Store payment in simulated database
  paymentsDb.set(paymentId, payment);

  return payment;
}

// Get payment status
async function getPaymentStatus(paymentId) {
  // Simulate potential issues
  if (Math.random() < 0.1) {
    throw new Error('Simulated database query timeout');
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Retrieve payment from simulated database
  return paymentsDb.get(paymentId) || null;
}

// Start server
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});

module.exports = app;
