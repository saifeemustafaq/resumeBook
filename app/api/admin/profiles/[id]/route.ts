import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/db';
import { StudentProfile } from '../../../../models/StudentProfile';
import jwt from 'jsonwebtoken';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Admin Profile Toggle Request ===');
    console.log('Profile ID:', params.id);
    
    // Get token from cookie
    const token = req.cookies.get('auth-token')?.value;
    console.log('Token present:', !!token);
    
    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json(
        { error: 'Unauthorized' },
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
      console.log('Token verified. User:', decoded.email, 'Role:', decoded.role);

      if (decoded.role !== 'admin') {
        console.log('❌ Non-admin role:', decoded.role);
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      console.log('Connecting to database...');
      await connectToDatabase();
      console.log('Database connected');
      
      console.log('Finding profile...');
      const profile = await StudentProfile.findById(params.id);
      if (!profile) {
        console.log('❌ Profile not found');
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }
      console.log('Current profile status:', profile.isApproved);

      // Toggle isApproved status
      profile.isApproved = !profile.isApproved;
      await profile.save();
      console.log('✅ Profile visibility updated to:', profile.isApproved);

      return NextResponse.json({
        message: 'Profile visibility updated successfully',
        isApproved: profile.isApproved
      });
    } catch (err) {
      console.error('❌ Token verification error:', err);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('❌ Error updating profile visibility:', error);
    return NextResponse.json(
      { error: 'Failed to update profile visibility' },
      { status: 500 }
    );
  }
} 