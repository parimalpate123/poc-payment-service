const { handler } = require('../src/index');

describe('Payment Service Lambda Handler', () => {
  test('POST /api/v1/payments - successful payment', async () => {
    const event = {
      path: '/api/v1/payments',
      httpMethod: 'POST',
      body: JSON.stringify({
        amount: 100,
        currency: 'USD',
        paymentMethod: 'credit_card'
      })
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.paymentId).toBeDefined();
    expect(body.amount).toBe(100);
    expect(body.status).toBe('completed');
  });

  test('POST /api/v1/payments - missing fields', async () => {
    const event = {
      path: '/api/v1/payments',
      httpMethod: 'POST',
      body: JSON.stringify({
        amount: 100
      })
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Missing required fields: amount, currency, paymentMethod');
  });

  test('GET /api/v1/payments/:paymentId - get payment status', async () => {
    const event = {
      path: '/api/v1/payments/PAY-123456',
      httpMethod: 'GET'
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.id).toBe('PAY-123456');
    expect(body.status).toBe('completed');
  });

  test('GET /health - health check', async () => {
    const event = {
      path: '/health',
      httpMethod: 'GET'
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('healthy');
    expect(body.service).toBe('payment-service');
  });

  test('Unknown route - 404 Not Found', async () => {
    const event = {
      path: '/unknown',
      httpMethod: 'GET'
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Not Found');
  });
});