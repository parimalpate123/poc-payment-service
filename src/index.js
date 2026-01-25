async function processPayment(amount, currency, paymentMethod) {
  // Payment gateway configuration
  const gatewayConfig = {
    timeout: 30000, // 30 seconds timeout
    retries: 3,
    baseUrl: process.env.PAYMENT_GATEWAY_URL || 'https://api.payment-gateway.com',
    apiKey: process.env.PAYMENT_GATEWAY_API_KEY
  };

  // Simulate payment gateway call with retries
  for (let attempt = 1; attempt <= gatewayConfig.retries; attempt++) {
    try {
      // Simulating API call to payment gateway
      const response = await simulateGatewayCall(gatewayConfig, amount, currency, paymentMethod);
      
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
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
}

async function simulateGatewayCall(config, amount, currency, paymentMethod) {
  // Simulate API call to payment gateway
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
  
  // Simulate potential gateway responses
  const responses = [
    { transactionId: `TRX-${Date.now()}`, status: 'completed' },
    { transactionId: `TRX-${Date.now()}`, status: 'failed' },
    new Error('Gateway timeout')
  ];
  
  const result = responses[Math.floor(Math.random() * responses.length)];
  if (result instanceof Error) throw result;
  return result;
}