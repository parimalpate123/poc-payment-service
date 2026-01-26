const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const app = require('../src/index');
const request = require('supertest');

describe('Payment Service', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it('should process payment successfully', async () => {
    const paymentData = {
      id: 'PAY-123',
      amount: 100,
      currency: 'USD',
      paymentMethod: 'card',
      status: 'completed',
      timestamp: new Date().toISOString()
    };

    mock.onPost('https://api.payment-gateway.com/process').reply(200, paymentData);

    const response = await request(app)
      .post('/api/v1/payments')
      .send({ amount: 100, currency: 'USD', paymentMethod: 'card' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      paymentId: 'PAY-123',
      amount: 100,
      status: 'completed'
    });
  });

  it('should handle payment gateway timeout', async () => {
    mock.onPost('https://api.payment-gateway.com/process').timeout();

    const response = await request(app)
      .post('/api/v1/payments')
      .send({ amount: 100, currency: 'USD', paymentMethod: 'card' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Payment processing failed');
    expect(response.body.message).toBe('Payment gateway timeout');
  });

  it('should get payment status successfully', async () => {
    const paymentData = {
      id: 'PAY-123',
      status: 'completed',
      amount: 100,
      currency: 'USD',
      timestamp: new Date().toISOString()
    };

    mock.onGet('https://api.payment-gateway.com/status/PAY-123').reply(200, paymentData);

    const response = await request(app).get('/api/v1/payments/PAY-123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(paymentData);
  });

  it('should handle payment not found', async () => {
    mock.onGet('https://api.payment-gateway.com/status/PAY-404').reply(404);

    const response = await request(app).get('/api/v1/payments/PAY-404');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Payment not found');
  });
});
