const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  role: String,
  isFirstLogin: Boolean,
  status: String,
  passwordResetRequired: Boolean
});

const User = mongoose.model('User', userSchema);

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admin = await User.findOne({ email: 'admin@cmu.edu' });
    console.log('Admin user state:', {
      email: admin.email,
      isFirstLogin: admin.isFirstLogin,
      status: admin.status,
      passwordResetRequired: admin.passwordResetRequired
    });
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdmin(); 