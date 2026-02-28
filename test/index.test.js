const request = require('supertest');
const app = require('../src/index');
const axios = require('axios');

jest.mock('axios');

describe('Payment Service', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(0, () => {
      const address = server.address();
      console.log(`Test server running on port ${address.port}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/v1/payments - successful payment', async () => {
    const mockPaymentResponse = {
      id: 'PAY-123',
      amount: 100,
      currency: 'USD',
      status: 'completed'
    };
    axios.post.mockResolvedValue({ data: mockPaymentResponse });

    const response = await request(server)
      .post('/api/v1/payments')
      .send({ amount: 100, currency: 'USD', paymentMethod: 'card' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      paymentId: 'PAY-123',
      amount: 100,
      status: 'completed'
    });
  });

  test('POST /api/v1/payments - payment gateway timeout', async () => {
    axios.post.mockRejectedValue({ request: {} });

    const response = await request(server)
      .post('/api/v1/payments')
      .send({ amount: 100, currency: 'USD', paymentMethod: 'card' });

    expect(response.status).toBe(504);
    expect(response.body).toEqual({
      error: 'Payment processing failed',
      message: 'Payment gateway timeout'
    });
  });

  test('GET /api/v1/payments/:paymentId - payment not found', async () => {
    const response = await request(server).get('/api/v1/payments/NON-EXISTENT');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Payment not found' });
  });
});