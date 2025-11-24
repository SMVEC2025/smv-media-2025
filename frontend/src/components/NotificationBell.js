import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Bell } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { formatDate } from '../utils/api';
import { toast } from 'sonner';

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.slice(0, 10)); // Latest 10
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleNotificationClick = async (notif) => {
    // Mark as read
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }
    
    // Navigate to related page
    setIsOpen(false);
    
    if (notif.type === 'task_assigned' || notif.type === 'task_completed') {
      // Navigate to My Tasks for team members, or to event details for admin/media_head
      if (user?.role === 'team_member') {
        navigate('/my-tasks');
      } else if (notif.related_id) {
        // Try to get task and navigate to event
        try {
          const taskRes = await api.get(`/tasks/${notif.related_id}`);
          if (taskRes.data?.event_id) {
            navigate(`/events/${taskRes.data.event_id}`);
          }
        } catch {
          navigate('/events');
        }
      }
    } else if (notif.type === 'event_status_changed' || notif.type === 'event_created') {
      if (notif.related_id) {
        navigate(`/events/${notif.related_id}`);
      } else {
        navigate('/events');
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      toast.success('All notifications marked as read');
      fetchNotifications();
      fetchUnreadCount();
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type) => {
    // Return different colors based on notification type
    const colors = {
      task_assigned: 'bg-[#00A896]',
      task_completed: 'bg-[#10B981]',
      event_status_changed: 'bg-[#3B82F6]',
      event_created: 'bg-[#F59E0B]'
    };
    return colors[type] || 'bg-slate-500';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="notification-bell"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-[#EF4444] text-white text-xs"
              data-testid="notification-count"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[500px] overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMarkAllRead}
              className="text-[#00A896] hover:text-[#02C9B3] text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                data-testid={`notification-${notif.id}`}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                  !notif.is_read ? 'bg-[#00A896]/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getNotificationIcon(notif.type)}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-medium ${!notif.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-[#00A896]"></div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{notif.message}</p>
                    <p className="text-xs text-slate-500">{formatDate(notif.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
