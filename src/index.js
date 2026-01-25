try {
    const result = await paymentGateway.processPayment(amount, currency, paymentMethod);
    return {
      id: result.id,
      amount: result.amount,
      currency: result.currency,
      paymentMethod: result.paymentMethod,
      status: result.status,
      timestamp: result.timestamp
    };
  } catch (error) {
    console.error('Payment gateway error:', error);
    throw new Error('Payment processing failed due to gateway issues');
  }