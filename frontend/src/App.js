import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyTasks from './pages/MyTasks';
import PublicDeliveries from './pages/PublicDeliveries';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Institutions from './pages/Institutions';
import Equipment from './pages/Equipment';
import Users from './pages/Users';
import CalendarView from './pages/CalendarView';
import MyCalendar from './pages/MyCalendar';
import Employees from './pages/Employees';
import Tasks from './pages/Tasks';
import ChangePassword from './pages/ChangePassword';
import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#37429c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/deliveries" element={<PublicDeliveries />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin', 'media_head']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/events"
        element={
          <ProtectedRoute allowedRoles={['admin', 'media_head']}>
            <Events />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/events/:eventId"
        element={
          <ProtectedRoute allowedRoles={['admin', 'media_head']}>
            <EventDetails />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/calendar"
        element={
          <ProtectedRoute allowedRoles={['admin', 'media_head']}>
            <CalendarView />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/institutions"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Institutions />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/equipment"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Equipment />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Users />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/my-tasks"
        element={
          <ProtectedRoute allowedRoles={['team_member']}>
            <MyTasks />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/my-calendar"
        element={
          <ProtectedRoute allowedRoles={['team_member']}>
            <MyCalendar />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={['admin', 'media_head']}>
            <Employees />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/tasks"
        element={
          <ProtectedRoute allowedRoles={['admin', 'media_head']}>
            <Tasks />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/change-password"
        element={
          <ProtectedRoute allowedRoles={['admin', 'media_head', 'team_member']}>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/"
        element={
          user ? (
            user.role === 'team_member' ? (
              <Navigate to="/my-tasks" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-slate-900 mb-4">403</h1>
              <p className="text-slate-600 mb-6">You don't have permission to access this page.</p>
              <a href="/" className="text-[#37429c] hover:underline">Go to Home</a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'white',
                color: '#1E293B',
                border: '1px solid #CBD5E1',
                borderRadius: '0.75rem',
                padding: '1rem',
              },
              className: 'shadow-lg',
            }}
          />
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
