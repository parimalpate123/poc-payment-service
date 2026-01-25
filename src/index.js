async function processPayment(amount, currency, paymentMethod) {
  try {
    // Simulate payment gateway request
    const response = await axios.post('https://fake-payment-gateway.com/process', {
      amount,
      currency,
      paymentMethod
    }, {
      timeout: PAYMENT_GATEWAY_TIMEOUT
    });

    return {
      id: response.data.id,
      amount: response.data.amount,
      currency: response.data.currency,
      paymentMethod: response.data.paymentMethod,
      status: response.data.status,
      timestamp: response.data.timestamp
    };
  } catch (error) {
    console.error('Payment gateway error:', error.message);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Payment gateway timeout');
    }
    throw new Error('Payment processing failed');
  }