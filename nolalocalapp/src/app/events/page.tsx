'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import WeatherWidget from '@/components/weather/WeatherWidget';

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
  imageUrl?: string; // NEW - for images
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
// HELPER FUNCTION - Category Icons
// ============================================
function getCategoryIcon(categoryName: string): string {
  const icons: { [key: string]: string } = {
    'Music': '🎵',
    'Arts & Culture': '🎨',
    'Architecture': '🏛️',
    'Theater': '🎭',
    'Comedy': '😂',
    'Sports': '⚽',
    'Food & Drink': '🍽️',
    'Business': '💼',
    'Tech': '💻',
    'Family & Kids': '👨‍👩‍👧',
    'Community': '🤝',
    'Fashion': '👗',
    'Health & Wellness': '🧘',
    'Nightlife': '🌙',
    'Festivals': '🎉',
    'Education': '📚',
    'General': '📌',
  };
  return icons[categoryName] || '📌';
}

// ============================================
// COMPONENT
// ============================================
export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  // Sync external events
  const handleSync = async () => {
    if (!confirm('Fetch latest events from Eventbrite and Ticketmaster?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/events/sync', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchEvents(); // Refresh the events list
      } else {
        alert('Sync failed: ' + data.message);
      }
    } catch (error) {
      alert('Error syncing events');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">NolaLocal Events</h1>
          <div className="flex items-center gap-6">
            {/* Weather Widget */}
           <WeatherWidget />
      
             {/* Divider */}
            <div className="h-6 w-px bg-gray-300" />
            {user && (
              <>
                <button
                  onClick={handleSync}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  🔄 Sync External Events
                </button>
                <a 
                  href="/events/create"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  + Create Event
                </a>
                <span className="text-gray-700">Welcome, {user.username}!</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

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
            {events.map((event) => (
              <div
                key={event._id}
                onClick={() => handleEventClick(event._id)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Category Color Bar */}
                <div
                  className="h-2"
                  style={{ backgroundColor: event.category.color }}
                />
                
                {/* Event Image or Fallback */}
                {event.imageUrl ? (
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <span class="text-6xl">${getCategoryIcon(event.category.name)}</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-6xl">{getCategoryIcon(event.category.name)}</span>
                  </div>
                )}
                
                {/* Event Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  {/* Event Details */}
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                    {event.time && <p>🕐 {event.time}</p>}
                    <p>📍 {event.location}</p>
                    <p className="inline-block px-2 py-1 bg-gray-100 rounded text-xs">
                      {event.category.name}
                    </p>
                  </div>
                  
                  {/* Event Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      {event.creator 
                        ? `By ${event.creator.username}` 
                        : `Source: ${event.source === 'eventbrite' ? 'Eventbrite' : event.source === 'ticketmaster' ? 'Ticketmaster' : 'External'}`
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}