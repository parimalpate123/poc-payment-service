const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');

describe('Payment Service', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/payments_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  it('should process a payment successfully', async () => {
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

  it('should retrieve payment status', async () => {
    // First, create a payment
    const createResponse = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 200,
        currency: 'EUR',
        paymentMethod: 'paypal'
      });

    const paymentId = createResponse.body.paymentId;

    // Then, retrieve its status
    const statusResponse = await request(app)
      .get(`/api/v1/payments/${paymentId}`);

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.id).toBe(paymentId);
    expect(statusResponse.body.amount).toBe(200);
    expect(statusResponse.body.currency).toBe('EUR');
    expect(statusResponse.body.status).toBe('completed');
  });

  it('should handle database connection timeout', async () => {
    // Simulate a database timeout by closing the connection
    await mongoose.connection.close();

    const response = await request(app)
      .post('/api/v1/payments')
      .send({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Payment processing failed');

    // Reconnect for other tests
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/payments_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });
});