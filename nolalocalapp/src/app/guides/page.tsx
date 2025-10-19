'use client';

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Navigation from '@/components/layout/Navigation';
import EventCard from '@/components/events/EventCard';
import CategoryFilter from '@/components/ui/CategoryFilter';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Guide {
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

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
    fetchGuides();
  }, []);

  useEffect(() => {
    fetchGuides();
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

  const fetchGuides = async () => {
    setLoading(true);
    try {
      let url = '/api/events?eventType=guide';
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setGuides(data.data.events);
      }
    } catch (error) {
      console.error('Error fetching guides:', error);
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
              LOCAL GUIDES
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
            <p className="text-center" style={{ fontFamily: 'Open Sans, sans-serif', color: 'var(--text-secondary)' }}>
              Loading guides...
            </p>
          ) : guides.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ fontFamily: 'Open Sans, sans-serif', color: 'var(--text-secondary)' }}>
                {selectedCategory ? 'No guides found in this category' : 'No guides found'}
              </p>
              <p className="mt-2" style={{ fontFamily: 'Open Sans, sans-serif', color: 'var(--text-secondary)' }}>
                Be the first to create one!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide, index) => (
                <EventCard key={guide._id} event={guide} index={index} onLikeUpdate={fetchGuides} />
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}