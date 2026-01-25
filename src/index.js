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
      // Simulated API call to payment gateway
      const response = await simulatePaymentGatewayCall(amount, currency, paymentMethod, gatewayConfig);
      
      return {
        id: response.transactionId,
        amount,
        currency,
        paymentMethod,
        status: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Payment attempt ${attempt} failed:`, error.message);
      if (attempt === gatewayConfig.retries) {
        throw new Error('Payment processing failed after multiple attempts');
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

async function simulatePaymentGatewayCall(amount, currency, paymentMethod, config) {
  // Simulate API call to payment gateway
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
  
  // Simulate potential gateway response
  if (Math.random() < 0.2) { // 20% chance of failure
    throw new Error('Payment gateway timeout');
  }
  
  return {
    transactionId: `TRX-${Date.now()}`,
    status: 'completed'
  };
}