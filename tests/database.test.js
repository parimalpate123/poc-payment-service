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

  test('processPayment uses and releases database connection', async () => {
    const mockClient = { release: jest.fn() };
    pool.connect.mockResolvedValue(mockClient);

    await processPayment(100, 'USD', 'credit_card');

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.release).toHaveBeenCalled();
  });

  test('getPaymentStatus uses and releases database connection', async () => {
    const mockClient = { release: jest.fn() };
    pool.connect.mockResolvedValue(mockClient);

    await getPaymentStatus('PAY-123456789');

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.release).toHaveBeenCalled();
  });
});
