import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/app/lib/db';
import { User } from '@/app/models/User';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const rows = text.split('\n').slice(1); // Skip header row
    
    await connectDB();
    
    // Get the admin user's ID
    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const row of rows) {
      try {
        const [email, name] = row.split(',').map(field => field.trim());
        
        if (!email || !name) {
          results.failed++;
          results.errors.push(`Invalid data format for row: ${row}`);
          continue;
        }

        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tempPassword, salt);

        await User.create({
          email,
          name,
          passwordHash,
          role: 'student',
          isFirstLogin: true,
          status: 'active',
          createdBy: adminUser._id,
          passwordResetRequired: true,
        });

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(
          error.code === 11000 
            ? `User with email ${error.keyValue.email} already exists`
            : `Error creating user: ${error.message}`
        );
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error processing bulk import:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk import' },
      { status: 500 }
    );
  }
} 