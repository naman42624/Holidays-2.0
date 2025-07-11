const axios = require('axios');

async function testTourPackagesAPI() {
  try {
    console.log('Testing tour packages API endpoint...');
    const response = await axios.get('http://localhost:8000/api/tour-packages');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    console.log('API connection successful!');
  } catch (error) {
    console.error('Error testing tour packages API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testTourPackagesAPI();
