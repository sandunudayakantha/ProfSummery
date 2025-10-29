const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      name: 'System Administrator',
      email: 'admin@profitsummary.com',
      password: 'Admin123!',
      role: 'admin',
      isApproved: true,
      approvedAt: new Date(),
      currency: 'USD'
    };

    const admin = await User.create(adminData);
    console.log('Admin user created successfully:');
    console.log('Email:', admin.email);
    console.log('Password:', adminData.password);
    console.log('Role:', admin.role);
    console.log('Approved:', admin.isApproved);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Run the script
createAdmin();
