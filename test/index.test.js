const request = require('supertest');
const app = require('../src/index');
const axios = require('axios');

jest.mock('axios');

describe('Payment Service', () => {
  it('should process a payment successfully', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });

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

  it('should handle rate limiting', async () => {
    // Simulate rate limit exceeded
    for (let i = 0; i < 101; i++) {
      await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
    }

    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      });

    expect(response.statusCode).toBe(429);
    expect(response.text).toContain('Too many requests');
  });

  it('should handle AI model API errors', async () => {
    axios.post.mockRejectedValue(new Error('AI model API error'));

    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      });

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Payment processing failed');
    expect(response.body.message).toContain('AI model API error');
  });
});