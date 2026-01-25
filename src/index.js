// Simulate payment processing
async function processPayment(amount, currency, paymentMethod) {
  // Simulate potential issues:
  // - Database connection timeout
  // - External payment gateway timeout
  // - Invalid payment method handling
  
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate external service call
      const gatewayResponse = await simulateGatewayCall(amount, currency, paymentMethod);

      if (gatewayResponse.status === 'error') {
        throw new Error(gatewayResponse.message);
      }

      return {
        id: gatewayResponse.id,
        amount,
        currency,
        paymentMethod,
        status: gatewayResponse.status,
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

// Simulate external gateway call
async function simulateGatewayCall(amount, currency, paymentMethod) {
  // Simulate intermittent failures
  if (Math.random() < 0.3) { // 30% chance of failure
    throw new Error('Gateway timeout');
  }
  return {
    id: `PAY-${Date.now()}`,
    status: 'completed',
    message: 'Payment processed successfully'
  };
}