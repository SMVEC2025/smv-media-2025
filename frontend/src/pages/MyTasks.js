import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api, { getTaskTypeColor, formatDate, formatDateTime } from '../utils/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { CheckCircle, Clock, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    deliverable_link: '',
    comments: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to load tasks', {
        description: error.response?.data?.detail || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (task) => {
    setSelectedTask(task);
    setUpdateData({
      status: task.status,
      deliverable_link: task.deliverable_link || '',
      comments: task.comments || ''
    });
    setIsDialogOpen(true);
  };

  const handleUpdateTask = async () => {
    if (updating) return; // Prevent double-click
    
    try {
      setUpdating(true);
      await api.put(`/tasks/${selectedTask.id}`, {
        ...selectedTask,
        ...updateData
      });
      toast.success('Task updated successfully');
      setIsDialogOpen(false);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task', {
        description: error.response?.data?.detail || 'Please try again'
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      assigned: 'bg-[#94A3B8]',
      in_progress: 'bg-[#F59E0B]',
      completed: 'bg-[#10B981]'
    };
    return colors[status] || 'bg-slate-500';
  };

  const assignedTasks = tasks.filter(t => t.status === 'assigned').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

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
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-heading">My Tasks</h1>
          <p className="text-slate-600 mt-1">Manage your assigned tasks</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Assigned</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{assignedTasks}</p>
                </div>
                <Clock className="w-10 h-10 text-[#94A3B8]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Progress</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{inProgressTasks}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-[#F59E0B]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{completedTasks}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-[#10B981]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        <Card data-testid="my-tasks-card">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-slate-900">All Tasks</CardTitle>
            <CardDescription className="text-slate-600">Your task assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No tasks assigned yet</p>
                <p className="text-sm text-slate-500 mt-2">Check back later for new assignments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => {
                  const eventTitle = task.event_title || 'Standalone Task';
                  const institution = task.institution_name || 'No institution';
                  const eventDate = task.event_date ? formatDate(task.event_date) : 'No event date';

                  return (
                    <div
                      key={task.id}
                      data-testid={`task-item-${task.id}`}
                      className="bg-white rounded-lg border border-slate-200 p-4 hover:border-[#37429c] transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              data-testid="task-type-badge"
                              className={`${getTaskTypeColor(task.type)} text-white`}
                            >
                              {task.type}
                            </Badge>
                            <Badge
                              data-testid="task-status-badge"
                              className={`${getStatusBadge(task.status)} text-white`}
                            >
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-slate-900">{eventTitle}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {institution} - {eventDate}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Assigned: {formatDateTime(task.created_at)}
                          </p>
                          {task.due_date && (
                            <p className="text-sm text-slate-500 mt-1">
                              Due: {formatDate(task.due_date)}
                            </p>
                          )}
                          {task.deliverable_link && (
                            <a
                              href={task.deliverable_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#37429c] hover:underline mt-2 inline-block"
                            >
                              View Deliverable
                            </a>
                          )}
                        </div>
                        <Button
                          data-testid={`update-task-button-${task.id}`}
                          size="sm"
                          className="bg-[#FF6F61] hover:bg-[#FF8A7F] text-white"
                          onClick={() => handleOpenDialog(task)}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Update
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Update Task Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="update-task-dialog" className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              Update Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-slate-700">
                Status
              </Label>
              <Select
                data-testid="task-status-select"
                value={updateData.status}
                onValueChange={(value) => setUpdateData({ ...updateData, status: value })}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deliverable_link" className="text-sm font-medium text-slate-700">
                Deliverable Link (Google Drive)
              </Label>
              <Input
                id="deliverable_link"
                data-testid="deliverable-link-input"
                type="url"
                placeholder="https://drive.google.com/..."
                className="mt-2"
                value={updateData.deliverable_link}
                onChange={(e) => setUpdateData({ ...updateData, deliverable_link: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="comments" className="text-sm font-medium text-slate-700">
                Comments {selectedTask?.comments && '(Read-only - From Management)'}
              </Label>
              <Textarea
                id="comments"
                data-testid="task-comments-textarea"
                placeholder="Add any notes or comments..."
                rows={4}
                className="mt-2"
                value={updateData.comments}
                onChange={(e) => setUpdateData({ ...updateData, comments: e.target.value })}
                disabled={!!selectedTask?.comments}
              />
              {selectedTask?.comments && (
                <p className="text-xs text-slate-500 mt-1">Management comments cannot be edited</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-testid="cancel-dialog-button"
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              data-testid="submit-dialog-button"
              className="bg-[#37429c] hover:bg-[#b49749] text-white"
              onClick={handleUpdateTask}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MyTasks;
