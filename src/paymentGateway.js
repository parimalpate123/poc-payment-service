function simulatePaymentGateway(amount, currency, paymentMethod) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.9) {
        resolve({
          id: `PAY-${Date.now()}`,
          amount,
          currency,
          paymentMethod,
          status: 'completed',
          timestamp: new Date().toISOString()
        });
      } else {
        reject(new Error('Payment gateway error: Transaction failed'));
      }
    }, 1000);
  });
}

module.exports = { simulatePaymentGateway };