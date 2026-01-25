const { processPayment } = require('../src/index');

describe('Payment Processing', () => {
  test('Successfully processes payment', async () => {
    const result = await processPayment(100, 'USD', 'credit_card');
    expect(result).toHaveProperty('id');
    expect(result.status).toBe('completed');
  });

  test('Handles payment gateway timeout', async () => {
    // Mock Math.random to always return 1 (simulating failure)
    const mockMath = Object.create(global.Math);
    mockMath.random = () => 1;
    global.Math = mockMath;

    await expect(processPayment(100, 'USD', 'credit_card'))
      .rejects
      .toThrow('Payment processing failed after multiple attempts');

    // Restore original Math
    global.Math = Object.create(global.Math);
  });
});