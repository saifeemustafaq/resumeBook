'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  userType: 'student' | 'admin';
}

export default function Header({ userType }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              CMU Resume Book
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {userType === 'student' && (
              <Link
                href="/student-dashboard"
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}
            
            {userType === 'admin' && (
              <Link
                href="/admin-dashboard"
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
} 