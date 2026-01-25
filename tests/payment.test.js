const axios = require('axios');
const { processPayment } = require('../src/index');

jest.mock('axios');

describe('Payment Processing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successful payment processing', async () => {
    axios.post.mockResolvedValue({
      data: { id: 'TEST-123', status: 'completed' }
    });

    const result = await processPayment(100, 'USD', 'credit_card');

    expect(result).toEqual(expect.objectContaining({
      id: 'TEST-123',
      amount: 100,
      currency: 'USD',
      paymentMethod: 'credit_card',
      status: 'completed'
    }));
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  test('payment processing with retries', async () => {
    axios.post
      .mockRejectedValueOnce(new Error('Gateway timeout'))
      .mockRejectedValueOnce(new Error('Gateway timeout'))
      .mockResolvedValueOnce({ data: { id: 'TEST-456', status: 'completed' } });

    const result = await processPayment(200, 'EUR', 'paypal');

    expect(result).toEqual(expect.objectContaining({
      id: 'TEST-456',
      amount: 200,
      currency: 'EUR',
      paymentMethod: 'paypal',
      status: 'completed'
    }));
    expect(axios.post).toHaveBeenCalledTimes(3);
  });

  test('payment processing failure after max retries', async () => {
    axios.post.mockRejectedValue(new Error('Gateway timeout'));

    await expect(processPayment(300, 'GBP', 'bank_transfer'))
      .rejects
      .toThrow('Payment processing failed after multiple attempts');

    expect(axios.post).toHaveBeenCalledTimes(3);
  });
});