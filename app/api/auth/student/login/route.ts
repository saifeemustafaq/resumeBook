import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/app/lib/db';
import { User } from '@/app/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('Student login attempt for:', email);

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

    // Find student user
    const student = await User.findOne({ email, role: 'student' });
    console.log('Student found:', student ? 'Yes' : 'No');

    if (!student) {
      console.log('No student found with email:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, student.passwordHash);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password for student:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (student.status !== 'active') {
      console.log('Student account is disabled:', email);
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const tokenPayload = { 
      userId: student._id,
      email: student.email,
      role: 'student',
      isFirstLogin: student.isFirstLogin,
      iat: Math.floor(Date.now() / 1000) // Explicitly set issued at time
    };
    console.log('Token payload:', tokenPayload);

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { 
        expiresIn: '24h',
        algorithm: 'HS256'
      }
    );
    console.log('JWT token generated successfully');

    // Update last login
    student.lastLogin = new Date();
    await student.save();
    console.log('Last login updated');

    // Create the response
    const response = NextResponse.json(
      { 
        success: true,
        isFirstLogin: student.isFirstLogin,
        requiresPasswordReset: student.passwordResetRequired
      },
      { status: 200 }
    );

    // Set secure cookie with explicit domain and path
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    };
    console.log('Setting cookie with options:', cookieOptions);
    
    response.cookies.set('auth-token', token, cookieOptions);
    console.log('Auth cookie set');

    return response;

  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
} 