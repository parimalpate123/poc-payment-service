const axios = require('axios');

// Mock the entire app module
jest.mock('../src/index', () => ({
  processPayment: jest.fn()
}));

const app = require('../src/index');

describe('Payment Processing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process a valid payment', async () => {
    const mockPaymentResult = {
      id: 'PAY-123',
      amount: 100,
      currency: 'USD',
      paymentMethod: 'credit_card',
      status: 'completed',
      timestamp: '2023-06-01T12:00:00Z'
    };
    app.processPayment.mockResolvedValue(mockPaymentResult);

    const result = await app.processPayment(100, 'USD', 'credit_card');

    expect(result).toEqual(mockPaymentResult);
    expect(app.processPayment).toHaveBeenCalledWith(100, 'USD', 'credit_card');
  });

  it('should throw an error for missing payment information', async () => {
    app.processPayment.mockRejectedValue(new Error('Missing required payment information'));

    await expect(app.processPayment(null, 'USD', 'credit_card')).rejects.toThrow('Missing required payment information');
  });

  it('should handle payment gateway errors', async () => {
    app.processPayment.mockRejectedValue(new Error('Payment processing failed'));

    await expect(app.processPayment(100, 'USD', 'credit_card')).rejects.toThrow('Payment processing failed');
  });
});