const axios = require('axios');
const request = require('supertest');
const {
  processPayment,
  getPaymentStatus,
  isRetryableError,
  createApp
} = require('../src/index');

jest.mock('axios');

describe('Payment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
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

      const result = await processPayment(100, 'USD', 'credit_card');

      expect(result).toEqual({
        id: 'test-payment-id',
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card',
        status: 'completed',
        timestamp: expect.any(String)
      });
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const error = new Error('Network error');
      error.code = 'ECONNABORTED';
      axios.post.mockRejectedValueOnce(error);
      axios.post.mockResolvedValueOnce({
        data: {
          id: 'test-payment-id',
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card',
          status: 'completed'
        }
      });

      const result = await processPayment(100, 'USD', 'credit_card');

      expect(axios.post).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('id', 'test-payment-id');
    });

    it('should throw an error after max retries', async () => {
      const error = new Error('Network error');
      error.code = 'ECONNABORTED';
      axios.post.mockRejectedValue(error);

      await expect(processPayment(100, 'USD', 'credit_card')).rejects.toThrow('Payment processing failed');
      expect(axios.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('getPaymentStatus', () => {
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

      const result = await getPaymentStatus('test-payment-id');

      expect(result).toEqual(mockStatusResponse.data);
    });

    it('should throw an error on failed status retrieval', async () => {
      axios.get.mockRejectedValue(new Error('Status retrieval error'));

      await expect(getPaymentStatus('test-payment-id')).rejects.toThrow('Failed to fetch payment status');
    });
  });

  describe('isRetryableError', () => {
    it('should return true for connection timeout', () => {
      const error = new Error('Connection timeout');
      error.code = 'ECONNABORTED';
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for 500 server errors', () => {
      const error = new Error('Server error');
      error.response = { status: 500 };
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new Error('Bad request');
      error.response = { status: 400 };
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('Express app', () => {
    let app;

    beforeEach(() => {
      app = createApp();
    });

    it('should have a health check endpoint', async () => {
      const response = await request(app).get('/health');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        status: 'healthy',
        service: 'payment-service',
        timestamp: expect.any(String)
      });
    });
  });
});