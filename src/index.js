// Simulate payment gateway call with retry logic
  let attempts = 0;
  while (attempts < gatewayConfig.retries) {
    try {
      // Simulating API call to payment gateway
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.8) { // 80% success rate
            resolve();
          } else {
            reject(new Error('Payment gateway timeout'));
          }
        }, Math.random() * gatewayConfig.timeout);
      });
      break; // Successful, exit the loop
    } catch (error) {
      attempts++;
      console.warn(`Payment attempt ${attempts} failed: ${error.message}`);
      if (attempts >= gatewayConfig.retries) {
        throw new Error('Payment gateway unavailable after multiple attempts');
      }
    }
  }