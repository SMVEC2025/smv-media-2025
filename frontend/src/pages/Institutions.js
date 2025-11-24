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
import { Building2, Plus, Edit, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Institutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [institutionToDelete, setInstitutionToDelete] = useState(null);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    active: 'all',
    search: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    short_code: '',
    type: 'college',
    is_active: true
  });

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/institutions');
      setInstitutions(response.data);
    } catch (error) {
      toast.error('Failed to load institutions', {
        description: error.response?.data?.detail || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (institution = null) => {
    if (institution) {
      setEditingInstitution(institution);
      setFormData({
        name: institution.name,
        short_code: institution.short_code || '',
        type: institution.type || 'college',
        is_active: institution.is_active
      });
    } else {
      setEditingInstitution(null);
      setFormData({
        name: '',
        short_code: '',
        type: 'college',
        is_active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        toast.error('Please enter institution name');
        return;
      }

      if (editingInstitution) {
        await api.put(`/institutions/${editingInstitution.id}`, formData);
        toast.success('Institution updated successfully');
      } else {
        await api.post('/institutions', formData);
        toast.success('Institution created successfully');
      }

      setIsDialogOpen(false);
      fetchInstitutions();
    } catch (error) {
      toast.error('Failed to save institution', {
        description: error.response?.data?.detail || 'Please try again'
      });
    }
  };

  const handleDeleteInstitution = async () => {
    try {
      await api.delete(`/institutions/${institutionToDelete.id}`);
      toast.success('Institution deleted successfully');
      setDeleteDialogOpen(false);
      setInstitutionToDelete(null);
      fetchInstitutions();
    } catch (error) {
      const errorMsg = typeof error.response?.data?.detail === 'string'
        ? error.response.data.detail
        : 'Cannot delete institution with associated events';
      toast.error('Failed to delete institution', {
        description: errorMsg
      });
    }
  };

  const filteredInstitutions = institutions.filter((inst) => {
    if (filters.type !== 'all' && inst.type !== filters.type) return false;
    if (filters.active !== 'all') {
      const isActive = filters.active === 'active';
      if (inst.is_active !== isActive) return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        inst.name.toLowerCase().includes(searchLower) ||
        inst.short_code?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#00A896] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading institutions...</p>
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
            <h1 className="text-3xl font-bold text-slate-900 font-heading">Institutions</h1>
            <p className="text-slate-600 mt-1">Manage educational institutions</p>
          </div>
          <Button
            data-testid="create-institution-button"
            className="bg-[#00A896] hover:bg-[#02C9B3] text-white"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Institution
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    placeholder="Search institutions..."
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <Label className="text-sm font-medium text-slate-700">Type</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters({ ...filters, type: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filter */}
              <div>
                <Label className="text-sm font-medium text-slate-700">Status</Label>
                <Select
                  value={filters.active}
                  onValueChange={(value) => setFilters({ ...filters, active: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {filteredInstitutions.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-lg mb-2">No institutions found</p>
                <p className="text-sm text-slate-500 mb-6">
                  {filters.search || filters.type !== 'all' || filters.active !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first institution to get started'}
                </p>
                <Button
                  className="bg-[#00A896] hover:bg-[#02C9B3] text-white"
                  onClick={() => handleOpenDialog()}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Institution
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
                    <TableHead>Short Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstitutions.map((institution) => (
                    <TableRow key={institution.id} data-testid={`institution-row-${institution.id}`}>
                      <TableCell className="font-medium">{institution.name}</TableCell>
                      <TableCell>{institution.short_code || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {institution.type || 'other'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={institution.is_active ? 'bg-[#10B981] text-white' : 'bg-slate-400 text-white'}>
                          {institution.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            data-testid={`edit-institution-button-${institution.id}`}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(institution)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            data-testid={`delete-institution-button-${institution.id}`}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              setInstitutionToDelete(institution);
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
        title="Delete Institution?"
        description={`Are you sure you want to delete "${institutionToDelete?.name}"? This action will fail if there are events associated with this institution.`}
        onConfirm={handleDeleteInstitution}
        confirmText="Delete Institution"
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              {editingInstitution ? 'Edit Institution' : 'Create Institution'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                data-testid="institution-name-input"
                placeholder="SMVEC College"
                className="mt-2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="short_code" className="text-sm font-medium text-slate-700">
                Short Code
              </Label>
              <Input
                id="short_code"
                placeholder="SMVEC"
                className="mt-2"
                maxLength={10}
                value={formData.short_code}
                onChange={(e) => setFormData({ ...formData, short_code: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700">Type</Label>
              <Select
                data-testid="institution-type-select"
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="university">University</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="is_active"
                data-testid="institution-active-toggle"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-[#00A896] border-slate-300 rounded focus:ring-[#00A896]"
              />
              <Label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                Active
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#00A896] hover:bg-[#02C9B3] text-white"
              onClick={handleSubmit}
            >
              {editingInstitution ? 'Update' : 'Create'} Institution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Institutions;