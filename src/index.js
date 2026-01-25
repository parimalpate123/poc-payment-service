async function processPayment(amount, currency, paymentMethod) {
  // Configuration for retry mechanism
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Simulate external payment gateway call
      const gatewayResponse = await simulateGatewayCall(amount, currency, paymentMethod);
      
      return {
        id: gatewayResponse.id,
        amount: gatewayResponse.amount,
        currency: gatewayResponse.currency,
        paymentMethod: gatewayResponse.paymentMethod,
        status: gatewayResponse.status,
        timestamp: gatewayResponse.timestamp
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

async function simulateGatewayCall(amount, currency, paymentMethod) {
  // Simulate intermittent failures
  if (Math.random() < 0.3) { // 30% chance of failure
    throw new Error('Gateway timeout');
  }
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    id: `PAY-${Date.now()}`,
    amount,
    currency,
    paymentMethod,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}