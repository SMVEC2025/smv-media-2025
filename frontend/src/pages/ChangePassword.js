import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import api from '../utils/api';

const formatError = (detail) => {
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || JSON.stringify(item)).join(' | ');
  }
  if (typeof detail === 'string') return detail;
  return 'Please try again';
};

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      });
      toast.success('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to update password', {
        description: formatError(error.response?.data?.detail)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password by confirming your current one.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="old-password">Current Password</Label>
                <Input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="bg-[#37429c] hover:bg-[#2f387f] text-white" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ChangePassword;
