const app = require('./index');

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});