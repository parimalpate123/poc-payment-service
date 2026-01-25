    const errorCode = error.message === 'Payment gateway timeout' ? 504 : 500;
    res.status(errorCode).json({ 
      error: 'Payment processing failed',
      message: error.message 