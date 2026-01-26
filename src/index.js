const axios = require('axios');

async function processPayment(amount, currency, paymentMethod) {
  try {
    // Configure payment gateway connection
    const gatewayConfig = {
      baseURL: process.env.PAYMENT_GATEWAY_URL || 'https://api.payment-gateway.com',
      timeout: 30000, // 30 seconds timeout
      headers: { 'Authorization': `Bearer ${process.env.PAYMENT_GATEWAY_API_KEY}` }
    };

    const paymentGateway = axios.create(gatewayConfig);

    // Process payment through the gateway
    const response = await paymentGateway.post('/process', {
      amount,
      currency,
      paymentMethod
    });

    return {
      id: response.data.id,
      amount: response.data.amount,
      currency: response.data.currency,
      paymentMethod: response.data.paymentMethod,
      status: response.data.status,
      timestamp: response.data.timestamp
    };
  } catch (error) {
    console.error('Payment gateway error:', error.message);
    throw new Error('Payment processing failed: ' + error.message);
  }
}