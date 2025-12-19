// Quick script to test if HTTPS is working
// Run with: node test-https.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://localhost:5443/api/auth/login';
const certPath = path.join(__dirname, 'localhost.pem');
const keyPath = path.join(__dirname, 'localhost-key.pem');

console.log('🔍 Testing HTTPS connection...\n');

// Check if certificates exist
if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.log('❌ Certificate files not found!');
    console.log('Expected files:');
    console.log(`  - ${certPath}`);
    console.log(`  - ${keyPath}`);
    console.log('\n💡 Run: mkcert localhost 127.0.0.1');
    process.exit(1);
}

console.log('✅ Certificate files found');

// Test HTTPS request
const options = {
    hostname: 'localhost',
    port: 5443,
    path: '/api/auth/login',
    method: 'GET',
    rejectUnauthorized: false // Allow self-signed certs for testing
};

const req = https.request(options, (res) => {
    console.log(`\n✅ HTTPS Connection Successful!`);
    console.log(`   Status Code: ${res.statusCode}`);
    console.log(`   Protocol: HTTPS`);
    console.log(`   URL: https://localhost:5443`);
    
    if (res.statusCode === 200 || res.statusCode === 401 || res.statusCode === 400) {
        console.log('\n🎉 Your server is using HTTPS!');
    } else {
        console.log(`\n⚠️  Server responded with status: ${res.statusCode}`);
    }
    
    process.exit(0);
});

req.on('error', (error) => {
    console.log('\n❌ HTTPS Connection Failed!');
    console.log(`   Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
        console.log('\n💡 Make sure your server is running on port 5443');
        console.log('   Run: npm start (with HTTPS enabled)');
    } else if (error.code === 'ENOTFOUND') {
        console.log('\n💡 Check your server configuration');
    }
    
    process.exit(1);
});

req.end();

