'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import EventCard from '@/components/events/EventCard';
import CategoryFilter from '@/components/ui/CategoryFilter';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
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
  creator?: {
    _id: string;
    username: string;
    isAdmin?: boolean;
  };
  source?: string;
  likes?: string[];
  likesCount?: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  color: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [likedEvents, setLikedEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'created' | 'liked'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchCategories();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setCreatedEvents(data.data.createdEvents);
        setLikedEvents(data.data.likedEvents);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

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
    logout();
    router.push('/');
  };

  // Filter events
  const getFilteredEvents = () => {
    let events: Event[] = [];

    if (filter === 'all') {
      events = [...createdEvents, ...likedEvents];
    } else if (filter === 'created') {
      events = createdEvents;
    } else if (filter === 'liked') {
      events = likedEvents;
    }

    // Apply category filter
    if (categoryFilter) {
      events = events.filter(event => event.category._id === categoryFilter);
    }

    // Remove duplicates and sort by date (newest first)
    const uniqueEvents = Array.from(new Map(events.map(e => [e._id, e])).values());
    return uniqueEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredEvents = getFilteredEvents();

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 
              className="text-5xl font-bold mb-2"
              style={{ 
                fontFamily: 'Bebas Neue, sans-serif',
                color: 'var(--text-primary)'
              }}
            >
              MY DASHBOARD
            </h1>
            <p 
              className="text-lg"
              style={{ 
                fontFamily: 'Open Sans, sans-serif',
                color: 'var(--text-secondary)'
              }}
            >
              Welcome back, {user?.username}!
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {/* Event Type Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  backgroundColor: filter === 'all' ? '#4F46E5' : 'var(--card-bg)',
                  color: filter === 'all' ? '#FFFFFF' : 'var(--text-primary)',
                  border: filter === 'all' ? 'none' : '1px solid var(--border-color)'
                }}
              >
                ALL EVENTS
              </button>
              <button
                onClick={() => setFilter('created')}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  backgroundColor: filter === 'created' ? '#4F46E5' : 'var(--card-bg)',
                  color: filter === 'created' ? '#FFFFFF' : 'var(--text-primary)',
                  border: filter === 'created' ? 'none' : '1px solid var(--border-color)'
                }}
              >
                MY EVENTS
              </button>
              <button
                onClick={() => setFilter('liked')}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  backgroundColor: filter === 'liked' ? '#4F46E5' : 'var(--card-bg)',
                  color: filter === 'liked' ? '#FFFFFF' : 'var(--text-primary)',
                  border: filter === 'liked' ? 'none' : '1px solid var(--border-color)'
                }}
              >
                LIKED EVENTS
              </button>
            </div>

            {/* Category Filter */}
            <CategoryFilter
              categories={categories}
              selectedCategory={categoryFilter}
              onCategoryChange={setCategoryFilter}
            />

            {/* Create Event Button */}
            <button
              onClick={() => router.push('/events/create')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors ml-auto"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              + CREATE EVENT
            </button>
          </div>

          {/* Events Grid */}
          {loading ? (
            <p 
              className="text-center"
              style={{ 
                fontFamily: 'Open Sans, sans-serif',
                color: 'var(--text-secondary)'
              }}
            >
              Loading events...
            </p>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p 
                className="text-lg"
                style={{ 
                  fontFamily: 'Open Sans, sans-serif',
                  color: 'var(--text-secondary)'
                }}
              >
                {filter === 'created' && 'No events created yet'}
                {filter === 'liked' && 'No liked events yet'}
                {filter === 'all' && 'No events found'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event, index) => (
                <EventCard 
                  key={event._id} 
                  event={event} 
                  index={index}
                  onLikeUpdate={fetchProfile}
                />
              ))}
            </div>
          )}
          
        </main>
      </div>
    </ProtectedRoute>
  );
}