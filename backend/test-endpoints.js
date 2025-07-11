#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

// Test the server endpoints
async function testEndpoints() {
  console.log('🧪 Testing Amadeus Travel Platform API endpoints...\n');

  try {
    // Test root endpoint
    console.log('1. Testing root endpoint...');
    const rootResponse = await axios.get(BASE_URL);
    console.log('✅ Root endpoint working');
    console.log('   Available endpoints:', Object.keys(rootResponse.data.endpoints));

    // Test health endpoint
    console.log('\n2. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health endpoint working');

    // Test playground endpoint
    console.log('\n3. Testing playground endpoint...');
    const playgroundResponse = await axios.get(`${BASE_URL}/api/playground`);
    console.log('✅ Playground endpoint working');
    console.log('   Available test endpoints:', Object.keys(playgroundResponse.data.data.availableEndpoints));

    // Test playground test data
    console.log('\n4. Testing playground test data...');
    const testDataResponse = await axios.get(`${BASE_URL}/api/playground/test?type=flight`);
    console.log('✅ Playground test data working');

    // Test auth endpoints (should fail without proper data)
    console.log('\n5. Testing auth endpoints...');
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, { email: 'test@test.com', password: 'wrongpassword' });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Auth endpoint working (correctly rejecting invalid credentials)');
      } else {
        console.log('❌ Auth endpoint error:', error.message);
      }
    }

    console.log('\n🎉 All basic endpoints are working correctly!');
    console.log('\n📋 Next steps:');
    console.log('   1. Set up your Amadeus API credentials in .env');
    console.log('   2. Start MongoDB for full functionality');
    console.log('   3. Test with real API calls using the playground');

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
    console.log('\n💡 Make sure the server is running: npm run dev');
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(BASE_URL, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🚀 Amadeus Travel Platform API Test Suite\n');
  
  const isServerRunning = await checkServer();
  
  if (!isServerRunning) {
    console.log('❌ Server is not running on port 8000');
    console.log('💡 Please start the server first: npm run dev');
    process.exit(1);
  }

  await testEndpoints();
}

main().catch(console.error);
