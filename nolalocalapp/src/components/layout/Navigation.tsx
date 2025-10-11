'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import WeatherWidget from '@/components/weather/WeatherWidget';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Desktop Nav */}
        <div className="hidden lg:flex justify-between items-center">
          {/* Left Side */}
          <div className="flex items-center gap-8">
            <h1 
              onClick={() => router.push('/')}
              className="text-4xl font-bold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors" 
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.05em' }}
            >
              NolaLocal
            </h1>
            <div className="flex gap-6 text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              <button 
                onClick={() => router.push('/calendar')} 
                className={`font-semibold transition-colors flex items-center gap-2 ${
                  pathname === '/calendar' ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="material-symbols-outlined text-xl">calendar_month</span>
                CALENDAR
              </button>
              <button 
                onClick={() => router.push('/events')} 
                className={`font-semibold transition-colors ${
                  pathname === '/events' ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
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
            <button 
              className="text-gray-600 hover:text-gray-900 transition-colors"
              title="Search"
            >
              <span className="material-symbols-outlined">search</span>
            </button>

            {user?.isAdmin && (
              <button
                onClick={() => router.push('/admin')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Admin Dashboard"
              >
                <span className="material-symbols-outlined">admin_panel_settings</span>
              </button>
            )}

            <button 
              onClick={() => router.push('/events/create')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              title="Create Event"
            >
              <span className="material-symbols-outlined">add</span>
            </button>

            <button 
              className="text-gray-600 hover:text-gray-900 transition-colors"
              title="Toggle Theme"
            >
              <span className="material-symbols-outlined">dark_mode</span>
            </button>

            {user ? (
              <>
                <span className="text-gray-700 text-sm">Hi, {user.username}!</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
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
            className="text-3xl font-bold text-gray-900" 
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            NolaLocal
          </h1>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-900"
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </div>

        {/* Mobile Weather (below header) */}
        <div className="lg:hidden mt-3">
          <WeatherWidget />
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden mt-4"
            >
              <div className="flex flex-col gap-4 py-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    router.push('/calendar');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-gray-900 font-semibold"
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                >
                  <span className="material-symbols-outlined">calendar_month</span>
                  CALENDAR
                </button>
                
                <button
                  onClick={() => {
                    router.push('/events');
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-900 font-semibold text-left"
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                >
                  EVENTS
                </button>

                <button
                  onClick={() => {
                    router.push('/events/create');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-gray-900"
                >
                  <span className="material-symbols-outlined">add</span>
                  Create Event
                </button>

                {user?.isAdmin && (
                  <button
                    onClick={() => {
                      router.push('/admin');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-gray-900"
                  >
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                    Admin Dashboard
                  </button>
                )}

                <div className="pt-4 border-t border-gray-200">
                  {user ? (
                    <>
                      <p className="text-gray-700 mb-2">Hi, {user.username}!</p>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => router.push('/login')}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => router.push('/signup')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                      >
                        Sign Up
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}