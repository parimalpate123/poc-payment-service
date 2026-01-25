// Simulate external payment gateway call
async function simulateGatewayCall(amount, currency, paymentMethod) {
  // Simulate intermittent failures
  if (Math.random() < 0.3) { // 30% chance of failure
    throw new Error('External gateway timeout');
  }

  // Simulate successful response
  return {
    id: `PAY-${Date.now()}`,
    amount,
    currency,
    paymentMethod,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}