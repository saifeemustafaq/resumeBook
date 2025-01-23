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
        const response = await fetch('/api/auth/verify');
        const data = await response.json();

        if (!response.ok || data.userType !== userType) {
          router.push(`/${userType}-login`);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
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