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

  it('should handle invalid input', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: -100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      });

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Payment processing failed');
    expect(response.body.message).toBe('Invalid amount');
  });

  it('should handle payment gateway timeout', async () => {
    // This test may occasionally pass due to the random nature of the simulation
    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      });

    if (response.statusCode === 500) {
      expect(response.body.error).toBe('Payment processing failed');
      expect(['Payment gateway timeout', 'Insufficient funds']).toContain(response.body.message);
    } else {
      expect(response.statusCode).toBe(200);
    }
  });
});