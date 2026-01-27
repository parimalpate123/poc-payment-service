const request = require('supertest');
const app = require('../src/index');

describe('Payment API', () => {
  it('should process a valid payment', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.paymentId).toBeDefined();
  });

  it('should reject payment with invalid amount', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 'invalid',
        currency: 'USD',
        paymentMethod: 'credit_card'
      });
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Payment processing failed');
    expect(res.body.message).toBe('Invalid amount');
  });

  it('should reject payment with unsupported currency', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'JPY',
        paymentMethod: 'credit_card'
      });
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Payment processing failed');
    expect(res.body.message).toBe('Unsupported currency');
  });

  it('should reject payment with unsupported payment method', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'bitcoin'
      });
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Payment processing failed');
    expect(res.body.message).toBe('Unsupported payment method');
  });
});