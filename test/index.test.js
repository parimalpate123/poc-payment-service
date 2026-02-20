const { handler } = require('../src/index');

describe('Lambda handler', () => {
  test('processes a valid payment request', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/api/v1/payments',
      body: JSON.stringify({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      })
    };
    const context = {
      succeed: jest.fn()
    };

    await handler(event, context);

    expect(context.succeed).toHaveBeenCalledWith({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('"success":true')
    });
  });

  test('handles missing required fields', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/api/v1/payments',
      body: JSON.stringify({
        amount: 100
      })
    };
    const context = {
      succeed: jest.fn()
    };

    await handler(event, context);

    expect(context.succeed).toHaveBeenCalledWith({
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('"error":"Missing required fields')
    });
  });

  test('handles GET request for payment status', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/api/v1/payments/PAY-123456',
      pathParameters: {
        paymentId: 'PAY-123456'
      }
    };
    const context = {
      succeed: jest.fn()
    };

    await handler(event, context);

    expect(context.succeed).toHaveBeenCalledWith({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('"id":"PAY-123456"')
    });
  });
});