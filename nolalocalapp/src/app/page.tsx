'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import WeatherWidget from '@/components/weather/WeatherWidget';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import EventCard from '@/components/events/EventCard';

const heroImages = [
  'https://res.cloudinary.com/dbmkqehtm/image/upload/v1760064911/hero-1_qencdg.jpg',
  'https://res.cloudinary.com/dbmkqehtm/image/upload/v1760064911/hero-2_c336rk.jpg',
  'https://res.cloudinary.com/dbmkqehtm/image/upload/v1760064911/hero-3_atdpa0.jpg',
  'https://res.cloudinary.com/dbmkqehtm/image/upload/v1760064911/hero-4_gtgzat.jpg',
];

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  category: {
    name: string;
    color: string;
  };
}

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const router = useRouter();
  const { user, logout } = useAuth();

  // Auto-advance hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  // Handle scroll for nav reveal
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowNav(true);
      } else {
        setShowNav(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch featured events
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch('/api/events?limit=6');
        const data = await response.json();
        if (data.success) {
          setFeaturedEvents(data.data.events.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching featured events:', error);
      }
    };
    fetchFeatured();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#fcf9e6]">
      {/* Sticky Navigation - only show after scroll */}
      {showNav && <Navigation />}

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Images with Parallax */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${heroImages[currentImageIndex]})`,
                filter: 'brightness(0.7)',
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Hero Text */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '0.02em' }}
          >
            Browse Upcoming Events<br />In New Orleans
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl"
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            Discover music, arts, food, and culture in the heart of NOLA
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.25, 1, 0.5, 1] }}
            onClick={() => router.push('/events')}
            className="px-12 py-4 bg-white text-gray-900 text-lg font-semibold rounded-2xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            Explore Events
          </motion.button>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-12"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
              className="text-white text-4xl"
            >
              ↓
            </motion.div>
          </motion.div>
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-white w-8' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold text-gray-900 mb-12"
          style={{ fontFamily: 'Bebas Neue, sans-serif' }}
        >
          Featured Events
        </motion.h2>

        {/* Horizontal Scroll Container */}
        <div className="overflow-x-auto pb-6 -mx-6 px-6">
          <div className="flex gap-6" style={{ width: 'max-content' }}>
            {featuredEvents.map((event, index) => (
              <div key={event._id} className="w-80 flex-shrink-0">
                <EventCard event={event} index={index} />
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => router.push('/events')}
            className="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-lg font-semibold"
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            View All Events →
          </button>
        </motion.div>
      </section>
    </div>
  );
}