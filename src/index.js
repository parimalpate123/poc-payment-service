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
    
    // Validate input with comprehensive null checks
    if (amount === undefined || amount === null || !currency || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, currency, paymentMethod' 
      });
    }

    // Validate amount is a valid number and not zero
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount: must be a positive number' 
      });
    }

    // Validate customerId if provided
    if (customerId !== undefined && customerId !== null && typeof customerId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid customerId: must be a string' 
      });
    }

    // Validate order object if provided
    if (order !== undefined && order !== null && typeof order !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid order: must be an object' 
      });
    }

    // Process payment with validated data
    const paymentResult = await processPayment(amount, currency, paymentMethod, customerId, order);
    
    // Validate payment result
    if (!paymentResult || typeof paymentResult !== 'object') {
      throw new Error('Payment processing returned invalid result');
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
    
    // Validate paymentId
    if (!paymentId || typeof paymentId !== 'string') {
      return res.status(400).json({ error: 'Invalid paymentId' });
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
async function processPayment(amount, currency, paymentMethod, customerId = null, order = null) {
  // Validate required parameters
  if (amount === undefined || amount === null || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    throw new Error('Invalid amount: must be a positive number');
  }

  if (!currency || typeof currency !== 'string') {
    throw new Error('Invalid currency: must be a non-empty string');
  }

  if (!paymentMethod || typeof paymentMethod !== 'string') {
    throw new Error('Invalid paymentMethod: must be a non-empty string');
  }

  // Validate optional customerId
  if (customerId !== null && customerId !== undefined && typeof customerId !== 'string') {
    throw new Error('Invalid customerId: must be a string or null');
  }

  // Validate optional order object
  if (order !== null && order !== undefined) {
    if (typeof order !== 'object') {
      throw new Error('Invalid order: must be an object or null');
    }
    
    // Validate order.amount if present to prevent division by zero
    if (order.amount !== undefined && order.amount !== null) {
      if (typeof order.amount !== 'number' || isNaN(order.amount) || order.amount < 0) {
        throw new Error('Invalid order.amount: must be a non-negative number');
      }
    }
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Create payment object with proper initialization
  const payment = {
    id: `PAY-${Date.now()}`,
    amount: amount,
    currency: currency,
    paymentMethod: paymentMethod,
    status: 'completed',
    timestamp: new Date().toISOString()
  };

  // Add optional fields only if they are provided and valid
  if (customerId !== null && customerId !== undefined) {
    payment.customerId = customerId;
  }

  if (order !== null && order !== undefined) {
    payment.order = order;
  }

  return payment;
}

// Simulate payment status retrieval with null checks
async function getPaymentStatus(paymentId) {
  // Validate paymentId
  if (!paymentId || typeof paymentId !== 'string') {
    throw new Error('Invalid paymentId: must be a non-empty string');
  }

  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Return payment object with proper initialization
  const payment = {
    id: paymentId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    timestamp: new Date().toISOString()
  };

  return payment;
}

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
  });
}

module.exports = app;
