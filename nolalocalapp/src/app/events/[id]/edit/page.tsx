'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useDropzone } from 'react-dropzone';

interface Category {
  _id: string;
  name: string;
  slug: string;
  color: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  imageUrl?: string;
  category: {
    _id: string;
  };
}

export default function EditEventPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { token, user } = useAuth();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    fetchCategories();
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`);
      const data = await response.json();

      if (data.success) {
        const event: Event = data.data.event;
        setTitle(event.title);
        setDescription(event.description);
        setDate(event.date.split('T')[0]);
        setTime(event.time || '');
        setLocation(event.location);
        setCategory(event.category._id);
        setCurrentImageUrl(event.imageUrl || null);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setInitialLoading(false);
    }
  };

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
    maxSize: 5242880,
  });

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'nolalocal-events');
    
    let folder = 'nolalocal/user-events';
    
    if (user?.isAdmin) {
      folder = 'nolalocal/admin-events';
    } else {
      folder = 'nolalocal/user-events';
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
      let imageUrl = currentImageUrl;

      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadToCloudinary(imageFile);
        setUploading(false);
      }

      const response = await fetch(`/api/events/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          date: date ? new Date(date + 'T00:00:00').toISOString() : date,
          time,
          location,
          category,
          imageUrl: imageUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        setLoading(false);
        return;
      }

      router.push(`/events/${params.id}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
          <p style={{ fontFamily: 'Open Sans, sans-serif', color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <Navigation />

        <header className="max-w-4xl mx-auto px-6 py-8">
          <h1 
            className="text-5xl font-bold"
            style={{ 
              fontFamily: 'Bebas Neue, sans-serif',
              color: 'var(--text-primary)'
            }}
          >
            EDIT EVENT
          </h1>
          <p 
            className="mt-2 text-lg"
            style={{ 
              fontFamily: 'Open Sans, sans-serif',
              color: 'var(--text-secondary)'
            }}
          >
            Update your event details
          </p>
        </header>

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

              <div>
                <label 
                  className="block text-sm font-semibold mb-3"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    color: 'var(--text-primary)'
                  }}
                >
                  Event Image
                </label>
                
                {!imagePreview && !currentImageUrl ? (
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
                        {isDragActive ? 'Drop image here' : 'Drag & drop a new image'}
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
                      src={imagePreview || currentImageUrl || ''} 
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
                    {!imagePreview && currentImageUrl && (
                      <div
                      {...getRootProps()}
                        className="absolute bottom-4 left-4 right-4 rounded-lg p-3 cursor-pointer transition-colors"
                        style={{
                        backgroundColor: 'var(--card-bg)',
                        opacity: 0.95
                      }}
                        >
                         <input {...getInputProps()} />
                         <p 
                           className="text-sm font-semibold text-center"
                           style={{ 
                           fontFamily: 'Open Sans, sans-serif',
                           color: 'var(--text-primary)'
                      }}
                        >
                        Click to replace image
                      </p>
                    </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label 
                  htmlFor="title" 
                  className="block text-sm font-semibold mb-2"
                  style={{ 
                    fontFamily: 'Open Sans, sans-serif',
                    color: 'var(--text-primary)'
                  }}
                >
                  Event Title *
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
                />
              </div>

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
                />
              </div>

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
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    required
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
                />
              </div>

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
                  {uploading ? 'Uploading Image...' : loading ? 'Updating...' : 'Update Event'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/events/${params.id}`)}
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