'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import WeatherWidget from '@/components/weather/WeatherWidget';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, token } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/users/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert('Account deleted successfully');
        logout();
        router.push('/');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error deleting account');
    }
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    router.push('/');
  };

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
            
            {/* Only show navigation links if user is logged in */}
            {user && (
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
                <button 
                  onClick={() => router.push('/guides')} 
                  className="font-semibold transition-all uppercase cursor-pointer hover:opacity-70"
                  style={{
                    color: 'var(--text-primary)',
                    fontWeight: pathname === '/guides' ? 'bold' : '600'
                  }}
                >
                  GUIDES
                </button>
              </div>
            )}
          </div>

          {/* Center - Weather Widget */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <WeatherWidget />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Only show these buttons if user is logged in */}
            {user && (
              <>
                <button 
                  onClick={() => router.push('/events/create')}
                  className="hover:opacity-70 transition-opacity cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  title="Create Event"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </>
            )}

            <ThemeToggle />

            {user ? (
              /* Username Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-colors hover:opacity-80"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  color: 'var(--text-primary)',
                  backgroundColor: 'rgba(128, 128, 128, 0.1)'
                }}
                >
                <span className="font-semibold">Hi, {user.username}!</span>
                <span 
                className="material-symbols-outlined text-sm transition-transform"
                style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                expand_more
                </span>
              </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl overflow-hidden"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      {/* My Dashboard */}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          router.push('/profile');
                        }}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors hover:opacity-70"
                        style={{
                          fontFamily: 'Open Sans, sans-serif',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="font-semibold">My Dashboard</span>
                      </button>

                      {/* Admin Dashboard (if admin) */}
                      {user.isAdmin && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            router.push('/admin');
                          }}
                          className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors hover:opacity-70"
                          style={{
                            fontFamily: 'Open Sans, sans-serif',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <span className="material-symbols-outlined">admin_panel_settings</span>
                          <span className="font-semibold">Admin Dashboard</span>
                        </button>
                      )}

                      {/* Divider */}
                      <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors hover:opacity-70"
                        style={{
                          fontFamily: 'Open Sans, sans-serif',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="font-semibold">Logout</span>
                      </button>

                      {/* Divider */}
                      <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />

                      {/* Delete Account */}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleDeleteAccount();
                        }}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                        style={{
                          fontFamily: 'Open Sans, sans-serif',
                          color: '#DC2626'
                        }}
                      >
                        <span className="material-symbols-outlined">delete_forever</span>
                        <span className="font-semibold">Delete Account</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
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
                {/* Only show navigation if logged in */}
                {user ? (
                  <>
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
                        router.push('/guides');
                        setMobileMenuOpen(false);
                      }}
                      className="font-semibold text-left uppercase cursor-pointer"
                      style={{ 
                        fontFamily: 'Open Sans, sans-serif',
                        color: 'var(--text-primary)'
                      }}
                    >
                      GUIDES
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

                    {user.isAdmin && (
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

                    {/* Divider */}
                    <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '8px 0' }} />

                    {/* Logout */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="font-semibold text-left uppercase cursor-pointer"
                      style={{ 
                        fontFamily: 'Open Sans, sans-serif',
                        color: 'var(--text-primary)'
                      }}
                    >
                      LOGOUT
                    </button>

                    {/* Delete Account */}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleDeleteAccount();
                      }}
                      className="font-semibold text-left uppercase cursor-pointer"
                      style={{ 
                        fontFamily: 'Open Sans, sans-serif',
                        color: '#DC2626'
                      }}
                    >
                      DELETE ACCOUNT
                    </button>
                  </>
                ) : (
                  /* Show login/signup when not logged in */
                  <div className="flex flex-col gap-2">
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'Open Sans, sans-serif' }}>
                      Sign up to explore events and guides in New Orleans
                    </p>
                    <button
                      onClick={() => {
                        router.push('/login');
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        router.push('/signup');
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer"
                    >
                      Sign Up
                    </button>
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