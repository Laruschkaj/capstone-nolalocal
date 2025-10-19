'use client';

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import EventCard from '@/components/events/EventCard';
import CategoryFilter from '@/components/ui/CategoryFilter';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ============================================
// INTERFACES
// ============================================
interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  imageUrl?: string;
  source: 'user' | 'eventbrite' | 'ticketmaster';
  category: {
    name: string;
    color: string;
  };
  creator?: {
    _id: string;
    username: string;
    isAdmin?: boolean;
  };
  likes?: string[];
  likesCount?: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  color: string;
}

// ============================================
// COMPONENT
// ============================================
export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = '/api/events?eventType=event';
      if (selectedCategory) {
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <Navigation />

        {/* Header with Filter */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 
              className="text-5xl font-bold"
              style={{ 
                fontFamily: 'Bebas Neue, sans-serif',
                color: 'var(--text-primary)'
              }}
            >
              EVENTS
            </h1>

            {/* Category Filter */}
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {loading ? (
            <p className="text-center text-gray-600">Loading events...</p>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {selectedCategory ? 'No events found in this category' : 'No events found'}
              </p>
              <p className="text-gray-500 mt-2">Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event, index) => (
                <EventCard key={event._id} event={event} index={index} onLikeUpdate={fetchEvents} />
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}