const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const app = require('../src/index');
const request = require('supertest');

describe('Payment Service', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it('should process payment successfully when OrderService returns valid data', async () => {
    mock.onGet('http://order-service:8080/api/orders/123').reply(200, { id: '123', total: 100 });

    const response = await request(app)
      .post('/api/v1/payments')
      .send({ amount: 100, currency: 'USD', paymentMethod: { type: 'credit_card', orderId: '123' } });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.orderId).toBe('123');
  });

  it('should handle null response from OrderService', async () => {
    mock.onGet('http://order-service:8080/api/orders/456').reply(200, null);

    const response = await request(app)
      .post('/api/v1/payments')
      .send({ amount: 100, currency: 'USD', paymentMethod: { type: 'credit_card', orderId: '456' } });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Payment processing failed');
  });

  it('should handle timeout from OrderService', async () => {
    mock.onGet('http://order-service:8080/api/orders/789').timeout();

    const response = await request(app)
      .post('/api/v1/payments')
      .send({ amount: 100, currency: 'USD', paymentMethod: { type: 'credit_card', orderId: '789' } });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Payment processing failed');
  });
});