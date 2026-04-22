const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Error Handling Tests', () => {
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

    test('should reject payment with missing amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          currency: 'USD',
          paymentMethod: 'credit_card'
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
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should reject payment with undefined currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: undefined,
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should reject payment with invalid amount type', async () => {
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

    test('should reject payment with invalid currency format', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'US',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid currency');
    });

    test('should reject payment with empty paymentMethod', async () => {
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
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    test('should retrieve payment status with valid paymentId', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-123456');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('PAY-123456');
      expect(response.body.status).toBeDefined();
    });

    test('should handle empty paymentId', async () => {
      const response = await request(app)
        .get('/api/v1/payments/%20');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid paymentId');
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