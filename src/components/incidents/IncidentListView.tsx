import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  AlertOctagon,
  Clock,
  MapPin,
  Truck,
  Cpu,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera
} from 'lucide-react';
import { Incident, IncidentSeverity, IncidentStatus, IncidentType, ResourceItem, UserRole } from '../../types';

interface IncidentListViewProps {
  userRole?: UserRole;
  incidents: Incident[];
  resources: ResourceItem[];
  onSelectIncident: (incident: Incident) => void;
  onOpenNewModal: () => void;
  onOpenAllocation: (incident: Incident) => void;
  onQuickResolve: (incidentId: string) => void;
}

export const IncidentListView: React.FC<IncidentListViewProps> = ({
  userRole,
  incidents,
  resources,
  onSelectIncident,
  onOpenNewModal,
  onOpenAllocation,
  onQuickResolve
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const isCivilian = userRole === 'Civilian';

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        inc.title.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q) ||
        inc.locationName.toLowerCase().includes(q) ||
        inc.area.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q);

      const matchesSeverity = selectedSeverity === 'all' || inc.severity === selectedSeverity;
      const matchesStatus = selectedStatus === 'all' || inc.status === selectedStatus;
      const matchesType = selectedType === 'all' || inc.incidentType === selectedType;

      return matchesSearch && matchesSeverity && matchesStatus && matchesType;
    });
  }, [incidents, searchQuery, selectedSeverity, selectedStatus, selectedType]);

  const severities: (IncidentSeverity | 'all')[] = ['all', 'Critical', 'High', 'Medium', 'Low'];
  const statuses: (IncidentStatus | 'all')[] = ['all', 'Open', 'Assigned', 'In Progress', 'Resolved'];

  const getResourceNames = (resIds: string[]) => {
    return resIds
      .map((id) => resources.find((r) => r.id === id)?.name || id)
      .join(', ');
  };

  const getSeverityBadge = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'Critical':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'High':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Medium':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Low':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-600" />
            Incident Coordination & Triage Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active emergencies, distress signals, and multi-agency response queue across Ballari
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Log New Incident
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        {/* Search input & Category dropdown */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, keyword, Cowl Bazaar, Millerpet, Siruguppa..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="sm:w-60">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Incident Categories</option>
              <option value="Flood / Waterlogging">Flood / Waterlogging</option>
              <option value="Structural Collapse">Structural Collapse</option>
              <option value="Fire Emergency">Fire Emergency</option>
              <option value="Road Accident">Road Accident</option>
              <option value="Chemical / Industrial Hazard">Chemical Hazard</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Power Grid Failure">Power Grid Failure</option>
            </select>
          </div>
        </div>

        {/* Severity & Status interactive buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Severity selector buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 text-[11px] font-medium mr-1">Severity:</span>
            {severities.map((sev) => {
              const count =
                sev === 'all'
                  ? incidents.length
                  : incidents.filter((i) => i.severity === sev).length;
              const isActive = selectedSeverity === sev;
              return (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-300 font-semibold'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {sev === 'all' ? 'All' : sev} ({count})
                </button>
              );
            })}
          </div>

          {/* Status selector buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 text-[11px] font-medium mr-1">Status:</span>
            {statuses.map((st) => {
              const count =
                st === 'all'
                  ? incidents.length
                  : incidents.filter((i) => i.status === st).length;
              const isActive = selectedStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-300 font-semibold'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All' : st} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Incidents Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-900">{filteredIncidents.length}</strong> of{' '}
          {incidents.length} recorded incidents
        </span>
        {(selectedSeverity !== 'all' || selectedStatus !== 'all' || selectedType !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedSeverity('all');
              setSelectedStatus('all');
              setSelectedType('all');
              setSearchQuery('');
            }}
            className="text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Incidents Card List */}
      {filteredIncidents.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-semibold text-slate-800 text-sm">No matching incidents found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, severity tags, or status filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((incident) => {
            const hasAssigned = incident.assignedResourceIds.length > 0;
            return (
              <div
                key={incident.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-xs transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                      <span className="font-mono text-blue-700 font-semibold">{incident.id}</span>
                      <span>·</span>
                      <span className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${getSeverityBadge(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span>·</span>
                      <span className="text-slate-700">{incident.incidentType}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        {new Date(incident.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {incident.photos && incident.photos.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            <Camera className="w-3 h-3 text-slate-500" />
                            {incident.photos.length} {incident.photos.length === 1 ? 'photo' : 'photos'}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Headline */}
                    <h3
                      onClick={() => onSelectIncident(incident)}
                      className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer truncate"
                    >
                      {incident.title}
                    </h3>

                    {/* Description excerpt */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {incident.description}
                    </p>

                    {/* Location & assigned units */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-0.5">
                      <span className="flex items-center gap-1 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        {incident.locationName} ({incident.area})
                      </span>
                      {hasAssigned && (
                        <span className="flex items-center gap-1 text-blue-700 font-medium">
                          <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          {incident.assignedResourceIds.length} units: {getResourceNames(incident.assignedResourceIds)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${
                        incident.status === 'Open'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : incident.status === 'Assigned'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : incident.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {incident.status}
                    </span>

                    {!isCivilian && (
                      <button
                        onClick={() => onOpenAllocation(incident)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                        title="Smart Resource Allocation"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Allocate</span>
                      </button>
                    )}

                    <button
                      onClick={() => onSelectIncident(incident)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
