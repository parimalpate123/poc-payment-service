/**
 * Unit tests for Payment Service
 * Tests null/undefined handling and data validation
 */

const request = require('supertest');
const app = require('../src/index');

describe('Payment Service - Null/Undefined Handling Tests', () => {
  
  describe('POST /api/v1/payments', () => {
    
    test('should successfully process valid payment', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100.50,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.paymentId).toBeDefined();
      expect(response.body.amount).toBe(100.50);
    });
    
    test('should handle null amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: null,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Payment processing failed');
      expect(response.body.message).toContain('Amount cannot be null or undefined');
    });
    
    test('should handle undefined amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
    
    test('should handle null currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: null,
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Payment processing failed');
      expect(response.body.message).toContain('Currency cannot be null or undefined');
    });
    
    test('should handle null paymentMethod', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: null
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Payment processing failed');
      expect(response.body.message).toContain('Payment method cannot be null or undefined');
    });
    
    test('should handle invalid amount (string)', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 'invalid',
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Payment processing failed');
      expect(response.body.message).toContain('Amount must be a valid positive number');
    });
    
    test('should handle negative amount', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: -50,
          currency: 'USD',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Payment processing failed');
      expect(response.body.message).toContain('Amount must be a valid positive number');
    });
    
    test('should handle empty string currency', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: '',
          paymentMethod: 'credit_card'
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Payment processing failed');
      expect(response.body.message).toContain('Currency must be a non-empty string');
    });
    
    test('should handle paymentMethod as object with type', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: { type: 'credit_card', last4: '1234' }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('should handle paymentMethod as object without type', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: { last4: '1234' }
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Payment processing failed');
      expect(response.body.message).toContain('Payment method type is required');
    });
    
    test('should handle paymentMethod as object with null type', async () => {
      const response = await request(app)
        .post('/api/v1/payments')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: { type: null }
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Payment processing failed');
      expect(response.body.message).toContain('Payment method type is required');
    });
  });
  
  describe('GET /api/v1/payments/:paymentId', () => {
    
    test('should successfully retrieve payment status', async () => {
      const response = await request(app)
        .get('/api/v1/payments/PAY-12345');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('PAY-12345');
      expect(response.body.status).toBeDefined();
    });
    
    test('should handle short/invalid payment ID', async () => {
      const response = await request(app)
        .get('/api/v1/payments/123');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Payment not found');
    });
    
    test('should handle payment ID with whitespace', async () => {
      const response = await request(app)
        .get('/api/v1/payments/  PAY-12345  ');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('PAY-12345');
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
