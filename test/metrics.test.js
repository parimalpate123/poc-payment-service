const request = require('supertest');
const { app, startServer } = require('../src/index');

describe('Metrics Endpoint', () => {
  let server;

  beforeAll(async () => {
    server = await startServer(0); // Use port 0 to get a random available port
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should return 200 and metrics content', async () => {
    const response = await request(app).get('/metrics');
    expect(response.status).toBe(200);
    expect(response.text).toContain('http_request_duration_seconds');
    expect(response.headers['content-type']).toMatch(/^text\/plain/);
  }, 10000);

  it('should record metrics for other endpoints', async () => {
    await request(app).get('/health');
    
    // Wait for a short period to allow metrics to update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const metricsResponse = await request(app).get('/metrics');
    expect(metricsResponse.text).toContain('http_request_duration_seconds_bucket{le="+Inf",method="GET",route="/health",code="200"}');
  }, 10000);
});