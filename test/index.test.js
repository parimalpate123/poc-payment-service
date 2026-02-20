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

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.paymentId).toBeDefined();
    expect(response.body.amount).toBe(100);
    expect(response.body.status).toBe('completed');
  });

  it('should handle invalid input', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: -100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Payment processing failed');
    expect(response.body.message).toBe('Payment processing failed: Invalid amount');
  });

  it('should handle missing required fields', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required fields: amount, currency, paymentMethod');
  });

  it('should get payment status', async () => {
    const response = await request(app)
      .get('/api/v1/payments/PAY-123456');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe('PAY-123456');
    expect(response.body.status).toBe('completed');
  });

  it('should return health check', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.service).toBe('payment-service');
  });
});