'use client';

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import CalendarEventCard from '@/components/events/CalendarEventCard';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  imageUrl?: string;
  category: {
    _id: string;
    name: string;
    color: string;
  };
  likes?: string[];
  likesCount?: number;
}

interface Category {
  _id: string;
  name: string;
  color: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.success && data.data?.categories) {
          setCategories(data.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch events for current month
  useEffect(() => {
    fetchEvents();
  }, [currentDate, selectedCategory]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      // Fetch ALL events, not just by month
      let url = `/api/events`;
      if (selectedCategory !== 'all') {
        url += `?category=${selectedCategory}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        // Filter events for current month on client side
        const monthEvents = data.data.events.filter((event: Event) => {
          const eventDate = new Date(event.date);
          return eventDate.getMonth() === currentDate.getMonth() && 
                 eventDate.getFullYear() === currentDate.getFullYear();
        });
        setEvents(monthEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Get events for selected date
  const selectedDateEvents = getEventsForDate(selectedDate);

  // Navigation functions
  const goToPreviousMonth = () => {
    const now = new Date();
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    
    // Don't allow going to past months
    if (prevMonth < new Date(now.getFullYear(), now.getMonth(), 1)) {
      return;
    }
    
    setCurrentDate(prevMonth);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isPastDate = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const calendarDays = generateCalendarDays();
  const now = new Date();
  const canGoPrevious = currentDate.getMonth() !== now.getMonth() || currentDate.getFullYear() !== now.getFullYear();

  const getCategoryName = () => {
    if (selectedCategory === 'all') return 'All Categories';
    return categories.find(cat => cat._id === selectedCategory)?.name || 'All Categories';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <Navigation />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Calendar - Fully Contained and Sticky */}
            <div className="lg:col-span-5">
              <div 
                className="rounded-2xl shadow-lg p-6 sticky top-24"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                {/* Month Header - Inside calendar box */}
                <div className="flex items-center justify-between mb-6">
                  <h2 
                    className="text-4xl font-bold leading-none"
                    style={{ 
                      fontFamily: 'Bebas Neue, sans-serif',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={goToPreviousMonth}
                      disabled={!canGoPrevious}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor: canGoPrevious ? 'rgba(128, 128, 128, 0.1)' : 'rgba(128, 128, 128, 0.05)',
                        color: canGoPrevious ? 'var(--text-primary)' : 'var(--text-secondary)',
                        cursor: canGoPrevious ? 'pointer' : 'not-allowed',
                        opacity: canGoPrevious ? 1 : 0.3
                      }}
                    >
                      ←
                    </button>
                    <button
                      onClick={goToNextMonth}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor: 'rgba(128, 128, 128, 0.1)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      →
                    </button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {DAYS.map(day => (
                    <div 
                      key={day} 
                      className="text-center text-sm font-semibold"
                      style={{ 
                        fontFamily: 'Open Sans, sans-serif',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {calendarDays.map((day, index) => {
                    const dayEvents = getEventsForDate(day);
                    const isSelected = day && selectedDate.toDateString() === day.toDateString();
                    const isToday = day && day.toDateString() === new Date().toDateString();
                    const isPast = isPastDate(day);

                    return (
                      <button
                        key={index}
                        onClick={() => day && !isPast && setSelectedDate(day)}
                        disabled={!day || isPast}
                        className="aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative"
                        style={{ 
                          fontFamily: 'Open Sans, sans-serif',
                          backgroundColor: isSelected && !isPast ? '#1F2937' : 'transparent',
                          color: isSelected && !isPast ? '#FFFFFF' : isPast ? 'rgba(128, 128, 128, 0.3)' : 'var(--text-primary)',
                          border: isToday && !isSelected && !isPast ? '2px solid var(--text-primary)' : 'none',
                          fontWeight: isSelected || isToday ? 'bold' : 'normal',
                          cursor: !day || isPast ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {day && (
                          <>
                            <span>{day.getDate()}</span>
                            {dayEvents.length > 0 && !isPast && (
                              <div className="flex gap-1 mt-1">
                                {dayEvents.slice(0, 3).map((event, i) => (
                                  <div
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: event.category.color }}
                                  />
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Category Filter - Custom dropdown */}
                <div className="pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <label 
                    className="block text-xs font-semibold mb-2"
                    style={{ 
                      fontFamily: 'Open Sans, sans-serif',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    FILTER BY CATEGORY
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full px-4 py-2 rounded-lg text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-gray-900"
                      style={{ 
                        fontFamily: 'Open Sans, sans-serif',
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <span>{getCategoryName()}</span>
                      <span className="material-symbols-outlined text-sm">
                        {dropdownOpen ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div 
                      className="absolute w-full mt-1 rounded-lg shadow-lg overflow-hidden z-10"
                      style={{ 
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      maxHeight: '160px'
                      }}
                      >
                     <div className="overflow-y-auto" style={{ maxHeight: '160px' }}>
                          <button
                            onClick={() => {
                              setSelectedCategory('all');
                              setDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            style={{ 
                              fontFamily: 'Open Sans, sans-serif',
                              color: 'var(--text-primary)',
                              backgroundColor: selectedCategory === 'all' ? 'rgba(128, 128, 128, 0.1)' : 'transparent'
                            }}
                          >
                            All Categories
                          </button>
                          {categories.map(cat => (
                            <button
                              key={cat._id}
                              onClick={() => {
                                setSelectedCategory(cat._id);
                                setDropdownOpen(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              style={{ 
                                fontFamily: 'Open Sans, sans-serif',
                                color: 'var(--text-primary)',
                                backgroundColor: selectedCategory === cat._id ? 'rgba(128, 128, 128, 0.1)' : 'transparent'
                              }}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Event List - Scrollable */}
            <div className="lg:col-span-7">
              {/* Selected Date Header */}
              <div className="mb-6">
                <h3 
                  className="text-4xl font-bold leading-none"
                  style={{ 
                    fontFamily: 'Bebas Neue, sans-serif',
                    color: 'var(--text-primary)'
                  }}
                >
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  }).toUpperCase()}
                </h3>
              </div>

              {/* Event Cards Grid - Scrollable */}
              <div className="grid gap-6 md:grid-cols-2">
                {loading ? (
                  <p 
                    className="text-center py-12 col-span-2"
                    style={{ 
                      fontFamily: 'Open Sans, sans-serif',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Loading events...
                  </p>
                ) : selectedDateEvents.length === 0 ? (
                  <div className="text-center py-12 col-span-2">
                    <p 
                      style={{ 
                        fontFamily: 'Open Sans, sans-serif',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      No events on this date
                    </p>
                  </div>
                ) : (
                  selectedDateEvents.map((event) => (
                    <CalendarEventCard 
                      key={event._id} 
                      event={event}
                      onLikeUpdate={fetchEvents}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}