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
        error: 'Invalid currency: must be a non-empty string' 
      });
    }

    if (!paymentMethod || typeof paymentMethod !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid paymentMethod: must be a non-empty string' 
      });
    }

    if (!customerId || typeof customerId !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid customerId: must be a non-empty string' 
      });
    }

    // Process payment with validated data
    const paymentResult = await processPayment(amount, currency, paymentMethod, customerId, order);
    
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

// Simulate payment processing with enhanced null-checking
async function processPayment(amount, currency, paymentMethod, customerId, order) {
  // Validate all required parameters
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount: must be a positive number');
  }

  if (!currency || typeof currency !== 'string') {
    throw new Error('Invalid currency: must be a non-empty string');
  }

  if (!paymentMethod || typeof paymentMethod !== 'string') {
    throw new Error('Invalid paymentMethod: must be a non-empty string');
  }

  if (!customerId || typeof customerId !== 'string') {
    throw new Error('Invalid customerId: must be a non-empty string');
  }

  // Order is optional, but validate if provided
  if (order !== null && order !== undefined) {
    if (typeof order !== 'object') {
      throw new Error('Invalid order: must be an object');
    }
    
    // Validate order properties if order exists
    if (order.total !== undefined && order.total !== null) {
      if (typeof order.total !== 'number' || order.total <= 0) {
        throw new Error('Invalid order.total: must be a positive number');
      }
      
      // Prevent division by zero
      if (order.items && Array.isArray(order.items) && order.items.length > 0) {
        const itemCount = order.items.length;
        const averageItemPrice = order.total / itemCount;
        console.log(`Average item price: ${averageItemPrice}`);
      }
    }
  }
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    id: `PAY-${Date.now()}`,
    amount,
    currency,
    paymentMethod,
    customerId,
    order: order || null,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}

// Simulate payment status retrieval with null-checking
async function getPaymentStatus(paymentId) {
  // Validate paymentId
  if (!paymentId || typeof paymentId !== 'string') {
    throw new Error('Invalid paymentId: must be a non-empty string');
  }
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Simulate potential null payment scenario
  if (paymentId === 'INVALID' || paymentId === 'null') {
    return null;
  }
  
  const payment = {
    id: paymentId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    timestamp: new Date().toISOString()
  };
  
  // Ensure payment object is valid before returning
  if (!payment || !payment.id || !payment.status) {
    throw new Error('Payment data is incomplete or corrupted');
  }
  
  return payment;
}

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
  });
}

module.exports = app;
