const request = require('supertest');
const app = require('../src/index');
const mysql = require('mysql2/promise');

jest.mock('mysql2/promise');

describe('Payment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/v1/payments - successful payment', async () => {
    const mockExecute = jest.fn().mockResolvedValue([{ insertId: 1 }]);
    mysql.createPool.mockReturnValue({ execute: mockExecute });

    const response = await request(app)
      .post('/api/v1/payments')
      .send({ amount: 100, currency: 'USD', paymentMethod: 'credit_card' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('paymentId');
    expect(response.body.success).toBe(true);
    expect(mockExecute).toHaveBeenCalled();
  });

  test('GET /api/v1/payments/:paymentId - get payment status', async () => {
    const mockExecute = jest.fn().mockResolvedValue([[{
      id: 1,
      amount: 100,
      currency: 'USD',
      status: 'completed',
      created_at: new Date().toISOString()
    }]]);
    mysql.createPool.mockReturnValue({ execute: mockExecute });

    const response = await request(app).get('/api/v1/payments/1');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(mockExecute).toHaveBeenCalled();
  });

  test('Database connection timeout and retry', async () => {
    const mockExecute = jest.fn()
      .mockRejectedValueOnce({ code: 'ETIMEDOUT' })
      .mockRejectedValueOnce({ code: 'ETIMEDOUT' })
      .mockResolvedValueOnce([{ insertId: 1 }]);
    mysql.createPool.mockReturnValue({ execute: mockExecute });

    const response = await request(app)
      .post('/api/v1/payments')
      .send({ amount: 100, currency: 'USD', paymentMethod: 'credit_card' });

    expect(response.statusCode).toBe(200);
    expect(mockExecute).toHaveBeenCalledTimes(3);
  });
});