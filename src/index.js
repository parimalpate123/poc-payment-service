const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

async function processPayment(amount, currency, paymentMethod) {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      // Simulate external payment gateway call
      const response = await axios.post('https://api.paymentgateway.com/process', {
        amount,
        currency,
        paymentMethod
      }, {
        timeout: 5000 // 5 seconds timeout
      });

      return {
        id: `PAY-${uuidv4()}`,
        amount,
        currency,
        paymentMethod,
        status: response.data.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Payment processing attempt ${retries + 1} failed:`, error.message);
      retries++;
      if (retries >= maxRetries) {
        throw new Error('Payment processing failed after multiple attempts');
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }
}