'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
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
          className="max-w-md w-full p-8 rounded-2xl shadow-lg"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          <div className="text-center">
            <span className="text-6xl mb-4 block">📧</span>
            <h3 
              className="text-2xl font-bold mb-4"
              style={{ 
                fontFamily: 'Bebas Neue, sans-serif',
                color: 'var(--text-primary)'
              }}
            >
              CHECK YOUR EMAIL!
            </h3>
            <p 
              className="mb-2"
              style={{ 
                fontFamily: 'Open Sans, sans-serif',
                color: 'var(--text-secondary)'
              }}
            >
              We sent a password reset link to:
            </p>
            <p 
              className="font-semibold mb-6"
              style={{ 
                fontFamily: 'Open Sans, sans-serif',
                color: 'var(--text-primary)'
              }}
            >
              {email}
            </p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{
                fontFamily: 'Open Sans, sans-serif',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF'
              }}
            >
              Back to Login
            </button>
          </div>
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
            FORGOT PASSWORD?
          </h2>
          <p 
            className="mt-2 text-center"
            style={{ 
              fontFamily: 'Open Sans, sans-serif',
              color: 'var(--text-secondary)'
            }}
          >
            Enter your email and we'll send you a reset link
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

          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-semibold mb-2"
              style={{ 
                fontFamily: 'Open Sans, sans-serif',
                color: 'var(--text-primary)'
              }}
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ 
                fontFamily: 'Open Sans, sans-serif',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl font-semibold transition-colors disabled:opacity-50"
              style={{
                fontFamily: 'Open Sans, sans-serif',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF'
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>

          <div className="text-center">
            <a 
              href="/login" 
              className="font-medium"
              style={{
                fontFamily: 'Open Sans, sans-serif',
                color: '#4F46E5'
              }}
            >
              Back to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}