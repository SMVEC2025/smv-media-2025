import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import NotificationBell from './NotificationBell';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  Camera, 
  Users, 
  Building2,
  Lock,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isMediaHead } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    // Common items for admin and media_head
    ...(isMediaHead ? [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', testId: 'nav-dashboard' },
      { name: 'Tasks', icon: CheckSquare, path: '/tasks', testId: 'nav-tasks' },
      { name: 'Events', icon: Calendar, path: '/events', testId: 'nav-events' },
      { name: 'Calendar', icon: Calendar, path: '/calendar', testId: 'nav-calendar' },
      { name: 'Employees', icon: Users, path: '/employees', testId: 'nav-employees' },
    ] : []),
    // Team member items
    ...(user?.role === 'team_member' ? [
      { name: 'My Tasks', icon: CheckSquare, path: '/my-tasks', testId: 'nav-my-tasks' },
      { name: 'My Calendar', icon: Calendar, path: '/my-calendar', testId: 'nav-my-calendar' },
    ] : []),
    // Admin only items
    ...(isAdmin ? [
      { name: 'Equipment', icon: Camera, path: '/equipment', testId: 'nav-equipment' },
      { name: 'Users', icon: Users, path: '/users', testId: 'nav-users' },
      { name: 'Institutions', icon: Building2, path: '/institutions', testId: 'nav-institutions' },
    ] : []),
    // All authenticated users
    { name: 'Change Password', icon: Lock, path: '/change-password', testId: 'nav-change-password' }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-50 transition-transform duration-300 ease-in-out",
          "w-64 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-heading">MediaHub</h1>
            <p className="text-xs text-slate-500 mt-1">{user?.name}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#37429c] text-white flex items-center justify-center font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <NotificationBell />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-0">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <button
                    data-testid={item.testId}
                    onClick={() => {
                      navigate(item.path);
                      onClose();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3  transition-all duration-200",
                      "text-left font-medium",
                      isActive
                        ? "bg-[#37429c] text-white shadow-md"
                        : "text-slate-700 hover:bg-slate-100 hover:text-[#37429c]"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <Button
            data-testid="sidebar-logout-button"
            variant="ghost"
            className="w-full justify-start text-slate-700 hover:bg-transparent hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
