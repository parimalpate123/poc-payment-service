const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Null/Undefined Reference Bug Fixes', () => {
  
  describe('POST /api/v1/payments', () => {
    
    test('should successfully process payment with all required fields', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.amount).toBe(100.50);
      expect(response.body.status).toBe('completed');
    });

    test('should successfully process payment with optional order field', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 200.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345',
          order: {
            total: 200.00,
            items: [{ id: 1, price: 100 }, { id: 2, price: 100 }]
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject payment when customerId is undefined', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card'
          // customerId is missing
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('customerId');
    });

    test('should reject payment when customerId is null', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: null
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('customerId');
    });

    test('should reject payment when amount is undefined', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345'
          // amount is missing
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('amount');
    });

    test('should reject payment when amount is zero (division by zero prevention)', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 0,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('amount');
    });

    test('should reject payment when amount is negative', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: -50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('amount');
    });

    test('should reject payment when paymentMethod is null', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: null,
          customerId: 'CUST-12345'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('paymentMethod');
    });

    test('should reject payment when paymentMethod is undefined', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          customerId: 'CUST-12345'
          // paymentMethod is missing
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('paymentMethod');
    });

    test('should reject payment when currency is null', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: null,
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('currency');
    });

    test('should handle order with empty items array (division by zero prevention)', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345',
          order: {
            total: 100.50,
            items: [] // Empty array - should not cause division by zero
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject payment when order.total is invalid', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345',
          order: {
            total: -50, // Invalid negative total
            items: [{ id: 1, price: 50 }]
          }
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Payment processing failed');
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    
    test('should successfully retrieve payment status', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-12345');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('PAY-12345');
      expect(response.body.status).toBeDefined();
      expect(response.body.amount).toBeDefined();
    });

    test('should return 404 when payment is null', async () => {
      const response = await request(app)
        .get('/api/v1/payments/null');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Payment not found');
    });

    test('should return 404 when payment is INVALID', async () => {
      const response = await request(app)
        .get('/api/v1/payments/INVALID');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Payment not found');
    });
  });

  describe('GET /health', () => {
    test('should return healthy status', async () => {
      const response = await request(app)
        .get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('payment-service');
    });
  });
});