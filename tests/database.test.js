const { Pool } = require('pg');
const { processPayment, getPaymentStatus } = require('../src/index');

jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('Database Connection Pool', () => {
  let pool;

  beforeEach(() => {
    pool = new Pool();
  });

  test('processPayment uses database connection correctly', async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);

    await processPayment(100, 'USD', 'credit_card');

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    expect(mockClient.release).toHaveBeenCalled();
  });

  test('getPaymentStatus fetches payment correctly', async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValue({ rows: [{ id: 'PAY-123', status: 'completed' }] }),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);

    const result = await getPaymentStatus('PAY-123');

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM payments WHERE id = $1', ['PAY-123']);
    expect(result).toEqual({ id: 'PAY-123', status: 'completed' });
    expect(mockClient.release).toHaveBeenCalled();
  });
});
