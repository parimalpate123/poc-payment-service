const request = require('supertest');
const app = require('../src/index');

describe('Payment Service', () => {
  describe('POST /api/v1/payments', () => {
    it('should process a valid payment', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('paymentId');
      expect(res.body).toHaveProperty('amount', 100);
      expect(res.body).toHaveProperty('status', 'completed');
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 'invalid',
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should return payment status for a valid ID', async () => {
      const paymentId = 'PAY-1234567890';
      const res = await request(app).get(`/api/v1/payments/${paymentId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', paymentId);
      expect(res.body).toHaveProperty('status');
    });

    it('should return 404 for non-existent payment ID', async () => {
      const res = await request(app).get('/api/v1/payments/INVALID-ID');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Payment not found');
    });
  });
});