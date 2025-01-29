import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/db';
import { StudentProfile } from '../../../models/StudentProfile';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    console.log('=== Admin Profiles GET Request ===');
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
      
      console.log('Fetching all profiles...');
      const profiles = await StudentProfile.find({})
        .select('name email schoolName gpa yearsOfExperience graduationDate isApproved')
        .sort({ createdAt: -1 });
      
      console.log('Profiles found:', profiles.length);
      console.log('Profile emails:', profiles.map(p => p.email));

      return NextResponse.json(profiles);
    } catch (err) {
      console.error('❌ Token verification error:', err);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('❌ Error fetching profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
} 