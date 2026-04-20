/**
 * Unit tests for Payment Service null-safety fixes
 * Tests verify that the service properly handles null/undefined objects
 */

const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Null Safety Tests', () => {
  
  describe('POST /api/v1/payments', () => {
    
    test('should process payment with valid data', async () => {
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
    
    test('should process payment with customer object', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customer: {
            id: 'CUST-123',
            email: 'test@example.com'
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('should process payment with order object', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          order: {
            id: 'ORD-456',
            total: 100.50
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('should handle null customer gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customer: null
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('should handle undefined customer gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card'
          // customer is undefined
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('should handle null order gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          order: null
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('should handle customer with missing properties', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customer: {} // empty object
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('should handle order with missing properties', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          order: {} // empty object
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('should reject invalid customer type', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customer: 'invalid-string'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid customer data');
    });
    
    test('should reject invalid order type', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          order: 'invalid-string'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid order data');
    });
    
    test('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50
          // missing currency and paymentMethod
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
  });
  
  describe('GET /api/v1/payments/:paymentId', () => {
    
    test('should retrieve payment status with valid ID', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-12345');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('PAY-12345');
      expect(response.body.status).toBeDefined();
    });
    
    test('should handle empty payment ID', async () => {
      const response = await request(app)
        .get('/api/v1/payments/');
      
      // Express will return 404 for missing route parameter
      expect(response.status).toBe(404);
    });
  });
  
  describe('GET /health', () => {
    
    test('should return healthy status', async () => {
      const response = await request(app)
        .get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('payment-service');
    });
  });
});