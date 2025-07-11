const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema (simplified for debugging)
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function debugUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find all users
    const users = await User.find({}).select('+password');
    console.log(`Found ${users.length} users in database`);
    
    for (const user of users) {
      console.log('\n--- User:', user.email, '---');
      console.log('Password hash:', user.password);
      console.log('Hash length:', user.password.length);
      console.log('Hash starts with $2:', user.password.startsWith('$2'));
      
      // Try to identify double-hashed passwords
      if (user.password.startsWith('$2')) {
        console.log('✅ Appears to be properly hashed');
        
        // Test with a common password
        const testPassword = 'password123';
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`Testing with '${testPassword}':`, isValid);
        
        // Test with different common passwords
        const commonPasswords = ['password', '123456', 'admin', 'test'];
        for (const pwd of commonPasswords) {
          const test = await bcrypt.compare(pwd, user.password);
          if (test) {
            console.log(`✅ Found matching password: '${pwd}'`);
          }
        }
      } else {
        console.log('❌ NOT properly hashed (possible double-hash or plaintext)');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

async function resetUserPassword(email, newPassword) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Current password hash:', user.password);
    
    // Hash the new password properly
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('New password hash:', hashedPassword);
    
    // Update user with new password
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    
    console.log('✅ Password updated successfully');
    
    // Test the new password
    const testUser = await User.findOne({ email: email.toLowerCase() });
    const isValid = await bcrypt.compare(newPassword, testUser.password);
    console.log('Password verification test:', isValid);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Command line arguments
const command = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

if (command === 'debug') {
  debugUsers();
} else if (command === 'reset' && email && password) {
  resetUserPassword(email, password);
  console.log(`Resetting password for ${email} to '${password}'`);
} else {
  console.log('Usage:');
  console.log('  node debug-users.js debug                    # Debug all users');
  console.log('  node debug-users.js reset <email> <password> # Reset user password');
  console.log('');
  console.log('Examples:');
  console.log('  node debug-users.js debug');
  console.log('  node debug-users.js reset test@example.com password123');
}
