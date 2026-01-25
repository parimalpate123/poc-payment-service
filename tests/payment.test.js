const axios = require('axios');
const { processPayment } = require('../src/index');

jest.mock('axios');

describe('Payment Processing', () => {
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
    axios.post.mockResolvedValue(mockResponse);

    const result = await processPayment(100, 'USD', 'credit_card');

    expect(result).toEqual(mockResponse.data);
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.payment-gateway.com/process',
      { amount: 100, currency: 'USD', paymentMethod: 'credit_card' },
      expect.objectContaining({
        timeout: 30000,
        headers: expect.objectContaining({
          'Authorization': expect.stringMatching(/^Bearer /),
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('should handle payment gateway errors', async () => {
    const errorMessage = 'Payment gateway error';
    axios.post.mockRejectedValue(new Error(errorMessage));

    await expect(processPayment(100, 'USD', 'credit_card')).rejects.toThrow('Payment processing failed');
  });
});