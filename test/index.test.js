/**
 * Unit tests for Payment Service Lambda Handler
 * Tests initialization, Lambda invocation, and error handling
 */

// Set Lambda environment before requiring the module
process.env.LAMBDA_TASK_ROOT = '/var/task';

const paymentService = require('../src/index');
const { handler } = paymentService;

describe('Payment Service Lambda Handler', () => {
  test('handler should be defined and exported', () => {
    expect(handler).toBeDefined();
    expect(typeof handler).toBe('function');
  });

  test('handler should process health check endpoint', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/health',
      headers: {},
      body: null,
      requestContext: {}
    };
    
    const context = {
      requestId: 'test-request-health',
      functionName: 'payment-service',
      awsRequestId: 'test-aws-123'
    };

    const result = await handler(event, context);
    
    expect(result).toBeDefined();
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.status).toBe('healthy');
    expect(body.service).toBe('payment-service');
  });

  test('handler should process payment creation', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/api/v1/payments',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 100.00,
        currency: 'USD',
        paymentMethod: 'credit_card'
      }),
      requestContext: {}
    };
    
    const context = {
      requestId: 'test-request-payment',
      functionName: 'payment-service',
      awsRequestId: 'test-aws-456'
    };

    const result = await handler(event, context);
    
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(true);
    expect(body.paymentId).toBeDefined();
    expect(body.amount).toBe(100.00);
  });

  test('handler should handle missing required fields', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/api/v1/payments',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 100.00
        // Missing currency and paymentMethod
      }),
      requestContext: {}
    };
    
    const context = {
      requestId: 'test-request-invalid',
      functionName: 'payment-service',
      awsRequestId: 'test-aws-789'
    };

    const result = await handler(event, context);
    
    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toBeDefined();
    expect(body.error).toContain('Missing required fields');
  });

  test('handler should retrieve payment status', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/api/v1/payments/PAY-123456',
      headers: {},
      pathParameters: { paymentId: 'PAY-123456' },
      requestContext: {}
    };
    
    const context = {
      requestId: 'test-request-get',
      functionName: 'payment-service',
      awsRequestId: 'test-aws-101'
    };

    const result = await handler(event, context);
    
    expect(result).toBeDefined();
    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.status).toBe('completed');
  });

  test('handler should handle malformed JSON gracefully', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/api/v1/payments',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json{',
      requestContext: {}
    };
    
    const context = {
      requestId: 'test-request-json-error',
      functionName: 'payment-service',
      awsRequestId: 'test-aws-202'
    };

    const result = await handler(event, context);
    expect(result).toBeDefined();
    expect(result.statusCode).toBeGreaterThanOrEqual(400);
  });
});

describe('Lambda Handler Logging', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('handler should log invocation start', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/health',
      headers: {},
      requestContext: {}
    };
    
    const context = {
      requestId: 'test-log-request',
      functionName: 'payment-service',
      awsRequestId: 'test-aws-303'
    };

    await handler(event, context);
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Lambda invocation started',
      expect.objectContaining({
        requestId: 'test-log-request',
        functionName: 'payment-service'
      })
    );
  });

  test('handler should log successful completion', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/health',
      headers: {},
      requestContext: {}
    };
    
    const context = {
      requestId: 'test-completion-request',
      functionName: 'payment-service',
      awsRequestId: 'test-aws-404'
    };

    await handler(event, context);
    
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Lambda invocation completed successfully',
      expect.objectContaining({
        requestId: 'test-completion-request',
        statusCode: 200
      })
    );
  });
});
