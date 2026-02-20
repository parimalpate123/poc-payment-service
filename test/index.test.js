const app = require('../src/index');
const axios = require('axios');

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

      const req = {
        body: {
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await app._router.handle(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        paymentId: 'test-payment-id',
        amount: 100,
        status: 'completed'
      });
    });

    it('should handle payment processing failure', async () => {
      axios.post.mockRejectedValue(new Error('Payment gateway error'));

      const req = {
        body: {
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await app._router.handle(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Payment processing failed',
        message: expect.any(String)
      });
    });

    it('should handle missing required fields', async () => {
      const req = {
        body: {
          amount: 100
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await app._router.handle(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required fields: amount, currency, paymentMethod'
      });
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

      const req = {
        params: { paymentId: 'test-payment-id' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await app._router.handle(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStatusResponse.data);
    });

    it('should handle payment status retrieval failure', async () => {
      axios.get.mockRejectedValue(new Error('Status retrieval error'));

      const req = {
        params: { paymentId: 'test-payment-id' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await app._router.handle(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch payment status',
        message: expect.any(String)
      });
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await app._router.handle(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'healthy',
        service: 'payment-service',
        timestamp: expect.any(String)
      });
    });
  });
});