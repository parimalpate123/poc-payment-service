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
    if (customer !== undefined && customer !== null) {
      if (typeof customer !== 'object') {
        return res.status(400).json({ 
          error: 'Invalid customer data: must be an object' 
        });
      }
    }

    // Validate order object if provided
    if (order !== undefined && order !== null) {
      if (typeof order !== 'object') {
        return res.status(400).json({ 
          error: 'Invalid order data: must be an object' 
        });
      }
    }

    // Process payment with validated data
    const paymentResult = await processPayment(amount, currency, paymentMethod, customer, order);
    
    // Validate payment result before accessing properties
    if (!paymentResult || typeof paymentResult !== 'object') {
      throw new Error('Invalid payment result from processor');
    }
    
    res.status(200).json({
      success: true,
      paymentId: paymentResult.id || null,
      amount: paymentResult.amount || amount,
      status: paymentResult.status || 'unknown'
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
    
    // Null-safety check for payment object
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

// Simulate payment processing with null-safety
async function processPayment(amount, currency, paymentMethod, customer, order) {
  // Validate required parameters
  if (amount === undefined || amount === null) {
    throw new Error('Amount is required');
  }
  
  if (!currency || typeof currency !== 'string') {
    throw new Error('Valid currency is required');
  }
  
  if (!paymentMethod || typeof paymentMethod !== 'string') {
    throw new Error('Valid payment method is required');
  }
  
  // Safely access customer properties if customer exists
  let customerId = null;
  let customerEmail = null;
  
  if (customer && typeof customer === 'object') {
    customerId = customer.id || null;
    customerEmail = customer.email || null;
  }
  
  // Safely access order properties if order exists
  let orderId = null;
  let orderTotal = null;
  
  if (order && typeof order === 'object') {
    orderId = order.id || null;
    orderTotal = order.total || null;
  }
  
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
    orderTotal,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}

// Simulate payment status retrieval with null-safety
async function getPaymentStatus(paymentId) {
  // Validate paymentId
  if (!paymentId || typeof paymentId !== 'string') {
    throw new Error('Valid payment ID is required');
  }
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Simulate potential null/undefined scenarios
  // In production, this might return null if payment not found in DB
  const paymentData = {
    id: paymentId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    timestamp: new Date().toISOString()
  };
  
  // Validate payment data before returning
  if (!paymentData || typeof paymentData !== 'object') {
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
