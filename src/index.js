async function processPayment(amount, currency, paymentMethod) {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Simulate external payment gateway call
      const response = await axios.post('https://api.external-payment-gateway.com/process', {
        amount,
        currency,
        paymentMethod
      }, { timeout: 5000 });

      return {
        id: response.data.id,
        amount,
        currency,
        paymentMethod,
        status: response.data.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Payment processing attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error('Payment processing failed after multiple attempts');
      }

      // Exponential backoff
      await sleep(baseDelay * Math.pow(2, attempt - 1));
    }
  }