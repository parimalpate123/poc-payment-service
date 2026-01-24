async function processPayment(amount, currency, paymentMethod) {
  try {
    const client = await pool.connect();
    try {
      // Perform database operations here
      await client.query('BEGIN');
      // Simulate payment processing
      const result = await client.query(
        'INSERT INTO payments(amount, currency, payment_method, status) VALUES($1, $2, $3, $4) RETURNING id',
        [amount, currency, paymentMethod, 'completed']
      );
      await client.query('COMMIT');
      
      return {