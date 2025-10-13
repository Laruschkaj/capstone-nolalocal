'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getEventCardColor, getTextColor } from '@/lib/data/colorPalette';

interface CalendarEventCardProps {
  event: {
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
  };
  onLikeUpdate?: () => void;
}

export default function CalendarEventCard({ event, onLikeUpdate }: CalendarEventCardProps) {
  const router = useRouter();
  const { user, token } = useAuth();
  const bgColor = getEventCardColor(event._id);
  const textColor = getTextColor(bgColor);
  
  const [liked, setLiked] = useState(event.likes?.includes(user?.id || '') || false);
  const [likesCount, setLikesCount] = useState(event.likesCount || 0);
  const [liking, setLiking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (liking) return;

    setLiking(true);
    try {
      const response = await fetch(`/api/events/${event._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setLiked(data.data.liked);
        setLikesCount(data.data.likesCount);
        if (onLikeUpdate) onLikeUpdate();
      }
    } catch (error) {
      console.error('Error liking event:', error);
    } finally {
      setLiking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => router.push(`/events/${event._id}`)}
      className="rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-[1.02] p-4 relative"
      style={{ backgroundColor: bgColor, minHeight: '280px' }}
    >
      {/* Event Image */}
      {event.imageUrl && (
        <div className="relative h-40 w-full overflow-hidden rounded-2xl mb-4">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h3 
        className="text-2xl font-bold mb-16 leading-tight line-clamp-3"
        style={{ 
          color: textColor,
          fontFamily: 'Bebas Neue, sans-serif',
          letterSpacing: '0.02em'
        }}
      >
        {event.title}
      </h3>

      {/* Bottom Section - Category and Heart */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        {/* Category Badge - Bottom Left */}
        <span 
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            color: textColor,
            fontFamily: 'Open Sans, sans-serif'
          }}
        >
          {event.category.name}
        </span>

        {/* Heart Icon - Bottom Right */}
        <button
          onClick={handleLike}
          className="transition-transform hover:scale-110"
          disabled={liking}
        >
          <span 
            className="material-symbols-outlined text-2xl"
            style={{ 
              color: 'white',
              fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0"
            }}
          >
            favorite
          </span>
        </button>
      </div>
    </motion.div>
  );
}