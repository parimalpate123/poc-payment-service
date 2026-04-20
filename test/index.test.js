const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Null Handling and Validation Tests', () => {
  
  describe('POST /api/v1/payments', () => {
    
    test('should successfully process payment with all required fields', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345',
          order: { orderId: 'ORD-123', items: ['item1'] }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.amount).toBe(100.00);
      expect(response.body.customerId).toBe('CUST-12345');
      expect(response.body.status).toBe('completed');
    });
    
    test('should handle missing amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('amount');
    });
    
    test('should handle zero amount', async () => {
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
    
    test('should handle negative amount', async () => {
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
    
    test('should handle missing currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('currency');
    });
    
    test('should handle missing paymentMethod', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          customerId: 'CUST-12345'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('paymentMethod');
    });
    
    test('should handle missing customerId', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('customerId');
    });
    
    test('should handle null customerId', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: null
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('customerId');
    });
    
    test('should process payment without optional order field', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customerId: 'CUST-12345'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
  });
  
  describe('GET /api/v1/payments/:paymentId', () => {
    
    test('should retrieve payment status with valid paymentId', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-12345');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('PAY-12345');
      expect(response.body.status).toBeDefined();
      expect(response.body.amount).toBeDefined();
      expect(response.body.customerId).toBeDefined();
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