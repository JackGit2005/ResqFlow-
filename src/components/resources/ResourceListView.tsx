import React, { useState, useMemo } from 'react';
import {
  Truck,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  MapPin,
  Phone,
  Shield,
  Layers,
  Wrench,
  MinusCircle
} from 'lucide-react';
import { ResourceCategory, ResourceItem, UserRole } from '../../types';

interface ResourceListViewProps {
  userRole?: UserRole;
  resources: ResourceItem[];
  onOpenNewModal: () => void;
  onUpdateQuantity: (resourceId: string, delta: number) => void;
  onUpdateStatus: (resourceId: string, status: ResourceItem['status']) => void;
}

export const ResourceListView: React.FC<ResourceListViewProps> = ({
  userRole,
  resources,
  onOpenNewModal,
  onUpdateQuantity,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const isCivilian = userRole === 'Civilian';

  const categories: (ResourceCategory | 'all')[] = [
    'all',
    'Ambulance',
    'Rescue Team',
    'Volunteer Group',
    'Medical Supplies',
    'Food & Ration',
    'Potable Water',
    'Rescue Equipment'
  ];

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        res.name.toLowerCase().includes(q) ||
        res.baseLocation.toLowerCase().includes(q) ||
        res.typeDetails.toLowerCase().includes(q) ||
        res.id.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || res.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || res.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [resources, searchQuery, selectedCategory, selectedStatus]);

  // Total stats
  const totalUnits = resources.reduce((acc, r) => acc + r.totalQuantity, 0);
  const availableUnits = resources.reduce((acc, r) => acc + r.availableQuantity, 0);
  const deployedUnits = totalUnits - availableUnits;
  const utilizationRate = Math.round((deployedUnits / (totalUnits || 1)) * 100);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Emergency Resource Management & Fleets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ambulances, rescue teams, water tankers, medical packs, and heavy de-watering pumps in Ballari
          </p>
        </div>

        {!isCivilian && (
          <button
            onClick={onOpenNewModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Register Resource
          </button>
        )}
      </div>

      {/* Utilization & Stock Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Total Tracked Units</span>
          <p className="text-2xl font-mono font-bold text-slate-900 mt-1">{totalUnits}</p>
          <span className="text-[11px] text-slate-400">{resources.length} fleet categories</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Available In Reserve</span>
          <p className="text-2xl font-mono font-bold text-emerald-600 mt-1">{availableUnits}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Ready to dispatch</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Deployed In Field</span>
          <p className="text-2xl font-mono font-bold text-amber-600 mt-1">{deployedUnits}</p>
          <span className="text-[11px] text-amber-600 font-medium">Active missions</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Resource Utilization</span>
          <p className="text-2xl font-mono font-bold text-blue-600 mt-1">{utilizationRate}%</p>
          <div className="mt-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div style={{ width: `${utilizationRate}%` }} className="h-full bg-blue-600 rounded-full" />
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources by name, depot base, or equipment..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="sm:w-52">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Operational Statuses</option>
              <option value="Ready">Ready</option>
              <option value="Deployed">Deployed</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Exhausted">Exhausted</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 text-[11px] mr-1 shrink-0 font-medium">Category:</span>
          {categories.map((cat) => {
            const count =
              cat === 'all'
                ? resources.length
                : resources.filter((r) => r.category === cat).length;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-300 font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {cat === 'all' ? 'All' : cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 md:col-span-2">
            <Truck className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-semibold text-slate-800 text-sm">No resource inventory records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Resource inventory starts at zero operational records. Authorized coordinators can register initial ambulances, rescue squads, and rations.
            </p>
          </div>
        ) : (
          filteredResources.map((res) => {
            const availRatio = res.availableQuantity / (res.totalQuantity || 1);
            const percent = Math.round(availRatio * 100);
            const isExhausted = res.availableQuantity === 0;

            return (
            <div
              key={res.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-xs flex flex-col justify-between gap-4 transition-all"
            >
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono text-blue-700 font-semibold">{res.id}</span>
                      <span>·</span>
                      <span className="text-slate-700">{res.category}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">{res.name}</h3>
                  </div>

                  {/* Status Tag / Dropdown */}
                  {!isCivilian ? (
                    <select
                      value={res.status}
                      onChange={(e) => onUpdateStatus(res.id, e.target.value as ResourceItem['status'])}
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded border focus:outline-none ${
                        res.status === 'Ready'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : res.status === 'Deployed'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      <option value="Ready">Ready</option>
                      <option value="Deployed">Deployed</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Exhausted">Exhausted</option>
                    </select>
                  ) : (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        res.status === 'Ready'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {res.status}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600">{res.typeDetails}</p>

                {/* Location & Contact */}
                <div className="space-y-1 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{res.baseLocation}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{res.contactPerson} ({res.contactPhone})</span>
                  </div>
                </div>

                {/* Availability Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Available Capacity:</span>
                    <span className="font-mono text-slate-900 font-bold">
                      {res.availableQuantity} / {res.totalQuantity} {res.unit} ({percent}%)
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
              </div>

              {/* Bottom Quick Controls (Coordinators & Responders only) */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 text-[11px]">
                  {res.assignedIncidentIds.length} active assignments
                </span>

                {!isCivilian ? (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={isExhausted}
                      onClick={() => onUpdateQuantity(res.id, -1)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 border border-slate-200 transition-colors"
                      title="Deploy 1 unit to emergency field"
                    >
                      <MinusCircle className="w-3 h-3 text-red-500" />
                      <span>Deploy 1</span>
                    </button>

                    <button
                      disabled={res.availableQuantity >= res.totalQuantity}
                      onClick={() => onUpdateQuantity(res.id, 1)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 border border-slate-200 transition-colors"
                      title="Return / Release 1 unit back to base"
                    >
                      <RotateCcw className="w-3 h-3 text-emerald-600" />
                      <span>Release 1</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400">View only</span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
  );
};
