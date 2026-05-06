/**
 * Payment Service - POC for Auto-Remediation Testing
 * 
 * This service handles payment processing operations.
 * It's designed to demonstrate auto-remediation capabilities.
 */

const express = require('express');
const serverless = require('serverless-http');
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize logging immediately
console.log('Payment service initializing...', {
  timestamp: new Date().toISOString(),
  nodeVersion: process.version,
  environment: process.env.NODE_ENV || 'development',
  isLambda: !!process.env.LAMBDA_TASK_ROOT
});

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

// Lambda handler export
let handler;
try {
  handler = serverless(app);
  console.log('Lambda handler created successfully');
} catch (error) {
  console.error('Failed to create Lambda handler:', error);
  throw error;
}

// Export Lambda handler with logging
const lambdaHandler = async (event, context) => {
  console.log('Lambda invocation started', {
    requestId: context.requestId,
    functionName: context.functionName,
    eventType: event.httpMethod || 'unknown',
    path: event.path || 'unknown'
  });
  
  try {
    const result = await handler(event, context);
    console.log('Lambda invocation completed successfully', {
      requestId: context.requestId,
      statusCode: result.statusCode
    });
    return result;
  } catch (error) {
    console.error('Lambda invocation failed', {
      requestId: context.requestId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Start server only if not in Lambda environment
if (!process.env.LAMBDA_TASK_ROOT && !process.env.JEST_WORKER_ID) {
  app.listen(PORT, () => {
    console.log(`Payment service running on port ${PORT}`);
  });
}

module.exports = app;
module.exports.handler = lambdaHandler;
