'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType: 'student' | 'admin';
}

export default function ProtectedRoute({ children, userType }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('ProtectedRoute: Verifying authentication...');
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        console.log('ProtectedRoute: Verification response:', data);

        if (!response.ok) {
          console.log('ProtectedRoute: Verification failed - response not ok');
          router.push(`/${userType}-login`);
          return;
        }

        // Check if user role matches required type
        if (data.user?.role !== userType) {
          console.log(`ProtectedRoute: User role (${data.user?.role}) doesn't match required type (${userType})`);
          router.push(`/${userType}-login`);
          return;
        }

        console.log('ProtectedRoute: Verification successful');
        setLoading(false);
      } catch (error) {
        console.error('ProtectedRoute: Auth verification error:', error);
        router.push(`/${userType}-login`);
      }
    };

    verifyAuth();
  }, [router, userType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
} 