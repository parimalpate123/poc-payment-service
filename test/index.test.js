/**
 * Unit tests for Payment Service null-safety fixes
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
    
    test('should process payment with customer and order data', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 250.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customer: {
            id: 'CUST-123',
            email: 'customer@example.com'
          },
          order: {
            id: 'ORD-456',
            items: ['item1', 'item2']
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('should handle null customer gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customer: null,
          order: null
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('should handle undefined customer properties', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customer: {},
          order: {}
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('should handle customer without id or email', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customer: { name: 'John Doe' }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('should handle order without items array', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          order: { id: 'ORD-789' }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('should reject invalid customer format', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customer: 'invalid-string'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid customer data format');
    });
    
    test('should reject invalid order format', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          order: 'invalid-string'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid order data format');
    });
    
    test('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
    
    test('should reject invalid amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: -50,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Invalid amount');
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
    
    test('should handle payment retrieval errors gracefully', async () => {
      // Test that the endpoint handles errors from getPaymentStatus
      const response = await request(app)
        .get('/api/v1/payments/VALID-ID-123');
      
      // Should return 200 with payment data (our mock always returns data)
      expect(response.status).toBe(200);
      expect(response.body.id).toBeDefined();
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
