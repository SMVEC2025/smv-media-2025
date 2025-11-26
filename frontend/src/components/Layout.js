import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header - Mobile */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 lg:hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              data-testid="mobile-menu-button"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold text-slate-900 font-heading">MediaHub</h1>
            <Badge className="bg-[#37429c] text-white text-xs">
              {user?.role?.split('_')[0]}
            </Badge>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
