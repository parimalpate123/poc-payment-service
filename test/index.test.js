const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Null Handling and Validation Tests', () => {
  
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

    test('should successfully process payment with order object', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345',
          order: {
            orderId: 'ORD-123',
            amount: 100.50
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject payment with null amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: null,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('amount');
    });

    test('should reject payment with zero amount', async () => {
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

    test('should reject payment with negative amount', async () => {
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

    test('should reject payment with missing currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('currency');
    });

    test('should reject payment with null currency', async () => {
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

    test('should reject payment with missing paymentMethod', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          customerId: 'CUST-12345'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('paymentMethod');
    });

    test('should reject payment with null paymentMethod', async () => {
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

    test('should reject payment with missing customerId', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('customerId');
    });

    test('should reject payment with null customerId', async () => {
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

    test('should reject payment with invalid order amount (zero)', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345',
          order: {
            orderId: 'ORD-123',
            amount: 0
          }
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Payment processing failed');
      expect(response.body.message).toContain('order amount');
    });

    test('should handle payment with null order gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345',
          order: null
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
      expect(response.body.status).toBe('completed');
      expect(response.body.customerId).toBeDefined();
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
      expect(response.body.timestamp).toBeDefined();
    });
  });
});