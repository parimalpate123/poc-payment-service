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
        error: 'Invalid customer data' 
      });
    }

    // Validate order object if provided
    if (order && typeof order !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid order data' 
      });
    }

    // Process payment with validated data
    const paymentResult = await processPayment(amount, currency, paymentMethod, customer, order);
    
    if (!paymentResult) {
      return res.status(500).json({ 
        error: 'Payment processing failed',
        message: 'Payment result is null or undefined'
      });
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
  // Validate required parameters
  if (!amount || typeof amount !== 'number') {
    throw new TypeError('Invalid amount: must be a number');
  }
  
  if (!currency || typeof currency !== 'string') {
    throw new TypeError('Invalid currency: must be a string');
  }
  
  if (!paymentMethod || typeof paymentMethod !== 'string') {
    throw new TypeError('Invalid paymentMethod: must be a string');
  }
  
  // Safely access customer properties with null checks
  const customerId = customer && customer.id ? customer.id : null;
  const customerEmail = customer && customer.email ? customer.email : null;
  
  // Safely access order properties with null checks
  const orderId = order && order.id ? order.id : null;
  const orderTotal = order && order.total ? order.total : null;
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const paymentResult = {
    id: `PAY-${Date.now()}`,
    amount,
    currency,
    paymentMethod,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
  
  // Add customer info if available
  if (customerId) {
    paymentResult.customerId = customerId;
  }
  if (customerEmail) {
    paymentResult.customerEmail = customerEmail;
  }
  
  // Add order info if available
  if (orderId) {
    paymentResult.orderId = orderId;
  }
  
  return paymentResult;
}

// Simulate payment status retrieval with null-safety
async function getPaymentStatus(paymentId) {
  // Validate paymentId
  if (!paymentId || typeof paymentId !== 'string') {
    throw new TypeError('Invalid paymentId: must be a non-empty string');
  }
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Simulate potential null response from database
  const paymentData = {
    id: paymentId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    timestamp: new Date().toISOString()
  };
  
  // Validate payment data before returning
  if (!paymentData || !paymentData.id) {
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
