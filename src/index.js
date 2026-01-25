  } catch (error) {
    console.error('Payment processing error:', error);
    const statusCode = error.message === 'Payment gateway timeout' ? 504 : 500;
    res.status(statusCode).json({ 
      error: statusCode === 504 ? 'Payment gateway timeout' : 'Payment processing failed',
      message: error.message 