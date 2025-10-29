const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '..', '.env');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  process.exit(0);
}

// Generate JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

// Create .env content
const envContent = `# Node Environment
NODE_ENV=development

# Server Port
PORT=5002

# MongoDB Connection
# For local MongoDB: mongodb://localhost:27017/profitsummary
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/profitsummary
MONGODB_URI=mongodb://localhost:27017/profitsummary

# JWT Secret Key (Generated automatically)
JWT_SECRET=${jwtSecret}
`;

// Write .env file
fs.writeFileSync(envPath, envContent);

console.log('✅ .env file created successfully!');
console.log('📝 Please update MONGODB_URI with your actual MongoDB connection string');
console.log('🔑 JWT_SECRET has been generated automatically');
console.log('');
console.log('Next steps:');
console.log('1. Update MONGODB_URI in backend/.env');
console.log('2. Run: npm run create-admin');
console.log('3. Start the server: npm run dev');
