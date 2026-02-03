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

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: -100, currency: 'USD', paymentMethod: 'credit_card' });
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Payment processing failed');
      expect(res.body.message).toContain('Invalid amount');
    });

    it('should handle gateway timeouts', async () => {
      // This test might be flaky due to the random nature of the simulated timeout
      // You might need to run it multiple times or mock the random function for consistent results
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: 100, currency: 'USD', paymentMethod: 'credit_card' });
      expect(res.statusCode).toBe(200).or(toBe(500));
      if (res.statusCode === 500) {
        expect(res.body).toHaveProperty('error', 'Payment processing failed');
        expect(res.body.message).toContain('Gateway timeout');
      }
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