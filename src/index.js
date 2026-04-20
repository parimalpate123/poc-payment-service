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
    const { amount, currency, paymentMethod } = req.body;
    
    // Validate input with comprehensive null checks
    if (amount == null || currency == null || paymentMethod == null) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, currency, paymentMethod' 
      });
    }

    // Additional validation for data types and values
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount: must be a positive number' 
      });
    }

    if (typeof currency !== 'string' || currency.length !== 3) {
      return res.status(400).json({ 
        error: 'Invalid currency: must be a 3-letter currency code' 
      });
    }

    if (typeof paymentMethod !== 'string' || !paymentMethod.trim()) {
      return res.status(400).json({ 
        error: 'Invalid paymentMethod: must be a non-empty string' 
      });
    }

    // Process payment with null-safe handling
    const paymentResult = await processPayment(amount, currency, paymentMethod);
    
    // Validate payment result before responding
    if (!paymentResult || typeof paymentResult !== 'object') {
      throw new Error('Payment processing returned invalid result');
    }

    if (!paymentResult.id || !paymentResult.status) {
      throw new Error('Payment processing returned incomplete result');
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
      message: error && error.message ? error.message : 'Unknown error' 
    });
  }
});

// Get payment status
app.get('/api/v1/payments/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Validate paymentId
    if (!paymentId || typeof paymentId !== 'string' || !paymentId.trim()) {
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
      message: error && error.message ? error.message : 'Unknown error' 
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

// Simulate payment processing with comprehensive null checks
async function processPayment(amount, currency, paymentMethod) {
  // Validate all inputs are not null/undefined
  if (amount == null) {
    throw new Error('Payment amount is required');
  }
  
  if (currency == null) {
    throw new Error('Payment currency is required');
  }
  
  if (paymentMethod == null) {
    throw new Error('Payment method is required');
  }

  // Validate data types
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Payment amount must be a valid number');
  }

  if (typeof currency !== 'string') {
    throw new Error('Payment currency must be a string');
  }

  if (typeof paymentMethod !== 'string') {
    throw new Error('Payment method must be a string');
  }

  // Validate business rules
  if (amount <= 0) {
    throw new Error('Payment amount must be positive');
  }

  if (currency.trim().length === 0) {
    throw new Error('Payment currency cannot be empty');
  }

  if (paymentMethod.trim().length === 0) {
    throw new Error('Payment method cannot be empty');
  }

  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Create payment result with null-safe operations
    const paymentId = `PAY-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Ensure all required fields are present
    const result = {
      id: paymentId,
      amount: amount,
      currency: currency,
      paymentMethod: paymentMethod,
      status: 'completed',
      timestamp: timestamp
    };

    // Validate result before returning
    if (!result.id || !result.status) {
      throw new Error('Failed to create valid payment result');
    }

    return result;
  } catch (error) {
    console.error('Error in processPayment:', error);
    throw new Error(`Payment processing failed: ${error && error.message ? error.message : 'Unknown error'}`);
  }
}

// Simulate payment status retrieval with null checks
async function getPaymentStatus(paymentId) {
  // Validate paymentId is not null/undefined
  if (paymentId == null) {
    throw new Error('Payment ID is required');
  }

  if (typeof paymentId !== 'string') {
    throw new Error('Payment ID must be a string');
  }

  if (paymentId.trim().length === 0) {
    throw new Error('Payment ID cannot be empty');
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Create payment status with null-safe operations
    const timestamp = new Date().toISOString();
    
    const payment = {
      id: paymentId,
      status: 'completed',
      amount: 100.00,
      currency: 'USD',
      timestamp: timestamp
    };

    // Validate payment object before returning
    if (!payment || typeof payment !== 'object') {
      throw new Error('Failed to create valid payment status');
    }

    if (!payment.id || !payment.status) {
      throw new Error('Payment status is incomplete');
    }

    return payment;
  } catch (error) {
    console.error('Error in getPaymentStatus:', error);
    throw new Error(`Failed to retrieve payment status: ${error && error.message ? error.message : 'Unknown error'}`);
  }
}

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
  });
}

module.exports = app;
