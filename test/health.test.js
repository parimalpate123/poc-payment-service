const request = require('supertest');
const app = require('../src/index');

describe('Health Check Endpoint', () => {
  it('should return a detailed health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('service', 'payment-service');
    expect(response.body).toHaveProperty('version', '1.0.1');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('paymentProcessing', 'operational');
    expect(response.body).toHaveProperty('dependencies');
    expect(response.body.dependencies).toHaveProperty('database', 'connected');
    expect(response.body.dependencies).toHaveProperty('cache', 'connected');
    expect(response.body.dependencies).toHaveProperty('paymentGateway', 'operational');
  });

  // Add more tests as needed
});