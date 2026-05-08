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
    
    // Validate input - check if fields exist in body (not just falsy)
    if (amount === undefined || currency === undefined || paymentMethod === undefined) {
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
  // Validate inputs for null/undefined
  if (amount === null || amount === undefined) {
    throw new Error('Amount cannot be null or undefined');
  }
  
  if (currency === null || currency === undefined) {
    throw new Error('Currency cannot be null or undefined');
  }
  
  if (paymentMethod === null || paymentMethod === undefined) {
    throw new Error('Payment method cannot be null or undefined');
  }
  
  // Validate amount is a valid number
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Amount must be a valid positive number');
  }
  
  // Validate currency format
  if (typeof currency !== 'string' || currency.trim().length === 0) {
    throw new Error('Currency must be a non-empty string');
  }
  
  // Validate payment method
  if (typeof paymentMethod === 'object') {
    // If paymentMethod is an object, validate required properties
    if (!paymentMethod.type || paymentMethod.type === null || paymentMethod.type === undefined) {
      throw new Error('Payment method type is required');
    }
  } else if (typeof paymentMethod !== 'string' || paymentMethod.trim().length === 0) {
    throw new Error('Payment method must be a non-empty string or valid object');
  }
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Safely construct payment method string
  const paymentMethodStr = typeof paymentMethod === 'object' 
    ? (paymentMethod.type || 'unknown')
    : paymentMethod;
  
  return {
    id: `PAY-${Date.now()}`,
    amount: numericAmount,
    currency: currency.trim().toUpperCase(),
    paymentMethod: paymentMethodStr,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}

// Simulate payment status retrieval
async function getPaymentStatus(paymentId) {
  // Validate paymentId
  if (!paymentId || paymentId === null || paymentId === undefined) {
    throw new Error('Payment ID cannot be null or undefined');
  }
  
  if (typeof paymentId !== 'string' || paymentId.trim().length === 0) {
    throw new Error('Payment ID must be a non-empty string');
  }
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Simulate payment not found scenario
  const trimmedPaymentId = paymentId.trim();
  
  // Return null for invalid payment IDs to be handled by caller
  if (trimmedPaymentId.length < 5) {
    return null;
  }
  
  return {
    id: trimmedPaymentId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    timestamp: new Date().toISOString()
  };
}

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
  });
}

module.exports = app;
