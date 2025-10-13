'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        setLoading(false);
        return;
      }

      login(data.data.token, data.data.user);
      router.push('/events');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

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
            SIGN IN TO NOLALOCAL
          </h2>
          <p 
            className="mt-2 text-center text-sm"
            style={{ 
              fontFamily: 'Open Sans, sans-serif',
              color: 'var(--text-secondary)'
            }}
          >
            Welcome back to the community
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
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold mb-2"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  color: 'var(--text-primary)'
                }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
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
                placeholder="Enter your password"
              />
            </div>
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <a 
              href="/forgot-password" 
              className="block font-medium text-sm"
              style={{
                fontFamily: 'Open Sans, sans-serif',
                color: '#4F46E5'
              }}
            >
              Forgot your password?
            </a>
            <a 
              href="/signup" 
              className="block font-medium"
              style={{
                fontFamily: 'Open Sans, sans-serif',
                color: '#4F46E5'
              }}
            >
              Don't have an account? Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}