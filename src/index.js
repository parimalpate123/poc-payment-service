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
    const { amount, currency, paymentMethod, customerId, order } = req.body;
    
    // Comprehensive input validation with null checks
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount: must be a positive number' 
      });
    }

    if (!currency || typeof currency !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid currency: must be a valid string' 
      });
    }

    if (!paymentMethod || typeof paymentMethod !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid paymentMethod: must be a valid string' 
      });
    }

    if (!customerId || typeof customerId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid customerId: must be a valid string' 
      });
    }

    // Process payment with validated data
    const paymentResult = await processPayment({
      amount,
      currency,
      paymentMethod,
      customerId,
      order: order || null
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
    if (!paymentId || typeof paymentId !== 'string') {
      return res.status(400).json({ error: 'Invalid payment ID' });
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

// Simulate payment processing with proper null handling
async function processPayment(paymentData) {
  // Validate payment data object
  if (!paymentData || typeof paymentData !== 'object') {
    throw new Error('Invalid payment data: payment object is null or invalid');
  }

  const { amount, currency, paymentMethod, customerId, order } = paymentData;

  // Critical null checks for payment object initialization
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid payment amount');
  }

  if (!currency || typeof currency !== 'string') {
    throw new Error('Invalid currency');
  }

  if (!paymentMethod || typeof paymentMethod !== 'string') {
    throw new Error('Invalid payment method');
  }

  if (!customerId || typeof customerId !== 'string') {
    throw new Error('Invalid customer ID');
  }

  // Validate order object if provided
  if (order !== null && order !== undefined) {
    if (typeof order !== 'object') {
      throw new Error('Invalid order: must be an object');
    }
    
    // Validate order amount to prevent division by zero
    if (order.amount !== undefined && order.amount !== null) {
      if (typeof order.amount !== 'number' || order.amount <= 0) {
        throw new Error('Invalid order amount: must be a positive number');
      }
    }
  }
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return properly initialized payment object
  return {
    id: `PAY-${Date.now()}`,
    amount: amount,
    currency: currency,
    paymentMethod: paymentMethod,
    customerId: customerId,
    order: order || null,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}

// Simulate payment status retrieval with null handling
async function getPaymentStatus(paymentId) {
  // Validate paymentId
  if (!paymentId || typeof paymentId !== 'string') {
    throw new Error('Invalid payment ID');
  }
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Return properly initialized payment object
  return {
    id: paymentId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    customerId: 'CUST-12345',
    order: null,
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
