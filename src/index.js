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
    
    // Validate input - check for null/undefined first
    if (amount === null || amount === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, currency, paymentMethod' 
      });
    }
    
    if (currency === null || currency === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, currency, paymentMethod' 
      });
    }
    
    if (paymentMethod === null || paymentMethod === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, currency, paymentMethod' 
      });
    }

    // Additional validation for data types and values
    if (typeof amount !== 'number' || amount <= 0) {
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

    // Process payment with error handling
    const paymentResult = await processPayment(amount, currency, paymentMethod);
    
    // Validate payment result before accessing properties
    if (!paymentResult || typeof paymentResult !== 'object') {
      throw new Error('Invalid payment result returned from payment processor');
    }

    if (!paymentResult.id || !paymentResult.status) {
      throw new Error('Payment result missing required fields (id, status)');
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
    if (!paymentId || typeof paymentId !== 'string' || !paymentId.trim()) {
      return res.status(400).json({ 
        error: 'Invalid paymentId: must be a non-empty string' 
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
async function processPayment(amount, currency, paymentMethod) {
  // Validate inputs to prevent undefined property access
  if (amount === null || amount === undefined) {
    throw new Error('Payment processing failed: amount is null or undefined');
  }
  
  if (currency === null || currency === undefined) {
    throw new Error('Payment processing failed: currency is null or undefined');
  }
  
  if (paymentMethod === null || paymentMethod === undefined) {
    throw new Error('Payment processing failed: paymentMethod is null or undefined');
  }
  
  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Ensure all required fields are present in the result
    const result = {
      id: `PAY-${Date.now()}`,
      amount: amount,
      currency: currency,
      paymentMethod: paymentMethod,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
    
    // Validate result before returning
    if (!result.id || !result.status) {
      throw new Error('Payment result validation failed: missing required fields');
    }
    
    return result;
  } catch (error) {
    console.error('Error in processPayment:', error);
    throw new Error(`Payment processing failed: ${error.message}`);
  }
}

// Simulate payment status retrieval
async function getPaymentStatus(paymentId) {
  // Validate input to prevent undefined property access
  if (paymentId === null || paymentId === undefined) {
    throw new Error('Payment status retrieval failed: paymentId is null or undefined');
  }
  
  try {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Ensure all required fields are present in the result
    const result = {
      id: paymentId,
      status: 'completed',
      amount: 100.00,
      currency: 'USD',
      timestamp: new Date().toISOString()
    };
    
    return result;
  } catch (error) {
    console.error('Error in getPaymentStatus:', error);
    throw new Error(`Payment status retrieval failed: ${error.message}`);
  }
}

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
  });
}

module.exports = app;
