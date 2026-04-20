/**
 * Payment Service Tests - Null Safety Validation
 * 
 * Tests to verify null-safety fixes for payment processing
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

    test('should process payment with customer and order objects', async () => {
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
            total: 250.00
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
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

    test('should handle undefined customer gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject invalid customer object (non-object)', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customer: 'invalid-string'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid customer');
    });

    test('should reject invalid order object (non-object)', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          order: 'invalid-string'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid order');
    });

    test('should reject invalid customer.id type', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customer: {
            id: 12345
          }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid customer.id');
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

    test('should reject invalid amount (negative)', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: -50.00,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid amount');
    });

    test('should reject invalid amount (zero)', async () => {
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

    test('should reject invalid amount (string)', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: '100.00',
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid amount');
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    
    test('should retrieve payment status with valid ID', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-12345');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('PAY-12345');
      expect(response.body.status).toBeDefined();
      expect(response.body.amount).toBeDefined();
    });

    test('should handle invalid payment ID gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/payments/INVALID');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('INVALID');
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
