import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/app/lib/db';
import { User } from '@/app/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find admin user
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (admin.status !== 'active') {
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
      process.env.JWT_SECRET!,
      { expiresIn: '12h' } // Shorter session for admins
    );

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Create the response
    const response = NextResponse.json(
      { 
        success: true,
        isFirstLogin: admin.isFirstLogin,
        requiresPasswordReset: admin.passwordResetRequired
      },
      { status: 200 }
    );

    // Set secure cookie with shorter maxAge for admins
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 12 // 12 hours
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 