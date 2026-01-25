const axios = require('axios');
const app = require('../src/index');
const request = require('supertest');

jest.mock('axios');

describe('Payment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/v1/payments - successful payment', async () => {
    const mockPaymentResponse = {
      data: {
        id: 'PAY-123',
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card',
        status: 'completed',
        timestamp: '2023-06-01T12:00:00Z'
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

  test('GET /api/v1/payments/:paymentId - fetch payment status', async () => {
    const mockStatusResponse = {
      data: {
        id: 'PAY-123',
        status: 'completed',
        amount: 100,
        currency: 'USD',
        timestamp: '2023-06-01T12:00:00Z'
      }
    };
    axios.create.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockStatusResponse)
    });

    const response = await request(app).get('/api/v1/payments/PAY-123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockStatusResponse.data);
  });

  test('Payment gateway timeout', async () => {
    axios.create.mockReturnValue({
      post: jest.fn().mockRejectedValue(new Error('Request timeout'))
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