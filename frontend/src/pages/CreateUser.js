import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import api from '../utils/api';
import { ShieldPlus, UserPlus } from 'lucide-react';

const formatError = (detail) => {
  if (Array.isArray(detail)) return detail.map((item) => item.msg || JSON.stringify(item)).join(' | ');
  if (typeof detail === 'string') return detail;
  return 'Please try again';
};

const CreateUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'team_member',
    specialization: 'photo'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        specialization: formData.role === 'team_member' ? formData.specialization : null
      };
      await api.post('/auth/register', payload);
      toast.success('User created successfully');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'team_member',
        specialization: 'photo'
      });
    } catch (error) {
      toast.error('Failed to create user', {
        description: formatError(error.response?.data?.detail)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex items-start justify-between flex-col gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#37429c] font-semibold mb-2">User access</p>
            <h1 className="text-3xl font-bold text-slate-900 font-heading">Create User</h1>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Add a new teammate and choose whether they join as a team member or media head. Passwords are set once and can
              be updated later from the Change Password screen.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#37429c] to-[#b49749] text-white flex items-center justify-center">
              <ShieldPlus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Restricted to Admins</p>
              <p className="font-semibold text-slate-900">Only admins can register users</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-slate-200 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">User details</CardTitle>
              <CardDescription>Fill in the basics to provision a new login.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team_member">Team Member</SelectItem>
                        <SelectItem value="media_head">Media Head</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.role === 'team_member' && (
                  <div className="space-y-2">
                    <Label>Specialization</Label>
                    <Select
                      value={formData.specialization}
                      onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                    >
                      <SelectTrigger>
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

                <div className="pt-2 flex gap-3">
                  <Button
                    type="submit"
                    className="bg-[#37429c] hover:bg-[#2f387f] text-white"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create User'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setFormData({
                        name: '',
                        email: '',
                        password: '',
                        role: 'team_member',
                        specialization: 'photo'
                      })
                    }
                    disabled={loading}
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#37429c]" />
                  Quick checklist
                </CardTitle>
                <CardDescription>Keep these in mind while onboarding.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-2">
                  <Badge className="bg-[#37429c] text-white">1</Badge>
                  <p>Use institutional emails so notifications reach the right inbox.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-[#b49749] text-white">2</Badge>
                  <p>Pick <strong>Media Head</strong> for people managing events and allocating tasks.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline">3</Badge>
                  <p>Team members can specialize to speed up task assignment later.</p>
                </div>
              </CardContent>
            </Card>

           
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateUser;
