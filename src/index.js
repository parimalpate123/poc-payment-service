
// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end().then(() => {
      console.log('Database pool has ended');
      process.exit(0);
    });
  });
});