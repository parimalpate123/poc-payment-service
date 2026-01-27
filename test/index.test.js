const request = require('supertest');
const app = require('../src/index');

describe('Payment Service', () => {
  describe('POST /api/v1/payments', () => {
    it('should process a valid payment', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: 100, currency: 'USD', paymentMethod: 'credit_card' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.paymentId).toBeDefined();
      expect(res.body.amount).toBe(100);
      expect(res.body.status).toBe('completed');
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: 'invalid', currency: '', paymentMethod: null });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should get payment status for a valid ID', async () => {
      const res = await request(app).get('/api/v1/payments/PAY-123456');
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe('PAY-123456');
      expect(res.body.status).toBe('completed');
    });

    it('should return 404 for non-existent payment ID', async () => {
      const res = await request(app).get('/api/v1/payments/NONEXISTENT');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Payment not found');
    });
  });
});
