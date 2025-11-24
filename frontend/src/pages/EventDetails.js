import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ConfirmDialog from '../components/ConfirmDialog';
import api, { getStatusColor, getPriorityColor, getTaskTypeColor, formatDate } from '../utils/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Calendar, ArrowLeft, Plus, Edit, Users, Camera, Package, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [equipmentAllocations, setEquipmentAllocations] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [newTask, setNewTask] = useState({
    type: 'photo',
    assigned_to: '',
    due_date: '',
    comments: ''
  });
  const [newEquipment, setNewEquipment] = useState({
    equipment_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [eventRes, tasksRes, allocationsRes, membersRes, equipmentRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/tasks`, { params: { event_id: eventId } }),
        api.get(`/equipment-allocations`, { params: { event_id: eventId } }),
        api.get(`/team-members`),  // Changed from /users to /team-members
        api.get(`/equipment`)
      ]);
      
      setEvent(eventRes.data);
      setTasks(tasksRes.data);
      setEquipmentAllocations(allocationsRes.data);
      setTeamMembers(membersRes.data);  // Already filtered to team_member role by backend
      setEquipment(equipmentRes.data);
    } catch (error) {
      toast.error('Failed to load event details', {
        description: error.response?.data?.detail || 'Please try again'
      });
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async () => {
    try {
      if (!newTask.assigned_to || !newTask.due_date) {
        toast.error('Please fill in required fields');
        return;
      }

      await api.post('/tasks', {
        event_id: eventId,
        ...newTask
      });
      toast.success('Task assigned successfully');
      setIsTaskDialogOpen(false);
      setNewTask({ type: 'photo', assigned_to: '', due_date: '', comments: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to assign task', {
        description: error.response?.data?.detail || 'Please try again'
      });
    }
  };

  const handleAllocateEquipment = async () => {
    try {
      if (!newEquipment.equipment_id) {
        toast.error('Please select equipment');
        return;
      }

      await api.post('/equipment-allocations', {
        event_id: eventId,
        ...newEquipment
      });
      toast.success('Equipment allocated successfully');
      setIsEquipmentDialogOpen(false);
      setNewEquipment({ equipment_id: '', notes: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to allocate equipment', {
        description: error.response?.data?.detail || 'Please try again'
      });
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/events/${eventId}`, {
        ...event,
        status: newStatus
      });
      toast.success('Event status updated');
      setIsStatusDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status', {
        description: error.response?.data?.detail || 'Please try again'
      });
    }
  };

  const handleDeleteTask = async () => {
    try {
      await api.delete(`/tasks/${taskToDelete.id}`);
      toast.success('Task deleted successfully');
      setDeleteTaskDialogOpen(false);
      setTaskToDelete(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete task', {
        description: error.response?.data?.detail || 'Please try again'
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#00A896] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading event...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) return null;

  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/events')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge className={`${getStatusColor(event.status)} text-white`}>
                  {event.status.replace('_', ' ')}
                </Badge>
                <Badge className={`${getPriorityColor(event.priority)} text-white`}>
                  {event.priority.toUpperCase()}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 font-heading mb-2">
                {event.title}
              </h1>
              <p className="text-slate-600">
                {event.institution_name} • {formatDate(event.event_date_start)}
                {event.venue && ` • ${event.venue}`}
              </p>
            </div>
            <Button
              className="bg-[#00A896] hover:bg-[#02C9B3] text-white"
              onClick={() => setIsStatusDialogOpen(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Change Status
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Event Type</p>
                    <p className="font-medium text-slate-900 capitalize">{event.event_type?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Department</p>
                    <p className="font-medium text-slate-900">{event.department || 'N/A'}</p>
                  </div>
                  {event.expected_audience && (
                    <div>
                      <p className="text-sm text-slate-600">Expected Audience</p>
                      <p className="font-medium text-slate-900">{event.expected_audience}</p>
                    </div>
                  )}
                  {event.deliverable_due_date && (
                    <div>
                      <p className="text-sm text-slate-600">Deliverable Due</p>
                      <p className="font-medium text-slate-900">{formatDate(event.deliverable_due_date)}</p>
                    </div>
                  )}
                </div>
                
                {event.description && (
                  <div>
                    <p className="text-sm text-slate-600">Description</p>
                    <p className="text-slate-900 mt-1">{event.description}</p>
                  </div>
                )}

                {event.chief_guests && (
                  <div>
                    <p className="text-sm text-slate-600">Chief Guests</p>
                    <p className="text-slate-900 mt-1">{event.chief_guests}</p>
                  </div>
                )}

                {event.requirements && event.requirements.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Requirements</p>
                    <div className="flex flex-wrap gap-2">
                      {event.requirements.map((req) => (
                        <Badge key={req} variant="outline">
                          {req.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tasks ({tasks.length})</CardTitle>
                  <Button
                    size="sm"
                    className="bg-[#00A896] hover:bg-[#02C9B3] text-white"
                    onClick={() => setIsTaskDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">No tasks assigned yet</p>
                    <p className="text-sm text-slate-500 mt-1">Assign tasks to your team members</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-[#00A896] transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${getTaskTypeColor(task.type)} text-white text-xs`}>
                              {task.type}
                            </Badge>
                            <Badge className={`${getStatusColor(task.status)} text-white text-xs`}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="font-medium text-slate-900">{task.assigned_to_name}</p>
                          <p className="text-sm text-slate-600">Due: {formatDate(task.due_date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.deliverable_link && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(task.deliverable_link, '_blank')}
                            >
                              View
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              setTaskToDelete(task);
                              setDeleteTaskDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deliverables */}
            <Card>
              <CardHeader>
                <CardTitle>Deliverables ({completedTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {completedTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600">No deliverables yet</p>
                    <p className="text-sm text-slate-500 mt-1">Completed tasks will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-200"
                      >
                        <div>
                          <Badge className={`${getTaskTypeColor(task.type)} text-white text-xs mb-2`}>
                            {task.type}
                          </Badge>
                          <p className="font-medium text-slate-900">{task.assigned_to_name}</p>
                          {task.comments && (
                            <p className="text-sm text-slate-600 mt-1">{task.comments}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="bg-[#00A896] hover:bg-[#02C9B3] text-white"
                          onClick={() => window.open(task.deliverable_link, '_blank')}
                        >
                          View Deliverable
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Equipment */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Equipment</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEquipmentDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {equipmentAllocations.length === 0 ? (
                  <div className="text-center py-6">
                    <Camera className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">No equipment allocated</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {equipmentAllocations.map((alloc) => (
                      <div key={alloc.id} className="p-3 rounded-lg bg-slate-50">
                        <p className="font-medium text-slate-900 text-sm">{alloc.equipment_name}</p>
                        {alloc.notes && (
                          <p className="text-xs text-slate-600 mt-1">{alloc.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Task Confirmation Dialog */}
      <ConfirmDialog
        open={deleteTaskDialogOpen}
        onOpenChange={setDeleteTaskDialogOpen}
        title="Delete Task?"
        description={`Are you sure you want to delete this ${taskToDelete?.type} task assigned to ${taskToDelete?.assigned_to_name}? This action cannot be undone.`}
        onConfirm={handleDeleteTask}
        confirmText="Delete Task"
      />

      {/* Assign Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Task Type</Label>
              <Select
                value={newTask.type}
                onValueChange={(value) => setNewTask({ ...newTask, type: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">Photography</SelectItem>
                  <SelectItem value="video">Videography</SelectItem>
                  <SelectItem value="editing">Editing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Assign To</Label>
              <Select
                value={newTask.assigned_to}
                onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} {member.specialization && `(${member.specialization})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                type="datetime-local"
                className="mt-2"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />
            </div>

            <div>
              <Label>Comments</Label>
              <Textarea
                rows={3}
                className="mt-2"
                placeholder="Any special instructions..."
                value={newTask.comments}
                onChange={(e) => setNewTask({ ...newTask, comments: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#00A896] hover:bg-[#02C9B3] text-white"
              onClick={handleAssignTask}
            >
              Assign Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Allocate Equipment Dialog */}
      <Dialog open={isEquipmentDialogOpen} onOpenChange={setIsEquipmentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Allocate Equipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Equipment</Label>
              <Select
                value={newEquipment.equipment_id}
                onValueChange={(value) => setNewEquipment({ ...newEquipment, equipment_id: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.filter(e => e.status === 'available').map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name} {eq.code && `(${eq.code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                rows={3}
                className="mt-2"
                placeholder="Any special notes..."
                value={newEquipment.notes}
                onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEquipmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#00A896] hover:bg-[#02C9B3] text-white"
              onClick={handleAllocateEquipment}
            >
              Allocate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Change Event Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {['event_created', 'event_scheduled', 'shoot_completed', 'delivery_in_progress', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  event.status === status
                    ? 'border-[#00A896] bg-[#00A896]/10'
                    : 'border-slate-200 hover:border-[#00A896]'
                }`}
              >
                <Badge className={`${getStatusColor(status)} text-white text-xs mb-1`}>
                  {status.replace('_', ' ')}
                </Badge>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default EventDetails;
