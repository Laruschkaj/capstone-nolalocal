'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getEventCardColor, getTextColor } from '@/lib/data/colorPalette';
import VerifiedBadge from '@/components/ui/VerifiedBadge';

interface EventCardProps {
  event: {
    _id: string;
    title: string;
    description: string;
    date: string;
    time?: string;
    location: string;
    imageUrl?: string;
    category: {
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
    eventType?: string;
  };
  index?: number;
  onLikeUpdate?: () => void;
}

export default function EventCard({ event, index = 0, onLikeUpdate }: EventCardProps) {
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
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={() => router.push(`/events/${event._id}`)}
      className="rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-[1.02] p-4 relative h-[420px] flex flex-col"
      style={{ backgroundColor: bgColor }}
    >
      {/* Verified Badge - Top Right */}
      {event.creator?.isAdmin && <VerifiedBadge size="small" position="top-right" />}

      {/* Event Image */}
      {event.imageUrl && (
        <div className="relative h-56 w-full overflow-hidden rounded-2xl mb-4 flex-shrink-0">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title - with line clamp */}
      <h3 
        className="text-3xl font-bold mb-2 leading-tight line-clamp-3 flex-grow"
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
          className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
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
            className="material-symbols-outlined text-3xl"
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