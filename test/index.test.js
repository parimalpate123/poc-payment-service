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

    it('should reject payment with invalid amount', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 'invalid',
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid amount');
    });

    it('should reject payment with invalid currency', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'INVALID',
          paymentMethod: 'credit_card'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid currency');
    });

    it('should reject payment with invalid payment method', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'invalid_method'
        });
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Payment processing failed');
      expect(res.body.message).toContain('Invalid payment method');
    });
  });
});
