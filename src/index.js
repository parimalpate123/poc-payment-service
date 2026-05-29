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
    const { amount, currency, paymentMethod, customer, order } = req.body;
    
    // Validate input with null-safety checks
    if (!amount || !currency || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, currency, paymentMethod' 
      });
    }

    // Validate customer object if provided
    if (customer && typeof customer !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid customer data format' 
      });
    }

    // Validate order object if provided
    if (order && typeof order !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid order data format' 
      });
    }

    // Process payment with validated data
    const paymentResult = await processPayment(amount, currency, paymentMethod, customer, order);
    
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

// Simulate payment processing with null-safety
async function processPayment(amount, currency, paymentMethod, customer, order) {
  // Validate all parameters with null-safety checks
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount: must be a positive number');
  }
  
  if (!currency || typeof currency !== 'string') {
    throw new Error('Invalid currency: must be a non-empty string');
  }
  
  if (!paymentMethod || typeof paymentMethod !== 'string') {
    throw new Error('Invalid payment method: must be a non-empty string');
  }
  
  // Safely access customer properties with null checks
  const customerId = customer && customer.id ? customer.id : null;
  const customerEmail = customer && customer.email ? customer.email : null;
  
  // Safely access order properties with null checks
  const orderId = order && order.id ? order.id : null;
  const orderItems = order && Array.isArray(order.items) ? order.items : [];
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    id: `PAY-${Date.now()}`,
    amount,
    currency,
    paymentMethod,
    customerId,
    customerEmail,
    orderId,
    orderItemsCount: orderItems.length,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}

// Simulate payment status retrieval with null-safety
async function getPaymentStatus(paymentId) {
  // Validate paymentId with null-safety
  if (!paymentId || typeof paymentId !== 'string' || paymentId.trim() === '') {
    throw new Error('Invalid payment ID');
  }
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Simulate database response that might be null
  const paymentData = {
    id: paymentId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    timestamp: new Date().toISOString()
  };
  
  // Ensure all required fields exist before returning
  if (!paymentData || !paymentData.id || !paymentData.status) {
    return null;
  }
  
  return paymentData;
}

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
  });
}

module.exports = app;
