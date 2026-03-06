const request = require('supertest');
const app = require('../src/index');
const axios = require('axios');

jest.mock('axios');

describe('Payment Service', () => {
  describe('POST /api/v1/payments', () => {
    it('should process a payment successfully', async () => {
      const mockPaymentResponse = {
        data: {
          id: 'PAY-123',
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
      expect(response.body).toHaveProperty('paymentId', 'PAY-123');
      expect(response.body).toHaveProperty('status', 'completed');
    });

    it('should handle payment gateway timeout', async () => {
      axios.post.mockRejectedValue({ code: 'ECONNABORTED' });

      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Payment processing failed');
      expect(response.body).toHaveProperty('message', 'Payment gateway timeout');
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should retrieve payment status successfully', async () => {
      const mockStatusResponse = {
        data: {
          id: 'PAY-123',
          status: 'completed',
          amount: 100,
          currency: 'USD',
          timestamp: new Date().toISOString()
        }
      };
      axios.get.mockResolvedValue(mockStatusResponse);

      const response = await request(app).get('/api/v1/payments/PAY-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'PAY-123');
      expect(response.body).toHaveProperty('status', 'completed');
    });

    it('should handle payment not found', async () => {
      axios.get.mockRejectedValue({ response: { status: 404 } });

      const response = await request(app).get('/api/v1/payments/PAY-999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Payment not found');
    });
  });
});
