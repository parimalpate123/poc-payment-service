const axios = require('axios');

async function processPayment(amount, currency, paymentMethod) {
  const PAYMENT_GATEWAY_URL = process.env.PAYMENT_GATEWAY_URL || 'https://api.payment-gateway.com';
  const CARD_VERIFICATION_URL = process.env.CARD_VERIFICATION_URL || 'https://api.card-verification.com';
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Verify card
      const verificationResult = await axios.post(CARD_VERIFICATION_URL, { paymentMethod }, { timeout: 5000 });
      if (!verificationResult.data.isValid) {
        throw new Error('Card verification failed');
      }

      // Process payment
      const paymentResult = await axios.post(PAYMENT_GATEWAY_URL, { amount, currency, paymentMethod }, { timeout: 10000 });

      return {
        id: paymentResult.data.id,
        amount,
        currency,
        paymentMethod,
        status: paymentResult.data.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Payment processing attempt ${attempt} failed:`, error.message);
      if (attempt === MAX_RETRIES) {
        throw new Error('Payment processing failed after multiple attempts');
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}