import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api, { getStatusColor, getPriorityColor, formatDate } from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { toast } from 'sonner';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css';

const localizer = momentLocalizer(moment);

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      const eventsData = response.data;
      setEvents(eventsData);

      // Transform events for react-big-calendar
      const calEvents = eventsData.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.event_date_start),
        end: event.event_date_end ? new Date(event.event_date_end) : new Date(event.event_date_start),
        resource: event // Store full event data
      }));

      setCalendarEvents(calEvents);
    } catch (error) {
      toast.error('Failed to load events', {
        description: error.response?.data?.detail || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
  };

  const handleNavigate = (date) => {
    setCurrentDate(date);
  };

  const eventStyleGetter = (event) => {
    const eventData = event.resource;
    let backgroundColor = '#37429c'; // Default teal

    // Color by status
    if (eventData.status === 'closed') {
      backgroundColor = '#10B981'; // Green
    } else if (eventData.status === 'delivery_in_progress') {
      backgroundColor = '#8B5CF6'; // Purple
    } else if (eventData.status === 'shoot_completed') {
      backgroundColor = '#F59E0B'; // Amber
    } else if (eventData.priority === 'vip') {
      backgroundColor = '#EF4444'; // Red for VIP
    } else if (eventData.priority === 'high') {
      backgroundColor = '#F59E0B'; // Amber for high
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.875rem',
        padding: '4px 8px'
      }
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#37429c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading calendar...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading">Event Calendar</h1>
          <p className="text-slate-600 mt-1">View all events in calendar format</p>
        </div>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-slate-700">Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#EF4444]"></div>
                <span className="text-sm text-slate-600">VIP Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#F59E0B]"></div>
                <span className="text-sm text-slate-600">High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#37429c]"></div>
                <span className="text-sm text-slate-600">Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#10B981]"></div>
                <span className="text-sm text-slate-600">Closed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View (2/3) */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {calendarEvents.length === 0 ? (
                  <div className="text-center py-20">
                    <CalendarIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg mb-2">No events scheduled</p>
                    <p className="text-sm text-slate-500">Create events to see them on the calendar</p>
                  </div>
                ) : (
                  <div style={{ height: '700px' }}>
                    <Calendar
                      localizer={localizer}
                      events={calendarEvents}
                      startAccessor="start"
                      endAccessor="end"
                      date={currentDate}
                      onNavigate={handleNavigate}
                      onSelectEvent={handleSelectEvent}
                      eventPropGetter={eventStyleGetter}
                      views={['month', 'week', 'day']}
                      defaultView="month"
                      popup
                      selectable
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Event Details Sidebar (1/3) */}
          <div>
            <Card>
              <CardContent className="p-6">
                {selectedEvent ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${getStatusColor(selectedEvent.status)} text-white`}>
                          {selectedEvent.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={`${getPriorityColor(selectedEvent.priority)} text-white`}>
                          {selectedEvent.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {selectedEvent.title}
                      </h3>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-slate-600 font-medium">Institution</p>
                        <p className="text-slate-900">{selectedEvent.institution_name}</p>
                      </div>

                      <div>
                        <p className="text-slate-600 font-medium">Date</p>
                        <p className="text-slate-900">{formatDate(selectedEvent.event_date_start)}</p>
                      </div>

                      {selectedEvent.venue && (
                        <div>
                          <p className="text-slate-600 font-medium">Venue</p>
                          <p className="text-slate-900">{selectedEvent.venue}</p>
                        </div>
                      )}

                      {selectedEvent.event_type && (
                        <div>
                          <p className="text-slate-600 font-medium">Type</p>
                          <p className="text-slate-900 capitalize">{selectedEvent.event_type.replace('_', ' ')}</p>
                        </div>
                      )}

                      {selectedEvent.description && (
                        <div>
                          <p className="text-slate-600 font-medium">Description</p>
                          <p className="text-slate-900">{selectedEvent.description}</p>
                        </div>
                      )}

                      {selectedEvent.requirements && selectedEvent.requirements.length > 0 && (
                        <div>
                          <p className="text-slate-600 font-medium mb-2">Requirements</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedEvent.requirements.map((req) => (
                              <Badge key={req} variant="outline" className="text-xs">
                                {req.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => window.location.href = `/events/${selectedEvent.id}`}
                      className="w-full mt-4 px-4 py-2 bg-[#37429c] hover:bg-[#b49749] text-white rounded-lg font-medium transition-colors"
                    >
                      View Full Details
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">Select an event</p>
                    <p className="text-sm text-slate-500 mt-2">Click on any event to see details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CalendarView;