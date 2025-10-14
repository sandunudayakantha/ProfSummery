const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB Connection...\n');
console.log('MongoDB URI:', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@')); // Hide password
console.log('');

const testConnection = async () => {
  try {
    console.log('⏳ Attempting to connect...');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });

    console.log('\n✅ SUCCESS! MongoDB Connected');
    console.log('📍 Host:', conn.connection.host);
    console.log('📦 Database:', conn.connection.name);
    console.log('🔌 Port:', conn.connection.port);
    console.log('');
    
    // Test creating a simple document
    console.log('⏳ Testing database write...');
    const TestModel = mongoose.model('Test', new mongoose.Schema({ test: String }));
    const testDoc = await TestModel.create({ test: 'Connection test' });
    console.log('✅ Write test successful!');
    
    // Clean up
    await TestModel.deleteMany({});
    console.log('✅ Cleanup complete');
    
    console.log('\n🎉 All tests passed! Your database is ready to use.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ CONNECTION FAILED!');
    console.error('Error:', error.message);
    console.error('\n📝 Common issues and solutions:\n');
    
    if (error.message.includes('authentication failed')) {
      console.error('   1. ❌ Wrong username or password');
      console.error('      → Check your MongoDB Atlas credentials');
      console.error('      → Password may need URL encoding for special characters');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('   1. ❌ Cannot reach MongoDB server');
      console.error('      → Check your internet connection');
      console.error('      → Verify the cluster URL is correct');
    } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.error('   1. ❌ IP not whitelisted');
      console.error('      → Go to MongoDB Atlas → Network Access');
      console.error('      → Add your IP or use 0.0.0.0/0 (allow from anywhere)');
    } else {
      console.error('   1. ❌ Unknown error');
      console.error('      → Full error:', error);
    }
    
    console.error('\n');
    process.exit(1);
  }
};

testConnection();

