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
import { Calendar, Eye } from 'lucide-react';
import { toast } from 'sonner';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [status, setStatus] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setListLoading(true);
    try {
      const res = await api.get('/tasks');
      setTasks(res.data || []);
    } catch (error) {
      toast.error('Failed to load tasks', {
        description: error.response?.data?.detail || 'Please try again'
      });
    } finally {
      setLoading(false);
      setListLoading(false);
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
                      <Button variant="ghost" size="icon" onClick={() => setSelectedTask(task)} aria-label="View task">
                        <Eye className="w-4 h-4 text-slate-600" />
                      </Button>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-2">
                      {task.event_title || 'No_event'}
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
    </Layout>
  );
};

export default Tasks;
