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

// Validation helper for payment data
function validatePaymentData(data) {
  const errors = [];
  
  // Validate required fields
  if (!data) {
    return { valid: false, errors: ['Payment data is required'] };
  }
  
  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push('Valid amount (positive number) is required');
  }
  
  if (!data.currency || typeof data.currency !== 'string' || data.currency.length !== 3) {
    errors.push('Valid currency code (3 letters) is required');
  }
  
  if (!data.paymentMethod || typeof data.paymentMethod !== 'string') {
    errors.push('Valid paymentMethod is required');
  }
  
  // Validate optional but critical fields from OrderService
  if (data.customerId !== undefined && (!data.customerId || typeof data.customerId !== 'string')) {
    errors.push('customerId must be a valid string if provided');
  }
  
  if (data.orderId !== undefined && (!data.orderId || typeof data.orderId !== 'string')) {
    errors.push('orderId must be a valid string if provided');
  }
  
  if (data.order !== undefined && typeof data.order !== 'object') {
    errors.push('order must be a valid object if provided');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Sanitize payment data to prevent null/undefined issues
function sanitizePaymentData(data) {
  return {
    amount: data.amount || 0,
    currency: data.currency || 'USD',
    paymentMethod: data.paymentMethod || 'unknown',
    customerId: data.customerId || null,
    orderId: data.orderId || null,
    order: data.order || null,
    metadata: data.metadata || {}
  };
}

// Payment processing endpoint
app.post('/api/v1/payments', async (req, res) => {
  try {
    const paymentData = req.body;
    
    // Validate payment data structure
    const validation = validatePaymentData(paymentData);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid payment data',
        details: validation.errors
      });
    }
    
    // Sanitize data to prevent null/undefined issues
    const sanitizedData = sanitizePaymentData(paymentData);
    
    // Process payment with sanitized data
    const paymentResult = await processPayment(
      sanitizedData.amount,
      sanitizedData.currency,
      sanitizedData.paymentMethod,
      sanitizedData
    );
    
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
    
    // Validate paymentId
    if (!paymentId || typeof paymentId !== 'string') {
      return res.status(400).json({ error: 'Valid paymentId is required' });
    }
    
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
async function processPayment(amount, currency, paymentMethod, additionalData = {}) {
  // Validate parameters to prevent null/undefined errors
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount provided to processPayment');
  }
  
  if (!currency || typeof currency !== 'string') {
    throw new Error('Invalid currency provided to processPayment');
  }
  
  if (!paymentMethod || typeof paymentMethod !== 'string') {
    throw new Error('Invalid paymentMethod provided to processPayment');
  }
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    id: `PAY-${Date.now()}`,
    amount,
    currency,
    paymentMethod,
    customerId: additionalData.customerId || null,
    orderId: additionalData.orderId || null,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}

// Simulate payment status retrieval
async function getPaymentStatus(paymentId) {
  // Validate paymentId to prevent null/undefined errors
  if (!paymentId || typeof paymentId !== 'string') {
    throw new Error('Invalid paymentId provided to getPaymentStatus');
  }
  
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
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
  });
}

module.exports = app;
