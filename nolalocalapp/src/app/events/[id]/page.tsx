'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

//INTERFACES
interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  imageUrl?: string;
  source: 'user' | 'eventbrite' | 'ticketmaster'; 
  sourceUrl?: string;
  category: {
    _id: string;
    name: string;
    color: string;
  };
  creator: {
    _id: string;
    username: string;
  };
  likes: string[];
  likesCount: number;
}

//COMPONENT
export default function EventDetailPage() {
  //state
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  //hooks
  const { user, token } = useAuth();
  const router = useRouter();
  const params = useParams();

  //FETCH EVENTS ON MOUNT
  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      // params is already resolved in client components, no need to await
      const response = await fetch(`/api/events/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setEvent(data.data.event);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  //HANDLERS
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/events/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        router.push('/events');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error deleting event');
    }
  };

  const handleEdit = () => {
    router.push(`/events/${params.id}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Event not found</p>
          <button
            onClick={() => router.push('/events')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            ← Back to events
          </button>
        </div>
      </div>
    );
  }

  // Check if user is creator - handle undefined creator
  const isCreator = event.creator && user && user.id === event.creator._id;
  const isExternalEvent = event.source !== 'user';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/events')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Events
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Category Color Bar */}
          <div
            className="h-3"
            style={{ backgroundColor: event.category.color }}
          />

          {/* Event Image (if available) */}
          {event.imageUrl && (
            <div className="relative w-full h-96 overflow-hidden bg-gray-100">
             <img
               src={event.imageUrl}
               alt={event.title}
               className="w-full h-full object-cover"
             />
           </div>
           )}

          {/* Event Details */}
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full mb-3">
                  {event.category.name}
                </span>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {event.title}
                </h1>
                <p className="text-gray-600">
                  {event.creator 
                    ? `Organized by ${event.creator.username}`
                    : `Source: ${event.source === 'eventbrite' ? 'Eventbrite' : 'Ticketmaster'}`
                  }
                </p>
              </div>

              {/* Edit/Delete Buttons (only for creator of user events) */}
              {isCreator && !isExternalEvent && (
                <div className="flex gap-2">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Date, Time, Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 py-6 border-t border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-1">Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  📅 {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {event.time && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    🕐 {event.time}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-1">Location</p>
                <p className="text-lg font-semibold text-gray-900">
                  📍 {event.location}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About this event
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* External Event Link */}
            {isExternalEvent && event.sourceUrl && (
              <div className="mt-6">
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  View on {event.source === 'eventbrite' ? 'Eventbrite' : 'Ticketmaster'} →
                </a>
              </div>
            )}

            {/* Likes */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                ❤️ {event.likesCount} {event.likesCount === 1 ? 'person' : 'people'} interested
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}