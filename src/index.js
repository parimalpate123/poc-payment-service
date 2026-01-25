async function getPaymentStatus(paymentId) {
  try {
    const response = await axios.get(`${PAYMENT_GATEWAY_URL}/status/${paymentId}`, {
      timeout: PAYMENT_GATEWAY_TIMEOUT
    });

    return response.data;
  } catch (error) {
    console.error('Payment status fetch error:', error.message);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Payment gateway timeout');
    }
    throw new Error('Failed to fetch payment status');
  }
}