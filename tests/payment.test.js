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
        status: 'completed'
      }
    };
    axios.post.mockResolvedValue(mockResponse);

    const result = await processPayment(100, 'USD', 'credit_card');

    expect(result.id).toBe('PAY-123');
    expect(result.status).toBe('completed');
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.paymentgateway.com/process',
      { amount: 100, currency: 'USD', paymentMethod: 'credit_card' },
      { timeout: 10000 }
    );
  });

  it('should handle payment gateway timeout', async () => {
    axios.post.mockRejectedValue({ code: 'ECONNABORTED' });

    await expect(processPayment(100, 'USD', 'credit_card')).rejects.toThrow('Payment gateway timeout');
  });

  it('should handle other payment processing errors', async () => {
    axios.post.mockRejectedValue(new Error('Unknown error'));

    await expect(processPayment(100, 'USD', 'credit_card')).rejects.toThrow('Payment processing failed');
  });
});