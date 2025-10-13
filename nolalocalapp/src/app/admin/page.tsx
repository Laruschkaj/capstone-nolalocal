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
              className="text-5xl font-bold"
              style={{ 
                fontFamily: 'Bebas Neue, sans-serif',
                color: 'var(--text-primary)'
              }}
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
            <p 
              className="text-center"
              style={{ 
                fontFamily: 'Open Sans, sans-serif',
                color: 'var(--text-secondary)'
              }}
            >
              Loading dashboard...
            </p>
          ) : (
            <>
              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <div 
                    className="rounded-2xl p-6 shadow-md"
                    style={{ backgroundColor: 'var(--card-bg)' }}
                  >
                    <p 
                      className="text-sm mb-2"
                      style={{ 
                        fontFamily: 'Open Sans, sans-serif',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Total Users
                    </p>
                    <p 
                      className="text-4xl font-bold"
                      style={{ 
                        fontFamily: 'Bebas Neue, sans-serif',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {stats.totalUsers}
                    </p>
                  </div>

                  <div 
                    className="rounded-2xl p-6 shadow-md"
                    style={{ backgroundColor: 'var(--card-bg)' }}
                  >
                    <p 
                      className="text-sm mb-2"
                      style={{ 
                        fontFamily: 'Open Sans, sans-serif',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Total Events
                    </p>
                    <p 
                      className="text-4xl font-bold"
                      style={{ 
                        fontFamily: 'Bebas Neue, sans-serif',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {stats.totalEvents}
                    </p>
                  </div>

                  <div 
                    className="rounded-2xl p-6 shadow-md"
                    style={{ backgroundColor: 'var(--card-bg)' }}
                  >
                    <p 
                      className="text-sm mb-2"
                      style={{ 
                        fontFamily: 'Open Sans, sans-serif',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      User Events
                    </p>
                    <p 
                      className="text-4xl font-bold"
                      style={{ 
                        fontFamily: 'Bebas Neue, sans-serif',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {stats.userEvents}
                    </p>
                  </div>

                  <div 
                    className="rounded-2xl p-6 shadow-md"
                    style={{ backgroundColor: 'var(--card-bg)' }}
                  >
                    <p 
                      className="text-sm mb-2"
                      style={{ 
                        fontFamily: 'Open Sans, sans-serif',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      External Events
                    </p>
                    <p 
                      className="text-4xl font-bold"
                      style={{ 
                        fontFamily: 'Bebas Neue, sans-serif',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {stats.externalEvents}
                    </p>
                  </div>

                  <div 
                    className="rounded-2xl p-6 shadow-md"
                    style={{ backgroundColor: 'var(--card-bg)' }}
                  >
                    <p 
                      className="text-sm mb-2"
                      style={{ 
                        fontFamily: 'Open Sans, sans-serif',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Categories
                    </p>
                    <p 
                      className="text-4xl font-bold"
                      style={{ 
                        fontFamily: 'Bebas Neue, sans-serif',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {stats.totalCategories}
                    </p>
                  </div>
                </div>
              )}

              {/* Recent Events */}
              <div className="mb-8">
                <h2 
                  className="text-3xl font-bold mb-4"
                  style={{ 
                    fontFamily: 'Bebas Neue, sans-serif',
                    color: 'var(--text-primary)'
                  }}
                >
                  RECENT EVENTS
                </h2>
                <div 
                  className="rounded-2xl shadow-md overflow-hidden"
                  style={{ backgroundColor: 'var(--card-bg)' }}
                >
                  <table className="w-full">
                    <thead 
                      style={{ 
                        backgroundColor: 'rgba(128, 128, 128, 0.1)'
                      }}
                    >
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-bold uppercase"
                          style={{ 
                            fontFamily: 'Open Sans, sans-serif',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          Title
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-bold uppercase"
                          style={{ 
                            fontFamily: 'Open Sans, sans-serif',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          Category
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-bold uppercase"
                          style={{ 
                            fontFamily: 'Open Sans, sans-serif',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          Source
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-bold uppercase"
                          style={{ 
                            fontFamily: 'Open Sans, sans-serif',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          Creator
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-bold uppercase"
                          style={{ 
                            fontFamily: 'Open Sans, sans-serif',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ borderTop: '1px solid var(--border-color)' }}>
                      {recentEvents.map(event => (
                        <tr 
                          key={event._id} 
                          onClick={() => router.push(`/events/${event._id}`)}
                          className="cursor-pointer transition-colors"
                          style={{ borderBottom: '1px solid var(--border-color)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td 
                            className="px-6 py-4 text-sm"
                            style={{ 
                              fontFamily: 'Open Sans, sans-serif',
                              color: 'var(--text-primary)'
                            }}
                          >
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
                          <td 
                            className="px-6 py-4 text-sm"
                            style={{ 
                              fontFamily: 'Open Sans, sans-serif',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            {event.source}
                          </td>
                          <td 
                            className="px-6 py-4 text-sm"
                            style={{ 
                              fontFamily: 'Open Sans, sans-serif',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            {event.creator?.username || 'External'}
                          </td>
                          <td 
                            className="px-6 py-4 text-sm"
                            style={{ 
                              fontFamily: 'Open Sans, sans-serif',
                              color: 'var(--text-secondary)'
                            }}
                          >
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
                  className="text-3xl font-bold mb-4"
                  style={{ 
                    fontFamily: 'Bebas Neue, sans-serif',
                    color: 'var(--text-primary)'
                  }}
                >
                  ALL USERS
                </h2>
                <div 
                  className="rounded-2xl shadow-md overflow-hidden"
                  style={{ backgroundColor: 'var(--card-bg)' }}
                >
                  <table className="w-full">
                    <thead 
                      style={{ 
                        backgroundColor: 'rgba(128, 128, 128, 0.1)'
                      }}
                    >
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-bold uppercase"
                          style={{ 
                            fontFamily: 'Open Sans, sans-serif',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          Username
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-bold uppercase"
                          style={{ 
                            fontFamily: 'Open Sans, sans-serif',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          Email
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-bold uppercase"
                          style={{ 
                            fontFamily: 'Open Sans, sans-serif',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          Role
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-bold uppercase"
                          style={{ 
                            fontFamily: 'Open Sans, sans-serif',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ borderTop: '1px solid var(--border-color)' }}>
                      {allUsers.map(u => (
                        <tr 
                          key={u._id}
                          className="transition-colors"
                          style={{ borderBottom: '1px solid var(--border-color)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td 
                            className="px-6 py-4 text-sm"
                            style={{ 
                              fontFamily: 'Open Sans, sans-serif',
                              color: 'var(--text-primary)'
                            }}
                          >
                            {u.username}
                          </td>
                          <td 
                            className="px-6 py-4 text-sm"
                            style={{ 
                              fontFamily: 'Open Sans, sans-serif',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            {u.email}
                          </td>
                          <td className="px-6 py-4">
                            <span 
                              className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ 
                              fontFamily: 'Open Sans, sans-serif',
                              backgroundColor: u.isAdmin 
                              ? '#E9D5FF'  // Purple for Admin
                              : 'var(--card-bg)',  // Uses card background variable
                              color: u.isAdmin 
                              ? '#6B21A8'   // Dark purple text for Admin
                              : 'var(--text-secondary)',  // Gray text matching table secondary text
                              border: u.isAdmin ? 'none' : '1px solid var(--border-color)'  // Add subtle border for User badge
                              }}
                             >
                             {u.isAdmin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td 
                            className="px-6 py-4 text-sm"
                            style={{ 
                              fontFamily: 'Open Sans, sans-serif',
                              color: 'var(--text-secondary)'
                            }}
                          >
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