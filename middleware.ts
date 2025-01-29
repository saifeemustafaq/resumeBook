import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/admin-login',
  '/student-login',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/admin/login',
  '/api/auth/student/login',
  '/api/auth/reset-password',
  '/api/auth/verify',
  '/api/auth/logout'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('=== Middleware Check ===');
  console.log('Path:', pathname);
  console.log('Timestamp:', new Date().toISOString());

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    console.log('✅ Public path access granted:', pathname);
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('auth-token')?.value;
  console.log('Auth token present:', !!token);

  if (!token) {
    console.log('❌ No token found, redirecting to login');
    const isAdminPath = pathname.includes('/admin');
    const loginPath = isAdminPath ? '/admin-login' : '/student-login';
    console.log('Redirecting to:', loginPath);
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  try {
    // Verify JWT token
    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ['HS256']
    }) as {
      userId: string;
      email: string;
      role: 'student' | 'admin';
      iat?: number;
      exp?: number;
    };
    
    console.log('Token decoded successfully');
    console.log('Token payload:', {
      ...decoded,
      iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : undefined,
      exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : undefined
    });

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      console.log('❌ Token has expired');
      const isAdminPath = pathname.includes('/admin');
      const loginPath = isAdminPath ? '/admin-login' : '/student-login';
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    // Check user type matches the path
    const isAdminPath = pathname.includes('/admin');
    const isAdminUser = decoded.role === 'admin';
    console.log('Path check - isAdminPath:', isAdminPath, 'isAdminUser:', isAdminUser);

    if (isAdminPath && !isAdminUser) {
      console.log('❌ Non-admin user trying to access admin path');
      return NextResponse.redirect(new URL('/student-login', request.url));
    }

    if (!isAdminPath && isAdminUser) {
      console.log('❌ Admin user trying to access student path');
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }

    console.log('✅ Access granted');
    return NextResponse.next();
  } catch (error) {
    // Token is invalid
    console.error('❌ Token verification failed:', error);
    const isAdminPath = pathname.includes('/admin');
    const loginPath = isAdminPath ? '/admin-login' : '/student-login';
    console.log('Redirecting to:', loginPath);
    return NextResponse.redirect(new URL(loginPath, request.url));
  }
}

// Configure paths that should be handled by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. Matches any path starting with:
     *  - api/auth (authentication endpoints)
     *  - _next/static (static files)
     *  - _next/image (image optimization files)
     *  - favicon.ico (favicon file)
     *  - public files (public folder)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 