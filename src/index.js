const paymentResult = await processPayment(amount, currency, paymentMethod).catch(error => {
      console.error('Payment gateway error:', error);
      throw new Error('Payment processing failed due to gateway timeout');
    });