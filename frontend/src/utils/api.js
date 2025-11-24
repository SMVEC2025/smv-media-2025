import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Helper functions
export const getStatusColor = (status) => {
  const colors = {
    event_created: 'bg-[#94A3B8]',
    event_scheduled: 'bg-[#3B82F6]',
    shoot_completed: 'bg-[#F59E0B]',
    delivery_in_progress: 'bg-[#8B5CF6]',
    closed: 'bg-[#10B981]',
    assigned: 'bg-[#94A3B8]',
    in_progress: 'bg-[#F59E0B]',
    completed: 'bg-[#10B981]'
  };
  return colors[status] || 'bg-slate-500'};

export const getPriorityColor = (priority) => {
  const colors = {
    normal: 'bg-[#64748B]',
    high: 'bg-[#F59E0B]',
    vip: 'bg-[#EF4444]'
  };
  return colors[priority] || 'bg-slate-500';
};

export const getTaskTypeColor = (type) => {
  const colors = {
    photo: 'bg-[#06B6D4]',
    video: 'bg-[#8B5CF6]',
    editing: 'bg-[#EC4899]',
    other: 'bg-slate-500'
  };
  return colors[type] || 'bg-slate-500';
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
