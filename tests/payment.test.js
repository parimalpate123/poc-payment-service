const { processPayment } = require('../src/index');

describe('Payment Processing', () => {
  test('should process payment successfully', async () => {
    const result = await processPayment(100, 'USD', 'credit_card');
    expect(result).toHaveProperty('id');
    expect(result.status).toBe('completed');
  });

  test('should retry on temporary failures', async () => {
    // Mock fetch to fail twice then succeed
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('Timeout'))
      .mockRejectedValueOnce(new Error('Server Error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'TEST-123', status: 'completed' })
      });

    const result = await processPayment(200, 'EUR', 'paypal');
    expect(result).toHaveProperty('id', 'TEST-123');
    expect(result.status).toBe('completed');
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  test('should throw error after max retries', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Gateway Unavailable'));

    await expect(processPayment(300, 'GBP', 'bank_transfer'))
      .rejects
      .toThrow('Payment processing failed after multiple attempts');

    expect(fetch).toHaveBeenCalledTimes(3);
  });
});