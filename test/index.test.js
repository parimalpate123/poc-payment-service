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

    it('should reject payment with invalid amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: -50,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid amount: must be a positive number');
    });

    it('should handle payment gateway timeout', async () => {
      // This test might be flaky due to the random nature of the simulation
      // You might need to run it multiple times to catch the timeout scenario
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });

      expect(response.statusCode).toBe(200).or(500);
      if (response.statusCode === 500) {
        expect(response.body).toHaveProperty('error', 'Payment processing failed');
      }
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should retrieve payment status', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-123456789');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', 'PAY-123456789');
      expect(response.body).toHaveProperty('status', 'completed');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'payment-service');
    });
  });
});