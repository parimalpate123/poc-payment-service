const request = require('supertest');
const app = require('../src/index');

describe('Payment Service', () => {
  describe('POST /api/v1/payments', () => {
    it('should process a valid payment', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: 100, currency: 'USD', paymentMethod: 'credit' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.paymentId).toBeDefined();
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: -100, currency: 'USD', paymentMethod: 'credit' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should return payment status for valid ID', async () => {
      const paymentId = 'PAY-1234567890';
      const res = await request(app).get(`/api/v1/payments/${paymentId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(paymentId);
    });

    it('should return 404 for non-existent payment', async () => {
      const res = await request(app).get('/api/v1/payments/PAY-nonexistent');
      expect(res.statusCode).toBe(404);
    });
  });
});
