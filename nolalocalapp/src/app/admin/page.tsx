///src/app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

interface Stats {
  totalUsers: number;
  totalEvents: number;
  userEvents: number;
  externalEvents: number;
  totalCategories: number;
}

interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Event {
  _id: string;
  title: string;
  date: string;
  category: {
    name: string;
    color: string;
  };
  creator?: {
    username: string;
  };
  source: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push('/');
      return;
    }
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);
        setRecentEvents(data.data.recentEvents);
        setAllUsers(data.data.allUsers);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncEvents = async () => {
    if (!confirm('Manually sync events from Ticketmaster and Eventbrite?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/events/sync', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchDashboard();
      } else {
        alert('Sync failed: ' + data.message);
      }
    } catch (error) {
      alert('Error syncing events');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <h1 
              className="text-5xl font-bold text-gray-900"
              style={{ fontFamily: 'Bebas Neue, sans-serif' }}
            >
              ADMIN DASHBOARD
            </h1>
            <button
              onClick={handleSyncEvents}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              🔄 Manual Sync Events
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-600">Loading dashboard...</p>
          ) : (
            <>
              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      Total Users
                    </p>
                    <p className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      {stats.totalUsers}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      Total Events
                    </p>
                    <p className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      {stats.totalEvents}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      User Events
                    </p>
                    <p className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      {stats.userEvents}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      External Events
                    </p>
                    <p className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      {stats.externalEvents}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-md">
                    <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      Categories
                    </p>
                    <p className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      {stats.totalCategories}
                    </p>
                  </div>
                </div>
              )}

              {/* Recent Events */}
              <div className="mb-8">
                <h2 
                  className="text-3xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                >
                  RECENT EVENTS
                </h2>
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          Source
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          Creator
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentEvents.map(event => (
                        <tr 
                          key={event._id} 
                          onClick={() => router.push(`/events/${event._id}`)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                            {event.title}
                          </td>
                          <td className="px-6 py-4">
                            <span 
                              className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ 
                                backgroundColor: event.category.color + '20',
                                color: event.category.color,
                                fontFamily: 'Open Sans, sans-serif'
                              }}
                            >
                              {event.category.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                            {event.source}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                            {event.creator?.username || 'External'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                            {new Date(event.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* All Users */}
              <div>
                <h2 
                  className="text-3xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                >
                  ALL USERS
                </h2>
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allUsers.map(u => (
                        <tr key={u._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                            {u.username}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                            {u.email}
                          </td>
                          <td className="px-6 py-4">
                            <span 
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                u.isAdmin 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                              style={{ fontFamily: 'Open Sans, sans-serif' }}
                            >
                              {u.isAdmin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}