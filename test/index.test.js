const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Bug Fix Tests', () => {
  describe('POST /api/v1/payments', () => {
    test('should process valid payment with all fields', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-123',
          order: { id: 'ORD-456', items: ['item1'] }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.amount).toBe(100.50);
    });

    test('should handle null customerId gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 50.00,
          currency: 'USD',
          paymentMethod: 'debit_card',
          customerId: null,
          order: null
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should handle missing optional fields', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 75.25,
          currency: 'EUR',
          paymentMethod: 'paypal'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
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

    test('should reject invalid amount (negative)', async () => {
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

    test('should reject invalid amount (not a number)', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 'invalid',
          currency: 'USD',
          paymentMethod: 'credit_card'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid amount');
    });

    test('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should handle division by zero scenario', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 0.01,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
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

    test('should handle null payment object gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-99999');

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
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