import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { StudentProfile } from '@/app/models/StudentProfile';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get only approved profiles with necessary fields
    const profiles = await StudentProfile.find(
      { isApproved: true },
      {
        name: 1,
        schoolName: 1,
        gpa: 1,
        yearsOfExperience: 1,
        graduationDate: 1,
        linkedinUrl: 1,
        bio: 1,
        profilePictureUrl: 1,
        resumeUrl: 1,
      }
    ).sort({ updatedAt: -1 });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error fetching student profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student profiles' },
      { status: 500 }
    );
  }
} 