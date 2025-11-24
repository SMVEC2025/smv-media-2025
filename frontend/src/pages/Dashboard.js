import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api, { getStatusColor, getPriorityColor, formatDate } from '../utils/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/events')
      ]);
      setStats(statsRes.data);
      setEvents(eventsRes.data.slice(0, 10));
    } catch (error) {
      toast.error('Failed to load dashboard data', {
        description: error.response?.data?.detail || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#00A896] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading">Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of your media operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="stat-upcoming-events">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Upcoming Events</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.upcoming_events || 0}</p>
                </div>
                <Calendar className="w-10 h-10 text-[#00A896]" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-pending-deliveries">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Deliveries</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.pending_deliveries || 0}</p>
                </div>
                <Clock className="w-10 h-10 text-[#F59E0B]" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-overdue-tasks">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Overdue Tasks</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.overdue_tasks || 0}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-[#EF4444]" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-closed-this-month">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Closed This Month</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.closed_this_month || 0}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-[#10B981]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card data-testid="recent-events-card">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-slate-900">Recent Events</CardTitle>
            <CardDescription className="text-slate-600">Latest event activities</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No events yet</p>
                <p className="text-sm text-slate-500 mt-2">Create your first event to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    data-testid={`event-card-${event.id}`}
                    className="bg-white rounded-lg border border-slate-200 p-4 hover:border-[#00A896] transition-colors duration-200 cursor-pointer"
                    onClick={() => window.location.href = `/events/${event.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{event.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {event.institution_name} • {formatDate(event.event_date_start)}
                        </p>
                        {event.venue && (
                          <p className="text-sm text-slate-500 mt-1">{event.venue}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge
                          data-testid="event-status-badge"
                          className={`${getStatusColor(event.status)} text-white`}
                        >
                          {event.status.replace('_', ' ')}
                        </Badge>
                        <Badge
                          data-testid="event-priority-badge"
                          className={`${getPriorityColor(event.priority)} text-white`}
                        >
                          {event.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
