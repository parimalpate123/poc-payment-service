const request = require('supertest');
const app = require('../src/index');

describe('Payment Service', () => {
  it('should process a valid payment', async () => {
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
    expect(response.body.amount).toBe(100);
    expect(response.body.status).toBe('completed');
  });

  it('should handle missing required fields', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Missing required fields: amount, currency, paymentMethod');
  });

  it('should handle null values', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: null,
        currency: 'USD',
        paymentMethod: 'credit_card'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Missing required fields: amount, currency, paymentMethod');
  });
});