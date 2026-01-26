const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const app = require('../src/index');
const request = require('supertest');

describe('Payment Service Tests', () => {
  let mock;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  test('POST /api/v1/payments - successful payment', async () => {
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

  test('POST /api/v1/payments - payment gateway timeout', async () => {
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

  test('GET /api/v1/payments/:paymentId - successful status retrieval', async () => {
    const paymentId = 'PAY-123';
    const paymentData = {
      id: paymentId,
      status: 'completed',
      amount: 100,
      currency: 'USD',
      timestamp: new Date().toISOString()
    };

    mock.onGet(`https://api.payment-gateway.com/status/${paymentId}`).reply(200, paymentData);

    const response = await request(app).get(`/api/v1/payments/${paymentId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(paymentData);
  });

  test('GET /api/v1/payments/:paymentId - payment not found', async () => {
    const paymentId = 'PAY-NOT-FOUND';

    mock.onGet(`https://api.payment-gateway.com/status/${paymentId}`).reply(404);

    const response = await request(app).get(`/api/v1/payments/${paymentId}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Payment not found');
  });
});