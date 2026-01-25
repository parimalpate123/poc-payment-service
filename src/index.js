async function processPayment(amount, currency, paymentMethod) {
  // Configure payment gateway connection settings
  const gatewayConfig = {
    timeout: 30000, // 30 seconds timeout
    retries: 3,
    retryDelay: 1000
  };

  // Simulate payment gateway call with retries
  for (let attempt = 1; attempt <= gatewayConfig.retries; attempt++) {
    try {
      // Simulated gateway call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.8) { // 80% success rate
            resolve();
          } else {
            reject(new Error('Gateway timeout'));
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
      console.error(`Payment attempt ${attempt} failed:`, error.message);
      if (attempt === gatewayConfig.retries) {
        throw new Error('Payment gateway unavailable after multiple attempts');
      }
      await new Promise(resolve => setTimeout(resolve, gatewayConfig.retryDelay));
    }
  }