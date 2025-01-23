import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || '';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'admin';
  isFirstLogin: boolean;
}

export async function verifyAuth(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function createToken(payload: JWTPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export async function protectedRoute(
  request: NextRequest,
  allowedRoles: ('student' | 'admin')[] = ['student', 'admin']
) {
  const user = await verifyAuth(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  return user;
} 