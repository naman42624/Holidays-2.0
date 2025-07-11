const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

async function testLogin() {
  try {
    console.log('Testing login functionality...');
    
    // Test server connection
    console.log('1. Testing server connection...');
    const healthResponse = await axios.get(`${BASE_URL.replace('/api', '')}/`);
    console.log('✅ Server is running:', healthResponse.data.message);
    
    // Test registration (create a test user)
    console.log('\n2. Testing registration...');
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };
    
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ Registration successful:', registerResponse.data.message);
    } catch (registerError) {
      if (registerError.response?.data?.error?.includes('already exists')) {
        console.log('ℹ️  User already exists, proceeding with login test...');
      } else {
        console.log('❌ Registration failed:', registerError.response?.data?.error || registerError.message);
      }
    }
    
    // Test login
    console.log('\n3. Testing login...');
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('📝 Token received:', loginResponse.data.data.token.slice(0, 20) + '...');
    console.log('👤 User data:', {
      firstName: loginResponse.data.data.user.firstName,
      lastName: loginResponse.data.data.user.lastName,
      email: loginResponse.data.data.user.email
    });
    
    // Test profile access
    console.log('\n4. Testing profile access...');
    const token = loginResponse.data.data.token;
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Profile access successful:', profileResponse.data.data.user.firstName, profileResponse.data.data.user.lastName);
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.error || error.message);
    console.log('Full error:', error.response?.data || error.message);
  }
}

testLogin();
