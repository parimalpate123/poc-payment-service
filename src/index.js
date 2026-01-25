async function processPayment(amount, currency, paymentMethod) {
  // Simulate potential issues:
  // - Database connection timeout
  // - External payment gateway timeout
  // - Invalid payment method handling
  
  // Simulate processing delay with increased timeout
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        reject(new Error('Payment gateway timeout'));
      }, 30000); // 30 seconds timeout
      
      setTimeout(() => {
        clearTimeout(timeout);
        resolve();
      }, 100);
    });
    
    return {
      id: `PAY-${Date.now()}`,
      amount,
      currency,
      paymentMethod,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    throw new Error('Payment gateway timeout. Please try again later.');
  }