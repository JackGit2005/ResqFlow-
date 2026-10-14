import React from 'react';
import {
  AlertOctagon,
  Truck,
  Home,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Flame,
  Droplets,
  Activity,
  HeartPulse,
  PlusCircle,
  MapPin,
  Cpu,
  Layers,
  LifeBuoy
} from 'lucide-react';
import { Incident, ResourceItem, Shelter, Hospital, UserRole } from '../../types';
import { TabKey } from '../layout/Sidebar';
import { BallariLiveWeatherCard } from '../weather/BallariLiveWeatherCard';

interface DashboardViewProps {
  userRole: UserRole;
  incidents: Incident[];
  resources: ResourceItem[];
  shelters: Shelter[];
  hospitals: Hospital[];
  onNavigate: (tab: TabKey) => void;
  onOpenReportModal: () => void;
  onSelectIncident: (incident: Incident) => void;
  lastDataChange: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userRole,
  incidents,
  resources,
  shelters,
  hospitals,
  onNavigate,
  onOpenReportModal,
  onSelectIncident,
  lastDataChange
}) => {
  // Metrics calculation
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter((i) => i.status === 'Open').length;
  const assignedIncidents = incidents.filter((i) => i.status === 'Assigned' || i.status === 'In Progress').length;
  const resolvedIncidents = incidents.filter((i) => i.status === 'Resolved').length;

  const criticalCount = incidents.filter((i) => i.severity === 'Critical').length;
  const highCount = incidents.filter((i) => i.severity === 'High').length;
  const mediumCount = incidents.filter((i) => i.severity === 'Medium').length;
  const lowCount = incidents.filter((i) => i.severity === 'Low').length;

  // Resources
  const totalResources = resources.length;
  const availableResources = resources.filter((r) => r.availableQuantity > 0).length;
  const totalResourceUnits = resources.reduce((acc, r) => acc + r.totalQuantity, 0);
  const availableResourceUnits = resources.reduce((acc, r) => acc + r.availableQuantity, 0);
  const resourceUtilizationRate =
    totalResourceUnits > 0
      ? Math.round(((totalResourceUnits - availableResourceUnits) / totalResourceUnits) * 100)
      : 0;

  // Shelters
  const totalShelterCapacity = shelters.reduce((acc, s) => acc + s.totalCapacity, 0);
  const currentShelterOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const shelterOccupancyRate =
    totalShelterCapacity > 0
      ? Math.round((currentShelterOccupancy / totalShelterCapacity) * 100)
      : 0;

  // Hospitals
  const availHospBeds = hospitals.reduce((acc, h) => acc + h.availableBeds, 0);
  const availIcuBeds = hospitals.reduce((acc, h) => acc + h.icuAvailable, 0);

  // Recent activity
  const allActivities = incidents
    .flatMap((inc) =>
      inc.timeline.map((t) => ({
        ...t,
        incidentId: inc.id,
        incidentTitle: inc.title,
        severity: inc.severity
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  const formatActivityTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const isCivilian = userRole === 'Civilian';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Ballari District Disaster Operations
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Emergency Operations Control Center</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Emergency Resource Coordination & Situational Hub
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Real-time situational awareness, multi-agency resource allocation, live meteorological risk indexing, and shelter logistics across Ballari district.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isCivilian ? (
            <button
              onClick={() => onNavigate('civilian-portal')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <LifeBuoy className="w-4 h-4" />
              Civilian Assistance Portal
            </button>
          ) : (
            <button
              onClick={() => onNavigate('allocation')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Cpu className="w-4 h-4" />
              Smart Allocate Resources
            </button>
          )}

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Report Incident
          </button>
        </div>
      </div>

      {/* 1. Live Weather Monitoring Component for Ballari */}
      <BallariLiveWeatherCard />

      {/* 2. Primary KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Incidents */}
        <div
          onClick={() => onNavigate(isCivilian ? 'public' : 'incidents')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Open Incidents</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{openIncidents}</span>
            <span className="text-xs text-red-600 font-medium">
              {criticalCount} Critical
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Total: {totalIncidents} logged</span>
            <span className="text-blue-600 group-hover:underline flex items-center gap-1">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Active Deployments */}
        <div
          onClick={() => onNavigate(isCivilian ? 'public' : 'incidents')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">In Field Missions</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{assignedIncidents}</span>
            <span className="text-xs text-emerald-600 font-medium">
              {resolvedIncidents} Resolved
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Active teams deployed</span>
            <span className="text-blue-600 group-hover:underline flex items-center gap-1">
              Track <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Resources Available */}
        <div
          onClick={() => onNavigate(isCivilian ? 'shelters' : 'resources')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Available Fleets</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{availableResources}</span>
            <span className="text-xs text-slate-500">
              of {totalResources} Categories
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>
              {totalResources === 0
                ? '0% deployed (0 in inventory)'
                : `${resourceUtilizationRate}% deployed`}
            </span>
            <span className="text-blue-600 group-hover:underline flex items-center gap-1">
              Inventory <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Shelter Occupancy */}
        <div
          onClick={() => onNavigate('shelters')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Shelter Beds</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{currentShelterOccupancy}</span>
            <span className="text-xs text-slate-500">
              / {totalShelterCapacity} Beds
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>
              {totalShelterCapacity === 0
                ? '0% Occupied (0 shelters registered)'
                : `${shelterOccupancyRate}% Occupied (${totalShelterCapacity - currentShelterOccupancy} vacant)`}
            </span>
            <span className="text-blue-600 group-hover:underline flex items-center gap-1">
              Shelters <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Breakdown & Tactical Actions & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Breakdown & Active Queue */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Incident Severity Distribution</h2>
                <p className="text-xs text-slate-500">Current triage categorization across Ballari sub-divisions</p>
              </div>
              <button
                onClick={() => onNavigate(isCivilian ? 'public' : 'incidents')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                All Incidents <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Severity bar progress */}
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex mb-4">
              <div
                style={{ width: `${(criticalCount / (totalIncidents || 1)) * 100}%` }}
                className="bg-red-600 h-full transition-all"
                title={`Critical: ${criticalCount}`}
              />
              <div
                style={{ width: `${(highCount / (totalIncidents || 1)) * 100}%` }}
                className="bg-orange-500 h-full transition-all"
                title={`High: ${highCount}`}
              />
              <div
                style={{ width: `${(mediumCount / (totalIncidents || 1)) * 100}%` }}
                className="bg-amber-400 h-full transition-all"
                title={`Medium: ${mediumCount}`}
              />
              <div
                style={{ width: `${(lowCount / (totalIncidents || 1)) * 100}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Low: ${lowCount}`}
              />
            </div>

            {/* Severity Legends */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <span className="text-slate-600">Critical</span>
                <span className="font-mono font-bold text-slate-900 ml-auto">{criticalCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span className="text-slate-600">High</span>
                <span className="font-mono font-bold text-slate-900 ml-auto">{highCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="text-slate-600">Medium</span>
                <span className="font-mono font-bold text-slate-900 ml-auto">{mediumCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">Low</span>
                <span className="font-mono font-bold text-slate-900 ml-auto">{lowCount}</span>
              </div>
            </div>

            {/* Top Incidents list */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Priority Queue
              </span>
              {incidents.filter((i) => i.status !== 'Resolved').length === 0 ? (
                <div className="p-5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-800">No Active Incidents Logged</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    The district operational registry has zero active emergencies. New public or dispatch reports will appear here instantly upon persistence.
                  </p>
                </div>
              ) : (
                incidents
                  .filter((i) => i.status !== 'Resolved')
                  .slice(0, 3)
                  .map((incident) => (
                    <div
                      key={incident.id}
                      onClick={() => onSelectIncident(incident)}
                      className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-between gap-3 cursor-pointer transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs mb-1">
                          <span
                            className={`font-semibold ${
                              incident.severity === 'Critical'
                                ? 'text-red-600'
                                : incident.severity === 'High'
                                ? 'text-orange-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {incident.severity}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500 font-mono text-[11px]">{incident.id}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-600 truncate">{incident.area}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {incident.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-[11px] text-slate-500 font-mono">
                          {incident.assignedResourceIds.length} units
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                          {incident.status}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Quick Action Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigate('map')}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all text-left"
            >
              <MapPin className="w-5 h-5 text-blue-600 mb-2" />
              <div className="font-semibold text-xs text-slate-900">Tactical Map</div>
              <div className="text-[11px] text-slate-500">Ballari spatial view</div>
            </button>

            <button
              onClick={() => onNavigate(isCivilian ? 'civilian-portal' : 'allocation')}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all text-left"
            >
              {isCivilian ? (
                <>
                  <LifeBuoy className="w-5 h-5 text-blue-600 mb-2" />
                  <div className="font-semibold text-xs text-slate-900">Aid Requests</div>
                  <div className="text-[11px] text-slate-500">Track assistance</div>
                </>
              ) : (
                <>
                  <Cpu className="w-5 h-5 text-blue-600 mb-2" />
                  <div className="font-semibold text-xs text-slate-900">Allocation Engine</div>
                  <div className="text-[11px] text-slate-500">Heuristic matching</div>
                </>
              )}
            </button>

            <button
              onClick={() => onNavigate('shelters')}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all text-left"
            >
              <Home className="w-5 h-5 text-emerald-600 mb-2" />
              <div className="font-semibold text-xs text-slate-900">Relief Shelters</div>
              <div className="text-[11px] text-slate-500">Bed capacity monitor</div>
            </button>

            <button
              onClick={() => onNavigate(isCivilian ? 'public' : 'simulation')}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-xs transition-all text-left"
            >
              <Layers className="w-5 h-5 text-purple-600 mb-2" />
              <div className="font-semibold text-xs text-slate-900">
                {isCivilian ? 'Community Feed' : 'Simulations'}
              </div>
              <div className="text-[11px] text-slate-500">
                {isCivilian ? 'Public situational view' : 'Stress test scenarios'}
              </div>
            </button>
          </div>

          {/* Hospital Readiness Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">Ballari Hospital Trauma & ICU Readiness</h3>
              </div>
              <span className="text-xs text-slate-500">
                <strong className="text-slate-800">{availHospBeds}</strong> beds open · <strong className="text-slate-800">{availIcuBeds}</strong> ICU
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hospitals.map((hosp) => (
                <div key={hosp.id} className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/80 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-900">{hosp.name}</div>
                      <div className="text-slate-500 text-[11px]">{hosp.address}</div>
                    </div>
                    {hosp.hasTraumaCenter && (
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 shrink-0">
                        Trauma Level 1
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                    <span>
                      Beds: <strong className="text-slate-900">{hosp.availableBeds}</strong> / {hosp.emergencyBeds}
                    </span>
                    <span>
                      ICU: <strong className="text-blue-700">{hosp.icuAvailable}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Activity Log & Resources */}
        <div className="space-y-6">
          {/* Operations Activity Log */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Recent Operations Log
                </h2>
                <p className="text-xs text-slate-500">Real-time audit trail of dispatches & actions</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {allActivities.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">No activity logged yet.</div>
              ) : (
                allActivities.map((act, idx) => (
                  <div key={idx} className="relative pl-4 pb-3 border-l border-slate-200 last:border-l-0">
                    <span className="absolute -left-1 top-1 w-2 h-2 rounded-full bg-blue-600" />
                    <div className="text-[11px] text-slate-400 flex items-center justify-between mb-0.5">
                      <span className="font-mono font-semibold text-blue-700">{act.incidentId}</span>
                      <span>{formatActivityTime(act.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">{act.action}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">By: {act.user}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Resource Fleets */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Critical Resource Fleets</h3>
              {!isCivilian && (
                <button
                  onClick={() => onNavigate('resources')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs">
              {resources.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
                  <Truck className="w-4 h-4 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No Fleet Inventory Registered</p>
                  <p className="text-[11px] text-slate-400">Inventory assets will display once entered into the database.</p>
                </div>
              ) : (
                resources.slice(0, 5).map((res) => {
                  const percent = Math.round((res.availableQuantity / res.totalQuantity) * 100);
                  return (
                    <div key={res.id} className="space-y-1">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium text-slate-800 truncate max-w-[180px]">{res.name}</span>
                        <span className="font-mono text-slate-500 text-[11px]">
                          {res.availableQuantity} / {res.totalQuantity} {res.unit}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className={`h-full rounded-full transition-all ${
                            percent > 50
                              ? 'bg-emerald-500'
                              : percent > 20
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
