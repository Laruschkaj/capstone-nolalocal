'use client';

import { useState, useRef, useEffect } from 'react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  color: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategoryName = selectedCategory 
    ? categories.find(c => c._id === selectedCategory)?.name 
    : 'All Categories';

  const handleSelect = (categoryId: string) => {
    onCategoryChange(categoryId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center gap-2 min-w-[180px] justify-between"
        style={{
          fontFamily: 'Open Sans, sans-serif',
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)'
        }}
      >
        <span>{selectedCategoryName}</span>
        <span 
          className="material-symbols-outlined text-sm transition-transform"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          expand_more
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute top-full mt-2 rounded-lg shadow-xl overflow-hidden z-50 min-w-[180px]"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {/* All Categories Option */}
          <button
            onClick={() => handleSelect('')}
            className="w-full px-4 py-2 text-left transition-colors hover:opacity-70"
            style={{
              fontFamily: 'Open Sans, sans-serif',
              backgroundColor: selectedCategory === '' ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
              color: 'var(--text-primary)'
            }}
          >
            ✓ All Categories
          </button>

          {/* Category Options */}
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleSelect(category._id)}
              className="w-full px-4 py-2 text-left transition-colors hover:opacity-70"
              style={{
                fontFamily: 'Open Sans, sans-serif',
                backgroundColor: selectedCategory === category._id ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                color: 'var(--text-primary)'
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}