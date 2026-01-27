const request = require('supertest');
const app = require('../src/index');

describe('Payment Service', () => {
  test('POST /api/v1/payments - successful payment', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({ amount: 100, currency: 'USD', paymentMethod: 'credit_card' });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('paymentId');
    expect(response.body).toHaveProperty('amount', 100);
    expect(response.body).toHaveProperty('status', 'completed');
  });

  test('POST /api/v1/payments - invalid input', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({ amount: -100, currency: 'USD', paymentMethod: 'credit_card' });
    
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('error', 'Payment processing failed');
    expect(response.body.message).toContain('Invalid amount');
  });

  test('GET /api/v1/payments/:paymentId - successful retrieval', async () => {
    const paymentId = 'test-payment-id';
    const response = await request(app).get(`/api/v1/payments/${paymentId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', paymentId);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('amount');
    expect(response.body).toHaveProperty('currency');
  });

  test('GET /api/v1/payments/:paymentId - invalid payment ID', async () => {
    const response = await request(app).get('/api/v1/payments/invalid-id');
    
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('error', 'Failed to fetch payment status');
  });
});
