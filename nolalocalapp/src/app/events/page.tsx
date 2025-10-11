'use client';

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import EventCard from '@/components/events/EventCard';
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
    username: string;
  };
}

// ============================================
// COMPONENT
// ============================================
export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
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
      <div className="min-h-screen bg-[#fcf9e6]">
        <Navigation />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <p className="text-center text-gray-600">Loading events...</p>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No events found</p>
              <p className="text-gray-500 mt-2">Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event, index) => (
                <EventCard key={event._id} event={event} index={index} />
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}