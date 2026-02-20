const request = require('supertest');
const axios = require('axios');
const app = require('../src/index');

jest.mock('axios');

describe('Payment Service', () => {
  describe('POST /api/v1/payments', () => {
    it('should process a payment successfully', async () => {
      const mockPaymentResponse = {
        data: {
          id: 'test-payment-id',
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card',
          status: 'completed'
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

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('paymentId', 'test-payment-id');
      expect(response.body).toHaveProperty('amount', 100);
      expect(response.body).toHaveProperty('status', 'completed');
    });

    it('should handle payment gateway errors', async () => {
      axios.post.mockRejectedValue({
        response: {
          data: { message: 'Payment declined' }
        }
      });

      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('error', 'Payment processing failed');
      expect(response.body).toHaveProperty('message', 'Payment gateway error: Payment declined');
    });

    it('should handle payment gateway timeouts', async () => {
      axios.post.mockRejectedValue({
        request: {}
      });

      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('error', 'Payment processing failed');
      expect(response.body).toHaveProperty('message', 'Payment gateway timeout');
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should retrieve payment status successfully', async () => {
      const mockStatusResponse = {
        data: {
          id: 'test-payment-id',
          status: 'completed',
          amount: 100,
          currency: 'USD'
        }
      };
      axios.get.mockResolvedValue(mockStatusResponse);

      const response = await request(app)
        .get('/api/v1/payments/test-payment-id');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', 'test-payment-id');
      expect(response.body).toHaveProperty('status', 'completed');
      expect(response.body).toHaveProperty('amount', 100);
      expect(response.body).toHaveProperty('currency', 'USD');
    });

    it('should handle payment not found', async () => {
      axios.get.mockRejectedValue({
        response: { status: 404 }
      });

      const response = await request(app)
        .get('/api/v1/payments/non-existent-id');

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('error', 'Payment not found');
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