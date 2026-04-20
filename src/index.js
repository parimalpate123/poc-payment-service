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
    
    // Validate paymentMethod is an object with required fields (check null first)
    if (paymentMethod === null || typeof paymentMethod !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid paymentMethod: must be an object' 
      });
    }

    // Enhanced validation with null checks
    if (!amount || !currency || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, currency, paymentMethod' 
      });
    }

    // Validate amount is a valid number
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount: must be a positive number' 
      });
    }

    // Validate currency format
    if (typeof currency !== 'string' || currency.length !== 3) {
      return res.status(400).json({ 
        error: 'Invalid currency: must be a 3-letter code' 
      });
    }

    // Process payment with null-safe handling
    const paymentResult = await processPayment(amount, currency, paymentMethod);
    
    // Validate payment result
    if (!paymentResult || typeof paymentResult !== 'object') {
      throw new Error('Invalid payment result received');
    }

    // Null-safe access to payment result properties
    const paymentId = paymentResult.id || null;
    const resultAmount = paymentResult.amount || amount;
    const status = paymentResult.status || 'unknown';

    if (!paymentId) {
      throw new Error('Payment processing failed: no payment ID generated');
    }
    
    res.status(200).json({
      success: true,
      paymentId: paymentId,
      amount: resultAmount,
      status: status
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
    let { paymentId } = req.params;
    
    // Decode and validate paymentId (check for empty/whitespace strings)
    if (!paymentId || typeof paymentId !== 'string') {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }

    // Trim whitespace
    paymentId = paymentId.trim();

    // Check if empty after trimming
    if (paymentId === '') {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }

    const payment = await getPaymentStatus(paymentId);
    
    // Enhanced null check
    if (!payment || typeof payment !== 'object') {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Validate payment object has required fields
    if (!payment.id) {
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

// Simulate payment processing with null-safe handling
async function processPayment(amount, currency, paymentMethod) {
  // Validate inputs
  if (!amount || typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Invalid amount provided to processPayment');
  }

  if (!currency || typeof currency !== 'string') {
    throw new Error('Invalid currency provided to processPayment');
  }

  if (!paymentMethod || typeof paymentMethod !== 'object') {
    throw new Error('Invalid paymentMethod provided to processPayment');
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Generate payment ID with null check
  const timestamp = Date.now();
  if (!timestamp) {
    throw new Error('Failed to generate timestamp');
  }

  const paymentId = `PAY-${timestamp}`;
  
  // Validate generated ID
  if (!paymentId || paymentId === 'PAY-') {
    throw new Error('Failed to generate payment ID');
  }

  // Return validated payment result
  return {
    id: paymentId,
    amount: amount,
    currency: currency,
    paymentMethod: paymentMethod,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}

// Simulate payment status retrieval with null-safe handling
async function getPaymentStatus(paymentId) {
  // Validate input
  if (!paymentId || typeof paymentId !== 'string') {
    throw new Error('Invalid paymentId provided to getPaymentStatus');
  }

  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Simulate database response with potential null
  const dbResponse = {
    id: paymentId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    timestamp: new Date().toISOString()
  };

  // Validate database response
  if (!dbResponse || typeof dbResponse !== 'object') {
    return null;
  }

  // Validate required fields exist
  if (!dbResponse.id) {
    return null;
  }

  return dbResponse;
}

// Start server only if not in test mode
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
  });
}

module.exports = app;
