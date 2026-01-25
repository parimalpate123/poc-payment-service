const axios = require('axios');

async function processPayment(amount, currency, paymentMethod) {
  const gatewayConfig = {
    baseURL: process.env.PAYMENT_GATEWAY_URL || 'https://api.payment-gateway.com',
    timeout: 10000, // 10 seconds timeout
    headers: { 'Authorization': `Bearer ${process.env.PAYMENT_GATEWAY_API_KEY}` }
  };

  const gateway = axios.create(gatewayConfig);

  try {
    const response = await gateway.post('/process', {
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
    if (error.response) {
      throw new Error(`Payment gateway error: ${error.response.status} - ${error.response.data.message}`);
    } else if (error.request) {
      throw new Error('Payment gateway timeout. Please try again.');
    } else {
      throw new Error('Error setting up payment gateway request.');
    }
  }