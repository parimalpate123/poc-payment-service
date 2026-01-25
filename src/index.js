// Simulate payment gateway call
async function simulatePaymentGateway(amount, currency, paymentMethod) {
  // Simulate gateway processing
  await new Promise(resolve => setTimeout(resolve, 30));
  
  if (Math.random() < 0.1) { // 10% chance of failure
    throw new Error('Payment gateway timeout');
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