'use client';

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import WeatherWidget from '@/components/weather/WeatherWidget';

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
      
      let url = `/api/events?month=${month}&year=${year}`;
      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data.events);
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

  // Get events grouped by date
  const getGroupedEvents = () => {
    const grouped: { [key: string]: Event[] } = {};
    
    events.forEach(event => {
      const dateKey = new Date(event.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return Object.entries(grouped).sort((a, b) => 
      new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );
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

  const handleLogout = () => {
    logout();
    router.push('/login');
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

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-[#fcf9e6]">
      {/* Navigation */}
        <Navigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Calendar Grid */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              {/* Month Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={goToPreviousMonth}
                    disabled={!canGoPrevious}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      canGoPrevious 
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    ←
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {DAYS.map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-500" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
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
                      className={`
                        aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative
                        ${!day ? 'invisible' : ''}
                        ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                        ${isSelected && !isPast ? 'bg-gray-900 text-white font-bold' : ''}
                        ${isToday && !isSelected && !isPast ? 'border-2 border-gray-900 font-bold' : ''}
                        ${!isSelected && !isToday && !isPast ? 'hover:bg-gray-100' : ''}
                      `}
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    >
                      {day && (
                        <>
                          <span>{day.getDate()}</span>
                          {dayEvents.length > 0 && (
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
            </div>
          </div>

          {/* Right: Event List */}
          <div className="lg:col-span-7">
            {/* Category Filter */}
            <div className="mb-6 flex justify-end">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              >
                <option value="all">All Categories</option>
                {Array.isArray(categories) && categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Selected Date Header */}
            <div className="mb-6">
              <h3 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                }).toUpperCase()}
              </h3>
            </div>

            {/* Event Cards */}
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500 text-center py-12">Loading events...</p>
              ) : selectedDateEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No events on this date</p>
                </div>
              ) : (
                selectedDateEvents.map((event) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => router.push(`/events/${event._id}`)}
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-2 h-full rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.category.color }}
                      />
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                          {event.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          {event.time && <span>🕐 {event.time}</span>}
                          <span>📍 {event.location}</span>
                        </div>
                        <div className="mt-3">
                          <span 
                            className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ 
                              backgroundColor: event.category.color + '20',
                              color: event.category.color,
                              fontFamily: 'Open Sans, sans-serif'
                            }}
                          >
                            {event.category.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
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