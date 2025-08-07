const http = require('http');

const SERVER_URL = 'http://localhost:3000/api/v1';
const CHECK_INTERVAL = 5000; // 5 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

let isRunning = false;
let consecutiveFailures = 0;

function checkServer() {
  const req = http.get(`${SERVER_URL}/health`, (res) => {
    if (res.statusCode === 200) {
      if (!isRunning) {
        console.log('✅ Server is running');
        isRunning = true;
      }
      consecutiveFailures = 0;
    } else {
      handleFailure();
    }
  });

  req.on('error', (error) => {
    handleFailure();
  });

  req.setTimeout(5000, () => {
    handleFailure();
    req.destroy();
  });
}

function handleFailure() {
  consecutiveFailures++;
  
  if (consecutiveFailures >= MAX_RETRIES && isRunning) {
    console.log('❌ Server stopped responding');
    isRunning = false;
    consecutiveFailures = 0;
  }
}

console.log('🔍 Starting server watcher...');
console.log(`📡 Monitoring: ${SERVER_URL}`);

// Initial check
checkServer();

// Set up periodic checking
setInterval(checkServer, CHECK_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server watcher...');
  process.exit(0);
}); 