import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connect } from '../../../lib/db';
import { StudentProfile } from '../../../models/StudentProfile';
import { deleteFile } from '../../../lib/storage';

// Initialize MongoDB connection
connect();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await StudentProfile.findOne({ email: session.user.email });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileData = await req.json();

    // Find existing profile to handle file cleanup
    const existingProfile = await StudentProfile.findOne({ email: session.user.email });
    
    if (existingProfile) {
      // Delete old files if they're being replaced
      if (existingProfile.resumeUrl && existingProfile.resumeUrl !== profileData.resumeUrl) {
        await deleteFile(existingProfile.resumeUrl);
      }
      if (existingProfile.profilePictureUrl && existingProfile.profilePictureUrl !== profileData.profilePictureUrl) {
        await deleteFile(existingProfile.profilePictureUrl);
      }
    }

    // Add or update profile
    const profile = await StudentProfile.findOneAndUpdate(
      { email: session.user.email },
      { ...profileData, email: session.user.email },
      { upsert: true, new: true }
    );

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find profile to get file URLs before deletion
    const profile = await StudentProfile.findOne({ email: session.user.email });
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
    await StudentProfile.deleteOne({ email: session.user.email });

    return NextResponse.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 