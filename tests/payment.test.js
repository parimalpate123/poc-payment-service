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

  it('should handle payment gateway errors', async () => {
    axios.create.mockReturnValue({ post: jest.fn().mockRejectedValue(new Error('Gateway error')) });

    await expect(processPayment(100, 'USD', 'credit_card')).rejects.toThrow('Payment processing failed: Gateway error');
  });
});
