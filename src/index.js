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

// Simulate payment processing
async function processPayment(amount, currency, paymentMethod) {
  // Validate input
  if (!amount || amount <= 0 || typeof amount !== 'number') {
    throw new Error('Invalid amount');
  }
  if (!currency || typeof currency !== 'string') {
    throw new Error('Invalid currency');
  }
  if (!paymentMethod || typeof paymentMethod !== 'string') {
    throw new Error('Invalid payment method');
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Process payment (simulated)
  const paymentId = `PAY-${Date.now()}`;
  const status = Math.random() < 0.9 ? 'completed' : 'failed';

  return {
    id: paymentId,
    amount: parseFloat(amount.toFixed(2)),
    currency,
    paymentMethod,
    status,
    timestamp: new Date().toISOString()
  };
}

// Simulate payment status retrieval
async function getPaymentStatus(paymentId) {
  if (!paymentId || typeof paymentId !== 'string') {
    throw new Error('Invalid payment ID');
  }

  // Simulate database query
  await new Promise(resolve => setTimeout(resolve, 50));

  // Simulate payment retrieval (with potential for not found)
  if (Math.random() < 0.1) {
    return null; // Simulating payment not found
  }

  return {
    id: paymentId,
    status: Math.random() < 0.8 ? 'completed' : 'pending',
    amount: parseFloat((Math.random() * 1000).toFixed(2)),
    currency: 'USD',
    paymentMethod: 'credit_card',
    timestamp: new Date().toISOString()
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});

module.exports = app;
