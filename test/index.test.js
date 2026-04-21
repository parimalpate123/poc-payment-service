/**
 * Payment Service Tests
 * Tests for input validation and error handling fixes
 */

const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Input Validation Tests', () => {
  
  describe('POST /api/v1/payments', () => {
    
    test('should successfully process payment with all required fields', async () => {
      const validPayment = {
        customerId: 'CUST-123',
        amount: 100.50,
        currency: 'USD',
        paymentMethod: 'credit_card',
        order: { orderId: 'ORD-456', items: ['item1'] },
        status: 'pending'
      };
      
      const response = await request(app)
        .post('/api/v1/payments')
        .send(validPayment)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.amount).toBe(100.50);
      expect(response.body.status).toBe('completed');
    });
    
    test('should reject payment with missing customerId', async () => {
      const invalidPayment = {
        amount: 100.50,
        currency: 'USD',
        paymentMethod: 'credit_card',
        order: { orderId: 'ORD-456' }
      };
      
      const response = await request(app)
        .post('/api/v1/payments')
        .send(invalidPayment)
        .expect(400);
      
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('customerId is required and must be a string');
    });
    
    test('should reject payment with missing amount', async () => {
      const invalidPayment = {
        customerId: 'CUST-123',
        currency: 'USD',
        paymentMethod: 'credit_card',
        order: { orderId: 'ORD-456' }
      };
      
      const response = await request(app)
        .post('/api/v1/payments')
        .send(invalidPayment)
        .expect(400);
      
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('amount is required and must be a positive number');
    });
    
    test('should reject payment with zero or negative amount', async () => {
      const invalidPayment = {
        customerId: 'CUST-123',
        amount: 0,
        currency: 'USD',
        paymentMethod: 'credit_card',
        order: { orderId: 'ORD-456' }
      };
      
      const response = await request(app)
        .post('/api/v1/payments')
        .send(invalidPayment)
        .expect(400);
      
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('amount is required and must be a positive number');
    });
    
    test('should reject payment with missing order', async () => {
      const invalidPayment = {
        customerId: 'CUST-123',
        amount: 100.50,
        currency: 'USD',
        paymentMethod: 'credit_card'
      };
      
      const response = await request(app)
        .post('/api/v1/payments')
        .send(invalidPayment)
        .expect(400);
      
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('order is required and must be an object');
    });
    
    test('should reject payment with missing paymentMethod', async () => {
      const invalidPayment = {
        customerId: 'CUST-123',
        amount: 100.50,
        currency: 'USD',
        order: { orderId: 'ORD-456' }
      };
      
      const response = await request(app)
        .post('/api/v1/payments')
        .send(invalidPayment)
        .expect(400);
      
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('paymentMethod is required and must be a string');
    });
    
    test('should reject payment with invalid status', async () => {
      const invalidPayment = {
        customerId: 'CUST-123',
        amount: 100.50,
        currency: 'USD',
        paymentMethod: 'credit_card',
        order: { orderId: 'ORD-456' },
        status: 'invalid_status'
      };
      
      const response = await request(app)
        .post('/api/v1/payments')
        .send(invalidPayment)
        .expect(400);
      
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('status must be one of: pending, processing, completed, failed');
    });
    
    test('should handle multiple missing fields', async () => {
      const invalidPayment = {
        currency: 'USD'
      };
      
      const response = await request(app)
        .post('/api/v1/payments')
        .send(invalidPayment)
        .expect(400);
      
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details.length).toBeGreaterThan(1);
    });
    
    test('should default status to pending if not provided', async () => {
      const validPayment = {
        customerId: 'CUST-123',
        amount: 100.50,
        currency: 'USD',
        paymentMethod: 'credit_card',
        order: { orderId: 'ORD-456' }
      };
      
      const response = await request(app)
        .post('/api/v1/payments')
        .send(validPayment)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
    
    test('should protect against division by zero in amount calculation', async () => {
      const validPayment = {
        customerId: 'CUST-123',
        amount: 0.01,
        currency: 'USD',
        paymentMethod: 'credit_card',
        order: { orderId: 'ORD-456' }
      };
      
      const response = await request(app)
        .post('/api/v1/payments')
        .send(validPayment)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.amount).toBe(0.01);
    });
  });
  
  describe('GET /api/v1/payments/:paymentId', () => {
    
    test('should successfully retrieve payment status with valid paymentId', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-12345')
        .expect(200);
      
      expect(response.body.id).toBe('PAY-12345');
      expect(response.body.status).toBeDefined();
      expect(response.body.amount).toBeDefined();
    });
  });
  
  describe('GET /health', () => {
    
    test('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('payment-service');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
