const axios = require('axios');
const app = require('../src/index');
const request = require('supertest');

jest.mock('axios');

describe('Payment Processing', () => {
  it('should process payment successfully', async () => {
    const mockPaymentResponse = {
      data: {
        id: 'PAY-123',
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card',
        status: 'completed',
        timestamp: new Date().toISOString()
      }
    };

    axios.create.mockReturnValue({
      post: jest.fn().mockResolvedValue(mockPaymentResponse)
    });

    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      paymentId: 'PAY-123',
      amount: 100,
      status: 'completed'
    });
  });

  it('should handle payment gateway timeout', async () => {
    axios.create.mockReturnValue({
      post: jest.fn().mockRejectedValue(new Error('Request timed out'))
    });

    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Payment processing failed',
      message: 'Payment processing failed'
    });
  });
});