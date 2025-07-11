const mongoose = require('mongoose');
require('dotenv').config();

async function fixUserIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    console.log('Checking existing indexes...');
    
    // List all indexes
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:');
    indexes.forEach(index => {
      console.log('-', JSON.stringify(index.key), index.name);
    });
    
    // Check if username_1 index exists
    const hasUsernameIndex = indexes.some(index => index.name === 'username_1');
    
    if (hasUsernameIndex) {
      console.log('\n❌ Found problematic username_1 index');
      console.log('Dropping username_1 index...');
      
      try {
        await usersCollection.dropIndex('username_1');
        console.log('✅ Successfully dropped username_1 index');
      } catch (dropError) {
        console.log('Error dropping index:', dropError.message);
      }
    } else {
      console.log('\n✅ No username_1 index found');
    }
    
    // Show indexes after cleanup
    console.log('\nIndexes after cleanup:');
    const finalIndexes = await usersCollection.indexes();
    finalIndexes.forEach(index => {
      console.log('-', JSON.stringify(index.key), index.name);
    });
    
    // Verify the correct indexes exist
    const hasEmailIndex = finalIndexes.some(index => 
      index.key.email && index.unique === true
    );
    
    if (!hasEmailIndex) {
      console.log('\n⚠️  Email index missing, creating...');
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      console.log('✅ Created email index');
    }
    
    console.log('\n✅ User collection indexes are now correct');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixUserIndexes();
