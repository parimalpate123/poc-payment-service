const axios = require('axios');
const app = require('../src/index');
const request = require('supertest');

jest.mock('axios');

describe('Payment Service', () => {
  it('should process payment successfully when order data is valid', async () => {
    axios.get.mockResolvedValue({ data: { id: 'ORDER-123' } });

    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: { type: 'credit_card', orderId: 'ORDER-123' }
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.orderId).toBe('ORDER-123');
  });

  it('should handle null order data from OrderService API', async () => {
    axios.get.mockResolvedValue({ data: null });

    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: { type: 'credit_card', orderId: 'ORDER-123' }
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Payment processing failed');
  });

  it('should handle network timeout with OrderService API', async () => {
    axios.get.mockRejectedValue(new Error('Network timeout'));

    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: { type: 'credit_card', orderId: 'ORDER-123' }
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Payment processing failed');
  });
});