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
    if (amount === undefined || amount === null || !currency || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, currency, paymentMethod' 
      });
    }

    // Validate amount is a valid number
    if (typeof amount !== 'number' || amount <= 0 || isNaN(amount)) {
      return res.status(400).json({ 
        error: 'Invalid amount: must be a positive number' 
      });
    }

    // Validate customer object if provided
    if (customer !== undefined && customer !== null) {
      if (typeof customer !== 'object') {
        return res.status(400).json({ 
          error: 'Invalid customer: must be an object' 
        });
      }
      // Validate customer properties safely
      if (customer.id && typeof customer.id !== 'string') {
        return res.status(400).json({ 
          error: 'Invalid customer.id: must be a string' 
        });
      }
    }

    // Validate order object if provided
    if (order !== undefined && order !== null) {
      if (typeof order !== 'object') {
        return res.status(400).json({ 
          error: 'Invalid order: must be an object' 
        });
      }
      // Validate order properties safely
      if (order.id && typeof order.id !== 'string') {
        return res.status(400).json({ 
          error: 'Invalid order.id: must be a string' 
        });
      }
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
  // Validate required parameters
  if (amount === undefined || amount === null || !currency || !paymentMethod) {
    throw new Error('Missing required payment parameters');
  }

  // Validate amount is a number
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    throw new Error('Invalid amount: must be a positive number');
  }

  // Validate currency is a string
  if (typeof currency !== 'string' || currency.trim() === '') {
    throw new Error('Invalid currency: must be a non-empty string');
  }

  // Validate paymentMethod is a string
  if (typeof paymentMethod !== 'string' || paymentMethod.trim() === '') {
    throw new Error('Invalid payment method: must be a non-empty string');
  }

  // Safely access customer properties with null checks
  const customerId = (customer && typeof customer === 'object' && customer.id) 
    ? customer.id 
    : null;
  const customerEmail = (customer && typeof customer === 'object' && customer.email) 
    ? customer.email 
    : null;

  // Safely access order properties with null checks
  const orderId = (order && typeof order === 'object' && order.id) 
    ? order.id 
    : null;
  const orderTotal = (order && typeof order === 'object' && typeof order.total === 'number') 
    ? order.total 
    : null;

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
  // Validate paymentId parameter
  if (!paymentId || typeof paymentId !== 'string' || paymentId.trim() === '') {
    throw new Error('Invalid payment ID: must be a non-empty string');
  }

  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Return payment object with all required fields
  const payment = {
    id: paymentId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    timestamp: new Date().toISOString()
  };

  // Ensure payment object is valid before returning
  if (!payment || typeof payment !== 'object') {
    return null;
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
