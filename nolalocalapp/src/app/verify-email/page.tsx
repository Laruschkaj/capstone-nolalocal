'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div 
          className="rounded-2xl shadow-lg p-12 text-center"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          {status === 'loading' && (
            <>
              <div className="mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
              <h1 
                className="text-4xl font-bold mb-4"
                style={{ 
                  fontFamily: 'Bebas Neue, sans-serif',
                  color: 'var(--text-primary)'
                }}
              >
                VERIFYING YOUR EMAIL...
              </h1>
              <p style={{ fontFamily: 'Open Sans, sans-serif', color: 'var(--text-secondary)' }}>
                Please wait a moment
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-6">
                <span className="text-6xl">✅</span>
              </div>
              <h1 
                className="text-4xl font-bold mb-4"
                style={{ 
                  fontFamily: 'Bebas Neue, sans-serif',
                  color: 'var(--text-primary)'
                }}
              >
                EMAIL VERIFIED!
              </h1>
              <p 
                className="text-lg mb-4"
                style={{ fontFamily: 'Open Sans, sans-serif', color: 'var(--text-secondary)' }}
              >
                {message}
              </p>
              <p 
                className="text-sm"
                style={{ fontFamily: 'Open Sans, sans-serif', color: 'var(--text-secondary)' }}
              >
                Check your email for a welcome message! Redirecting you to login...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-6">
                <span className="text-6xl">❌</span>
              </div>
              <h1 
                className="text-4xl font-bold mb-4"
                style={{ 
                  fontFamily: 'Bebas Neue, sans-serif',
                  color: 'var(--text-primary)'
                }}
              >
                VERIFICATION FAILED
              </h1>
              <p 
                className="text-lg mb-6"
                style={{ fontFamily: 'Open Sans, sans-serif', color: 'var(--text-secondary)' }}
              >
                {message}
              </p>
              <button
                onClick={() => router.push('/signup')}
                className="px-6 py-3 rounded-xl font-semibold"
                style={{
                  fontFamily: 'Open Sans, sans-serif',
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF'
                }}
              >
                Back to Signup
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <p style={{ fontFamily: 'Open Sans, sans-serif', color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}