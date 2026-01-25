async function processPayment(amount, currency, paymentMethod) {
  // Simulate potential issues:
  // - Database connection timeout
  // - External payment gateway timeout
  // - Invalid payment method handling
  
  // Simulate card verification service with timeout
  const verifyCard = () => new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Card verification timeout')), 5000);
    setTimeout(() => {
      clearTimeout(timeout);
      resolve('Card verified');
    }, Math.random() * 6000); // Random time up to 6 seconds
  });

  try {
    await verifyCard();
    
    return {
      id: `PAY-${Date.now()}`,
      amount,
      currency,
      paymentMethod,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Card verification failed:', error);
    throw new Error('Payment processing failed due to card verification timeout');
  }