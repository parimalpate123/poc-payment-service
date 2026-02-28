const request = require('supertest');
const app = require('../src/index');

describe('Payment Service', () => {
  test('Health check endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
  });

  test('Process payment endpoint', async () => {
    const paymentData = {
      amount: 100,
      currency: 'USD',
      paymentMethod: 'credit_card'
    };
    const response = await request(app)
      .post('/api/v1/payments')
      .send(paymentData);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('paymentId');
  });

  test('Get payment status endpoint', async () => {
    const paymentId = 'PAY-123456789';
    const response = await request(app).get(`/api/v1/payments/${paymentId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', paymentId);
    expect(response.body).toHaveProperty('status');
  });

  test('Invalid payment request', async () => {
    const invalidPaymentData = {
      amount: 100
      // Missing currency and paymentMethod
    };
    const response = await request(app)
      .post('/api/v1/payments')
      .send(invalidPaymentData);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});