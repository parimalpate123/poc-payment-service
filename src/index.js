async function processPayment(amount, currency, paymentMethod) {
  // Payment gateway configuration
  const gatewayConfig = {
    timeout: 30000, // 30 seconds timeout
    retries: 3,
    baseUrl: process.env.PAYMENT_GATEWAY_URL || 'https://api.payment-gateway.com'
  };

  // Simulate payment gateway call with retries
  for (let attempt = 1; attempt <= gatewayConfig.retries; attempt++) {
    try {
      // Simulating API call to payment gateway
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
      console.error(`Payment attempt ${attempt} failed:`, error.message);
      if (attempt === gatewayConfig.retries) {
        throw new Error('Payment processing failed after multiple attempts');
      }
    }
  }
}