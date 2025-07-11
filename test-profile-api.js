const axios = require('axios');

async function testProfileAPI() {
  console.log('Testing profile API...');
  
  // First, let's try to login and get a token
  try {
    console.log('1. Testing login...');
    const loginResponse = await axios.post('http://localhost:8000/api/auth/login', {
      email: 'test@example.com', // Replace with actual test email
      password: 'testpassword'   // Replace with actual test password
    });
    
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('\n2. User data from login:');
    console.log('User structure:', JSON.stringify(user, null, 2));
    
    // Now test the profile endpoint
    console.log('\n3. Testing profile endpoint...');
    const profileResponse = await axios.get('http://localhost:8000/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Profile response:', JSON.stringify(profileResponse.data, null, 2));
    
    const profileUser = profileResponse.data.data.user;
    console.log('\n4. User data from profile endpoint:');
    console.log('Profile user structure:', JSON.stringify(profileUser, null, 2));
    
    // Check if nested objects exist
    console.log('\n5. Checking nested objects:');
    console.log('preferences:', profileUser.preferences);
    console.log('profile:', profileUser.profile);
    console.log('profile.address:', profileUser.profile?.address);
    
  } catch (error) {
    console.error('Error testing profile API:', error.response?.data || error.message);
  }
}

testProfileAPI();
