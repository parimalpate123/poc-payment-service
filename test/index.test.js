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

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: 100 });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Missing required fields: amount, currency, paymentMethod');
    });

    it('should return 500 for invalid amount', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: -100, currency: 'USD', paymentMethod: 'credit_card' });
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Payment processing failed');
      expect(res.body).toHaveProperty('message', 'Invalid amount');
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should return payment status', async () => {
      const res = await request(app).get('/api/v1/payments/PAY-123');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 'PAY-123');
      expect(res.body).toHaveProperty('status', 'completed');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('service', 'payment-service');
    });
  });
});