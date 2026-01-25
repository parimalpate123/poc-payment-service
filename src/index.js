const axios = require('axios');

async function processPayment(amount, currency, paymentMethod) {
  try {
    const paymentGatewayUrl = process.env.PAYMENT_GATEWAY_URL || 'https://api.payment-gateway.com';
    const response = await axios.post(`${paymentGatewayUrl}/process`, {
      amount,
      currency,
      paymentMethod
    }, {
      timeout: 30000, // 30 seconds timeout
      retries: 3,
      retryDelay: 1000
    });

    return {
      id: response.data.id,
      amount: response.data.amount,
      currency: response.data.currency,
      paymentMethod: response.data.paymentMethod,
      status: response.data.status,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Payment gateway error:', error.message);
    throw new Error('Payment processing failed: ' + error.message);
  }
}