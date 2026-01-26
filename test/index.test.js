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
    mock.restore();
  });

  it('should process payment successfully', async () => {
    const paymentData = {
      amount: 100,
      currency: 'USD',
      paymentMethod: 'credit_card'
    };

    mock.onPost('https://api.payment-gateway.com/process-payment').reply(200, {
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

  it('should retry on payment gateway timeout', async () => {
    const paymentData = {
      amount: 100,
      currency: 'USD',
      paymentMethod: 'credit_card'
    };

    mock.onPost('https://api.payment-gateway.com/process-payment')
      .timeoutOnce()
      .replyOnce(500)
      .replyOnce(200, {
        id: 'PAY-456',
        ...paymentData,
        status: 'completed',
        timestamp: new Date().toISOString()
      });

    const response = await request(app)
      .post('/api/v1/payments')
      .send(paymentData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.paymentId).toBe('PAY-456');
  });

  it('should fail after max retries', async () => {
    const paymentData = {
      amount: 100,
      currency: 'USD',
      paymentMethod: 'credit_card'
    };

    mock.onPost('https://api.payment-gateway.com/process-payment').reply(500);

    const response = await request(app)
      .post('/api/v1/payments')
      .send(paymentData);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Payment processing failed');
  });
});