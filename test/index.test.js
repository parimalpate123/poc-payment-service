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
        amount: -50,
        currency: 'INVALID',
        paymentMethod: 'unknown'
      });
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('error');
  });

  test('POST /api/v1/payments - simulated gateway timeout', async () => {
    jest.setTimeout(10000); // Increase timeout for this test
    const mockMath = Object.create(global.Math);
    mockMath.random = () => 0.05; // Force the 10% failure case
    global.Math = mockMath;

    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      });
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('error', 'Payment processing failed');
    expect(response.body.message).toContain('Gateway timeout');

    global.Math = Object.create(global.Math); // Restore original Math
  });
});
