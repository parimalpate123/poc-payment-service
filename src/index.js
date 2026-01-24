  try {
    client = await pool.connect();
    // Perform database query here
    const result = await client.query('SELECT * FROM payments WHERE id = $1', [paymentId]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  } catch (error) {
    console.error('Database error while fetching payment status:', error);
    throw error;
  } finally {
    if (client) client.release();
  }