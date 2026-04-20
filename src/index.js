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

// Validation helper functions
function validatePaymentRequest(amount, currency, paymentMethod) {
  const errors = [];
  
  if (amount === null || amount === undefined) {
    errors.push('amount is required');
  } else if (typeof amount !== 'number' || amount <= 0) {
    errors.push('amount must be a positive number');
  }
  
  if (!currency || typeof currency !== 'string') {
    errors.push('currency is required and must be a string');
  }
  
  if (!paymentMethod || typeof paymentMethod !== 'object') {
    errors.push('paymentMethod is required and must be an object');
  } else {
    if (!paymentMethod.type || typeof paymentMethod.type !== 'string') {
      errors.push('paymentMethod.type is required');
    }
  }
  
  return errors;
}

function validatePaymentResult(result) {
  if (!result || typeof result !== 'object') {
    return false;
  }
  return result.id && result.amount !== undefined && result.status;
}

function validatePaymentStatus(payment) {
  if (!payment || typeof payment !== 'object') {
    return false;
  }
  return payment.id && payment.status;
}

// Payment processing endpoint
app.post('/api/v1/payments', async (req, res) => {
  try {
    // Validate request body exists and has required fields
    if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request body' 
      });
    }
    
    const { amount, currency, paymentMethod } = req.body;
    
    // Comprehensive validation
    const validationErrors = validatePaymentRequest(amount, currency, paymentMethod);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors
      });
    }

    // Process payment with null-safe handling
    const paymentResult = await processPayment(amount, currency, paymentMethod);
    
    // Validate payment result
    if (!validatePaymentResult(paymentResult)) {
      throw new Error('Invalid payment result received from payment processor');
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
      message: error && error.message ? error.message : 'Unknown error occurred'
    });
  }
});

// Get payment status
app.get('/api/v1/payments/:paymentId', async (req, res) => {
  try {
    // Validate params exist
    if (!req.params || !req.params.paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }
    
    const paymentId = req.params.paymentId;
    
    // Validate paymentId is not empty or whitespace-only
    if (typeof paymentId !== 'string' || !paymentId.trim()) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }
    
    const payment = await getPaymentStatus(paymentId);
    
    // Validate payment result
    if (!validatePaymentStatus(payment)) {
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

// Simulate payment processing
async function processPayment(amount, currency, paymentMethod) {
  // Validate inputs are not null/undefined
  if (amount === null || amount === undefined) {
    throw new Error('Payment amount cannot be null or undefined');
  }
  
  if (!currency) {
    throw new Error('Payment currency cannot be null or undefined');
  }
  
  if (!paymentMethod || typeof paymentMethod !== 'object') {
    throw new Error('Payment method cannot be null or undefined');
  }
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    id: `PAY-${Date.now()}`,
    amount,
    currency,
    paymentMethod: paymentMethod.type || 'unknown',
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}

// Simulate payment status retrieval
async function getPaymentStatus(paymentId) {
  // Validate paymentId
  if (!paymentId || typeof paymentId !== 'string') {
    throw new Error('Payment ID cannot be null or undefined');
  }
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Simulate potential null return
  if (paymentId === 'INVALID') {
    return null;
  }
  
  return {
    id: paymentId,
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
