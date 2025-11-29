import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { formatDate, getPriorityColor, getStatusColor, getTaskTypeColor } from "../utils/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { CalendarDays, ExternalLink, Filter } from "lucide-react";

const PublicEvents = () => {
  const [events, setEvents] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveriesModalOpen, setDeliveriesModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);

  const [filters, setFilters] = useState({
    institution: "all",
    year: "all",
    month: "all",
    startDate: "",
    endDate: "",
    sortOrder: "desc",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, instRes, deliveriesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/events/public`),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/institutions`),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/deliveries/public`),
        ]);

        setEvents(eventsRes.data);
        setInstitutions(instRes.data);
        setDeliveries(deliveriesRes.data);
      } catch (error) {
        console.error("Failed to load public events", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const deliveriesByEvent = useMemo(() => {
    return deliveries.reduce((acc, item) => {
      if (!item.event_id) return acc;
      if (!acc[item.event_id]) acc[item.event_id] = [];
      acc[item.event_id].push(item);
      return acc;
    }, {});
  }, [deliveries]);

  const resetFilters = () => {
    setFilters({
      institution: "all",
      year: "all",
      month: "all",
      startDate: "",
      endDate: "",
      sortOrder: "desc",
    });
  };

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        const start = new Date(event.event_date_start);

        if (filters.institution !== "all" && event.institution_id !== filters.institution) return false;
        if (filters.year !== "all" && start.getFullYear().toString() !== filters.year) return false;
        if (filters.month !== "all" && (start.getMonth() + 1).toString() !== filters.month) return false;
        if (filters.startDate && start < new Date(filters.startDate)) return false;
        if (filters.endDate && start > new Date(filters.endDate)) return false;
        return true;
      })
      .sort((a, b) => {
        const aDate = new Date(a.event_date_start).getTime();
        const bDate = new Date(b.event_date_start).getTime();
        return filters.sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      });
  }, [events, filters]);

  const years = useMemo(() => {
    const set = new Set(events.map((e) => new Date(e.event_date_start).getFullYear().toString()));
    return Array.from(set).sort((a, b) => b - a);
  }, [events]);

  const openDeliveriesModal = (event) => {
    setSelectedEvent(event);
    setSelectedDeliveries(deliveriesByEvent[event.id] || []);
    setDeliveriesModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#37429c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <header className="bg-[#37429c] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-3">Events</p>
          <h1 className="text-4xl font-bold text-[white] font-heading">Explore our upcoming and recent events</h1>
          <p className="mt-3 text-white/80 text-lg max-w-3xl">
            Browse every event we are covering, filter by institution and dates, and peek into the deliveries as they go live.
          </p>
        </div>
      </header>

      {/* Filters */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 text-slate-700 mb-4">
            <Filter className="w-4 h-4" />
            <p className="text-sm">Refine the list with the controls below</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              value={filters.institution}
              onValueChange={(value) => setFilters({ ...filters, institution: value })}
            >
              <SelectTrigger className="bg-slate-50">
                <SelectValue placeholder="Institution" />
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

            <Select value={filters.year} onValueChange={(value) => setFilters({ ...filters, year: value })}>
              <SelectTrigger className="bg-slate-50">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.month} onValueChange={(value) => setFilters({ ...filters, month: value })}>
              <SelectTrigger className="bg-slate-50">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {new Date(0, month - 1).toLocaleString("default", { month: "short" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.sortOrder}
              onValueChange={(value) => setFilters({ ...filters, sortOrder: value })}
            >
              <SelectTrigger className="bg-slate-50">
                <SelectValue placeholder="Sort by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="flex gap-2">
              <input
                type="date"
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-[#37429c] focus:outline-none"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
              <input
                type="date"
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-[#37429c] focus:outline-none"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={resetFilters} className="text-slate-700 hover:text-[#37429c]">
                Clear filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Event list */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <CalendarDays className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-lg text-slate-700 font-semibold">No events match these filters</p>
            <p className="text-slate-500 mt-1">Try clearing or adjusting the date and institution filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((event) => {
              const eventDeliveries = deliveriesByEvent[event.id] || [];

              return (
                <Card
                  key={event.id}
                  className="border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-200"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-xl text-slate-900">{event.title}</CardTitle>
                      <Badge className={`${getPriorityColor(event.priority)} text-white`}>
                        {event.priority}
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-600">
                      {event.institution_name || "Institution TBA"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center flex-wrap gap-3 text-sm text-slate-600">
                      <Badge variant="outline" className={`${getStatusColor(event.status)} text-white border-0`}>
                        {event.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="border-slate-200">
                        {formatDate(event.event_date_start)}
                      </Badge>
                      {event.venue && (
                        <Badge variant="outline" className="border-slate-200">
                          {event.venue}
                        </Badge>
                      )}
                      {event.department && (
                        <Badge variant="outline" className="border-slate-200 capitalize">
                          {event.department}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-slate-500">
                        Deliveries: {eventDeliveries.length > 0 ? eventDeliveries.length : "None yet"}
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => openDeliveriesModal(event)}
                        className="text-[#37429c] hover:text-[#2f387f]"
                      >
                        View deliveries
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={deliveriesModalOpen} onOpenChange={setDeliveriesModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-900">
              {selectedEvent?.title || "Deliveries"}
            </DialogTitle>
            <p className="text-sm text-slate-600">
              {selectedEvent?.institution_name || "Institution"} ·{" "}
              {selectedEvent ? formatDate(selectedEvent.event_date_start) : ""}
            </p>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {selectedDeliveries.length === 0 ? (
              <p className="text-sm text-slate-500">Deliveries will appear here once completed.</p>
            ) : (
              selectedDeliveries.map((item) => (
                <Card key={item.id} className="border-slate-200 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.event_title}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                          <Badge
                            variant="outline"
                            className={`${getTaskTypeColor(item.task_type)} text-white border-0`}
                          >
                            {item.task_type}
                          </Badge>
                          <span>{formatDate(item.event_date)}</span>
                          <span className="text-slate-500">{item.institution_name}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-[#37429c] text-[#37429c] hover:bg-[#37429c] hover:text-white"
                        onClick={() => window.open(item.deliverable_link, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicEvents;
