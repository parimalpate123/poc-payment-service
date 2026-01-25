const axios = require('axios');
const { processPayment } = require('../src/index');

jest.mock('axios');

describe('Payment Processing', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should process payment successfully', async () => {
    const mockResponse = {
      data: {
        id: 'PAY-123',
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card',
        status: 'completed',
        timestamp: '2023-06-01T12:00:00Z'
      }
    };
    axios.create.mockReturnValue({ post: jest.fn().mockResolvedValue(mockResponse) });

    const result = await processPayment(100, 'USD', 'credit_card');

    expect(result).toEqual(mockResponse.data);
  });

  it('should handle payment gateway timeout', async () => {
    axios.create.mockReturnValue({ post: jest.fn().mockRejectedValue({ request: {} }) });

    await expect(processPayment(100, 'USD', 'credit_card')).rejects.toThrow('Payment gateway timeout. Please try again.');
  });

  it('should handle payment gateway error response', async () => {
    const errorResponse = {
      response: {
        status: 400,
        data: { message: 'Invalid payment method' }
      }
    };
    axios.create.mockReturnValue({ post: jest.fn().mockRejectedValue(errorResponse) });

    await expect(processPayment(100, 'USD', 'invalid_method')).rejects.toThrow('Payment gateway error: 400 - Invalid payment method');
  });
});