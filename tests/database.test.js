const { Pool } = require('pg');
const { processPayment, getPaymentStatus } = require('../src/index');

jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe('Database Connection Tests', () => {
  let pool;

  beforeEach(() => {
    pool = new Pool();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('processPayment should handle database connection', async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValue({ rows: [{ id: 1 }] }),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);

    await processPayment(100, 'USD', 'credit_card');

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith('SELECT 1');
    expect(mockClient.release).toHaveBeenCalled();
  });

  test('getPaymentStatus should handle database query', async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValue({
        rows: [{ status: 'completed', amount: 100, currency: 'USD' }]
      }),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);

    const result = await getPaymentStatus('PAY-123');

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(
      'SELECT status, amount, currency FROM payments WHERE id = $1',
      ['PAY-123']
    );
    expect(mockClient.release).toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({
      id: 'PAY-123',
      status: 'completed',
      amount: 100,
      currency: 'USD'
    }));
  });

  test('getPaymentStatus should return null for non-existent payment', async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);

    const result = await getPaymentStatus('NON-EXISTENT');

    expect(result).toBeNull();
  });
});
