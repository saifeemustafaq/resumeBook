import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/db';
import { StudentProfile } from '../../../models/StudentProfile';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    // Verify admin token
    const token = await getToken({ req });
    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const profiles = await StudentProfile.find({})
      .select('name email schoolName gpa yearsOfExperience graduationDate isApproved')
      .sort({ createdAt: -1 });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
} 