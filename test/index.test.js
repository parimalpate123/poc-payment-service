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
    });

    it('should handle invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: -100, currency: 'INVALID', paymentMethod: 'unknown' });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Payment processing failed');
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should retrieve payment status for a valid ID', async () => {
      const res = await request(app).get('/api/v1/payments/PAY-123456789');
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe('PAY-123456789');
    });

    it('should handle invalid payment ID', async () => {
      const res = await request(app).get('/api/v1/payments/INVALID-ID');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to fetch payment status');
    });
  });
});