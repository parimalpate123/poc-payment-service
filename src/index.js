
// Simulate payment gateway call
async function simulatePaymentGatewayCall(amount, currency, paymentMethod) {
  // Simulate gateway processing time
  await new Promise(resolve => setTimeout(resolve, Math.random() * 8000 + 2000));
  
  // Simulate potential gateway errors
  if (Math.random() < 0.1) {
    throw new Error('Payment gateway error');
  }
  
  return {
    transactionId: `TRX-${Date.now()}`,
    status: 'success'
  };
}