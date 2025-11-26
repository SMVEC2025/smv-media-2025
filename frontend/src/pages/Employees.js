import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import api, { formatDate } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { CalendarDays, ListFilter } from 'lucide-react';
import { toast } from 'sonner';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksRaw, setTasksRaw] = useState([]);
  const [filterType, setFilterType] = useState('none');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    month: '',
    year: '',
    date: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/team-members');
      setEmployees(res.data || []);
    } catch (error) {
      toast.error('Failed to load employees', {
        description: error.response?.data?.detail || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (employeeId) => {
    setTasksLoading(true);
    try {
      const params = { assigned_to: employeeId };
      const res = await api.get('/tasks', { params });
      const data = res.data || [];
      setTasksRaw(data);
      setTasks(data);
    } catch (error) {
      const detail = error.response?.data?.detail;
      const description = Array.isArray(detail)
        ? detail.map((item) => item.msg || JSON.stringify(item)).join(' | ')
        : typeof detail === 'string'
          ? detail
          : 'Please try again';
      toast.error('Failed to load tasks', { description });
    } finally {
      setTasksLoading(false);
    }
  };

  const handleOpenTasks = (employee) => {
    setSelectedEmployee(employee);
    setFilters({ from: '', to: '', month: '', year: '', date: '' });
    setFilterType('none');
    setStatusFilter('all');
    fetchTasks(employee.id);
  };

  const filteredTasks = useMemo(() => {
    let data = [...tasksRaw];

    const parseDate = (value) => (value ? new Date(value) : null);

    if (filterType === 'range' && filters.from && filters.to) {
      const fromDate = parseDate(filters.from);
      const toDate = parseDate(filters.to);
      data = data.filter((t) => {
        const created = parseDate(t.created_at);
        return created && created >= fromDate && created <= toDate;
      });
    } else if (filterType === 'month' && filters.month && filters.year) {
      data = data.filter((t) => {
        const created = parseDate(t.created_at);
        return created && created.getMonth() + 1 === Number(filters.month) && created.getFullYear() === Number(filters.year);
      });
    } else if (filterType === 'year' && filters.year) {
      data = data.filter((t) => {
        const created = parseDate(t.created_at);
        return created && created.getFullYear() === Number(filters.year);
      });
    } else if (filterType === 'date' && filters.date) {
      const target = filters.date;
      data = data.filter((t) => {
        const created = t.created_at ? t.created_at.slice(0, 10) : '';
        return created === target;
      });
    }

    if (statusFilter !== 'all') {
      data = data.filter((t) => t.status === statusFilter);
    }

    // Default order by created_at desc
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return data;
  }, [tasksRaw, filterType, filters, statusFilter]);

  const groupedTasks = useMemo(() => {
    const groups = { assigned: [], in_progress: [], completed: [] };
    filteredTasks.forEach((t) => {
      if (groups[t.status]) {
        groups[t.status].push(t);
      } else {
        groups.assigned.push(t);
      }
    });
    return groups;
  }, [filteredTasks]);

  const handleApplyFilter = () => {
    // Filtering is handled client-side via filteredTasks memo
    return;
  };
  function handleEmployeeTaskOpen(link) {
    if (link) {
      window.open(link, '_blank');
    } else {
      toast.error('Links not found', {
        description: 'task not completed'
      });
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#37429c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading employees...</p>
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
            <h1 className="text-3xl font-bold text-slate-900 font-heading">Employees</h1>
            <p className="text-slate-600 mt-1">Manage team members and their assigned tasks</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Only employees are listed here</CardDescription>
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <p className="text-slate-600">No employees found.</p>
            ) : (
              <div className="space-y-3">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{emp.name}</p>
                      <p className="text-sm text-slate-600">{emp.email}</p>
                    </div>
                    <Button
                      className="bg-[#37429c] hover:bg-[#2f387f] text-white"
                      onClick={() => handleOpenTasks(emp)}
                    >
                      View Tasks
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListFilter className="w-5 h-5" />
              Tasks for {selectedEmployee?.name}
            </DialogTitle>
            <p className="text-sm text-slate-600">{selectedEmployee?.email}</p>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Filter Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="range">From - To</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                    <SelectItem value="date">Particular Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Task status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filterType === 'range' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Input
                      type="date"
                      value={filters.from}
                      onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input
                      type="date"
                      value={filters.to}
                      onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {filterType === 'month' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <Select value={filters.month} onValueChange={(value) => setFilters({ ...filters, month: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(12)].map((_, idx) => (
                          <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                            {idx + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      type="number"
                      placeholder="2025"
                      value={filters.year}
                      onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {filterType === 'year' && (
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    type="number"
                    placeholder="2025"
                    value={filters.year}
                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  />
                </div>
              )}

              {filterType === 'date' && (
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setFilterType('none');
                  setStatusFilter('all');
                  setFilters({ from: '', to: '', month: '', year: '', date: '' });
                }}
              >
                Clear
              </Button>
              <Button className="bg-[#37429c] hover:bg-[#2f387f] text-white" onClick={handleApplyFilter} disabled={tasksLoading}>
                Apply Filter
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CalendarDays className="w-4 h-4" />
                <span>{tasksLoading ? 'Loading tasks...' : `${filteredTasks.length} task(s) found`}</span>
              </div>
              {filteredTasks.length === 0 ? (
                <p className="text-slate-600 text-sm">No tasks for this employee.</p>
              ) : (
                <div className="overflow-x-auto overflow-y-auto max-h-[480px] rounded-lg border border-slate-200">

                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-slate-600">
                        <th className="px-4 py-3 font-medium">Task Type</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Event</th>
                        <th className="px-4 py-3 font-medium">Comments</th>
                        <th className="px-4 py-3 font-medium">Due Date</th>
                        <th className="px-4 py-3 font-medium">Created At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-50" onClick={() => { handleEmployeeTaskOpen(task?.deliverable_link) }} >
                          <td className="px-4 py-3">
                            <Badge className="bg-[#37429c] text-white">{task.type}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="capitalize">
                              {task.status?.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {task.event_title || 'No_event'}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {task.comments || '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {task.due_date ? formatDate(task.due_date) : 'Not set'}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {task.created_at ? formatDate(task.created_at) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setSelectedEmployee(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Employees;
