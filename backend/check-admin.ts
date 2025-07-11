import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/amadeus-travel';

async function checkAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const adminUser = await User.findOne({ email: 'admin@example.com' }).select('+password');
    
    if (adminUser) {
      console.log('Admin user found:');
      console.log({
        id: adminUser._id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
        hasPassword: !!adminUser.password,
        passwordLength: adminUser.password?.length
      });
    } else {
      console.log('Admin user not found');
    }
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error checking admin user:', error);
  }
}

checkAdminUser();
