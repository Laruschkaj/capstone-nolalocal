'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getEventCardColor, getTextColor } from '@/lib/data/colorPalette';

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
  creator?: {
    _id: string;
    username: string;
  };
  likes: string[];
  likesCount: number;
}

export default function EventDetailPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
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

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf9e6] flex items-center justify-center">
        <p className="text-gray-600">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#fcf9e6] flex items-center justify-center">
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

  const isCreator = event.creator && user && user.id === event.creator._id;
  const isExternalEvent = event.source !== 'user';
  const bgColor = getEventCardColor(event._id);
  const textColor = getTextColor(bgColor);

  // Format time to 12-hour with AM/PM
  const formatTime = (time?: string) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-[#fcf9e6]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>

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
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div 
          className="rounded-3xl overflow-hidden shadow-2xl p-8"
          style={{ backgroundColor: bgColor }}
        >
          {/* Event Image - Inset */}
          {event.imageUrl && (
            <div className="relative w-full h-96 overflow-hidden rounded-2xl mb-8">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h1 
            className="text-6xl font-bold mb-4 leading-tight uppercase"
            style={{ 
              color: textColor,
              fontFamily: 'Bebas Neue, sans-serif',
              letterSpacing: '0.02em'
            }}
          >
            {event.title}
          </h1>

          {/* Category */}
          <div className="mb-6">
            <span 
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                color: textColor,
                fontFamily: 'Open Sans, sans-serif'
              }}
            >
              {event.category.name}
            </span>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <p 
                className="font-bold text-sm mb-1"
                style={{ color: textColor, fontFamily: 'Open Sans, sans-serif', opacity: 0.8 }}
              >
                DATE
              </p>
              <p 
                className="text-lg font-semibold"
                style={{ color: textColor, fontFamily: 'Open Sans, sans-serif' }}
              >
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {event.time && (
              <div>
                <p 
                  className="font-bold text-sm mb-1"
                  style={{ color: textColor, fontFamily: 'Open Sans, sans-serif', opacity: 0.8 }}
                >
                  TIME
                </p>
                <p 
                  className="text-lg font-semibold"
                  style={{ color: textColor, fontFamily: 'Open Sans, sans-serif' }}
                >
                  {formatTime(event.time)}
                </p>
              </div>
            )}

            <div>
              <p 
                className="font-bold text-sm mb-1"
                style={{ color: textColor, fontFamily: 'Open Sans, sans-serif', opacity: 0.8 }}
              >
                LOCATION
              </p>
              <p 
                className="text-lg font-semibold"
                style={{ color: textColor, fontFamily: 'Open Sans, sans-serif' }}
              >
                {event.location}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ color: textColor, fontFamily: 'Open Sans, sans-serif' }}
            >
              About this event
            </h2>
            <p 
              className="text-lg leading-relaxed whitespace-pre-line"
              style={{ color: textColor, fontFamily: 'Open Sans, sans-serif', opacity: 0.9 }}
            >
              {event.description}
            </p>
          </div>

          {/* External Event Link */}
          {isExternalEvent && event.sourceUrl && (
            <div className="mb-6">
               <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-full font-semibold transition-all hover:scale-105"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  color: textColor,
                  fontFamily: 'Open Sans, sans-serif'
                }}
                >
                View on {event.source === 'eventbrite' ? 'Eventbrite' : 'Ticketmaster'} &rarr;
              </a>
            </div>
          )}

          {/* Footer - Source in bottom right */}
          <div className="flex justify-between items-end mt-8 pt-6 border-t" style={{ borderColor: `${textColor}20` }}>
            <p 
              className="text-sm"
              style={{ color: textColor, fontFamily: 'Open Sans, sans-serif', opacity: 0.7 }}
            >
              {event.likesCount} {event.likesCount === 1 ? 'person' : 'people'} interested
            </p>
            
            {isExternalEvent && (
              <p 
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: textColor, fontFamily: 'Open Sans, sans-serif', opacity: 0.7 }}
              >
                {event.source === 'ticketmaster' ? 'Ticketmaster' : 'Eventbrite'}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}