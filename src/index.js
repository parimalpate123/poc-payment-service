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
    
    // Validate input with null safety checks
    if (!amount || !currency || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, currency, paymentMethod' 
      });
    }

    // Additional validation for null/undefined values
    if (amount === null || amount === undefined || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount: must be a positive number' 
      });
    }

    if (typeof currency !== 'string' || currency.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid currency: must be a non-empty string' 
      });
    }

    if (typeof paymentMethod !== 'string' || paymentMethod.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid paymentMethod: must be a non-empty string' 
      });
    }

    // Process payment
    const paymentResult = await processPayment(amount, currency, paymentMethod);
    
    // Null safety check on payment result
    if (!paymentResult || typeof paymentResult !== 'object') {
      throw new Error('Payment processing returned invalid result');
    }

    res.status(200).json({
      success: true,
      paymentId: paymentResult.id || 'UNKNOWN',
      amount: paymentResult.amount || amount,
      status: paymentResult.status || 'pending'
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ 
      error: 'Payment processing failed',
      message: error && error.message ? error.message : 'Unknown error occurred'
    });
  }
});

// Get payment status
app.get('/api/v1/payments/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Null safety check for paymentId
    if (!paymentId || typeof paymentId !== 'string' || paymentId.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }
    
    const payment = await getPaymentStatus(paymentId);
    
    if (!payment || typeof payment !== 'object') {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.status(200).json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment status',
      message: error && error.message ? error.message : 'Unknown error occurred'
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

// Simulate payment processing with null safety
async function processPayment(amount, currency, paymentMethod) {
  // Null safety checks for all parameters
  if (amount === null || amount === undefined || isNaN(amount) || amount <= 0) {
    throw new Error('Invalid amount provided to processPayment');
  }

  if (!currency || typeof currency !== 'string' || currency.trim().length === 0) {
    throw new Error('Invalid currency provided to processPayment');
  }

  if (!paymentMethod || typeof paymentMethod !== 'string' || paymentMethod.trim().length === 0) {
    throw new Error('Invalid paymentMethod provided to processPayment');
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Ensure all returned fields are properly initialized
  const paymentId = `PAY-${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  return {
    id: paymentId,
    amount: parseFloat(amount),
    currency: currency.trim().toUpperCase(),
    paymentMethod: paymentMethod.trim(),
    status: 'completed',
    timestamp: timestamp
  };
}

// Simulate payment status retrieval with null safety
async function getPaymentStatus(paymentId) {
  // Null safety check for paymentId
  if (!paymentId || typeof paymentId !== 'string' || paymentId.trim().length === 0) {
    throw new Error('Invalid paymentId provided to getPaymentStatus');
  }

  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Ensure all returned fields are properly initialized
  const timestamp = new Date().toISOString();
  
  return {
    id: paymentId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    timestamp: timestamp
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});

module.exports = app;
