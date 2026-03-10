const request = require('supertest');
const app = require('../src/index');
const mysql = require('mysql2/promise');

jest.mock('mysql2/promise');

describe('Payment Service', () => {
  let mockPool;
  let mockConnection;

  beforeEach(() => {
    mockConnection = {
      beginTransaction: jest.fn().mockResolvedValue(),
      query: jest.fn(),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn()
    };
    mockPool = {
      getConnection: jest.fn().mockResolvedValue(mockConnection)
    };
    mysql.createPool.mockReturnValue(mockPool);
  });

  test('POST /api/v1/payments - successful payment', async () => {
    mockConnection.query.mockResolvedValueOnce([[{ insertId: 1 }]]);

    const response = await request(app)
      .post('/api/v1/payments')
      .send({ amount: 100, currency: 'USD', paymentMethod: 'credit_card' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('paymentId');
    expect(response.body.success).toBe(true);
  });

  test('POST /api/v1/payments - database timeout', async () => {
    mockPool.getConnection.mockRejectedValueOnce(new Error('Connection timeout'));
    mockPool.getConnection.mockRejectedValueOnce(new Error('Connection timeout'));
    mockPool.getConnection.mockRejectedValueOnce(new Error('Connection timeout'));

    const response = await request(app)
      .post('/api/v1/payments')
      .send({ amount: 100, currency: 'USD', paymentMethod: 'credit_card' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Payment processing failed');
  });

  test('GET /api/v1/payments/:paymentId - successful retrieval', async () => {
    mockConnection.query.mockResolvedValueOnce([[
      { id: 1, amount: 100, currency: 'USD', status: 'completed', created_at: new Date() }
    ]]);

    const response = await request(app).get('/api/v1/payments/PAY-1');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 'PAY-1');
  });

  test('GET /api/v1/payments/:paymentId - payment not found', async () => {
    mockConnection.query.mockResolvedValueOnce([[]]);

    const response = await request(app).get('/api/v1/payments/PAY-999');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Payment not found');
  });
});
