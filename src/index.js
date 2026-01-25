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
      const response = await simulateGatewayCall(amount, currency, paymentMethod, gatewayConfig);
      
      return {
        id: response.id,
        amount: response.amount,
        currency: response.currency,
        paymentMethod: response.paymentMethod,
        status: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Payment attempt ${attempt} failed:`, error.message);
      if (attempt === gatewayConfig.retries) {
        throw new Error('Payment processing failed after multiple attempts');
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
}

async function simulateGatewayCall(amount, currency, paymentMethod, config) {
  // Simulate API call to payment gateway
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
  
  // Simulate potential gateway response
  if (Math.random() < 0.2) { // 20% chance of failure
    throw new Error('Gateway timeout');
  }
  
  return {
    id: `PAY-${Date.now()}`,
    amount,
    currency,
    paymentMethod,
    status: 'completed'
  };
}