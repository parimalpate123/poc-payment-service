const request = require('supertest');
const app = require('../src/index');

describe('Payment Service', () => {
  test('Health check returns 200', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('healthy');
  });

  test('Process payment returns 200 for valid input', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.paymentId).toBeDefined();
  });

  test('Process payment returns 400 for invalid input', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Missing required fields: amount, currency, paymentMethod');
  });

  test('Get payment status returns 200 for existing payment', async () => {
    const paymentId = 'PAY-123456789';
    const response = await request(app).get(`/api/v1/payments/${paymentId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(paymentId);
    expect(response.body.status).toBe('completed');
  });
});
