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

// Lambda handler function
exports.handler = async (event, context) => {
  // Create a new express app for each Lambda invocation
  const server = express();
  
  // Reuse existing route definitions
  server.use(app);

  // Convert API Gateway event to express request
  const expressEvent = await createExpressEvent(event, context);

  // Process the event with express
  return new Promise((resolve, reject) => {
    server(expressEvent, {
      end: (responseBody) => {
        resolve({
          statusCode: expressEvent.res.statusCode,
          headers: expressEvent.res.headers,
          body: responseBody
        });
      }
    });
  });
};

// Helper function to create express event from Lambda event
async function createExpressEvent(event, context) {
  const req = {
    method: event.httpMethod,
    url: event.path,
    headers: event.headers,
    body: event.body,
    params: event.pathParameters || {},
    query: event.queryStringParameters || {}
  };

  return {
    req,
    res: {
      statusCode: 200,
      headers: {},
      setHeader: (key, value) => {
        this.headers[key] = value;
      },
      end: (data) => {
        if (this.statusCode === 200 && !this.headers['Content-Type']) {
          this.headers['Content-Type'] = 'application/json';
        }
        context.succeed({
          statusCode: this.statusCode,
          headers: this.headers,
          body: data
        });
      }
    }
  };
}

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

// Remove server startup for Lambda
// app.listen(PORT, () => {
//   console.log(`Payment service running on port ${PORT}`);
// });

module.exports = app;
