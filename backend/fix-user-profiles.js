const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/amadeus-travel');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// User schema (simplified for this script)
const userSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  preferences: {
    currency: String,
    language: String,
    timezone: String,
  },
  profile: {
    dateOfBirth: Date,
    phone: String,
    address: {
      street: String,
      city: String,
      country: String,
      postalCode: String,
    },
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function fixUserProfile() {
  await connectDB();

  try {
    // Update all users to have a profile field if they don't have one
    const result = await User.updateMany(
      { 
        $or: [
          { profile: { $exists: false } },
          { profile: null }
        ]
      },
      { 
        $set: { 
          profile: {
            dateOfBirth: null,
            phone: '',
            address: {
              street: '',
              city: '',
              country: '',
              postalCode: ''
            }
          }
        }
      }
    );

    console.log('Updated', result.modifiedCount, 'users with profile field');

    // Check the test user specifically
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (testUser) {
      console.log('Test user profile:', JSON.stringify(testUser.profile, null, 2));
    }

  } catch (error) {
    console.error('Error fixing user profiles:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixUserProfile();
