import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/app/lib/db';
import { User } from '@/app/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('Admin login attempt for:', email);

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Find admin user
    const admin = await User.findOne({ email, role: 'admin' });
    console.log('Admin found:', admin ? 'Yes' : 'No');

    if (!admin) {
      console.log('No admin found with email:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password for admin:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (admin.status !== 'active') {
      console.log('Admin account is disabled:', email);
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: admin._id,
        email: admin.email,
        role: 'admin',
        isFirstLogin: admin.isFirstLogin
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    console.log('JWT token generated successfully');

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    console.log('Last login updated');

    // Create the response
    const response = NextResponse.json(
      { 
        success: true,
        isFirstLogin: admin.isFirstLogin,
        requiresPasswordReset: admin.passwordResetRequired
      },
      { status: 200 }
    );

    // Set secure cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12 // 12 hours
    });
    console.log('Auth cookie set');

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
} 