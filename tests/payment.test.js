const { processPayment } = require('../src/index');

describe('Payment Processing', () => {
  test('Successfully processes payment', async () => {
    const result = await processPayment(100, 'USD', 'credit_card');
    expect(result).toHaveProperty('id');
    expect(result.amount).toBe(100);
    expect(result.currency).toBe('USD');
    expect(result.paymentMethod).toBe('credit_card');
    expect(result.status).toBe('completed');
  });

  test('Handles gateway timeout with retries', async () => {
    // Mock simulateGatewayCall to always timeout
    jest.spyOn(global, 'simulateGatewayCall').mockImplementation(() => {
      throw new Error('Gateway timeout');
    });

    await expect(processPayment(100, 'USD', 'credit_card')).rejects.toThrow('Payment processing failed');

    // Verify that it attempted to retry
    expect(global.simulateGatewayCall).toHaveBeenCalledTimes(3);
  });
});