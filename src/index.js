const axios = require('axios');

async function processPayment(amount, currency, paymentMethod) {
  try {
    const response = await axios.post('https://payment-gateway-url.com/process', {
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
      timestamp: response.data.timestamp
    };
  } catch (error) {
    console.error('Payment gateway error:', error.message);
    throw new Error('Payment processing failed: Gateway timeout');
  }
}