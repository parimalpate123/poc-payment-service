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
      expect(res.body.amount).toBe(100);
      expect(res.body.status).toBe('completed');
    });

    it('should handle null amount', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: null, currency: 'USD', paymentMethod: 'credit_card' });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Payment processing failed');
      expect(res.body.message).toBe('Invalid amount');
    });

    it('should handle undefined currency', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: 100, paymentMethod: 'credit_card' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing required fields: amount, currency, paymentMethod');
    });

    it('should handle invalid payment method', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: 100, currency: 'USD', paymentMethod: null });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Payment processing failed');
      expect(res.body.message).toBe('Invalid payment method');
    });
  });
});