const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Null/Undefined Handling Tests', () => {
  
  describe('POST /api/v1/payments', () => {
    test('should reject null amount', async () => {
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
    
    test('should reject undefined amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
    
    test('should reject null currency', async () => {
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
    
    test('should reject null paymentMethod', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: null
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
    
    test('should process valid payment', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.amount).toBe(100);
    });
    
    test('should reject zero amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 0,
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
    
    test('should reject negative amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: -100,
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
    
    test('should reject NaN amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 'invalid',
          currency: 'USD',
          paymentMethod: { type: 'credit_card' }
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });
  
  describe('GET /api/v1/payments/:paymentId', () => {
    test('should retrieve valid payment', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-123456');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBeDefined();
    });
  });
  
  describe('Health Check', () => {
    test('should return healthy status', async () => {
      const response = await request(app)
        .get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('payment-service');
    });
  });
});

// Unit tests for helper functions
describe('Payment Helper Functions', () => {
  const {
    validatePaymentMethod,
    calculateTotal,
    createPayment,
    updatePaymentStatus
  } = require('../src/index');
  
  describe('validatePaymentMethod', () => {
    test('should reject null payment method', () => {
      expect(() => validatePaymentMethod(null)).toThrow('Invalid payment method');
    });
    
    test('should reject undefined payment method', () => {
      expect(() => validatePaymentMethod(undefined)).toThrow('Invalid payment method');
    });
    
    test('should reject payment method without type', () => {
      expect(() => validatePaymentMethod({})).toThrow('type is required');
    });
    
    test('should accept valid payment method', () => {
      expect(validatePaymentMethod({ type: 'credit_card' })).toBe(true);
    });
  });
  
  describe('calculateTotal', () => {
    test('should reject null amount', () => {
      expect(() => calculateTotal(null)).toThrow('Amount cannot be null or undefined');
    });
    
    test('should reject undefined amount', () => {
      expect(() => calculateTotal(undefined)).toThrow('Amount cannot be null or undefined');
    });
    
    test('should reject zero amount', () => {
      expect(() => calculateTotal(0)).toThrow('Amount must be greater than zero');
    });
    
    test('should reject negative amount', () => {
      expect(() => calculateTotal(-100)).toThrow('Amount must be greater than zero');
    });
    
    test('should calculate total with valid inputs', () => {
      expect(calculateTotal(100, 10, 5)).toBe(115);
    });
    
    test('should handle null fees and tax', () => {
      expect(calculateTotal(100, null, null)).toBe(100);
    });
    
    test('should handle undefined fees and tax', () => {
      expect(calculateTotal(100)).toBe(100);
    });
  });
  
  describe('createPayment', () => {
    test('should reject null payment data', () => {
      expect(() => createPayment(null)).toThrow('Payment data cannot be null or undefined');
    });
    
    test('should reject undefined payment data', () => {
      expect(() => createPayment(undefined)).toThrow('Payment data cannot be null or undefined');
    });
    
    test('should reject missing amount', () => {
      expect(() => createPayment({
        currency: 'USD',
        paymentMethod: { type: 'credit_card' },
        userId: 'user123'
      })).toThrow('Amount is required');
    });
    
    test('should create payment with valid data', () => {
      const payment = createPayment({
        amount: 100,
        currency: 'USD',
        paymentMethod: { type: 'credit_card' },
        userId: 'user123'
      });
      
      expect(payment.id).toBeDefined();
      expect(payment.amount).toBe(100);
      expect(payment.status).toBe('pending');
    });
  });
  
  describe('updatePaymentStatus', () => {
    test('should reject null payment', () => {
      expect(() => updatePaymentStatus(null, 'completed')).toThrow('Payment object cannot be null or undefined');
    });
    
    test('should reject null status', () => {
      expect(() => updatePaymentStatus({ id: 'PAY-123' }, null)).toThrow('Status cannot be null or undefined');
    });
    
    test('should update status with valid inputs', () => {
      const payment = { id: 'PAY-123', status: 'pending' };
      const updated = updatePaymentStatus(payment, 'completed');
      
      expect(updated.status).toBe('completed');
      expect(updated.updatedAt).toBeDefined();
    });
  });
});