const request = require('supertest');
const axios = require('axios');
const retry = require('async-retry');
const app = require('../src/index');

jest.mock('axios');
jest.mock('async-retry');

describe('Payment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    retry.mockImplementation((fn) => fn());
  });

  describe('POST /api/v1/payments', () => {
    it('should process a payment successfully', async () => {
      const mockPaymentResponse = {
        data: {
          id: 'test-payment-id',
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card',
          status: 'completed',
          timestamp: new Date().toISOString()
        }
      };
      axios.post.mockResolvedValue(mockPaymentResponse);

      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('paymentId', 'test-payment-id');
      expect(response.body).toHaveProperty('amount', 100);
      expect(response.body).toHaveProperty('status', 'completed');
    });

    it('should handle payment processing errors', async () => {
      axios.post.mockRejectedValue(new Error('Payment gateway error'));

      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Payment processing failed');
    });

    it('should validate input parameters', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          // Missing currency and paymentMethod
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required fields: amount, currency, paymentMethod');
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should retrieve payment status successfully', async () => {
      const mockStatusResponse = {
        data: {
          id: 'test-payment-id',
          status: 'completed',
          amount: 100,
          currency: 'USD',
          timestamp: new Date().toISOString()
        }
      };
      axios.get.mockResolvedValue(mockStatusResponse);

      const response = await request(app).get('/api/v1/payments/test-payment-id');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'test-payment-id');
      expect(response.body).toHaveProperty('status', 'completed');
    });

    it('should handle payment not found', async () => {
      axios.get.mockRejectedValue({ response: { status: 404 } });

      const response = await request(app).get('/api/v1/payments/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Payment not found');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'payment-service');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});