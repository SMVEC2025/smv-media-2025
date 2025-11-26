import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Users as UsersIcon, Plus, Edit, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '../utils/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [filters, setFilters] = useState({
    role: 'all',
    search: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'team_member',
    specialization: 'photo'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users', {
        description: error.response?.data?.detail || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        specialization: user.specialization || 'photo'
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'team_member',
        specialization: 'photo'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.email) {
        toast.error('Please fill in required fields');
        return;
      }

      if (!editingUser && !formData.password) {
        toast.error('Password is required for new users');
        return;
      }

      if (editingUser) {
        // Edit: only send name, role, specialization
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          specialization: formData.role === 'team_member' ? formData.specialization : null
        };
        await api.put(`/users/${editingUser.id}`, updateData);
        toast.success('User updated successfully');
      } else {
        // Create: send all fields
        const createData = {
          ...formData,
          specialization: formData.role === 'team_member' ? formData.specialization : null
        };
        await api.post('/users', createData);
        toast.success('User created successfully');
      }

      setIsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to save user', {
        description: error.response?.data?.detail || 'Please try again'
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/users/${userToDelete.id}`);
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      const errorMsg = typeof error.response?.data?.detail === 'string'
        ? error.response.data.detail
        : 'Failed to delete user';
      toast.error('Failed to delete user', {
        description: errorMsg
      });
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-[#EF4444]',
      media_head: 'bg-[#F59E0B]',
      team_member: 'bg-[#37429c]'
    };
    return colors[role] || 'bg-slate-500';
  };

  const filteredUsers = users.filter((user) => {
    if (filters.role !== 'all' && user.role !== filters.role) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#37429c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading users...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-heading">Users</h1>
            <p className="text-slate-600 mt-1">Manage system users and roles</p>
          </div>
          <Button
            data-testid="create-user-button"
            className="bg-[#37429c] hover:bg-[#b49749] text-white"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create User
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <Label htmlFor="search" className="text-sm font-medium text-slate-700">
                  Search
                </Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search users..."
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <Label className="text-sm font-medium text-slate-700">Role</Label>
                <Select
                  value={filters.role}
                  onValueChange={(value) => setFilters({ ...filters, role: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="media_head">Media Head</SelectItem>
                    <SelectItem value="team_member">Team Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <UsersIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-lg mb-2">No users found</p>
                <p className="text-sm text-slate-500 mb-6">
                  {filters.search || filters.role !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first user to get started'}
                </p>
                <Button
                  className="bg-[#37429c] hover:bg-[#b49749] text-white"
                  onClick={() => handleOpenDialog()}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create User
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#37429c] text-white flex items-center justify-center font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.specialization ? (
                          <Badge variant="outline" className="capitalize">
                            {user.specialization}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            data-testid={`edit-user-button-${user.id}`}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(user)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            data-testid={`delete-user-button-${user.id}`}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              setUserToDelete(user);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User?"
        description={`Are you sure you want to delete user "${userToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteUser}
        confirmText="Delete User"
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              {editingUser ? 'Edit User' : 'Create User'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                data-testid="user-name-input"
                placeholder="John Doe"
                className="mt-2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                data-testid="user-email-input"
                type="email"
                placeholder="john@example.com"
                className="mt-2"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!!editingUser}
              />
              {editingUser && (
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              )}
            </div>

            {!editingUser && (
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="mt-2"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-slate-700">Role</Label>
              <Select
                data-testid="user-role-select"
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="media_head">Media Head</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'team_member' && (
              <div>
                <Label className="text-sm font-medium text-slate-700">Specialization</Label>
                <Select
                  data-testid="user-specialization-select"
                  value={formData.specialization}
                  onValueChange={(value) => setFormData({ ...formData, specialization: value })}
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
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#37429c] hover:bg-[#b49749] text-white"
              onClick={handleSubmit}
            >
              {editingUser ? 'Update' : 'Create'} User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Users;