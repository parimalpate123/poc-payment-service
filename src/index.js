// Payment gateway configuration
const paymentGatewayConfig = {
  timeout: 30000, // 30 seconds timeout
  retries: 3,
  baseUrl: process.env.PAYMENT_GATEWAY_URL || 'https://api.payment-gateway.com'
};

// Simulate payment processing
async function processPayment(amount, currency, paymentMethod) {
  for (let attempt = 1; attempt <= paymentGatewayConfig.retries; attempt++) {
    try {
      // Simulating API call to payment gateway
      const response = await fetch(`${paymentGatewayConfig.baseUrl}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, paymentMethod }),
        timeout: paymentGatewayConfig.timeout
      });

      if (!response.ok) {
        throw new Error(`Payment gateway responded with status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Payment processed successfully on attempt ${attempt}`);
      return {
        id: result.id || `PAY-${Date.now()}`,
        amount,
        currency,
        paymentMethod,
        status: result.status || 'completed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Payment processing attempt ${attempt} failed:`, error.message);
      if (attempt === paymentGatewayConfig.retries) {
        throw new Error('Payment processing failed after multiple attempts');
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }