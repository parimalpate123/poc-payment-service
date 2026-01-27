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
      expect(res.body.success).toBe(true);
      expect(res.body.paymentId).toBeDefined();
      expect(res.body.amount).toBe(100);
      expect(res.body.status).toBe('completed');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing required fields: amount, currency, paymentMethod');
    });

    it('should return 500 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 'invalid',
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Payment processing failed');
      expect(res.body.message).toBe('Invalid amount');
    });
  });
});
