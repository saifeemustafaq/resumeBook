import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/app/lib/db';
import { User, type IUser } from '@/app/models/User';
import bcrypt from 'bcryptjs';

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        passwordHash,
        isFirstLogin: true,
        passwordResetRequired: true,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Password reset successful',
      temporaryPassword: tempPassword,
    });
  } catch (error) {
    console.error('Error in reset password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 