async function processPayment(amount, currency, paymentMethod) {
  // Payment gateway configuration
  const gatewayConfig = {
    timeout: 30000, // 30 seconds timeout
    retries: 3,
    backoff: {
      duration: 1000,
      factor: 2,
      maxDuration: 10000
    }
  };

  let attempts = 0;
  while (attempts < gatewayConfig.retries) {
    try {
      // Simulate payment gateway call
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Payment gateway timeout'));
        }, gatewayConfig.timeout);

        // Simulate successful payment after delay
        setTimeout(() => {
          clearTimeout(timeout);
          resolve();
        }, 1000);
      });

      // Payment successful
      return {
        id: `PAY-${Date.now()}`,
        amount,
        currency,
        paymentMethod,
        status: 'completed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Payment attempt ${attempts + 1} failed:`, error.message);
      attempts++;
      if (attempts < gatewayConfig.retries) {
        const backoffTime = Math.min(
          gatewayConfig.backoff.duration * Math.pow(gatewayConfig.backoff.factor, attempts),
          gatewayConfig.backoff.maxDuration
        );
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      } else {
        throw new Error('Payment processing failed after multiple attempts');
      }
    }
  }