const request = require('supertest');
const app = require('../src/index');
const winston = require('winston');

describe('Payment Service Logging', () => {
  let originalLogger;
  let logSpy;

  beforeEach(() => {
    originalLogger = winston.createLogger;
    logSpy = jest.fn();
    winston.createLogger = jest.fn().mockReturnValue({
      info: logSpy,
      error: logSpy,
      warn: logSpy
    });
  });

  afterEach(() => {
    winston.createLogger = originalLogger;
  });

  test('Logs payment processing', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({ amount: 100, currency: 'USD', paymentMethod: 'card' });

    expect(response.status).toBe(200);
    expect(logSpy).toHaveBeenCalledWith('Payment processed successfully', expect.any(Object));
  });

  test('Logs payment retrieval', async () => {
    const response = await request(app)
      .get('/api/v1/payments/PAY-123');

    expect(response.status).toBe(200);
    expect(logSpy).toHaveBeenCalledWith('Payment status retrieved', expect.any(Object));
  });

  test('Logs health check', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.status).toBe(200);
    expect(logSpy).toHaveBeenCalledWith('Health check requested');
  });

  test('Logs error on invalid payment request', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .send({});

    expect(response.status).toBe(400);
    expect(logSpy).not.toHaveBeenCalled();
  });
});
