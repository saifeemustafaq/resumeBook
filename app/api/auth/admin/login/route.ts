import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/app/lib/db';
import { User } from '@/app/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('=== Admin Login Attempt ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Email:', email);

    // Validate input
    if (!email || !password) {
      console.log('❌ Validation Error: Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error('❌ Server Error: JWT_SECRET is not defined');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Connect to database
    await connectDB();
    console.log('✅ Database connection established');

    // Find admin user
    const admin = await User.findOne({ email, role: 'admin' });
    console.log('Admin lookup result:', admin ? '✅ Found' : '❌ Not found');

    if (!admin) {
      console.log('❌ Authentication failed: No admin found with email:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    console.log('Password verification:', isValidPassword ? '✅ Valid' : '❌ Invalid');

    if (!isValidPassword) {
      console.log('❌ Authentication failed: Invalid password for admin:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is active
    console.log('Account status:', admin.status);
    if (admin.status !== 'active') {
      console.log('❌ Access denied: Admin account is disabled:', email);
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const tokenPayload = { 
      userId: admin._id,
      email: admin.email,
      role: 'admin',
      isFirstLogin: admin.isFirstLogin
    };
    console.log('Token payload:', tokenPayload);
    
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    console.log('✅ JWT token generated successfully');

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    console.log('✅ Last login timestamp updated');

    // Create the response
    const responseData = { 
      success: true,
      isFirstLogin: admin.isFirstLogin,
      requiresPasswordReset: admin.passwordResetRequired
    };
    console.log('Response data:', responseData);
    
    const response = NextResponse.json(responseData, { status: 200 });

    // Set secure cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as 'lax' | 'strict' | 'none',
      path: '/',
      maxAge: 60 * 60 * 12 // 12 hours
    };
    console.log('Cookie options:', cookieOptions);
    
    response.cookies.set('auth-token', token, cookieOptions);
    console.log('✅ Auth cookie set successfully');

    return response;

  } catch (error) {
    console.error('❌ Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
} 