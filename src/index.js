async function processPayment(amount, currency, paymentMethod) {
  // Simulate potential issues:
  // - Database connection timeout
  // - External payment gateway timeout
  // - Invalid payment method handling
  
  // Implement retry logic with exponential backoff
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      // Simulate processing delay
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          clearTimeout(timeout);
          reject(new Error('Payment gateway timeout'));
        }, 5000);

        setTimeout(() => {
          clearTimeout(timeout);
          resolve();
        }, 100);
      });
      
      return {
        id: `PAY-${Date.now()}`,
        amount,
        currency,
        paymentMethod,
        status: 'completed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Payment processing attempt ${retryCount + 1} failed:`, error);
      retryCount++;
      if (retryCount >= maxRetries) {
        throw new Error('Payment processing failed after multiple attempts');
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 2 ** retryCount * 1000));
    }
  }
}