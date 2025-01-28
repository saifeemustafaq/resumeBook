import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/app/lib/db';
import { User } from '@/app/models/User';
import bcrypt from 'bcryptjs';

// Helper function to verify auth token
async function verifyAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      role: 'admin' | 'student';
    };

    if (payload.role !== 'admin') {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const users = await User.find({})
      .select('name email status lastLogin role')
      .sort({ name: 1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'User ID and status are required' },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { 
        new: true,
        select: 'name email status lastLogin'
      }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, role, school, gpa, yearsOfExperience, graduationDate, linkedinUrl, bio } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    // Create the user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      isFirstLogin: true,
      status: 'active',
      createdBy: auth.userId,
      passwordResetRequired: false,
      // Optional student profile fields
      ...(role === 'student' && {
        school: school || '',
        gpa: gpa || null,
        yearsOfExperience: yearsOfExperience || null,
        graduationDate: graduationDate || '',
        linkedinUrl: linkedinUrl || '',
        bio: bio || ''
      })
    });

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      temporaryPassword: tempPassword
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 