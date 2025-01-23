import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/app/lib/db';
import { User } from '@/app/models/User';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
        role: 'student' | 'admin';
      };

      // Connect to database
      await connectDB();

      // Get user data
      const user = await User.findOne(
        { _id: decoded.userId },
        { passwordHash: 0 } // Exclude password hash
      );

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Check if account is still active
      if (user.status !== 'active') {
        return NextResponse.json(
          { error: 'Account is disabled' },
          { status: 403 }
        );
      }

      // Return user data
      return NextResponse.json({
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isFirstLogin: user.isFirstLogin,
          requiresPasswordReset: user.passwordResetRequired,
          lastLogin: user.lastLogin
        }
      });

    } catch (err) {
      // Token verification failed
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 