const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Null Safety Tests', () => {
  describe('POST /api/v1/payments', () => {
    test('should process payment with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.amount).toBe(100.00);
      expect(response.body.status).toBe('completed');
    });

    test('should handle null customer object safely', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customer: null
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should handle undefined order object safely', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          order: undefined
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should handle customer with missing properties', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customer: {}
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should handle order with missing properties', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          order: {}
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject invalid customer type', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customer: 'invalid'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid customer data');
    });

    test('should reject invalid order type', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          order: 'invalid'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid order data');
    });

    test('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.00
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should process payment with complete customer and order data', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 250.00,
          currency: 'USD',
          paymentMethod: 'credit_card',
          customer: {
            id: 'CUST-123',
            email: 'customer@example.com'
          },
          order: {
            id: 'ORD-456',
            total: 250.00
          }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    test('should get payment status with valid ID', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-123456');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('PAY-123456');
      expect(response.body.status).toBeDefined();
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