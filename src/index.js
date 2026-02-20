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
    
    // Validate input
    if (!amount || !currency || !paymentMethod) {
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

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  try {
    const paymentStatus = await testPaymentProcessing();
    const dependenciesStatus = await checkDependencies();
    
    res.status(200).json({ 
      status: 'healthy',
      service: 'payment-service',
      version: '1.0.1',
      timestamp: new Date().toISOString(),
      paymentProcessing: paymentStatus,
      dependencies: dependenciesStatus
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      service: 'payment-service',
      version: '1.0.1',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Simulate payment processing
async function processPayment(amount, currency, paymentMethod) {
  // Simulate potential issues:
  // - Database connection timeout
  // - External payment gateway timeout
  // - Invalid payment method handling
  
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
  // Simulate potential issues:
  // - Database query timeout
  // - Cache miss handling
  
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
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});

// Test payment processing capability
async function testPaymentProcessing() {
  try {
    await processPayment(1.00, 'USD', 'test');
    return 'operational';
  } catch (error) {
    return 'failed';
  }
}

// Simulate checking critical dependencies
async function checkDependencies() {
  // In a real scenario, you would check actual dependencies
  // This is a simplified simulation
  return {
    database: 'connected',
    cache: 'connected',
    paymentGateway: 'operational'
  };
}

module.exports = app;
