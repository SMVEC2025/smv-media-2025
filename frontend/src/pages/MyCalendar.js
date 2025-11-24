import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api, { getTaskTypeColor, formatDate } from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { toast } from 'sonner';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css';

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const [tasks, setTasks] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      const tasksData = response.data;
      setTasks(tasksData);

      // Transform tasks for react-big-calendar
      const calEvents = tasksData
        .filter(task => task.due_date) // Only tasks with due dates
        .map((task) => ({
          id: task.id,
          title: `${task.type.toUpperCase()}: ${task.event_title}`,
          start: new Date(task.due_date),
          end: new Date(task.due_date),
          resource: task // Store full task data
        }));

      setCalendarEvents(calEvents);
    } catch (error) {
      toast.error('Failed to load tasks', {
        description: error.response?.data?.detail || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedTask(event.resource);
  };

  const eventStyleGetter = (event) => {
    const task = event.resource;
    let backgroundColor = '#00A896'; // Default teal

    // Color by task type
    if (task.type === 'photo') {
      backgroundColor = '#06B6D4'; // Cyan
    } else if (task.type === 'video') {
      backgroundColor = '#8B5CF6'; // Purple
    } else if (task.type === 'editing') {
      backgroundColor = '#EC4899'; // Pink
    }

    // Dim if completed
    const opacity = task.status === 'completed' ? 0.5 : 0.9;

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.875rem',
        padding: '4px 8px'
      }
    };
  };

  const getStatusBadge = (status) => {
    const colors = {
      assigned: 'bg-[#94A3B8]',
      in_progress: 'bg-[#F59E0B]',
      completed: 'bg-[#10B981]'
    };
    return colors[status] || 'bg-slate-500';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#00A896] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
          <h1 className="text-3xl font-bold text-slate-900 font-heading">My Calendar</h1>
          <p className="text-slate-600 mt-1">View your task due dates</p>
        </div>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-slate-700">Task Types:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#06B6D4]"></div>
                <span className="text-sm text-slate-600">Photography</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#8B5CF6]"></div>
                <span className="text-sm text-slate-600">Videography</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#EC4899]"></div>
                <span className="text-sm text-slate-600">Editing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#00A896]"></div>
                <span className="text-sm text-slate-600">Other</span>
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
                    <p className="text-slate-600 text-lg mb-2">No tasks scheduled</p>
                    <p className="text-sm text-slate-500">Tasks with due dates will appear here</p>
                  </div>
                ) : (
                  <div style={{ height: '700px' }}>
                    <Calendar
                      localizer={localizer}
                      events={calendarEvents}
                      startAccessor="start"
                      endAccessor="end"
                      date={currentDate}
                      onNavigate={(date) => setCurrentDate(date)}
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

          {/* Task Details Sidebar (1/3) */}
          <div>
            <Card>
              <CardContent className="p-6">
                {selectedTask ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`${getTaskTypeColor(selectedTask.type)} text-white`}>
                          {selectedTask.type}
                        </Badge>
                        <Badge className={`${getStatusBadge(selectedTask.status)} text-white`}>
                          {selectedTask.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {selectedTask.event_title}
                      </h3>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-slate-600 font-medium">Institution</p>
                        <p className="text-slate-900">{selectedTask.institution_name}</p>
                      </div>

                      <div>
                        <p className="text-slate-600 font-medium">Event Date</p>
                        <p className="text-slate-900">{formatDate(selectedTask.event_date)}</p>
                      </div>

                      <div>
                        <p className="text-slate-600 font-medium">Task Due Date</p>
                        <p className="text-slate-900 font-semibold">{formatDate(selectedTask.due_date)}</p>
                      </div>

                      {selectedTask.comments && (
                        <div>
                          <p className="text-slate-600 font-medium">Comments</p>
                          <p className="text-slate-900">{selectedTask.comments}</p>
                        </div>
                      )}

                      {selectedTask.deliverable_link && (
                        <div>
                          <p className="text-slate-600 font-medium mb-2">Deliverable</p>
                          <a
                            href={selectedTask.deliverable_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00A896] hover:underline text-sm"
                          >
                            View Link
                          </a>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => window.location.href = `/my-tasks`}
                      className="w-full mt-4 px-4 py-2 bg-[#00A896] hover:bg-[#02C9B3] text-white rounded-lg font-medium transition-colors"
                    >
                      Go to My Tasks
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">Select a task</p>
                    <p className="text-sm text-slate-500 mt-2">Click on any task to see details</p>
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

export default MyCalendar;