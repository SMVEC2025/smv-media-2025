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
import { Textarea } from '../components/ui/textarea';
import { Camera, Plus, Edit, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    status: 'available',
    notes: ''
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipment(response.data);
    } catch (error) {
      toast.error('Failed to load equipment', {
        description: error.response?.data?.detail || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (equip = null) => {
    if (equip) {
      setEditingEquipment(equip);
      setFormData({
        name: equip.name,
        code: equip.code || '',
        status: equip.status || 'available',
        notes: equip.notes || ''
      });
    } else {
      setEditingEquipment(null);
      setFormData({
        name: '',
        code: '',
        status: 'available',
        notes: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        toast.error('Please enter equipment name');
        return;
      }

      if (editingEquipment) {
        await api.put(`/equipment/${editingEquipment.id}`, formData);
        toast.success('Equipment updated successfully');
      } else {
        await api.post('/equipment', formData);
        toast.success('Equipment created successfully');
      }

      setIsDialogOpen(false);
      fetchEquipment();
    } catch (error) {
      toast.error('Failed to save equipment', {
        description: error.response?.data?.detail || 'Please try again'
      });
    }
  };

  const handleDeleteEquipment = async () => {
    try {
      await api.delete(`/equipment/${equipmentToDelete.id}`);
      toast.success('Equipment deleted successfully');
      setDeleteDialogOpen(false);
      setEquipmentToDelete(null);
      fetchEquipment();
    } catch (error) {
      const errorMsg = typeof error.response?.data?.detail === 'string'
        ? error.response.data.detail
        : 'Cannot delete equipment that is allocated to events';
      toast.error('Failed to delete equipment', {
        description: errorMsg
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-[#10B981]',
      in_use: 'bg-[#F59E0B]',
      maintenance: 'bg-[#EF4444]'
    };
    return colors[status] || 'bg-slate-500';
  };

  const filteredEquipment = equipment.filter((equip) => {
    if (filters.status !== 'all' && equip.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        equip.name.toLowerCase().includes(searchLower) ||
        equip.code?.toLowerCase().includes(searchLower)
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
            <p className="text-slate-600">Loading equipment...</p>
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
            <h1 className="text-3xl font-bold text-slate-900 font-heading">Equipment</h1>
            <p className="text-slate-600 mt-1">Manage media equipment inventory</p>
          </div>
          <Button
            data-testid="create-equipment-button"
            className="bg-[#00A896] hover:bg-[#02C9B3] text-white"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Equipment
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
                    placeholder="Search equipment..."
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
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_use">In Use</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Grid */}
        {filteredEquipment.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Camera className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-lg mb-2">No equipment found</p>
                <p className="text-sm text-slate-500 mb-6">
                  {filters.search || filters.status !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Add your first equipment to get started'}
                </p>
                <Button
                  className="bg-[#00A896] hover:bg-[#02C9B3] text-white"
                  onClick={() => handleOpenDialog()}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Equipment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((equip) => (
              <Card
                key={equip.id}
                data-testid={`equipment-card-${equip.id}`}
                className="hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Camera className="w-8 h-8 text-[#00A896]" />
                    <Badge className={`${getStatusColor(equip.status)} text-white`}>
                      {equip.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{equip.name}</h3>
                  {equip.code && (
                    <p className="text-sm text-slate-600 mb-3">Code: {equip.code}</p>
                  )}
                  
                  {equip.notes && (
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{equip.notes}</p>
                  )}
                  
                  <div className="space-y-2">
                    <Button
                      data-testid={`edit-equipment-button-${equip.id}`}
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleOpenDialog(equip)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      data-testid={`delete-equipment-button-${equip.id}`}
                      size="sm"
                      variant="ghost"
                      className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => {
                        setEquipmentToDelete(equip);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
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
        title="Delete Equipment?"
        description={`Are you sure you want to delete "${equipmentToDelete?.name}"? This action will fail if the equipment is currently allocated to any event.`}
        onConfirm={handleDeleteEquipment}
        confirmText="Delete Equipment"
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-slate-900">
              {editingEquipment ? 'Edit Equipment' : 'Add Equipment'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                data-testid="equipment-name-input"
                placeholder="Sony FX30 Camera"
                className="mt-2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="code" className="text-sm font-medium text-slate-700">
                Code
              </Label>
              <Input
                id="code"
                data-testid="equipment-code-input"
                placeholder="CAM001"
                className="mt-2"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700">Status</Label>
              <Select
                data-testid="equipment-status-select"
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-slate-700">
                Notes
              </Label>
              <Textarea
                id="notes"
                data-testid="equipment-notes-textarea"
                placeholder="Any additional notes..."
                rows={3}
                className="mt-2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
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
              {editingEquipment ? 'Update' : 'Add'} Equipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Equipment;