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
    
    // Enhanced validation with null/undefined checks
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

    if (!order || typeof order !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid order: must be a valid object' 
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
    
    if (!payment || typeof payment !== 'object') {
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

// Simulate payment processing with enhanced validation
async function processPayment(amount, currency, paymentMethod, customerId, order) {
  // Validate all parameters to prevent null/undefined errors
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount parameter');
  }

  if (!currency || typeof currency !== 'string') {
    throw new Error('Invalid currency parameter');
  }

  if (!paymentMethod || typeof paymentMethod !== 'string') {
    throw new Error('Invalid paymentMethod parameter');
  }

  if (!customerId || typeof customerId !== 'string') {
    throw new Error('Invalid customerId parameter');
  }

  if (!order || typeof order !== 'object') {
    throw new Error('Invalid order parameter');
  }

  // Validate order properties to prevent division by zero and null references
  const orderTotal = order.total || 0;
  const orderItems = order.items || [];
  const itemCount = orderItems.length;

  // Prevent division by zero
  const averageItemPrice = itemCount > 0 ? orderTotal / itemCount : 0;

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    id: `PAY-${Date.now()}`,
    amount,
    currency,
    paymentMethod,
    customerId,
    order: {
      total: orderTotal,
      itemCount: itemCount,
      averageItemPrice: averageItemPrice
    },
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}

// Simulate payment status retrieval with validation
async function getPaymentStatus(paymentId) {
  // Validate paymentId parameter
  if (!paymentId || typeof paymentId !== 'string') {
    throw new Error('Invalid paymentId parameter');
  }

  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Return validated payment object
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
