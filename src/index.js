async function processPayment(amount, currency, paymentMethod) {
  // Simulate potential issues:
  // - Database connection timeout
  // - External payment gateway timeout
  // - Invalid payment method handling
  
  // Simulate processing delay with timeout
  try {
    await Promise.race([
      new Promise(resolve => setTimeout(resolve, 100)),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Card verification timeout')), 3000))
    ]);
  } catch (error) {
    console.error('Card verification service timeout:', error);
    throw new Error('Payment processing failed due to card verification timeout');
  }
  
  return {
    id: `PAY-${Date.now()}`,
    amount,
    currency,
    paymentMethod,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}