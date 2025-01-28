import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { uploadFile, initializeStorage } from '@/app/lib/storage';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
      // Initialize storage and verify connection
      await initializeStorage();

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
        role: 'student' | 'admin';
      };

      if (decoded.role !== 'student') {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      const type = request.nextUrl.searchParams.get('type');
      if (!type || !['profile', 'resume'].includes(type)) {
        return new NextResponse('Invalid file type', { status: 400 });
      }

      const formData = await request.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return new NextResponse('No file provided', { status: 400 });
      }

      // Validate file type
      if (type === 'resume' && !file.type.includes('pdf')) {
        return new NextResponse('Only PDF files are allowed for resumes', { status: 400 });
      }

      if (type === 'profile' && !file.type.includes('image')) {
        return new NextResponse('Only JPEG and PNG files are allowed for profile pictures', { status: 400 });
      }

      // Upload file to Azure Storage
      const url = await uploadFile(
        file,
        type === 'resume' ? 'resumes' : 'profiles',
        decoded.email
      );

      return NextResponse.json({ url });
    } catch (err) {
      console.error('Error in upload handler:', err);
      if (err instanceof Error && err.name === 'AzureStorageError') {
        return new NextResponse('Storage service unavailable', { status: 503 });
      }
      if (err instanceof Error && err.name === 'StorageValidationError') {
        return new NextResponse(err.message, { status: 400 });
      }
      if (err instanceof Error && err.name === 'JsonWebTokenError') {
        return new NextResponse('Invalid token', { status: 401 });
      }
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 