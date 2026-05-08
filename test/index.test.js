/**
 * Unit tests for Payment Service
 * Tests null safety fixes and error handling
 */

const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Null Safety Tests', () => {
  
  describe('POST /api/v1/payments', () => {
    
    test('should successfully process valid payment', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.amount).toBe(100.50);
      expect(response.body.status).toBe('completed');
    });
    
    test('should reject payment with null amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: null,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
    
    test('should reject payment with undefined amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
    
    test('should reject payment with zero amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 0,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid amount');
    });
    
    test('should reject payment with negative amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: -50,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid amount');
    });
    
    test('should reject payment with null currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: null,
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
    
    test('should reject payment with empty string currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: '',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid currency');
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
      expect(response.body.error).toBeDefined();
    });
    
    test('should reject payment with empty string paymentMethod', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: ''
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid paymentMethod');
    });
    
    test('should handle NaN amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 'not-a-number',
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
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
    
    test('should reject empty paymentId', async () => {
      const response = await request(app)
        .get('/api/v1/payments/ ');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid payment ID');
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

describe('Payment Processing Functions - Null Safety', () => {
  
  // Note: These are internal functions, but we can test them indirectly through the API
  // The above tests cover the null safety of processPayment and getPaymentStatus
  
  test('processPayment should handle valid inputs correctly', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 250.75,
        currency: 'EUR',
        paymentMethod: 'debit_card'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.amount).toBe(250.75);
  });
  
  test('getPaymentStatus should handle valid paymentId', async () => {
    const response = await request(app)
      .get('/api/v1/payments/PAY-TEST-123');
    
    expect(response.status).toBe(200);
    expect(response.body.id).toBe('PAY-TEST-123');
  });
  
});