'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        setLoading(false);
        return;
      }

      // Don't auto-login - show success message instead
      setSuccess(true);
      
      // Redirect to landing page after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
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
            <span 
              className="material-symbols-outlined text-6xl mb-4"
              style={{ color: '#10B981' }}
            >
              mark_email_read
            </span>
            <h3 
              className="text-2xl font-bold mb-4"
              style={{ 
                fontFamily: 'Bebas Neue, sans-serif',
                color: 'var(--text-primary)'
              }}
            >
              CHECK YOUR EMAIL! 📧
            </h3>
            <p 
              className="text-lg mb-2"
              style={{ 
                fontFamily: 'Open Sans, sans-serif',
                color: 'var(--text-secondary)'
              }}
            >
              We sent a verification link to:
            </p>
            <p 
              className="font-semibold mb-4"
              style={{ 
                fontFamily: 'Open Sans, sans-serif',
                color: 'var(--text-primary)'
              }}
            >
              {email}
            </p>
            <p 
              className="text-sm"
              style={{ 
                fontFamily: 'Open Sans, sans-serif',
                color: 'var(--text-secondary)'
              }}
            >
              Click the link in the email to verify your account and get started!
            </p>
            <p 
              className="text-xs mt-4"
              style={{ 
                fontFamily: 'Open Sans, sans-serif',
                color: 'var(--text-secondary)'
              }}
            >
              Redirecting to home page...
            </p>
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
            CREATE YOUR ACCOUNT
          </h2>
          <p 
            className="mt-2 text-center text-sm"
            style={{ 
              fontFamily: 'Open Sans, sans-serif',
              color: 'var(--text-secondary)'
            }}
          >
            Join the NolaLocal community
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
                htmlFor="username" 
                className="block text-sm font-semibold mb-2"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  color: 'var(--text-primary)'
                }}
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
                placeholder="Choose a username"
              />
            </div>
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
                autoComplete="new-password"
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
              {loading ? 'Creating account...' : 'Sign up'}
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
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}