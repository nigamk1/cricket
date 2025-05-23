// debugServer.js - Diagnostic tool for server deployment
const fs = require('fs');
const path = require('path');

console.log('====== SERVER DEPLOYMENT DIAGNOSTICS ======');
console.log(`Current directory: ${process.cwd()}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT}`);

// Check for environment variables
console.log('\n--- Environment Variables ---');
console.log(`MONGO_URI defined: ${Boolean(process.env.MONGO_URI)}`);
console.log(`JWT_SECRET defined: ${Boolean(process.env.JWT_SECRET)}`);

// List directories
console.log('\n--- Directory Structure ---');
function listDir(dirPath, level = 0) {
  const indent = '  '.repeat(level);
  
  try {
    const items = fs.readdirSync(dirPath);
    console.log(`${indent}${dirPath}/`);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      
      try {
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          if (level < 2) { // Limit recursion depth
            listDir(fullPath, level + 1);
          } else {
            console.log(`${indent}  ${item}/`);
          }
        } else {
          console.log(`${indent}  ${item}`);
        }
      } catch (error) {
        console.log(`${indent}  ${item} [Error: ${error.message}]`);
      }
    }
  } catch (error) {
    console.log(`${indent}Error reading directory ${dirPath}: ${error.message}`);
  }
}

// List the current directory and the client build directories
listDir(process.cwd());
console.log('\n--- Client Build Paths ---');
const clientBuildPaths = [
  path.join(process.cwd(), '../client/build'),
  path.join(process.cwd(), './client/build'),
  path.join(process.cwd(), 'client/build'),
  '/app/client/build'
];

for (const buildPath of clientBuildPaths) {
  try {
    if (fs.existsSync(buildPath)) {
      console.log(`✓ ${buildPath} exists`);
      const files = fs.readdirSync(buildPath);
      console.log(`  Contains ${files.length} files/directories:`);
      console.log(`  ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
      
      // Check for index.html
      const indexPath = path.join(buildPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        console.log(`  ✓ index.html exists`);
      } else {
        console.log(`  ✗ index.html NOT found`);
      }
    } else {
      console.log(`✗ ${buildPath} does NOT exist`);
    }
  } catch (error) {
    console.log(`✗ Error checking ${buildPath}: ${error.message}`);
  }
}

console.log('\n====== END DIAGNOSTICS ======');
