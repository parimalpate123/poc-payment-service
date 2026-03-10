/**
 * Payment Service - POC for Auto-Remediation Testing
 * 
 * This service handles payment processing operations.
 * It's designed to demonstrate auto-remediation capabilities.
 */

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/payments';
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Connect to MongoDB
mongoose.connect(MONGO_URI, dbOptions)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Payment schema
const PaymentSchema = new mongoose.Schema({
  amount: Number,
  currency: String,
  paymentMethod: String,
  status: String,
  timestamp: Date
});

const Payment = mongoose.model('Payment', PaymentSchema);

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
  try {
    const payment = new Payment({
      amount,
      currency,
      paymentMethod,
      status: 'completed',
      timestamp: new Date()
    });

    const savedPayment = await payment.save();
    return {
      id: savedPayment._id,
      amount: savedPayment.amount,
      currency: savedPayment.currency,
      paymentMethod: savedPayment.paymentMethod,
      status: savedPayment.status,
      timestamp: savedPayment.timestamp
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    throw new Error('Payment processing failed');
  }
}

// Simulate payment status retrieval
async function getPaymentStatus(paymentId) {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return null;
    }
    return {
      id: payment._id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      timestamp: payment.timestamp
    };
  } catch (error) {
    console.error('Error fetching payment status:', error);
    throw new Error('Failed to fetch payment status');
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});

module.exports = app;
