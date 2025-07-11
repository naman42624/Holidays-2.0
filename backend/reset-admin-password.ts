import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/amadeus-travel';

async function resetAdminPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const newPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await User.updateOne(
      { email: 'admin@example.com' },
      { $set: { password: hashedPassword } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('Admin password reset successfully');
      console.log(`New password: ${newPassword}`);
    } else if (result.matchedCount > 0) {
      console.log('Admin user found but password was not changed (might be the same)');
    } else {
      console.log('Admin user not found');
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error resetting admin password:', error);
  }
}

resetAdminPassword();
