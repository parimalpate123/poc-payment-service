const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const app = require('../src/index');
const request = require('supertest');

describe('Payment Processing', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.restore();
  });

  it('should process payment successfully', async () => {
    const paymentData = {
      amount: 100,
      currency: 'USD',
      paymentMethod: 'card'
    };

    mock.onPost('https://api.payment-gateway.com/process').reply(200, {
      id: 'PAY-123',
      ...paymentData,
      status: 'completed',
      timestamp: new Date().toISOString()
    });

    const response = await request(app)
      .post('/api/v1/payments')
      .send(paymentData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.paymentId).toBe('PAY-123');
  });

  it('should handle payment gateway timeout', async () => {
    const paymentData = {
      amount: 100,
      currency: 'USD',
      paymentMethod: 'card'
    };

    mock.onPost('https://api.payment-gateway.com/process').timeout();

    const response = await request(app)
      .post('/api/v1/payments')
      .send(paymentData);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Payment processing failed');
    expect(response.body.message).toBe('Payment gateway timeout');
  });

  it('should handle card verification failure', async () => {
    const paymentData = {
      amount: 100,
      currency: 'USD',
      paymentMethod: 'invalid_card'
    };

    mock.onPost('https://api.payment-gateway.com/process').reply(400, {
      error: 'Card verification failed'
    });

    const response = await request(app)
      .post('/api/v1/payments')
      .send(paymentData);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Payment processing failed');
    expect(response.body.message).toBe('Invalid payment method or card verification failed');
  });
});