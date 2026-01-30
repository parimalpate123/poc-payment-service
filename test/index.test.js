const request = require('supertest');
const app = require('../src/index');

describe('Payment Service', () => {
  describe('POST /api/v1/payments', () => {
    it('should process a valid payment', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: 100, currency: 'USD', paymentMethod: 'credit_card' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.paymentId).toBeDefined();
    });

    it('should handle invalid amount', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: null, currency: 'USD', paymentMethod: 'credit_card' });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Payment processing failed');
      expect(res.body.message).toBe('Invalid amount');
    });

    it('should handle invalid currency', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: 100, currency: '', paymentMethod: 'credit_card' });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Payment processing failed');
      expect(res.body.message).toBe('Invalid currency');
    });

    it('should handle invalid payment method', async () => {
      const res = await request(app)
        .post('/api/v1/payments')
        .send({ amount: 100, currency: 'USD', paymentMethod: null });
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Payment processing failed');
      expect(res.body.message).toBe('Invalid payment method');
    });
  });

  describe('GET /api/v1/payments/:paymentId', () => {
    it('should get payment status for valid ID', async () => {
      const res = await request(app).get('/api/v1/payments/PAY-123456');
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe('PAY-123456');
    });

    it('should handle invalid payment ID', async () => {
      const res = await request(app).get('/api/v1/payments/');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to fetch payment status');
      expect(res.body.message).toBe('Invalid payment ID');
    });
  });
});