// Simulate payment processing
async function processPayment(amount, currency, paymentMethod) {
  const MAX_RETRIES = 3;
  const TIMEOUT = 5000; // 5 seconds

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Simulate external payment gateway call
      const paymentResult = await Promise.race([
        simulatePaymentGateway(amount, currency, paymentMethod),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Payment gateway timeout')), TIMEOUT)
        )
      ]);

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
      if (attempt === MAX_RETRIES) {
        throw new Error('Payment processing failed after multiple attempts');
      }
    }
  }
}

// Simulate external payment gateway
async function simulatePaymentGateway(amount, currency, paymentMethod) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 6000));
  
  // Simulate potential gateway errors
  if (Math.random() < 0.2) {
    throw new Error('Payment gateway error');
  }

  return true;
}