const request = require('supertest');
const app = require('../src/index');

describe('Payment Service', () => {
  describe('POST /api/v1/payments', () => {
    it('should process a valid payment', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: 100, currency: 'USD', paymentMethod: 'credit_card' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('paymentId');
      expect(res.body).toHaveProperty('amount', 100);
      expect(res.body).toHaveProperty('status', 'completed');
    });

    it('should return 400 for invalid amount', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: -100, currency: 'USD', paymentMethod: 'credit_card' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid amount');
    });

    it('should return 400 for invalid currency', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: 100, currency: 'INVALID', paymentMethod: 'credit_card' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid currency');
    });

    it('should return 400 for invalid paymentMethod', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: 100, currency: 'USD', paymentMethod: '' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid paymentMethod');
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should return payment status for a valid paymentId', async () => {
      const res = await request(app).get('/api/v1/payments/PAY-123456');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 'PAY-123456');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('amount');
      expect(res.body).toHaveProperty('currency');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('service', 'payment-service');
      expect(res.body).toHaveProperty('timestamp');
    });
  });
});