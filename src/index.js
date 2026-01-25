async function processPayment(amount, currency, paymentMethod) {
  // Simulate potential issues:
  // - Database connection timeout
  // - External payment gateway timeout
  // - Invalid payment method handling
  
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Simulate processing delay and potential failure
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.3) { // 30% chance of failure
            reject(new Error('External payment gateway timeout'));
          } else {
            resolve();
          }
        }, 100);
      });

      // If successful, return the payment result
      return {
        id: `PAY-${Date.now()}`,
        amount,
        currency,
        paymentMethod,
        status: 'completed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Payment processing attempt ${attempt} failed:`, error);
      if (attempt === MAX_RETRIES) {
        throw error; // Rethrow the error if all retries have been exhausted
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}