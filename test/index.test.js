const request = require('supertest');
const app = require('../src/index');

describe('Payment Service', () => {
  describe('POST /api/v1/payments', () => {
    it('should process a valid payment', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('paymentId');
      expect(response.body).toHaveProperty('amount', 100);
      expect(response.body).toHaveProperty('status', 'completed');
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: -100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle null values correctly', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: null,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
