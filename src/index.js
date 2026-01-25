async function processPayment(amount, currency, paymentMethod) {
  try {
    const response = await paymentGateway.post('/process-payment', {
      amount,
      currency,
      paymentMethod
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
    if (error.response) {
      console.error('Payment gateway response:', error.response.data);
    }
    throw new Error('Payment processing failed');
  }