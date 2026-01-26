const request = require('supertest');
const nock = require('nock');
const app = require('../src/index');

describe('Payment Service', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  it('should process a payment successfully', async () => {
    const mockPayment = {
      id: 'PAY-123',
      amount: 100,
      currency: 'USD',
      paymentMethod: 'card',
      status: 'completed',
      timestamp: new Date().toISOString()
    };

    nock('https://api.payment-gateway.com')
      .post('/process')
      .reply(200, mockPayment);

    const res = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'card'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      paymentId: 'PAY-123',
      amount: 100,
      status: 'completed'
    });
  });

  it('should handle payment gateway timeout', async () => {
    nock('https://api.payment-gateway.com')
      .post('/process')
      .delayConnection(31000) // Delay longer than our 30s timeout
      .reply(200, {});

    const res = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'card'
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Payment processing failed');
    expect(res.body.message).toBe('Payment gateway timeout');
  });

  it('should get payment status', async () => {
    const mockStatus = {
      id: 'PAY-123',
      status: 'completed',
      amount: 100,
      currency: 'USD',
      timestamp: new Date().toISOString()
    };

    nock('https://api.payment-gateway.com')
      .get('/status/PAY-123')
      .reply(200, mockStatus);

    const res = await request(app)
      .get('/api/v1/payments/PAY-123');

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject(mockStatus);
  });

  it('should handle payment not found', async () => {
    nock('https://api.payment-gateway.com')
      .get('/status/PAY-NOT-FOUND')
      .reply(404);

    const res = await request(app)
      .get('/api/v1/payments/PAY-NOT-FOUND');

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Payment not found');
  });
});