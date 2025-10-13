'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import WeatherWidget from '@/components/weather/WeatherWidget';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav style={{ backgroundColor: 'var(--nav-bg)' }} className="backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Desktop Nav */}
        <div className="hidden lg:flex justify-between items-center">
          {/* Left Side */}
          <div className="flex items-center gap-8">
            <h1 
              onClick={() => router.push('/')}
              className="text-4xl font-bold cursor-pointer hover:opacity-70 transition-opacity"
              style={{ 
                fontFamily: 'Bebas Neue, sans-serif', 
                letterSpacing: '0.05em',
                color: 'var(--text-primary)'
              }}
            >
              NolaLocal
            </h1>
            <div className="flex gap-6 text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              <button 
                onClick={() => router.push('/calendar')} 
                className="font-semibold transition-all uppercase cursor-pointer hover:opacity-70"
                style={{
                  color: 'var(--text-primary)',
                  fontWeight: pathname === '/calendar' ? 'bold' : '600'
                }}
              >
                CALENDAR
              </button>
              <button 
                onClick={() => router.push('/events')} 
                className="font-semibold transition-all uppercase cursor-pointer hover:opacity-70"
                style={{
                  color: 'var(--text-primary)',
                  fontWeight: pathname === '/events' ? 'bold' : '600'
                }}
              >
                EVENTS
              </button>
            </div>
          </div>

          {/* Center - Weather Widget */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <WeatherWidget />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {user?.isAdmin && (
              <button
                onClick={() => router.push('/admin')}
                className="hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
                title="Admin Dashboard"
              >
                <span className="material-symbols-outlined">admin_panel_settings</span>
              </button>
            )}

            <button 
              onClick={() => router.push('/events/create')}
              className="hover:opacity-70 transition-opacity cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
              title="Create Event"
            >
              <span className="material-symbols-outlined">add</span>
            </button>

            <ThemeToggle />

            {user && (
              <button
                onClick={() => router.push('/profile')}
                className="text-sm hover:opacity-70 font-medium transition-opacity underline cursor-pointer"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  color: 'var(--text-primary)'
                }}
              >
                Hi, {user.username}!
              </button>
            )}

            {!user && (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 hover:opacity-70 transition-opacity text-sm cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden flex justify-between items-center">
          <h1 
            onClick={() => router.push('/')}
            className="text-3xl font-bold cursor-pointer"
            style={{ 
              fontFamily: 'Bebas Neue, sans-serif',
              color: 'var(--text-primary)'
            }}
          >
            NolaLocal
          </h1>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              <span className="material-symbols-outlined text-3xl">menu</span>
            </button>
          </div>
        </div>

        {/* Mobile Weather */}
        <div className="lg:hidden mt-3">
          <WeatherWidget />
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden mt-4"
            >
              <div className="flex flex-col gap-4 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    router.push('/calendar');
                    setMobileMenuOpen(false);
                  }}
                  className="font-semibold text-left uppercase cursor-pointer"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    color: 'var(--text-primary)'
                  }}
                >
                  CALENDAR
                </button>
                
                <button
                  onClick={() => {
                    router.push('/events');
                    setMobileMenuOpen(false);
                  }}
                  className="font-semibold text-left uppercase cursor-pointer"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    color: 'var(--text-primary)'
                  }}
                >
                  EVENTS
                </button>

                <button
                  onClick={() => {
                    router.push('/events/create');
                    setMobileMenuOpen(false);
                  }}
                  className="font-semibold text-left uppercase cursor-pointer"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    color: 'var(--text-primary)'
                  }}
                >
                  CREATE EVENT
                </button>

                {user && (
                  <button
                    onClick={() => {
                      router.push('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="font-semibold text-left uppercase cursor-pointer"
                    style={{ 
                      fontFamily: 'Open Sans, sans-serif',
                      color: 'var(--text-primary)'
                    }}
                  >
                    MY DASHBOARD
                  </button>
                )}

                {user?.isAdmin && (
                  <button
                    onClick={() => {
                      router.push('/admin');
                      setMobileMenuOpen(false);
                    }}
                    className="font-semibold text-left uppercase cursor-pointer"
                    style={{ 
                      fontFamily: 'Open Sans, sans-serif',
                      color: 'var(--text-primary)'
                    }}
                  >
                    ADMIN DASHBOARD
                  </button>
                )}

                {!user && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => router.push('/login')}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Login
                      </button>
                      <button
                        onClick={() => router.push('/signup')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}