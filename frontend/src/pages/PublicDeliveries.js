import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Eye, ExternalLink } from 'lucide-react';
import { formatDate, getTaskTypeColor, getPriorityColor } from '../utils/api';

const PublicDeliveries = () => {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deliveriesRes, institutionsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/deliveries/public`),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/institutions`)
      ]);
      setDeliverables(deliveriesRes.data);
      setInstitutions(institutionsRes.data);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliverables = deliverables.filter((item) => {
    if (selectedInstitution !== 'all') {
      const inst = institutions.find(i => i.name === item.institution_name);
      if (!inst || inst.id !== selectedInstitution) return false;
    }
    if (selectedType !== 'all' && item.task_type !== selectedType) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#37429c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 font-heading">Our Work</h1>
              <p className="text-slate-600 mt-2 text-lg">
                Showcasing our media team's delivered projects
              </p>
            </div>
            <button
              onClick={() => (window.location.href = '/public-events')}
              className="inline-flex items-center justify-center rounded-lg bg-[#37429c] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2f387f] transition-colors"
            >
              Browse Events
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <Select
            data-testid="filter-institution"
            value={selectedInstitution}
            onValueChange={setSelectedInstitution}
          >
            <SelectTrigger className="w-64 bg-white">
              <SelectValue placeholder="All Institutions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Institutions</SelectItem>
              {institutions.map((inst) => (
                <SelectItem key={inst.id} value={inst.id}>
                  {inst.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            data-testid="filter-type"
            value={selectedType}
            onValueChange={setSelectedType}
          >
            <SelectTrigger className="w-64 bg-white">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="photo">Photography</SelectItem>
              <SelectItem value="video">Videography</SelectItem>
              <SelectItem value="editing">Editing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gallery Grid */}
        {filteredDeliverables.length === 0 ? (
          <div className="text-center py-20">
            <Eye className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No deliverables found</p>
            <p className="text-slate-500 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeliverables.map((item) => (
              <Card
                key={item.id}
                data-testid={`deliverable-${item.id}`}
                className="group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                onClick={() => window.open(item.deliverable_link, '_blank')}
              >
                <div className="aspect-video bg-gradient-to-br from-[#37429c]/20 to-[#FF6F61]/20 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-slate-200 group-hover:bg-slate-300 transition-colors duration-300"></div>
                  <div className="relative z-10 text-center">
                    <ExternalLink className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-700 font-medium">Click to view</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-1">{item.event_title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{item.institution_name}</p>
                  <div className="flex items-center flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={`${getTaskTypeColor(item.task_type)} text-white border-0`}
                    >
                      {item.task_type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`${getPriorityColor(item.priority)} text-white border-0`}
                    >
                      {item.priority}
                    </Badge>
                    <span className="text-xs text-slate-500">{formatDate(item.event_date)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDeliveries;
