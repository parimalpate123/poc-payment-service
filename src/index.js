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
    if (!amount || amount <= 0) {
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

    // Process payment with validated data
    const paymentResult = await processPayment(amount, currency, paymentMethod, customerId, order);
    
    // Validate payment result
    if (!paymentResult || !paymentResult.id) {
      throw new Error('Payment processing returned invalid result');
    }
    
    res.status(200).json({
      success: true,
      paymentId: paymentResult.id,
      amount: paymentResult.amount,
      status: paymentResult.status,
      customerId: paymentResult.customerId
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
async function processPayment(amount, currency, paymentMethod, customerId, order) {
  // Validate all required parameters
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount: must be a positive number');
  }
  
  if (!currency || typeof currency !== 'string') {
    throw new Error('Invalid currency');
  }
  
  if (!paymentMethod || typeof paymentMethod !== 'string') {
    throw new Error('Invalid payment method');
  }
  
  if (!customerId || typeof customerId !== 'string') {
    throw new Error('Invalid customerId');
  }
  
  // Initialize payment object with all required fields
  const payment = {
    id: `PAY-${Date.now()}`,
    amount: amount,
    currency: currency,
    paymentMethod: paymentMethod,
    customerId: customerId,
    order: order || null,
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  
  // Validate payment object initialization
  if (!payment || !payment.id || !payment.amount || !payment.customerId) {
    throw new Error('Payment object initialization failed');
  }
  
  // Calculate processing fee with division by zero protection
  let processingFee = 0;
  if (payment.amount && payment.amount > 0) {
    processingFee = payment.amount * 0.029; // 2.9% fee
  }
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Update payment status
  payment.status = 'completed';
  payment.processingFee = processingFee;
  
  // Validate final payment object
  if (!payment || !payment.id || !payment.status) {
    throw new Error('Payment processing completed but result is invalid');
  }
  
  return payment;
}

// Simulate payment status retrieval with null handling
async function getPaymentStatus(paymentId) {
  // Validate input
  if (!paymentId || typeof paymentId !== 'string') {
    throw new Error('Invalid paymentId');
  }
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Initialize payment status object with null checks
  const payment = {
    id: paymentId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    customerId: 'CUST-12345',
    timestamp: new Date().toISOString()
  };
  
  // Validate payment object before returning
  if (!payment || !payment.id || !payment.status || !payment.amount) {
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
