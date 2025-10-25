#!/usr/bin/env node

const http = require('http');

function testServer() {
  const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/health',
    method: 'GET',
    timeout: 2000
  };

  console.log('Testing DevScope server at http://127.0.0.1:3000/health');

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`BODY: ${data}`);

      if (res.statusCode === 200) {
        console.log('✅ Server is running successfully!');
        try {
          const healthData = JSON.parse(data);
          console.log(`Server started at: ${healthData.startedAt}`);
          console.log(`Server version: ${healthData.version}`);
          console.log(`Process ID: ${healthData.pid}`);
        } catch (e) {
          console.log('Failed to parse health response:', e.message);
        }
      } else {
        console.log('❌ Server returned unexpected status code');
      }
    });
  });

  req.on('error', (e) => {
    console.log(`❌ ERROR: ${e.message}`);
    if (e.code === 'ECONNREFUSED') {
      console.log('The server is not running or not accessible.');
    } else if (e.code === 'ENOTFOUND') {
      console.log('The host could not be resolved.');
    } else {
      console.log('An unexpected error occurred:', e);
    }
  });

  req.on('timeout', () => {
    console.log('❌ Request timed out');
    req.destroy();
  });

  req.end();
}

// Test also the diagnostics endpoint
function testDiagnostics() {
  setTimeout(() => {
    console.log('\nTesting diagnostics endpoint...');

    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/diagnostics',
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      console.log(`DIAGNOSTICS STATUS: ${res.statusCode}`);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`DIAGNOSTICS BODY LENGTH: ${data.length} bytes`);
        if (res.statusCode === 200) {
          console.log('✅ Diagnostics endpoint is working!');
        } else {
          console.log('❌ Diagnostics endpoint returned an error');
        }
      });
    });

    req.on('error', (e) => {
      console.log(`DIAGNOSTICS ERROR: ${e.message}`);
    });

    req.end();
  }, 1000);
}

testServer();
testDiagnostics();