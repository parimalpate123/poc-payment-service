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
    
    // Validate payment result before accessing properties
    if (!paymentResult || typeof paymentResult !== 'object') {
      throw new Error('Invalid payment result returned from payment processor');
    }
    
    if (!paymentResult.id || !paymentResult.status) {
      throw new Error('Payment result missing required fields');
    }
    
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
    
    // Validate paymentId parameter
    if (!paymentId || typeof paymentId !== 'string' || paymentId.trim() === '') {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }
    
    const payment = await getPaymentStatus(paymentId);
    
    if (!payment || typeof payment !== 'object') {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Validate payment object has required fields
    if (!payment.id || !payment.status) {
      return res.status(500).json({ error: 'Invalid payment data' });
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
  // Validate input parameters
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount: must be a positive number');
  }
  
  if (!currency || typeof currency !== 'string' || currency.trim() === '') {
    throw new Error('Invalid currency: must be a non-empty string');
  }
  
  if (!paymentMethod || typeof paymentMethod !== 'object') {
    throw new Error('Invalid payment method: must be an object');
  }
  
  // Simulate potential issues:
  // - Database connection timeout
  // - External payment gateway timeout
  // - Invalid payment method handling
  
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
  
  // Validate result before returning
  if (!result.id || !result.status) {
    throw new Error('Failed to generate valid payment result');
  }
  
  return result;
}

// Simulate payment status retrieval
async function getPaymentStatus(paymentId) {
  // Validate input parameter
  if (!paymentId || typeof paymentId !== 'string' || paymentId.trim() === '') {
    throw new Error('Invalid payment ID: must be a non-empty string');
  }
  
  // Simulate potential issues:
  // - Database query timeout
  // - Cache miss handling
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const result = {
    id: paymentId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    timestamp: new Date().toISOString()
  };
  
  // Validate result before returning
  if (!result || !result.id || !result.status) {
    throw new Error('Failed to retrieve valid payment status');
  }
  
  return result;
}

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
  });
}

module.exports = app;
