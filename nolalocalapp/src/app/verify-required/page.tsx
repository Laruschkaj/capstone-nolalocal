'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';

export default function VerifyRequiredPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div 
          className="rounded-2xl shadow-lg p-12 text-center"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          <div className="mb-6">
            <span className="material-symbols-outlined text-6xl" style={{ color: '#F59E0B' }}>
              mark_email_unread
            </span>
          </div>
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ 
              fontFamily: 'Bebas Neue, sans-serif',
              color: 'var(--text-primary)'
            }}
          >
            EMAIL VERIFICATION REQUIRED 📧
          </h1>
          <p 
            className="text-lg mb-6"
            style={{ fontFamily: 'Open Sans, sans-serif', color: 'var(--text-secondary)' }}
          >
            Please verify your email address to access NolaLocal.
          </p>
          <p 
            className="mb-8"
            style={{ fontFamily: 'Open Sans, sans-serif', color: 'var(--text-secondary)' }}
          >
            We sent a verification link to <strong>{user?.email}</strong>
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-xl font-semibold"
            style={{
              fontFamily: 'Open Sans, sans-serif',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}