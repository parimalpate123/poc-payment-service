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
    
    // Validate input - check for null/undefined but allow 0 to reach processPayment for proper validation
    if (amount === null || amount === undefined || !currency || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, currency, paymentMethod' 
      });
    }

    // Process payment
    const paymentResult = await processPayment(amount, currency, paymentMethod);
    
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

// Validate payment method
function validatePaymentMethod(paymentMethod) {
  if (!paymentMethod || typeof paymentMethod !== 'object') {
    throw new Error('Invalid payment method: must be a valid object');
  }
  
  if (!paymentMethod.type || typeof paymentMethod.type !== 'string') {
    throw new Error('Invalid payment method: type is required and must be a string');
  }
  
  const validTypes = ['credit_card', 'debit_card', 'paypal', 'bank_transfer'];
  if (!validTypes.includes(paymentMethod.type)) {
    throw new Error(`Invalid payment method type: ${paymentMethod.type}`);
  }
  
  return true;
}

// Calculate total with validation
function calculateTotal(amount, fees = 0, tax = 0) {
  // Validate amount
  if (amount === null || amount === undefined) {
    throw new Error('Amount cannot be null or undefined');
  }
  
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Amount must be a valid number');
  }
  
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }
  
  // Validate fees
  if (fees !== null && fees !== undefined) {
    if (typeof fees !== 'number' || isNaN(fees)) {
      throw new Error('Fees must be a valid number');
    }
    if (fees < 0) {
      throw new Error('Fees cannot be negative');
    }
  } else {
    fees = 0;
  }
  
  // Validate tax
  if (tax !== null && tax !== undefined) {
    if (typeof tax !== 'number' || isNaN(tax)) {
      throw new Error('Tax must be a valid number');
    }
    if (tax < 0) {
      throw new Error('Tax cannot be negative');
    }
  } else {
    tax = 0;
  }
  
  const total = amount + fees + tax;
  return parseFloat(total.toFixed(2));
}

// Create payment with validation
function createPayment(paymentData) {
  if (!paymentData || typeof paymentData !== 'object') {
    throw new Error('Payment data cannot be null or undefined');
  }
  
  const { amount, currency, paymentMethod, userId } = paymentData;
  
  // Validate amount
  if (amount === null || amount === undefined) {
    throw new Error('Amount is required');
  }
  
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }
  
  // Validate currency
  if (!currency || typeof currency !== 'string') {
    throw new Error('Currency is required and must be a string');
  }
  
  // Validate payment method
  validatePaymentMethod(paymentMethod);
  
  // Validate userId
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required and must be a string');
  }
  
  return {
    id: `PAY-${Date.now()}`,
    amount,
    currency,
    paymentMethod,
    userId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
}

// Update payment status with validation
function updatePaymentStatus(payment, newStatus) {
  if (!payment || typeof payment !== 'object') {
    throw new Error('Payment object cannot be null or undefined');
  }
  
  if (!newStatus || typeof newStatus !== 'string') {
    throw new Error('Status cannot be null or undefined and must be a string');
  }
  
  const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }
  
  return {
    ...payment,
    status: newStatus,
    updatedAt: new Date().toISOString()
  };
}

// Simulate payment processing
async function processPayment(amount, currency, paymentMethod) {
  // Validate inputs
  if (amount === null || amount === undefined) {
    throw new Error('Amount cannot be null or undefined');
  }
  
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new Error('Amount must be a valid number');
  }
  
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }
  
  if (!currency || typeof currency !== 'string') {
    throw new Error('Currency is required and must be a string');
  }
  
  if (!paymentMethod) {
    throw new Error('Payment method cannot be null or undefined');
  }
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    id: `PAY-${Date.now()}`,
    amount,
    currency,
    paymentMethod,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}

// Simulate payment status retrieval
async function getPaymentStatus(paymentId) {
  // Validate input
  if (!paymentId || typeof paymentId !== 'string') {
    throw new Error('Payment ID cannot be null or undefined and must be a string');
  }
  
  if (paymentId.trim().length === 0) {
    throw new Error('Payment ID cannot be empty');
  }
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
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
module.exports.validatePaymentMethod = validatePaymentMethod;
module.exports.calculateTotal = calculateTotal;
module.exports.createPayment = createPayment;
module.exports.updatePaymentStatus = updatePaymentStatus;
