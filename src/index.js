async function processPayment(amount, currency, paymentMethod) {
  // Simulate potential issues:
  // - Database connection timeout
  // - External payment gateway timeout
  // - Invalid payment method handling
  
  // Configure payment gateway timeout
  const PAYMENT_GATEWAY_TIMEOUT = 30000; // 30 seconds
  
  try {
    // Simulate payment gateway call with timeout
    const paymentResult = await Promise.race([
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: `PAY-${Date.now()}`,
            amount,
            currency,
            paymentMethod,
            status: 'completed',
            timestamp: new Date().toISOString()
          });
        }, 100); // Simulating processing delay
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Payment gateway timeout')), PAYMENT_GATEWAY_TIMEOUT)
      )
    ]);
    
    return paymentResult;
  } catch (error) {
    console.error('Payment processing error:', error);
    throw new Error('Payment gateway timeout. Please try again later.');
  }
}