/**
 * Payment Service - POC for Auto-Remediation Testing
 * 
 * This service handles payment processing operations.
 * It's designed to demonstrate auto-remediation capabilities.
 */

const express = require('express');
const mysql = require('mysql2/promise');
const { promisify } = require('util');
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection pool configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'payments',
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds
  acquireTimeout: 10000, // 10 seconds
};

const pool = mysql.createPool(dbConfig);

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
  const retries = 3;
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [result] = await connection.query(
          'INSERT INTO payments (amount, currency, payment_method, status) VALUES (?, ?, ?, ?)',
          [amount, currency, paymentMethod, 'completed']
        );
        await connection.commit();
        return {
          id: `PAY-${result.insertId}`,
          amount,
          currency,
          paymentMethod,
          status: 'completed',
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
    }
  }
}

// Simulate payment status retrieval
async function getPaymentStatus(paymentId) {
  const retries = 3;
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.query(
          'SELECT * FROM payments WHERE id = ?',
          [paymentId.replace('PAY-', '')]
        );
        if (rows.length === 0) return null;
        const payment = rows[0];
        return {
          id: `PAY-${payment.id}`,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          timestamp: payment.created_at.toISOString()
        };
      } finally {
        connection.release();
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
    }
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});

module.exports = app;
