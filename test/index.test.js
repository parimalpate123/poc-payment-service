const request = require('supertest');
const app = require('../src/index');

describe('Payment Service', () => {
  test('POST /api/v1/payments - successful payment', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('paymentId');
    expect(response.body).toHaveProperty('amount', 100);
    expect(response.body).toHaveProperty('status', 'completed');
  });

  test('POST /api/v1/payments - invalid input', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: -100,
        currency: 'INVALID',
        paymentMethod: 'unknown'
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('POST /api/v1/payments - simulated timeout', async () => {
    jest.setTimeout(10000);
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      });
    expect(response.statusCode).toBe(200).or(500);
  }, 10000);
});
