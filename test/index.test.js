const request = require('supertest');
const app = require('../src/index');

describe('Payment Service', () => {
  describe('POST /api/v1/payments', () => {
    it('should process a valid payment', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('paymentId');
      expect(response.body).toHaveProperty('amount', 100);
      expect(response.body).toHaveProperty('status', 'completed');
    });

    it('should reject payment with invalid amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 'invalid',
          currency: 'USD',
          paymentMethod: 'credit_card'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid amount');
    });

    it('should reject payment with missing currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          paymentMethod: 'credit_card'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid currency');
    });

    it('should reject payment with invalid paymentMethod', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: ''
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid paymentMethod');
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should return payment status', async () => {
      const response = await request(app).get('/api/v1/payments/PAY-123');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', 'PAY-123');
      expect(response.body).toHaveProperty('status', 'completed');
      expect(response.body).toHaveProperty('amount', 100.00);
      expect(response.body).toHaveProperty('currency', 'USD');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'payment-service');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});