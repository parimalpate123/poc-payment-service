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
      const response = await simulateGatewayCall(gatewayConfig, amount, currency, paymentMethod);
      
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
    }
  }
}

async function simulateGatewayCall(config, amount, currency, paymentMethod) {
  // Simulate API call to payment gateway
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
  
  // Simulate potential gateway responses
  const responses = [
    { success: true, id: `PAY-${Date.now()}`, amount, currency, paymentMethod, status: 'completed' },
    { success: false, error: 'Gateway timeout' },
    { success: false, error: 'Card verification failed' }
  ];
  
  const response = responses[Math.floor(Math.random() * responses.length)];
  
  if (!response.success) {
    throw new Error(response.error);
  }
  
  return response;
}