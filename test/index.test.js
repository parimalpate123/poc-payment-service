const request = require('supertest');
const app = require('../src/index');
const { Pool } = require('pg');

jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('Payment Service', () => {
  let pool;

  beforeEach(() => {
    pool = new Pool();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/payments', () => {
    it('should process a payment successfully', async () => {
      const mockPayment = {
        id: 1,
        amount: 100,
        currency: 'USD',
        payment_method: 'credit_card',
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      pool.connect.mockResolvedValue({
        query: jest.fn().mockResolvedValueOnce({ rows: [mockPayment] }),
        release: jest.fn(),
      });

      const response = await request(app)
        .post('/api/v1/payments')
        .send({ amount: 100, currency: 'USD', paymentMethod: 'credit_card' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        paymentId: mockPayment.id,
        amount: mockPayment.amount,
        status: mockPayment.status,
      });
    });

    it('should handle database connection timeout', async () => {
      pool.connect.mockRejectedValue(new Error('Connection timeout'));

      const response = await request(app)
        .post('/api/v1/payments')
        .send({ amount: 100, currency: 'USD', paymentMethod: 'credit_card' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Payment processing failed');
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should retrieve payment status successfully', async () => {
      const mockPayment = {
        id: 1,
        amount: 100,
        currency: 'USD',
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      pool.connect.mockResolvedValue({
        query: jest.fn().mockResolvedValueOnce({ rows: [mockPayment] }),
        release: jest.fn(),
      });

      const response = await request(app).get('/api/v1/payments/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPayment);
    });

    it('should handle payment not found', async () => {
      pool.connect.mockResolvedValue({
        query: jest.fn().mockResolvedValueOnce({ rows: [] }),
        release: jest.fn(),
      });

      const response = await request(app).get('/api/v1/payments/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Payment not found');
    });
  });
});