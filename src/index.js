async function getPaymentStatus(paymentId) {
  try {
    const response = await paymentGateway.get(`/payment-status/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment status:', error.message);
    if (error.response) {
      console.error('Payment gateway response:', error.response.data);
    }
    throw new Error('Failed to fetch payment status');
  }
}