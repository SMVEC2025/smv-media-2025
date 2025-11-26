import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ConfirmDialog from '../components/ConfirmDialog';
import api, { getStatusColor, getPriorityColor, formatDate, formatDateTime } from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Calendar, Plus, Filter, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    institution: 'all',
    priority: 'all',
    search: ''
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    institution_id: '',
    department: '',
    event_date_start: '',
    event_date_end: '',
    venue: '',
    description: '',
    event_type: 'seminar',
    expected_audience: '',
    chief_guests: '',
    requirements: [],
    comments: '',
    priority: 'normal',
    deliverable_due_date: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [eventsRes, institutionsRes] = await Promise.all([
        api.get('/events', {
          params: {
            status: filters.status !== 'all' ? filters.status : undefined,
            institution_id: filters.institution !== 'all' ? filters.institution : undefined,
            priority: filters.priority !== 'all' ? filters.priority : undefined
          }
        }),
        api.get('/institutions')
      ]);
      let eventsData = eventsRes.data;
      
      // Apply search filter on frontend
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        eventsData = eventsData.filter(e => 
          e.title.toLowerCase().includes(searchLower) ||
          e.institution_name?.toLowerCase().includes(searchLower) ||
          e.venue?.toLowerCase().includes(searchLower)
        );
      }
      
      setEvents(eventsData);
      setInstitutions(institutionsRes.data);
    } catch (error) {
      toast.error('Failed to load events', {
        description: error.response?.data?.detail || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (creating) return; // Prevent double-click
    
    try {
      // Validate required fields
      if (!newEvent.title || !newEvent.institution_id || !newEvent.event_date_start) {
        toast.error('Please fill in required fields', {
          description: 'Title, Institution, and Event Date are required'
        });
        return;
      }

      setCreating(true);

      // Prepare event data with proper date formatting
      const eventData = {
        ...newEvent,
        event_date_start: newEvent.event_date_start ? new Date(newEvent.event_date_start).toISOString() : null,
        event_date_end: newEvent.event_date_end ? new Date(newEvent.event_date_end).toISOString() : null,
        deliverable_due_date: newEvent.deliverable_due_date ? new Date(newEvent.deliverable_due_date).toISOString() : null,
        expected_audience: newEvent.expected_audience ? parseInt(newEvent.expected_audience) : null
      };

      await api.post('/events', eventData);
      toast.success('Event created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      const errorMessage = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : 'Please check all required fields and try again';
      toast.error('Failed to create event', {
        description: errorMessage
      });
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      institution_id: '',
      department: '',
      event_date_start: '',
      event_date_end: '',
      venue: '',
      description: '',
      event_type: 'seminar',
      expected_audience: '',
      chief_guests: '',
      requirements: [],
      comments: '',
      priority: 'normal',
      deliverable_due_date: ''
    });
  };

  const handleRequirementToggle = (requirement) => {
    setNewEvent(prev => ({
      ...prev,
      requirements: prev.requirements.includes(requirement)
        ? prev.requirements.filter(r => r !== requirement)
        : [...prev.requirements, requirement]
    }));
  };

  const handleDeleteEvent = async () => {
    try {
      await api.delete(`/events/${eventToDelete.id}`);
      toast.success('Event deleted successfully', {
        description: 'All associated tasks and allocations have been removed'
      });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete event', {
        description: error.response?.data?.detail || 'Please try again'
      });
    }
  };

  const openDeleteDialog = (event, e) => {
    e.stopPropagation(); // Prevent card click
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#37429c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading events...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-heading">Events</h1>
            <p className="text-slate-600 mt-1">Manage all your media events</p>
          </div>
          <Button
            data-testid="create-event-button"
            className="bg-[#37429c] hover:bg-[#b49749] text-white"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <Label htmlFor="search" className="text-sm font-medium text-slate-700">
                  Search
                </Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="search"
                    data-testid="search-events-input"
                    type="text"
                    placeholder="Search events..."
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <Label className="text-sm font-medium text-slate-700">Status</Label>
                <Select
                  data-testid="filter-status"
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="event_created">Created</SelectItem>
                    <SelectItem value="event_scheduled">Scheduled</SelectItem>
                    <SelectItem value="shoot_completed">Shoot Completed</SelectItem>
                    <SelectItem value="delivery_in_progress">Delivery In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div>
                <Label className="text-sm font-medium text-slate-700">Priority</Label>
                <Select
                  data-testid="filter-priority"
                  value={filters.priority}
                  onValueChange={(value) => setFilters({ ...filters, priority: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {events.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-lg mb-2">No events found</p>
                <p className="text-sm text-slate-500 mb-6">
                  {filters.search || filters.status !== 'all' || filters.priority !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first event to get started'}
                </p>
                <Button
                  className="bg-[#37429c] hover:bg-[#b49749] text-white"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Event
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                data-testid={`event-card-${event.id}`}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => window.location.href = `/events/${event.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      className={`${getStatusColor(event.status)} text-white`}
                    >
                      {event.status.replace('_', ' ')}
                    </Badge>
                    <Badge
                      className={`${getPriorityColor(event.priority)} text-white`}
                    >
                      {event.priority.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-[#37429c] transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(event.event_date_start)}
                    </p>
                    <p>{event.institution_name}</p>
                    {event.venue && <p className="text-slate-500">{event.venue}</p>}
                    <p className="text-xs text-slate-500">Created: {formatDateTime(event.created_at)}</p>
                  </div>

                  {event.requirements && event.requirements.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {event.requirements.slice(0, 3).map((req) => (
                        <Badge key={req} variant="outline" className="text-xs">
                          {req.replace('_', ' ')}
                        </Badge>
                      ))}
                      {event.requirements.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{event.requirements.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <Button
                      data-testid={`delete-event-button-${event.id}`}
                      size="sm"
                      variant="ghost"
                      className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={(e) => openDeleteDialog(event, e)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Event
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Event?"
        description={`Are you sure you want to delete "${eventToDelete?.title}"? This will also delete all associated tasks and equipment allocations. This action cannot be undone.`}
        onConfirm={handleDeleteEvent}
        confirmText="Delete Event"
      />

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent data-testid="create-event-dialog" className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              Create New Event
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                Event Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                data-testid="event-title-input"
                placeholder="Annual Graduation Ceremony 2024"
                className="mt-2"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>

            {/* Institution */}
            <div>
              <Label className="text-sm font-medium text-slate-700">
                Institution <span className="text-red-500">*</span>
              </Label>
              <Select
                data-testid="event-institution-select"
                value={newEvent.institution_id}
                onValueChange={(value) => setNewEvent({ ...newEvent, institution_id: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select institution" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_date_start" className="text-sm font-medium text-slate-700">
                  Event Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="event_date_start"
                  type="datetime-local"
                  className="mt-2"
                  value={newEvent.event_date_start}
                  onChange={(e) => setNewEvent({ ...newEvent, event_date_start: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="event_date_end" className="text-sm font-medium text-slate-700">
                  End Date (Optional)
                </Label>
                <Input
                  id="event_date_end"
                  type="datetime-local"
                  className="mt-2"
                  value={newEvent.event_date_end}
                  onChange={(e) => setNewEvent({ ...newEvent, event_date_end: e.target.value })}
                />
              </div>
            </div>

            {/* Department and Venue */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department" className="text-sm font-medium text-slate-700">
                  Department
                </Label>
                <Input
                  id="department"
                  placeholder="Computer Science"
                  className="mt-2"
                  value={newEvent.department}
                  onChange={(e) => setNewEvent({ ...newEvent, department: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="venue" className="text-sm font-medium text-slate-700">
                  Venue
                </Label>
                <Input
                  id="venue"
                  placeholder="Main Auditorium"
                  className="mt-2"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                />
              </div>
            </div>

            {/* Event Type and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Event Type</Label>
                <Select
                  value={newEvent.event_type}
                  onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="inauguration">Inauguration</SelectItem>
                    <SelectItem value="convocation">Convocation</SelectItem>
                    <SelectItem value="press_meet">Press Meet</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Priority</Label>
                <Select
                  value={newEvent.priority}
                  onValueChange={(value) => setNewEvent({ ...newEvent, priority: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-3 block">Requirements</Label>
              <div className="grid grid-cols-2 gap-3">
                {['photos', 'video_coverage', 'highlight_video', 'instagram_reel', 'live_stream', 'drone'].map((req) => (
                  <label key={req} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEvent.requirements.includes(req)}
                      onChange={() => handleRequirementToggle(req)}
                      className="w-4 h-4 text-[#37429c] border-slate-300 rounded focus:ring-[#37429c]"
                    />
                    <span className="text-sm text-slate-700">{req.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter event description..."
                rows={3}
                className="mt-2"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              data-testid="submit-create-event-button"
              className="bg-[#37429c] hover:bg-[#37429c] text-white"
              onClick={handleCreateEvent}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Events;
