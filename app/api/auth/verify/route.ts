import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/app/lib/db';
import { User } from '@/app/models/User';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Auth Verification Attempt ===');
    console.log('Timestamp:', new Date().toISOString());
    
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    console.log('Token present:', !!token);
    
    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    try {
      // Verify token
      console.log('Attempting to verify JWT token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
        role: 'student' | 'admin';
      };
      console.log('✅ Token verified successfully');
      console.log('Token payload:', decoded);

      // Connect to database
      await connectDB();
      console.log('✅ Database connection established');

      // Get user data
      const user = await User.findOne(
        { _id: decoded.userId },
        { passwordHash: 0 } // Exclude password hash
      );
      console.log('User found:', !!user);

      if (!user) {
        console.log('❌ User not found in database');
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Check if account is still active
      console.log('Account status:', user.status);
      if (user.status !== 'active') {
        console.log('❌ Account is disabled');
        return NextResponse.json(
          { error: 'Account is disabled' },
          { status: 403 }
        );
      }

      // Return user data
      const userData = {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isFirstLogin: user.isFirstLogin,
          requiresPasswordReset: user.passwordResetRequired,
          lastLogin: user.lastLogin
        }
      };
      console.log('✅ Verification successful');
      console.log('User data:', userData);
      
      return NextResponse.json(userData);

    } catch (err) {
      // Token verification failed
      console.error('❌ Token verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('❌ Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 