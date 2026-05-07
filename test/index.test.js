const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Malformed Data Handling', () => {
  describe('POST /api/v1/payments', () => {
    test('should reject request with missing amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid payment data');
      expect(response.body.details).toContain('Valid amount (positive number) is required');
    });

    test('should reject request with null amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: null,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid payment data');
    });

    test('should reject request with missing currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.details).toContain('Valid currency code (3 letters) is required');
    });

    test('should reject request with missing paymentMethod', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.details).toContain('Valid paymentMethod is required');
    });

    test('should handle malformed customerId gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: null
        });
      
      expect(response.status).toBe(400);
      expect(response.body.details).toContain('customerId must be a valid string if provided');
    });

    test('should handle malformed orderId gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card',
          orderId: undefined
        });
      
      expect(response.status).toBe(200);
    });

    test('should handle malformed order object gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card',
          order: 'invalid_string'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.details).toContain('order must be a valid object if provided');
    });

    test('should successfully process valid payment data', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-123',
          orderId: 'ORD-456'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.amount).toBe(100);
      expect(response.body.status).toBe('completed');
    });

    test('should successfully process payment with optional fields omitted', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 50.99,
          currency: 'EUR',
          paymentMethod: 'paypal'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject negative amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: -100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.details).toContain('Valid amount (positive number) is required');
    });

    test('should reject zero amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 0,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    test('should fetch payment status with valid paymentId', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-123456');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('PAY-123456');
      expect(response.body.status).toBeDefined();
    });

    test('should handle empty paymentId gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/payments/');
      
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