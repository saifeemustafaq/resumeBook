import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/app/lib/db';
import { StudentProfile } from '@/app/models/StudentProfile';
import { deleteFile } from '../../../lib/storage';

export async function GET(req: NextRequest) {
  try {
    console.log('=== Student Profile GET Request ===');
    // Get token from cookie
    const token = req.cookies.get('auth-token')?.value;
    console.log('Token present:', !!token);
    
    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Verify token
      console.log('Verifying token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
        role: 'student' | 'admin';
      };
      console.log('Token verified. User:', decoded.email, 'Role:', decoded.role);

      if (decoded.role !== 'student') {
        console.log('❌ Non-student role:', decoded.role);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      console.log('Connecting to database...');
      await connectDB();
      console.log('Database connected');
      
      console.log('Finding profile for email:', decoded.email);
      const profile = await StudentProfile.findOne({ email: decoded.email });
      console.log('Profile found:', !!profile);
      
      if (!profile) {
        console.log('❌ No profile found');
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      console.log('✅ Profile found and returned');
      return NextResponse.json(profile);
    } catch (err) {
      console.error('❌ Token verification error:', err);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
        role: 'student' | 'admin';
      };

      if (decoded.role !== 'student') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const data = await req.json();
      await connectDB();

      // Validate required fields
      const requiredFields = ['name', 'schoolName', 'gpa', 'yearsOfExperience', 'graduationDate', 'linkedinUrl', 'bio'];
      for (const field of requiredFields) {
        if (!data[field]) {
          return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
        }
      }

      // Validate GPA range
      if (data.gpa < 1.0 || data.gpa > 4.04) {
        return NextResponse.json({ error: 'GPA must be between 1.0 and 4.04' }, { status: 400 });
      }

      // Validate LinkedIn URL
      if (!data.linkedinUrl.includes('linkedin.com')) {
        return NextResponse.json({ error: 'Invalid LinkedIn URL' }, { status: 400 });
      }

      // Validate bio length
      if (data.bio.length > 100) {
        return NextResponse.json({ error: 'Bio must be 100 characters or less' }, { status: 400 });
      }

      // Find existing profile to handle file cleanup
      const existingProfile = await StudentProfile.findOne({ email: decoded.email });
      
      if (existingProfile) {
        // Delete old files if they're being replaced
        if (existingProfile.resumeUrl && existingProfile.resumeUrl !== data.resumeUrl) {
          await deleteFile(existingProfile.resumeUrl);
        }
        if (existingProfile.profilePictureUrl && existingProfile.profilePictureUrl !== data.profilePictureUrl) {
          await deleteFile(existingProfile.profilePictureUrl);
        }
      }

      // Add or update profile
      const profile = await StudentProfile.findOneAndUpdate(
        { email: decoded.email },
        {
          ...data,
          email: decoded.email,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      return NextResponse.json(profile);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
        role: 'student' | 'admin';
      };

      if (decoded.role !== 'student') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      await connectDB();
      // Find profile to get file URLs before deletion
      const profile = await StudentProfile.findOne({ email: decoded.email });
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      // Delete files from storage
      if (profile.resumeUrl) {
        await deleteFile(profile.resumeUrl);
      }
      if (profile.profilePictureUrl) {
        await deleteFile(profile.profilePictureUrl);
      }

      // Delete profile from database
      await StudentProfile.deleteOne({ email: decoded.email });

      return NextResponse.json({ message: 'Profile deleted successfully' });
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 