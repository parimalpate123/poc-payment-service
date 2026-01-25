// Simulate payment processing
async function processPayment(amount, currency, paymentMethod) {
  // Simulate potential issues:
  // - Database connection timeout
  // - External payment gateway timeout
  // - Invalid payment method handling
  
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate external service call
      const gatewayResponse = await simulateGatewayCall(amount, currency, paymentMethod);
      
      return {
        id: gatewayResponse.id,
        amount,
        currency,
        paymentMethod,
        status: gatewayResponse.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Payment processing attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw new Error('Payment processing failed after multiple attempts');
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt - 1)));
    }
  }
}

// Simulate external gateway call
async function simulateGatewayCall(amount, currency, paymentMethod) {
  // Simulate potential gateway issues
  if (Math.random() < 0.3) { // 30% chance of failure
    throw new Error('Gateway timeout');
  }
  
  return {
    id: `PAY-${Date.now()}`,
    status: 'completed'
  };
}