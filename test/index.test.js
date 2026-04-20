const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Null Reference Fix Tests', () => {
  
  describe('POST /api/v1/payments', () => {
    
    test('should successfully process valid payment', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: { type: 'credit_card', last4: '1234' }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.paymentId).not.toBeNull();
      expect(response.body.amount).toBe(100.50);
      expect(response.body.status).toBe('completed');
    });

    test('should reject payment with missing amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should reject payment with null amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: null,
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should reject payment with invalid amount type', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 'invalid',
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid amount');
    });

    test('should reject payment with negative amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: -50,
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid amount');
    });

    test('should reject payment with null currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: null,
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should reject payment with invalid currency format', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'US',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid currency');
    });

    test('should reject payment with null paymentMethod', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: null
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid paymentMethod');
    });

    test('should reject payment with non-object paymentMethod', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid paymentMethod');
    });

    test('should handle undefined fields gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: undefined,
          currency: undefined,
          paymentMethod: undefined
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    
    test('should retrieve payment status successfully', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-123456');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBeDefined();
      expect(response.body.id).not.toBeNull();
      expect(response.body.status).toBeDefined();
    });

    test('should reject empty payment ID with whitespace', async () => {
      const response = await request(app)
        .get('/api/v1/payments/%20%20%20');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid payment ID');
    });

    test('should handle payment not found', async () => {
      const response = await request(app)
        .get('/api/v1/payments/INVALID-ID');
      
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
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
