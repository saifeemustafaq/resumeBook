import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/db';
import { StudentProfile } from '../../../../models/StudentProfile';
import { getToken } from 'next-auth/jwt';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const profile = await StudentProfile.findById(params.id);
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Toggle isApproved status
    profile.isApproved = !profile.isApproved;
    await profile.save();

    return NextResponse.json({
      message: 'Profile visibility updated successfully',
      isApproved: profile.isApproved
    });
  } catch (error) {
    console.error('Error updating profile visibility:', error);
    return NextResponse.json(
      { error: 'Failed to update profile visibility' },
      { status: 500 }
    );
  }
} 