async function processPayment(amount, currency, paymentMethod) {
  // Configure payment gateway connection settings
  const gatewayConfig = {
    timeout: 30000, // 30 seconds timeout
    retries: 3,
    retryDelay: 1000 // 1 second between retries
  };

  // Simulate payment gateway call with retries
  let attempts = 0;
  while (attempts < gatewayConfig.retries) {
    try {
      // Simulate external payment gateway call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.8) { // 80% success rate
            resolve();
          } else {
            reject(new Error('Payment gateway timeout'));
          }
        }, Math.random() * 1000); // Random delay up to 1 second
      });

      // If successful, return payment result
      return {
        id: `PAY-${Date.now()}`,
        amount,
        currency,
        paymentMethod,
        status: 'completed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Payment attempt ${attempts + 1} failed:`, error.message);
      attempts++;
      if (attempts < gatewayConfig.retries) {
        await new Promise(resolve => setTimeout(resolve, gatewayConfig.retryDelay));
      }
    }
  }

  // If all retries fail, throw an error
  throw new Error('Payment processing failed after multiple attempts');
}