
// Simulate payment gateway call
async function simulateGatewayCall(amount, currency, paymentMethod) {
  // Simulate processing delay and potential timeout
  await new Promise((resolve, reject) => {
    const processingTime = Math.random() * 1000;
    setTimeout(() => {
      if (processingTime > 800) {
        reject(new Error('Gateway timeout'));
      } else {
        resolve();
      }
    }, processingTime);
  });

  return {
    id: `PAY-${Date.now()}`,
    amount,
    currency,
    paymentMethod,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}

// Retry operation with exponential backoff
async function retryOperation(operation, config) {
  let lastError;
  for (let attempt = 1; attempt <= config.retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Attempt ${attempt} failed: ${error.message}`);
      lastError = error;
      if (attempt < config.retries) {
        const delay = Math.min(
          config.backoff.duration * Math.pow(config.backoff.factor, attempt - 1),
          config.backoff.maxDuration
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}