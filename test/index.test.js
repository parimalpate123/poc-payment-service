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

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('paymentId');
      expect(response.body).toHaveProperty('amount', 100);
      expect(response.body).toHaveProperty('status', 'completed');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields: amount, currency, paymentMethod');
    });

    it('should handle invalid input', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: -100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Payment processing failed');
      expect(response.body).toHaveProperty('message', 'Invalid amount');
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should retrieve a payment status', async () => {
      // First, create a payment
      const createResponse = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 200,
          currency: 'EUR',
          paymentMethod: 'paypal'
        });

      const paymentId = createResponse.body.paymentId;

      // Then, retrieve its status
      const response = await request(app)
        .get(`/api/v1/payments/${paymentId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', paymentId);
      expect(response.body).toHaveProperty('amount', 200);
      expect(response.body).toHaveProperty('currency', 'EUR');
      expect(response.body).toHaveProperty('paymentMethod', 'paypal');
      expect(response.body).toHaveProperty('status', 'completed');
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/v1/payments/NON_EXISTENT_ID');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Payment not found');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'payment-service');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});