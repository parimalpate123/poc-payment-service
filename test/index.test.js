const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Null Reference Fix Tests', () => {
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

    test('should reject null amount', async () => {
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

    test('should reject undefined currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          paymentMethod: 'credit_card'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
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
      expect(response.body.error).toBeDefined();
    });

    test('should reject invalid amount type', async () => {
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

    test('should reject negative amount', async () => {
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

    test('should reject zero amount', async () => {
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

    test('should reject invalid currency format', async () => {
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

    test('should reject empty paymentMethod', async () => {
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

    test('should reject non-string paymentMethod', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 123
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid paymentMethod');
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
      expect(response.body.currency).toBeDefined();
    });

    test('should reject empty payment ID', async () => {
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
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
