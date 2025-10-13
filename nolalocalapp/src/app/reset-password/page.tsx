'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center py-12 px-4"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div 
          className="max-w-md w-full p-8 rounded-2xl shadow-lg text-center"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          <span className="text-6xl mb-4 block">✅</span>
          <h3 
            className="text-2xl font-bold mb-4"
            style={{ 
              fontFamily: 'Bebas Neue, sans-serif',
              color: 'var(--text-primary)'
            }}
          >
            PASSWORD RESET!
          </h3>
          <p 
            style={{ 
              fontFamily: 'Open Sans, sans-serif',
              color: 'var(--text-secondary)'
            }}
          >
            Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 
            className="mt-6 text-center text-4xl font-bold"
            style={{ 
              fontFamily: 'Bebas Neue, sans-serif',
              color: 'var(--text-primary)'
            }}
          >
            RESET YOUR PASSWORD
          </h2>
          <p 
            className="mt-2 text-center"
            style={{ 
              fontFamily: 'Open Sans, sans-serif',
              color: 'var(--text-secondary)'
            }}
          >
            Enter your new password below
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div 
              className="rounded-lg p-4"
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <p 
                className="text-sm"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  color: '#DC2626'
                }}
              >
                {error}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold mb-2"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  color: 'var(--text-primary)'
                }}
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
                placeholder="Min 8 characters"
              />
            </div>
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-semibold mb-2"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  color: 'var(--text-primary)'
                }}
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 px-6 rounded-xl font-semibold transition-colors disabled:opacity-50"
              style={{
                fontFamily: 'Open Sans, sans-serif',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF'
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <p style={{ fontFamily: 'Open Sans, sans-serif', color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}