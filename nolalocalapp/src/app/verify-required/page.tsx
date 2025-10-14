'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyRequiredPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    // Get email from localStorage if available
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('unverifiedEmail') || 'your email';
      setEmail(storedEmail);
    }
  }, []);

  const handleBackToHome = () => {
    // Clear any auth tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('unverifiedEmail');
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-12 h-12 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            EMAIL VERIFICATION REQUIRED
          </h1>

          <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
            Please verify your email address to access NolaLocal.
          </p>

          <p className="mb-8 text-gray-600 dark:text-gray-300">
            We sent a verification link to <strong className="text-gray-900 dark:text-white">{email}</strong>
          </p>

          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Check your inbox and click the verification link to activate your account.
            </p>

            <button
              onClick={handleBackToHome}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}