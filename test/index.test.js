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
      expect(res.body.amount).toBe(100);
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
      expect(res.body.error).toContain('Invalid amount');
    });

    it('should reject payment with missing currency', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          paymentMethod: 'credit_card'
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Invalid currency');
    });

    it('should reject payment with empty paymentMethod', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: ''
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Invalid paymentMethod');
    });
  });
});
