'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not logged in - redirect to home
      if (!user) {
        router.push('/');
      }
      // Logged in but not verified - redirect to home
      else if (!user.isVerified) {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <p style={{ fontFamily: 'Open Sans, sans-serif', color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  // Don't render if no user or not verified
  if (!user || !user.isVerified) {
    return null;
  }

  return <>{children}</>;
}