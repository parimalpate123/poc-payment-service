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

  test('POST /api/v1/payments - missing fields', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100
      });
    
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Missing required fields: amount, currency, paymentMethod');
  });

  test('GET /api/v1/payments/:paymentId - successful retrieval', async () => {
    const paymentId = 'TEST-123';
    const response = await request(app).get(`/api/v1/payments/${paymentId}`);
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', paymentId);
    expect(response.body).toHaveProperty('status', 'completed');
  });

  test('GET /health - health check', async () => {
    const response = await request(app).get('/health');
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('service', 'payment-service');
  });
});