// Simulate payment processing
async function processPayment(amount, currency, paymentMethod) {
  // Configure payment gateway connection settings
  const gatewayConfig = {
    timeout: 30000, // 30 seconds timeout
    retries: 3,
    retryDelay: 1000 // 1 second between retries
  };

  // Simulate payment gateway call with retries
  for (let attempt = 1; attempt <= gatewayConfig.retries; attempt++) {
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate successful payment
      return {
        id: `PAY-${Date.now()}`,
        amount,
        currency,
        paymentMethod,
        status: 'completed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Payment attempt ${attempt} failed:`, error);
      if (attempt === gatewayConfig.retries) {
        throw new Error('Payment gateway timeout after multiple attempts');
      }
      await new Promise(resolve => setTimeout(resolve, gatewayConfig.retryDelay));
    }
  }
}