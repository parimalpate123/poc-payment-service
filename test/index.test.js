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
        amount: 'invalid',
        currency: 'USD',
        paymentMethod: 'credit_card'
      });
    
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('error', 'Payment processing failed');
  });

  test('GET /api/v1/payments/:paymentId - successful retrieval', async () => {
    const response = await request(app)
      .get('/api/v1/payments/PAY-123456789');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', 'PAY-123456789');
    expect(response.body).toHaveProperty('status', 'completed');
  });

  test('GET /health - health check', async () => {
    const response = await request(app)
      .get('/health');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('service', 'payment-service');
  });
});