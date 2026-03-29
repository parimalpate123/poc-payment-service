const request = require('supertest');
const app = require('../src/index');

describe('Payment Service', () => {
  describe('POST /api/v1/payments', () => {
    it('should process a valid payment', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('paymentId');
      expect(response.body).toHaveProperty('amount', 100.50);
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

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('error', 'Payment processing failed');
      expect(response.body).toHaveProperty('message', 'Invalid amount');
    });

    it('should reject payment with invalid currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'INVALID',
          paymentMethod: 'credit_card'
        });

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('error', 'Payment processing failed');
      expect(response.body).toHaveProperty('message', 'Invalid currency');
    });

    it('should reject payment with invalid payment method', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'invalid_method'
        });

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('error', 'Payment processing failed');
      expect(response.body).toHaveProperty('message', 'Invalid payment method');
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should retrieve payment status', async () => {
      const response = await request(app).get('/api/v1/payments/PAY-123456');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', 'PAY-123456');
      expect(response.body).toHaveProperty('status', 'completed');
      expect(response.body).toHaveProperty('amount', 100.00);
      expect(response.body).toHaveProperty('currency', 'USD');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'payment-service');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});