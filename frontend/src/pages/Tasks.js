import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import api, { getStatusColor, formatDate } from '../utils/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Calendar, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Tasks = () => {
  const { isAdmin, isMediaHead } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [status, setStatus] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    type: 'photo',
    assigned_to: '',
    due_date: '',
    comments: '',
    event_id: '8d304940-none-none-a5c5-2c5d26d000c9'
  });

  useEffect(() => {
    fetchTasks();
    fetchMeta();
  }, []);

  const formatError = (detail) => {
    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg || JSON.stringify(item)).join(' | ');
    }
    if (typeof detail === 'string') return detail;
    return 'Please try again';
  };

  const fetchTasks = async () => {
    setListLoading(true);
    try {
      const res = await api.get('/tasks');
      setTasks(res.data || []);
    } catch (error) {
      toast.error('Failed to load tasks', {
        description: formatError(error.response?.data?.detail)
      });
    } finally {
      setLoading(false);
      setListLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [membersRes, eventsRes] = await Promise.all([
        api.get('/team-members'),
        api.get('/events')
      ]);
      setTeamMembers(membersRes.data || []);
      setAllEvents(eventsRes.data || []);
    } catch (error) {
      // soft fail
    }
  };

  const handleCreateTask = async () => {
    if (creating) return;
    if (!newTask.assigned_to || !newTask.due_date) {
      toast.error('Please fill in required fields');
      return;
    }
    try {
      setCreating(true);
      const payload = { ...newTask };
      if (!newTask.event_id || newTask.event_id === 'none') {
        delete payload.event_id;
        payload.event_title = 'No_event';
      }
      await api.post('/tasks', payload);
      toast.success('Task created successfully');
      setTaskDialogOpen(false);
      setNewTask({
        type: 'photo',
        assigned_to: '',
        due_date: '',
        comments: '',
        event_id: 'none'
      });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task', {
        description: formatError(error.response?.data?.detail)
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (deleting || !taskToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/tasks/${taskToDelete.id}`);
      toast.success('Task deleted successfully');
      fetchTasks();
      setTaskToDelete(null);
      setConfirmOpen(false);
    } catch (error) {
      toast.error('Failed to delete task', {
        description: formatError(error.response?.data?.detail)
      });
    } finally {
      setDeleting(false);
    }
  };

  const filteredTasks = useMemo(() => {
    let data = [...tasks];

    if (status !== 'all') {
      data = data.filter((t) => t.status === status);
    }

    const parseDate = (value) => (value ? new Date(value) : null);
    if (fromDate && toDate) {
      const from = parseDate(fromDate);
      const to = parseDate(toDate);
      data = data.filter((t) => {
        const created = t.created_at ? parseDate(t.created_at) : null;
        return created && created >= from && created <= to;
      });
    } else if (fromDate) {
      const from = parseDate(fromDate);
      data = data.filter((t) => {
        const created = t.created_at ? parseDate(t.created_at) : null;
        return created && created >= from;
      });
    } else if (toDate) {
      const to = parseDate(toDate);
      data = data.filter((t) => {
        const created = t.created_at ? parseDate(t.created_at) : null;
        return created && created <= to;
      });
    }

    return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [tasks, status, fromDate, toDate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#37429c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading tasks...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-heading">Tasks</h1>
            <p className="text-slate-600 mt-1">All tasks across events and standalone work</p>
          </div>
          {(isAdmin || isMediaHead) && (
            <Button
              className="bg-[#37429c] hover:bg-[#2f387f] text-white"
              onClick={() => setTaskDialogOpen(true)}
            >
              + New Task
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter tasks by status and created date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>From</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>To</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setStatus('all');
                  setFromDate('');
                  setToDate('');
                }}
              >
                Clear
              </Button>
              <Button onClick={fetchTasks} className="bg-[#37429c] hover:bg-[#2f387f] text-white" disabled={listLoading}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
            <CardDescription>{listLoading ? 'Loading...' : `${filteredTasks.length} task(s)`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[600px] overflow-y-auto space-y-3">
              {listLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : filteredTasks.length === 0 ? (
                <p className="text-sm text-slate-500">No tasks found.</p>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task.id} className="rounded-lg border border-slate-200 p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(task.status)} text-white`}>
                          {task.status?.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">{task.type}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedTask(task)} aria-label="View task">
                          <Eye className="w-4 h-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setTaskToDelete(task);
                            setConfirmOpen(true);
                          }}
                          aria-label="Delete task"
                          disabled={deleting}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-2">
                      {task.event_title || 'Standalone Task'}
                    </p>
                    <p className="text-xs text-slate-600">
                      Assigned: {task.created_at ? formatDate(task.created_at) : '—'}
                    </p>
                    <p className="text-xs text-slate-600">
                      Due: {task.due_date ? formatDate(task.due_date) : 'Not set'}
                    </p>
                    {task.comments && (
                      <p className="text-xs text-slate-700 mt-1">Notes: {task.comments}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={`${selectedTask?.status ? getStatusColor(selectedTask.status) : ''} text-white`}>
                {selectedTask?.status?.replace('_', ' ') || 'Unknown'}
              </Badge>
              <Badge variant="outline">{selectedTask?.type}</Badge>
            </div>
            <p className="text-lg font-semibold text-slate-900">{selectedTask?.event_title || 'No_event'}</p>
            <p className="text-sm text-slate-700">{selectedTask?.comments || 'No description'}</p>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
              <div>
                <p className="text-slate-500">Assigned</p>
                <p>{selectedTask?.created_at ? formatDate(selectedTask.created_at) : '—'}</p>
              </div>
              <div>
                <p className="text-slate-500">Due</p>
                <p>{selectedTask?.due_date ? formatDate(selectedTask.due_date) : 'Not set'}</p>
              </div>
            </div>
            {selectedTask?.deliverable_link && (
              <a
                href={selectedTask.deliverable_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#37429c] hover:underline text-sm"
              >
                View Deliverable
              </a>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedTask(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={(open) => { if (!open) { setConfirmOpen(false); setTaskToDelete(null); } }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-slate-700">
              Are you sure you want to delete this task?
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {taskToDelete?.event_title || 'No_event'}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => { setConfirmOpen(false); setTaskToDelete(null); }} disabled={deleting}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteTask} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {(isAdmin || isMediaHead) && (
        <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Task Type</Label>
                  <Select
                    value={newTask.type}
                    onValueChange={(value) => setNewTask({ ...newTask, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photo">Photo</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="editing">Editing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select
                    value={newTask.assigned_to}
                    onValueChange={(value) => setNewTask({ ...newTask, assigned_to: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.length === 0 ? (
                        <SelectItem value="no-members" disabled>
                          No team members available
                        </SelectItem>
                      ) : (
                        teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.name} ({member.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Link to Event (optional)</Label>
                <Select
                  value={newTask.event_id}
                  onValueChange={(value) => setNewTask({ ...newTask, event_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No event (standalone task)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8d304940-none-none-a5c5-2c5d26d000c9">No event</SelectItem>
                    {allEvents.map((evt) => (
                      <SelectItem key={evt.id} value={evt.id.toString()}>
                        {evt.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Comments (optional)</Label>
                <Textarea
                  rows={3}
                  value={newTask.comments}
                  onChange={(e) => setNewTask({ ...newTask, comments: e.target.value })}
                  placeholder="Provide guidance or requirements for this task"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setTaskDialogOpen(false)} disabled={creating}>
                Cancel
              </Button>
              <Button className="bg-[#37429c] hover:bg-[#2f387f] text-white" onClick={handleCreateTask} disabled={creating}>
                {creating ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default Tasks;
