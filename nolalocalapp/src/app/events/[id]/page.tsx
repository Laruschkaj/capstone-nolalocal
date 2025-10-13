'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import { getEventCardColor, getTextColor } from '@/lib/data/colorPalette';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

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
    isAdmin?: boolean;
  };
  likes: string[];
  likesCount: number;
}

export default function EventDetailPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [liking, setLiking] = useState(false);
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
        setLikesCount(data.data.event.likesCount || 0);
        setLiked(data.data.event.likes?.includes(user?.id || '') || false);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (liking) return;

    setLiking(true);
    try {
      const response = await fetch(`/api/events/${params.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setLiked(data.data.liked);
        setLikesCount(data.data.likesCount);
      }
    } catch (error) {
      console.error('Error liking event:', error);
    } finally {
      setLiking(false);
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

  // Format time to 12-hour with AM/PM
  const formatTime = (time?: string) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ fontFamily: 'Open Sans, sans-serif', color: 'var(--text-secondary)' }}>
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg mb-4" style={{ fontFamily: 'Open Sans, sans-serif', color: 'var(--text-secondary)' }}>
              Event not found
            </p>
            <button
              onClick={() => router.push('/events')}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{
                fontFamily: 'Open Sans, sans-serif',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF'
              }}
            >
              Back to events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCreator = event.creator && user && user.id === event.creator._id;
  const isExternalEvent = event.source !== 'user';
  const bgColor = getEventCardColor(event._id);
  const textColor = getTextColor(bgColor);

  

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Navigation />

      <header className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 font-medium transition-colors hover:opacity-70"
            style={{ 
              fontFamily: 'Open Sans, sans-serif',
              color: 'var(--text-primary)'
            }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>

          {isCreator && !isExternalEvent && (
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 rounded-lg font-semibold transition-colors"
                style={{
                  fontFamily: 'Open Sans, sans-serif',
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF'
                }}
              >
                Edit
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg font-semibold transition-colors"
                style={{
                  fontFamily: 'Open Sans, sans-serif',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF'
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 pb-12">
        <div 
          className="rounded-3xl overflow-hidden shadow-2xl p-8 relative"
          style={{ backgroundColor: bgColor }}
        >

          {/* Verified Badge - Top Right */}
            {event.creator?.isAdmin && <VerifiedBadge size="medium" position="top-right" />}

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

          {/* Event Details - Vertical Layout */}
          <div className="mb-8 space-y-4">
           <div>
            <p 
               className="font-bold text-sm mb-1 uppercase"
               style={{ color: textColor, fontFamily: 'Open Sans, sans-serif', opacity: 0.8, fontSize: '16px' }}
              >
                DATE:
            </p>
            <p 
               style={{ color: textColor, fontFamily: 'Open Sans, sans-serif', fontSize: '16px' }}
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
        className="font-bold text-sm mb-1 uppercase"
        style={{ color: textColor, fontFamily: 'Open Sans, sans-serif', opacity: 0.8, fontSize: '16px' }}
      >
        TIME:
      </p>
      <p 
        style={{ color: textColor, fontFamily: 'Open Sans, sans-serif', fontSize: '16px' }}
      >
        {formatTime(event.time)}
      </p>
    </div>
  )}

  <div>
    <p 
      className="font-bold text-sm mb-1 uppercase"
      style={{ color: textColor, fontFamily: 'Open Sans, sans-serif', opacity: 0.8, fontSize: '16px' }}
    >
      LOCATION:
    </p>
    <p 
      style={{ color: textColor, fontFamily: 'Open Sans, sans-serif', fontSize: '16px' }}
    >
      {event.location}
    </p>
  </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 
              className="text-2xl font-bold mb-4 uppercase"
              style={{ color: textColor, fontFamily: 'Open Sans, sans-serif' }}
            >
              ABOUT THIS EVENT
            </h2>
            <p 
              className="leading-relaxed whitespace-pre-line"
              style={{ color: textColor, fontFamily: 'Open Sans, sans-serif', opacity: 0.9, fontSize: '16px' }}
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

          {/* Footer - Likes and Source */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t" style={{ borderColor: `${textColor}20` }}>
            {/* Likes */}
            <button
              onClick={handleLike}
              disabled={liking}
              className="flex items-center gap-2 transition-transform hover:scale-105"
            >
              <span 
                className="material-symbols-outlined text-3xl"
                style={{ 
                  color: 'white',
                  fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0"
                }}
              >
                favorite
              </span>
              {likesCount > 0 && (
              <span 
                 style={{ color: textColor, fontFamily: 'Open Sans, sans-serif', fontSize: '16px' }}
                >
                 {likesCount} {likesCount === 1 ? 'like' : 'likes'}
              </span>
                  )}
            </button>
            
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