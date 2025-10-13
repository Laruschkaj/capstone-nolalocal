//src/app/events/create/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useDropzone } from 'react-dropzone';

interface Category {
  _id: string;
  name: string;
  slug: string;
  color: string;
}

export default function CreateEventPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [eventType, setEventType] = useState<'event' | 'guide'>('event');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories);
        if (data.data.categories.length > 0) {
          setCategory(data.data.categories[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Drag and drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 5242880, // 5MB
  });

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'nolalocal-events');
  
  // Determine folder based on user role and event type
  let folder = 'nolalocal/user-events';
  
  if (user?.isAdmin) {
    folder = eventType === 'guide' ? 'nolalocal/admin-guides' : 'nolalocal/admin-events';
  } else {
    folder = eventType === 'guide' ? 'nolalocal/user-guides' : 'nolalocal/user-events';
  }
  
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.secure_url;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let imageUrl = '';

      // Upload image if provided
      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadToCloudinary(imageFile);
        setUploading(false);
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          date,
          time,
          location,
          category,
          imageUrl: imageUrl || undefined,
          eventType, // For future use
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        setLoading(false);
        return;
      }

      router.push('/events');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <Navigation />

        {/* Header */}
        <header className="max-w-4xl mx-auto px-6 py-8">
          <h1 
            className="text-5xl font-bold"
            style={{ 
              fontFamily: 'Bebas Neue, sans-serif',
              color: 'var(--text-primary)'
            }}
          >
            CREATE NEW {eventType === 'event' ? 'EVENT' : 'GUIDE'}
          </h1>
          <p 
            className="mt-2 text-lg"
            style={{ 
              fontFamily: 'Open Sans, sans-serif',
              color: 'var(--text-secondary)'
            }}
          >
            Share what's happening in New Orleans
          </p>
        </header>

        {/* Form */}
        <main className="max-w-4xl mx-auto px-6 pb-12">
          <div 
            className="rounded-2xl shadow-lg p-8"
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div 
                  className="rounded-lg p-4"
                  style={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <p 
                    className="text-sm"
                    style={{ 
                      fontFamily: 'Open Sans, sans-serif',
                      color: '#DC2626'
                    }}
                  >
                    {error}
                  </p>
                </div>
              )}

              {/* Event Type Toggle */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-3"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    color: 'var(--text-primary)'
                  }}
                >
                  What are you creating?
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setEventType('event')}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all"
                    style={{
                      fontFamily: 'Open Sans, sans-serif',
                      backgroundColor: eventType === 'event' ? '#4F46E5' : 'var(--card-bg)',
                      color: eventType === 'event' ? '#FFFFFF' : 'var(--text-primary)',
                      border: eventType === 'event' ? 'none' : '2px solid var(--border-color)'
                    }}
                  >
                    📅 Event (Date-Specific)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventType('guide')}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all"
                    style={{
                      fontFamily: 'Open Sans, sans-serif',
                      backgroundColor: eventType === 'guide' ? '#4F46E5' : 'var(--card-bg)',
                      color: eventType === 'guide' ? '#FFFFFF' : 'var(--text-primary)',
                      border: eventType === 'guide' ? 'none' : '2px solid var(--border-color)'
                    }}
                  >
                    🗺️ Local Guide (Evergreen)
                  </button>
                </div>
                <p 
                  className="mt-2 text-xs"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {eventType === 'event' 
                    ? 'Happening on a specific date (concerts, festivals, etc.)'
                    : 'Evergreen recommendations (best restaurants, hidden gems, etc.)'}
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label 
                  className="block text-sm font-semibold mb-3"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    color: 'var(--text-primary)'
                  }}
                >
                  Event Image (Optional)
                </label>
                
                {!imagePreview ? (
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all hover:border-indigo-500"
                    style={{ 
                      borderColor: isDragActive ? '#4F46E5' : 'var(--border-color)',
                      backgroundColor: isDragActive ? 'rgba(79, 70, 229, 0.05)' : 'transparent'
                    }}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-6xl mb-4" style={{ color: 'var(--text-secondary)' }}>
                        cloud_upload
                      </span>
                      <p 
                        className="text-lg font-semibold mb-2"
                        style={{ 
                          fontFamily: 'Open Sans, sans-serif',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {isDragActive ? 'Drop image here' : 'Drag & drop an image'}
                      </p>
                      <p 
                        className="text-sm"
                        style={{ 
                          fontFamily: 'Open Sans, sans-serif',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        or click to browse • PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-64 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label 
                  htmlFor="title" 
                  className="block text-sm font-semibold mb-2"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    color: 'var(--text-primary)'
                  }}
                >
                  {eventType === 'event' ? 'Event' : 'Guide'} Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                  placeholder={eventType === 'event' ? 'e.g., Jazz Night at Frenchmen Street' : 'e.g., Best Jazz Clubs in New Orleans'}
                />
              </div>

              {/* Description */}
              <div>
                <label 
                  htmlFor="description" 
                  className="block text-sm font-semibold mb-2"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    color: 'var(--text-primary)'
                  }}
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                  placeholder={eventType === 'event' ? 'Tell us about your event...' : 'Share your recommendations and insider tips...'}
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label 
                    htmlFor="date" 
                    className="block text-sm font-semibold mb-2"
                    style={{ 
                      fontFamily: 'Open Sans, sans-serif',
                      color: 'var(--text-primary)'
                    }}
                  >
                    Date {eventType === 'event' ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="date"
                    id="date"
                    required={eventType === 'event'}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ 
                      fontFamily: 'Open Sans, sans-serif',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  />
                </div>

                <div>
                  <label 
                    htmlFor="time" 
                    className="block text-sm font-semibold mb-2"
                    style={{ 
                      fontFamily: 'Open Sans, sans-serif',
                      color: 'var(--text-primary)'
                    }}
                  >
                    Time (Optional)
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ 
                      fontFamily: 'Open Sans, sans-serif',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label 
                  htmlFor="location" 
                  className="block text-sm font-semibold mb-2"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    color: 'var(--text-primary)'
                  }}
                >
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                  placeholder="e.g., French Quarter, New Orleans"
                />
              </div>

              {/* Category */}
              <div>
                <label 
                  htmlFor="category" 
                  className="block text-sm font-semibold mb-2"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    color: 'var(--text-primary)'
                  }}
                >
                  Category *
                </label>
                <select
                  id="category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold transition-colors disabled:opacity-50"
                  style={{
                    fontFamily: 'Open Sans, sans-serif',
                    backgroundColor: '#4F46E5',
                    color: '#FFFFFF'
                  }}
                >
                  {uploading ? 'Uploading Image...' : loading ? 'Creating...' : `Create ${eventType === 'event' ? 'Event' : 'Guide'}`}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/events')}
                  className="px-6 py-3 rounded-xl font-semibold transition-colors"
                  style={{
                    fontFamily: 'Open Sans, sans-serif',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}