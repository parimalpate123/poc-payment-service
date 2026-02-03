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
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.amount).toBe(100.50);
      expect(response.body.status).toBe('completed');
    });

    it('should handle null amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: null,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });

      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBe('Payment processing failed');
      expect(response.body.message).toBe('Invalid amount');
    });

    it('should handle undefined currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          paymentMethod: 'credit_card'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Missing required fields: amount, currency, paymentMethod');
    });

    it('should handle empty string paymentMethod', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: ''
        });

      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBe('Payment processing failed');
      expect(response.body.message).toBe('Invalid payment method');
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should retrieve payment status', async () => {
      const response = await request(app).get('/api/v1/payments/PAY-123456');

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe('PAY-123456');
      expect(response.body.status).toBe('completed');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('payment-service');
    });
  });
});