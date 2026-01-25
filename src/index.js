
// Simulate payment gateway call
async function simulatePaymentGateway(amount, currency, paymentMethod) {
  // Simulate gateway issues
  if (Math.random() < 0.3) {
    throw new Error('Payment gateway timeout');
  }
  return { success: true };
}