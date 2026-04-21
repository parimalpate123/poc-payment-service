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

// Input validation helper
function validatePaymentInput(paymentData) {
  const errors = [];
  
  // Validate required fields
  if (!paymentData.customerId || typeof paymentData.customerId !== 'string') {
    errors.push('customerId is required and must be a string');
  }
  
  if (!paymentData.amount || typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
    errors.push('amount is required and must be a positive number');
  }
  
  if (!paymentData.currency || typeof paymentData.currency !== 'string') {
    errors.push('currency is required and must be a string');
  }
  
  if (!paymentData.paymentMethod || typeof paymentData.paymentMethod !== 'string') {
    errors.push('paymentMethod is required and must be a string');
  }
  
  if (!paymentData.order || typeof paymentData.order !== 'object') {
    errors.push('order is required and must be an object');
  }
  
  // Validate status if provided
  if (paymentData.status && !['pending', 'processing', 'completed', 'failed'].includes(paymentData.status)) {
    errors.push('status must be one of: pending, processing, completed, failed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Payment processing endpoint
app.post('/api/v1/payments', async (req, res) => {
  try {
    const { customerId, amount, currency, paymentMethod, order, status } = req.body;
    
    // Validate input with comprehensive validation
    const validation = validatePaymentInput({
      customerId,
      amount,
      currency,
      paymentMethod,
      order,
      status
    });
    
    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Process payment with validated data
    const paymentResult = await processPayment({
      customerId,
      amount,
      currency,
      paymentMethod,
      order,
      status: status || 'pending'
    });
    
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
    if (!paymentId || typeof paymentId !== 'string' || paymentId.trim() === '') {
      return res.status(400).json({ 
        error: 'Invalid paymentId',
        details: ['paymentId must be a non-empty string']
      });
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
async function processPayment(paymentData) {
  // Validate payment data object
  if (!paymentData || typeof paymentData !== 'object') {
    throw new Error('Invalid payment data: payment object is required');
  }
  
  // Validate required fields exist
  if (!paymentData.customerId) {
    throw new Error('Invalid payment data: customerId is required');
  }
  
  if (!paymentData.amount || paymentData.amount <= 0) {
    throw new Error('Invalid payment data: amount must be a positive number');
  }
  
  if (!paymentData.currency) {
    throw new Error('Invalid payment data: currency is required');
  }
  
  if (!paymentData.paymentMethod) {
    throw new Error('Invalid payment data: paymentMethod is required');
  }
  
  if (!paymentData.order) {
    throw new Error('Invalid payment data: order is required');
  }
  
  if (!paymentData.status) {
    throw new Error('Invalid payment data: status is required');
  }
  
  // Simulate potential issues:
  // - Database connection timeout
  // - External payment gateway timeout
  // - Invalid payment method handling
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Safe amount calculation with division by zero protection
  const calculatedAmount = paymentData.amount && paymentData.amount > 0 
    ? paymentData.amount 
    : 0;
  
  return {
    id: `PAY-${Date.now()}`,
    customerId: paymentData.customerId,
    amount: calculatedAmount,
    currency: paymentData.currency,
    paymentMethod: paymentData.paymentMethod,
    order: paymentData.order,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}

// Simulate payment status retrieval
async function getPaymentStatus(paymentId) {
  // Validate paymentId
  if (!paymentId || typeof paymentId !== 'string' || paymentId.trim() === '') {
    throw new Error('Invalid paymentId: must be a non-empty string');
  }
  
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
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
  });
}

module.exports = app;
