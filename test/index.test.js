const axios = require('axios');

// Mock the entire axios module
jest.mock('axios');

// Import the functions to test
const { processPayment, getPaymentStatus } = require('../src/index');

describe('Payment Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('processPayment', () => {
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

      const result = await processPayment(100, 'USD', 'credit_card');

      expect(result).toEqual(mockPaymentResponse.data);
      expect(axios.post).toHaveBeenCalledWith('/process-payment', {
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      }, expect.any(Object));
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
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

      axios.post
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Gateway timeout'))
        .mockResolvedValueOnce(mockPaymentResponse);

      const result = await processPayment(100, 'USD', 'credit_card');

      expect(result).toEqual(mockPaymentResponse.data);
      expect(axios.post).toHaveBeenCalledTimes(3);
    });

    it('should throw an error after max retries', async () => {
      axios.post.mockRejectedValue(new Error('Persistent error'));

      await expect(processPayment(100, 'USD', 'credit_card')).rejects.toThrow(
        'Payment processing failed after 3 attempts: Persistent error'
      );

      expect(axios.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('getPaymentStatus', () => {
    it('should retrieve payment status successfully', async () => {
      const mockPaymentStatus = {
        data: {
          id: 'test-payment-id',
          status: 'completed',
          amount: 100,
          currency: 'USD',
          timestamp: new Date().toISOString()
        }
      };

      axios.get.mockResolvedValue(mockPaymentStatus);

      const result = await getPaymentStatus('test-payment-id');

      expect(result).toEqual(mockPaymentStatus.data);
      expect(axios.get).toHaveBeenCalledWith('/payments/test-payment-id', expect.any(Object));
    });

    it('should return null for non-existent payment', async () => {
      axios.get.mockRejectedValue({ response: { status: 404 } });

      const result = await getPaymentStatus('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw an error for unexpected errors', async () => {
      axios.get.mockRejectedValue(new Error('Unexpected error'));

      await expect(getPaymentStatus('test-payment-id')).rejects.toThrow(
        'Failed to fetch payment status: Unexpected error'
      );
    });
  });
});