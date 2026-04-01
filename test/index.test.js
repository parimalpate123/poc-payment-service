const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');

describe('Payment Service', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payments_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  it('should process a payment successfully', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.paymentId).toBeDefined();
    expect(res.body.amount).toBe(100);
    expect(res.body.status).toBe('completed');
  });

  it('should retrieve payment status', async () => {
    const createRes = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 200,
        currency: 'EUR',
        paymentMethod: 'paypal'
      });

    const paymentId = createRes.body.paymentId;

    const res = await request(app)
      .get(`/api/v1/payments/${paymentId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(paymentId);
    expect(res.body.amount).toBe(200);
    expect(res.body.currency).toBe('EUR');
    expect(res.body.paymentMethod).toBe('paypal');
    expect(res.body.status).toBe('completed');
  });

  it('should handle missing payment fields', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Missing required fields: amount, currency, paymentMethod');
  });

  it('should handle non-existent payment', async () => {
    const res = await request(app)
      .get('/api/v1/payments/nonexistentid');

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Payment not found');
  });
});