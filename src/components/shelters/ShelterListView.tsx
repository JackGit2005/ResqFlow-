import React, { useState, useMemo } from 'react';
import {
  Home,
  PlusCircle,
  Search,
  CheckCircle2,
  Users,
  MapPin,
  Phone,
  Bed,
  Utensils,
  HeartPulse,
  Droplet,
  Zap,
  Smile,
  AlertTriangle,
  Minus,
  Plus
} from 'lucide-react';
import { Shelter, UserRole } from '../../types';

interface ShelterListViewProps {
  userRole?: UserRole;
  shelters: Shelter[];
  onOpenNewModal: () => void;
  onUpdateOccupancy: (shelterId: string, newOccupancy: number) => void;
  onViewOnMap: (lat: number, lng: number) => void;
}

export const ShelterListView: React.FC<ShelterListViewProps> = ({
  userRole,
  shelters,
  onOpenNewModal,
  onUpdateOccupancy,
  onViewOnMap
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const isCivilian = userRole === 'Civilian';

  const totalCapacity = shelters.reduce((acc, s) => acc + s.totalCapacity, 0);
  const currentOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const availableBeds = totalCapacity - currentOccupancy;
  const occupancyRate = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;

  const filteredShelters = useMemo(() => {
    return shelters.filter((shl) => {
      const q = searchQuery.toLowerCase();
      return (
        !q ||
        shl.name.toLowerCase().includes(q) ||
        shl.area.toLowerCase().includes(q) ||
        shl.address.toLowerCase().includes(q)
      );
    });
  }, [shelters, searchQuery]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-600" />
            Ballari Relief Shelters & Evacuation Centers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capacity tracking, live bed occupancy, community kitchens, and disaster refuge camps
          </p>
        </div>

        {!isCivilian && (
          <button
            onClick={onOpenNewModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Register Shelter
          </button>
        )}
      </div>

      {/* District-wide Capacity Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Total Shelter Beds</span>
          <p className="text-2xl font-mono font-bold text-slate-900 mt-1">{totalCapacity}</p>
          <span className="text-[11px] text-slate-400">{shelters.length} active designated sites</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Current Occupants</span>
          <p className="text-2xl font-mono font-bold text-amber-600 mt-1">{currentOccupancy}</p>
          <span className="text-[11px] text-amber-600 font-medium">Displaced residents</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Vacant Beds Available</span>
          <p className="text-2xl font-mono font-bold text-emerald-600 mt-1">{availableBeds}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Ready for intake</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Occupancy Rate</span>
          <p className="text-2xl font-mono font-bold text-blue-600 mt-1">{occupancyRate}%</p>
          <div className="mt-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div style={{ width: `${occupancyRate}%` }} className="h-full bg-blue-600 rounded-full" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter shelters by name, area (Brucepet, Gandhi Nagar, Cowl Bazaar)..."
          className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
        />
      </div>

      {/* Shelter Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredShelters.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 md:col-span-2">
            <Home className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-semibold text-slate-800 text-sm">No relief shelter records registered</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              The district shelter registry starts at zero records. Authorized coordinators can register relief centers and manage capacity.
            </p>
          </div>
        ) : (
          filteredShelters.map((shelter) => {
            const remaining = shelter.totalCapacity - shelter.currentOccupancy;
            const percent = shelter.totalCapacity > 0 ? Math.round((shelter.currentOccupancy / shelter.totalCapacity) * 100) : 0;
            const isNearFull = percent >= 80;
            const isFull = shelter.currentOccupancy >= shelter.totalCapacity;

            return (
            <div
              key={shelter.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4 transition-all"
            >
              <div className="space-y-3">
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono text-blue-700 font-semibold">{shelter.id}</span>
                      <span>·</span>
                      <span className="text-slate-700">{shelter.area}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">{shelter.name}</h3>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                      isFull
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : isNearFull
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isFull ? 'At Full Capacity' : isNearFull ? 'Near Capacity' : 'Active Intake'}
                  </span>
                </div>

                {/* Address & Contact */}
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{shelter.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{shelter.contactPerson} (<a href={`tel:${shelter.contactPhone}`} className="underline">{shelter.contactPhone}</a>)</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Beds Occupied:</span>
                    <span className="font-mono text-slate-900 font-bold">
                      {shelter.currentOccupancy} / {shelter.totalCapacity} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full transition-all ${
                        percent >= 90
                          ? 'bg-red-500'
                          : percent >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Available: <strong className="text-emerald-700">{remaining} beds</strong></span>
                    <span>Total: {shelter.totalCapacity}</span>
                  </div>
                </div>

                {/* Facilities Checklist */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1 font-semibold">
                    On-Site Facilities:
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {shelter.facilities.bedding && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
                        <Bed className="w-3 h-3 text-blue-600" /> Bedding
                      </span>
                    )}
                    {shelter.facilities.foodKitchen && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
                        <Utensils className="w-3 h-3 text-amber-600" /> Kitchen
                      </span>
                    )}
                    {shelter.facilities.medicalPost && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
                        <HeartPulse className="w-3 h-3 text-red-600" /> Medical
                      </span>
                    )}
                    {shelter.facilities.cleanWater && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
                        <Droplet className="w-3 h-3 text-blue-500" /> Potable Water
                      </span>
                    )}
                    {shelter.facilities.powerBackup && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
                        <Zap className="w-3 h-3 text-yellow-600" /> Generator
                      </span>
                    )}
                    {shelter.facilities.childFriendly && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
                        <Smile className="w-3 h-3 text-emerald-600" /> Child Safe
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Occupancy Modifier Controls */}
              {!isCivilian ? (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <span className="text-[11px] text-slate-500">Update Bed Count:</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={shelter.currentOccupancy <= 0}
                      onClick={() => onUpdateOccupancy(shelter.id, Math.max(0, shelter.currentOccupancy - 10))}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 border border-slate-200 transition-colors"
                      title="Discharge 10 evacuees"
                    >
                      <Minus className="w-3 h-3 text-red-600" />
                      <span>-10</span>
                    </button>

                    <button
                      disabled={shelter.currentOccupancy >= shelter.totalCapacity}
                      onClick={() =>
                        onUpdateOccupancy(
                          shelter.id,
                          Math.min(shelter.totalCapacity, shelter.currentOccupancy + 10)
                        )
                      }
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 border border-slate-200 transition-colors"
                      title="Admit 10 evacuees"
                    >
                      <Plus className="w-3 h-3 text-emerald-600" />
                      <span>+10</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Shelter admission: Present at site or call coordinator</span>
                  <a href={`tel:${shelter.contactPhone}`} className="text-blue-600 font-semibold underline">
                    Call Center
                  </a>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  </div>
  );
};
