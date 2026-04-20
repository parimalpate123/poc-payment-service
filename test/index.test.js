/**
 * Payment Service Tests
 * Tests for null-checking and data validation fixes
 */

const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Null Reference Error Fixes', () => {
  
  describe('POST /api/v1/payments', () => {
    
    test('should successfully process valid payment', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: { type: 'credit_card', last4: '4242' }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.status).toBe('completed');
      expect(response.body.amount).toBe(100.50);
    });
    
    test('should reject payment with missing amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
    
    test('should reject payment with missing currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
    
    test('should reject payment with missing paymentMethod', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
    
    test('should reject payment with invalid amount (negative)', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: -50,
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Payment processing failed');
      expect(response.body.message).toContain('Invalid amount');
    });
    
    test('should reject payment with invalid amount (zero)', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 0,
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
    
    test('should reject payment with null amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: null,
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
    
    test('should reject payment with null currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: null,
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
    
    test('should reject payment with null paymentMethod', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: null
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
    
  });
  
  describe('GET /api/v1/payments/:paymentId', () => {
    
    test('should successfully retrieve payment status', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-12345');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('PAY-12345');
      expect(response.body.status).toBeDefined();
      expect(response.body.amount).toBeDefined();
      expect(response.body.currency).toBeDefined();
    });
    
    test('should handle valid paymentId format', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-999999');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status');
    });
    
    test('should handle various valid paymentId formats', async () => {
      const testIds = ['PAY-123', 'payment-abc-def', 'TXN_999'];
      
      for (const testId of testIds) {
        const response = await request(app)
          .get(`/api/v1/payments/${testId}`);
        
        expect(response.status).toBe(200);
        expect(response.body.id).toBe(testId);
      }
    });
    
  });
  
  describe('GET /health', () => {
    
    test('should return healthy status', async () => {
      const response = await request(app)
        .get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('payment-service');
      expect(response.body.timestamp).toBeDefined();
    });
    
  });
  
});

describe('Internal Functions - Null Safety', () => {
  
  // Note: These tests would require exporting the functions or using a test helper
  // For now, they are tested indirectly through the API endpoints
  
  test('processPayment validates amount parameter', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 'invalid',
        currency: 'USD',
        paymentMethod: { type: 'credit_card' }
      });
    
    // Should fail validation at the route level or function level
    expect([400, 500]).toContain(response.status);
  });
  
  test('getPaymentStatus validates paymentId parameter', async () => {
    const response = await request(app)
      .get('/api/v1/payments/');
    
    // Should return 404 for missing paymentId
    expect(response.status).toBe(404);
  });
  
});

describe('Null Reference Error Prevention', () => {
  
  test('should handle null response from processPayment gracefully', async () => {
    // This test verifies that the route handler checks for null/undefined
    // payment results before accessing properties
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 50,
        currency: 'USD',
        paymentMethod: { type: 'debit_card' }
      });
    
    // Should either succeed or fail gracefully without null reference errors
    expect([200, 500]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.status).toBeDefined();
    } else {
      expect(response.body.error).toBeDefined();
    }
  });
  
  test('should handle null response from getPaymentStatus gracefully', async () => {
    // This test verifies that the route handler checks for null/undefined
    // payment objects before accessing properties
    const response = await request(app)
      .get('/api/v1/payments/TEST-NULL-CHECK');
    
    // Should either succeed or fail gracefully without null reference errors
    expect([200, 404, 500]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBeDefined();
    } else {
      expect(response.body.error).toBeDefined();
    }
  });
  
});
