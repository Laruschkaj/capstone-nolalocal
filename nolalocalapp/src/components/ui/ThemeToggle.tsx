'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
      style={{
        backgroundColor: theme === 'light' ? '#D1D5DB' : '#4B5563'
      }}
      aria-label="Toggle theme"
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md"
        animate={{
          x: theme === 'dark' ? 28 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <span className="material-symbols-outlined text-sm text-gray-900">
          {theme === 'light' ? 'light_mode' : 'dark_mode'}
        </span>
      </motion.div>
    </button>
  );
}