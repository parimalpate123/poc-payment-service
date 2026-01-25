
// Simulate payment gateway connection
async function simulateGatewayConnection(timeout) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.9) { // 90% success rate
        resolve();
      } else {
        reject(new Error('Gateway connection timeout'));
      }
    }, Math.random() * timeout);
  });
}