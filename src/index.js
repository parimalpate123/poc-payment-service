const axios = require('axios');

async function processPayment(amount, currency, paymentMethod) {
  const gatewayConfig = {
    baseURL: process.env.PAYMENT_GATEWAY_URL || 'https://api.payment-gateway.com',
    timeout: 30000, // 30 seconds timeout
    headers: {
      'Authorization': `Bearer ${process.env.PAYMENT_GATEWAY_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  const gatewayClient = axios.create(gatewayConfig);

  try {
    const response = await gatewayClient.post('/process-payment', {
      amount,
      currency,
      paymentMethod
    });

    return {
      id: response.data.paymentId,
      amount: response.data.amount,
      currency: response.data.currency,
      paymentMethod: response.data.paymentMethod,
      status: response.data.status,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Payment gateway error:', error.message);
    if (error.response) {
      console.error('Gateway response:', error.response.data);
    }
    throw new Error('Payment processing failed: ' + error.message);
  }
}