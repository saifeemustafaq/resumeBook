import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../lib/db';
import { User } from '../models/User';

async function setupTestUsers() {
  try {
    await connectDB();
    console.log('Connected to MongoDB Atlas');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      email: 'admin@cmu.edu',
      passwordHash: adminPassword,
      role: 'admin',
      isFirstLogin: true,
      status: 'active',
      createdAt: new Date(),
    });
    console.log('Created admin user:', admin.email);

    // Create test students
    const students = [
      {
        email: 'student1@andrew.cmu.edu',
        name: 'John Smith',
        school: 'School of Computer Science',
        gpa: 3.95,
        yearsOfExperience: 2,
        graduationDate: '2024-05',
        linkedinUrl: 'https://linkedin.com/in/johnsmith',
        bio: 'Passionate about AI and Machine Learning',
      },
      {
        email: 'student2@andrew.cmu.edu',
        name: 'Emma Johnson',
        school: 'Tepper School of Business',
        gpa: 3.88,
        yearsOfExperience: 1,
        graduationDate: '2025-05',
        linkedinUrl: 'https://linkedin.com/in/emmajohnson',
        bio: 'Aspiring Product Manager with technical background',
      },
    ];

    for (const studentData of students) {
      const studentPassword = await bcrypt.hash('student123', 10);
      const student = await User.create({
        ...studentData,
        passwordHash: studentPassword,
        role: 'student',
        isFirstLogin: true,
        status: 'active',
        createdAt: new Date(),
      });
      console.log('Created student:', student.email);
    }

    console.log('\nTest users created successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin - Email: admin@cmu.edu, Password: admin123');
    console.log('Student 1 - Email: student1@andrew.cmu.edu, Password: student123');
    console.log('Student 2 - Email: student2@andrew.cmu.edu, Password: student123');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error setting up test users:', error);
    process.exit(1);
  }
}

setupTestUsers(); 