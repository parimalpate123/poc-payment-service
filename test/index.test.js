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
          customerId: 'CUST-12345',
          order: {
            total: 100.50,
            items: [{ id: 1, price: 50.25 }, { id: 2, price: 50.25 }]
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.amount).toBe(100.50);
      expect(response.body.status).toBe('completed');
    });

    test('should reject payment when customerId is undefined', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          order: { total: 100.50, items: [] }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('customerId');
    });

    test('should reject payment when order is undefined', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('order');
    });

    test('should reject payment when paymentMethod is null', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: null,
          customerId: 'CUST-12345',
          order: { total: 100.50, items: [] }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('paymentMethod');
    });

    test('should reject payment when amount is undefined', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345',
          order: { total: 100.50, items: [] }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('amount');
    });

    test('should reject payment when amount is zero or negative', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 0,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345',
          order: { total: 0, items: [] }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('amount');
    });

    test('should handle division by zero when order has no items', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345',
          order: {
            total: 100.50,
            items: [] // Empty items array - would cause division by zero
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should handle order with missing properties', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345',
          order: {} // Order with no properties
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
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

    test('should handle empty paymentId', async () => {
      const response = await request(app)
        .get('/api/v1/payments/');
      
      expect(response.status).toBe(404);
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
