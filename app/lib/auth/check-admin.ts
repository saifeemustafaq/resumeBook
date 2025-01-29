import { verifyAuth } from '../auth';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function checkAdmin(): Promise<boolean> {
  try {
    const request = new NextRequest('http://localhost', {
      headers: {
        cookie: cookies().toString()
      }
    });
    const user = await verifyAuth(request);
    return user?.role === 'admin';
  } catch (error) {
    return false;
  }
} 