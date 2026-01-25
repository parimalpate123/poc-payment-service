// Simulate payment gateway call with retry logic
  let attempts = 0;
  while (attempts < gatewayConfig.retries) {
    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Payment gateway timeout'));
        }, gatewayConfig.timeout);

        // Simulate successful payment after delay
        setTimeout(() => {
          clearTimeout(timeout);
          resolve();
        }, 100);
      });
      break; // Success, exit retry loop
    } catch (error) {
      attempts++;
      console.warn(`Payment attempt ${attempts} failed: ${error.message}`);
      if (attempts >= gatewayConfig.retries) {
        throw new Error('Payment gateway unavailable after multiple attempts');
      }
    }
  }