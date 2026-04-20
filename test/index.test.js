const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Null Reference Error Fix Tests', () => {
  
  describe('POST /api/v1/payments', () => {
    
    test('should successfully process valid payment', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.amount).toBe(100.50);
      expect(response.body.status).toBe('completed');
    });
    
    test('should reject null amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: null,
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('amount is required');
    });
    
    test('should reject undefined amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
    
    test('should reject null currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: null,
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('currency is required and must be a string');
    });
    
    test('should reject null paymentMethod', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: null
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('paymentMethod is required and must be an object');
    });
    
    test('should reject paymentMethod without type', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: {}
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('paymentMethod.type is required');
    });
    
    test('should reject empty request body', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request body');
    });
    
    test('should reject negative amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: -50,
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('amount must be a positive number');
    });
  });
  
  describe('GET /api/v1/payments/:paymentId', () => {
    
    test('should successfully retrieve payment status', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-12345');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('PAY-12345');
      expect(response.body.status).toBe('completed');
      expect(response.body.amount).toBeDefined();
      expect(response.body.currency).toBeDefined();
    });
    
    test('should handle null payment result', async () => {
      const response = await request(app)
        .get('/api/v1/payments/INVALID');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Payment not found');
    });
    
    test('should reject whitespace-only payment ID', async () => {
      const response = await request(app)
        .get('/api/v1/payments/%20%20%20');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid payment ID');
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
