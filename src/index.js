async function getPaymentStatus(paymentId) {
  try {
    const response = await paymentGateway.get(`/payment-status/${paymentId}`);
    
    return {
      id: response.data.id,
      status: response.data.status,
      amount: response.data.amount,
      currency: response.data.currency,
      timestamp: response.data.timestamp
    };
  } catch (error) {
    console.error('Payment status retrieval error:', error.message);
    if (error.response) {
      console.error('Payment gateway response:', error.response.data);
    }
    throw new Error('Failed to fetch payment status');
  }
}