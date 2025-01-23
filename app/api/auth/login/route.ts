import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import connectDB from '@/app/lib/db';
import { createToken } from '@/app/lib/auth';
import { User } from '@/app/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 403 }
      );
    }

    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      role: 'student',
      isFirstLogin: user.isFirstLogin
    });

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    const response = NextResponse.json({
      user: {
        email: user.email,
        role: 'student',
        isFirstLogin: user.isFirstLogin
      }
    });

    // Set cookie in the response
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 