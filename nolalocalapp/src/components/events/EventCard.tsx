'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getEventCardColor, getTextColor } from '@/lib/data/colorPalette';

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
      username: string;
    };
    source?: string;
  };
  index?: number;
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const router = useRouter();
  const bgColor = getEventCardColor(event._id);
  const textColor = getTextColor(bgColor);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={() => router.push(`/events/${event._id}`)}
      className="rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:scale-[1.02] p-4"
      style={{ backgroundColor: bgColor }}
    >
      {/* Event Image - Inset with visible card color around it */}
      {event.imageUrl && (
        <div className="relative h-56 w-full overflow-hidden rounded-2xl mb-4">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title - Large and Bold */}
      <h3 
        className="text-3xl font-bold mb-4 leading-tight"
        style={{ 
          color: textColor,
          fontFamily: 'Bebas Neue, sans-serif',
          letterSpacing: '0.02em'
        }}
      >
        {event.title}
      </h3>

      {/* Category Badge - At Bottom */}
      <div>
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
    </motion.div>
  );
}