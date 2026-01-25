    console.error('Payment processing error:', error);
    const processingTime = Date.now() - startTime;
    console.log(`Payment processing failed after ${processingTime}ms`);