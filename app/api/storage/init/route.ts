import { NextResponse } from 'next/server';
import { initializeStorage } from '@/app/lib/storage';

export async function GET() {
  try {
    await initializeStorage();
    return NextResponse.json({ message: 'Storage initialized successfully' });
  } catch (error) {
    console.error('Failed to initialize storage:', error);
    return NextResponse.json(
      { error: 'Failed to initialize storage' },
      { status: 500 }
    );
  }
} 