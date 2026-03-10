const request = require('supertest');
const app = require('../src/index');

describe('Payment Service', () => {
  it('should process payment successfully', async () => {
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

  it('should handle payment processing with retries on timeout', async () => {
    // This test relies on the 20% chance of timeout in processPayment
    // It may need multiple runs to trigger the retry scenario
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 200,
        currency: 'EUR',
        paymentMethod: 'paypal'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.paymentId).toBeDefined();
    expect(response.body.amount).toBe(200);
    expect(response.body.status).toBe('completed');
  });

  it('should get payment status successfully', async () => {
    const paymentId = 'PAY-123456789';
    const response = await request(app)
      .get(`/api/v1/payments/${paymentId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(paymentId);
    expect(response.body.status).toBe('completed');
    expect(response.body.amount).toBe(100.00);
    expect(response.body.currency).toBe('USD');
  });

  it('should handle payment status retrieval with retries on timeout', async () => {
    // This test relies on the 20% chance of timeout in getPaymentStatus
    // It may need multiple runs to trigger the retry scenario
    const paymentId = 'PAY-987654321';
    const response = await request(app)
      .get(`/api/v1/payments/${paymentId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(paymentId);
    expect(response.body.status).toBe('completed');
    expect(response.body.amount).toBe(100.00);
    expect(response.body.currency).toBe('USD');
  });
});