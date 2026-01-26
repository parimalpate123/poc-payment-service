const axios = require('axios');
const app = require('../src/index');
const request = require('supertest');

jest.mock('axios');

describe('Payment Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process payment successfully', async () => {
    const mockResponse = {
      data: {
        id: 'PAY-123',
        amount: 100,
        currency: 'USD',
        paymentMethod: 'card',
        status: 'completed',
        timestamp: new Date().toISOString()
      }
    };
    axios.post.mockResolvedValue(mockResponse);

    const response = await request(app)
      .post('/api/v1/payments')
      .send({ amount: 100, currency: 'USD', paymentMethod: 'card' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('paymentId', 'PAY-123');
    expect(response.body).toHaveProperty('status', 'completed');
  });

  it('should handle payment gateway timeout and retry', async () => {
    axios.post.mockRejectedValueOnce(new Error('Gateway Timeout'))
             .mockRejectedValueOnce(new Error('Gateway Timeout'))
             .mockResolvedValueOnce({
               data: {
                 id: 'PAY-456',
                 amount: 200,
                 currency: 'EUR',
                 paymentMethod: 'card',
                 status: 'completed',
                 timestamp: new Date().toISOString()
               }
             });

    const response = await request(app)
      .post('/api/v1/payments')
      .send({ amount: 200, currency: 'EUR', paymentMethod: 'card' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('paymentId', 'PAY-456');
    expect(response.body).toHaveProperty('status', 'completed');
    expect(axios.post).toHaveBeenCalledTimes(3);
  });

  it('should fail after max retries', async () => {
    axios.post.mockRejectedValue(new Error('Gateway Timeout'));

    const response = await request(app)
      .post('/api/v1/payments')
      .send({ amount: 300, currency: 'GBP', paymentMethod: 'card' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Payment processing failed');
    expect(axios.post).toHaveBeenCalledTimes(3);
  });
});