#!/bin/sh
# port_check.sh - Check if server is binding to the correct port

# Get the environment PORT or default to 10000
PORT="${PORT:-10000}"

echo "==== Server Port Configuration Check ===="
echo "Environment PORT: $PORT"

# Create a simple script to check port binding
cat > check_ports.js << 'EOL'
const http = require('http');

// Create a simple server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Port check successful\n');
});

// Log which port we're trying to listen on
console.log(`Attempting to listen on port ${process.env.PORT || 10000}`);

// Try to listen on the specified port
server.listen(process.env.PORT || 10000, () => {
  console.log(`Successfully listening on port ${server.address().port}`);
});

// Check for errors
server.on('error', (err) => {
  console.error(`Error binding to port ${process.env.PORT || 10000}:`, err.message);
  process.exit(1);
});

// Close after a brief period
setTimeout(() => {
  server.close(() => {
    console.log('Port check completed');
  });
}, 1000);
EOL

# Run the script
echo "Checking port binding..."
node check_ports.js

echo "==== Starting application ===="
# Continue with the normal command
exec "$@"
