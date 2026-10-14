import React, { useState, useMemo } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Truck,
  ArrowRight,
  ShieldAlert,
  Gauge,
  Sliders,
  Sparkles,
  Info,
  Layers,
  MapPin,
  Clock,
  Check
} from 'lucide-react';
import { Incident, ResourceItem, AllocationRecommendation } from '../../types';
import { getRecommendedResourcesForIncident } from '../../services/allocationEngine';

interface AllocationViewProps {
  incidents: Incident[];
  resources: ResourceItem[];
  preselectedIncident?: Incident | null;
  onCommitAllocation: (
    incidentId: string,
    allocations: { resourceId: string; quantity: number }[]
  ) => void;
  onViewIncidentDetails: (incident: Incident) => void;
}

export const AllocationView: React.FC<AllocationViewProps> = ({
  incidents,
  resources,
  preselectedIncident,
  onCommitAllocation,
  onViewIncidentDetails
}) => {
  const openIncidents = incidents.filter((i) => i.status !== 'Resolved');

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    preselectedIncident?.id || (openIncidents[0]?.id ?? '')
  );

  const [strategy, setStrategy] = useState<'Balanced' | 'Fastest Response' | 'Maximum Capacity'>(
    'Balanced'
  );

  const [reservePercent, setReservePercent] = useState<number>(15);

  const currentIncident = useMemo(() => {
    return incidents.find((i) => i.id === selectedIncidentId) || openIncidents[0];
  }, [incidents, selectedIncidentId, openIncidents]);

  const recommendations = useMemo(() => {
    if (!currentIncident) return [];
    return getRecommendedResourcesForIncident(currentIncident, resources, strategy, reservePercent);
  }, [currentIncident, resources, strategy, reservePercent]);

  const [selectedRecommendations, setSelectedRecommendations] = useState<Record<string, number>>({});
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  React.useEffect(() => {
    if (recommendations.length > 0) {
      const initial: Record<string, number> = {};
      recommendations.slice(0, 3).forEach((rec) => {
        initial[rec.resourceId] = rec.recommendedQuantity;
      });
      setSelectedRecommendations(initial);
    } else {
      setSelectedRecommendations({});
    }
  }, [currentIncident?.id, strategy]);

  const toggleSelectRec = (resourceId: string, defaultQty: number) => {
    setSelectedRecommendations((prev) => {
      const copy = { ...prev };
      if (copy[resourceId]) {
        delete copy[resourceId];
      } else {
        copy[resourceId] = defaultQty;
      }
      return copy;
    });
  };

  const updateSelectedQuantity = (resourceId: string, qty: number, maxQty: number) => {
    const valid = Math.max(1, Math.min(qty, maxQty));
    setSelectedRecommendations((prev) => ({
      ...prev,
      [resourceId]: valid
    }));
  };

  const handleConfirmApproval = () => {
    if (!currentIncident) return;
    const allocations = Object.entries(selectedRecommendations).map(([resId, qty]) => ({
      resourceId: resId,
      quantity: qty
    }));

    onCommitAllocation(currentIncident.id, allocations);
    setShowApprovalModal(false);
  };

  if (!currentIncident) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
        <Cpu className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="font-semibold text-slate-800 text-sm">No active incidents requiring allocation</h3>
        <p className="text-xs text-slate-500">All recorded emergency incidents in Ballari are currently resolved.</p>
      </div>
    );
  }

  const selectedCount = Object.keys(selectedRecommendations).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
              Heuristic Decision Support System
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-500">Ballari Command Desk</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            Resource Allocation & Optimization Engine
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Evaluates Haversine travel distances, incident domain severity, and unit availability to recommend optimal deployment packages.
          </p>
        </div>

        {/* Target Incident Switcher */}
        <div className="w-full sm:w-72">
          <label className="block text-[11px] text-slate-500 mb-1 font-medium">Target Incident to Allocate:</label>
          <select
            value={selectedIncidentId}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
          >
            {openIncidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                [{inc.severity}] {inc.id}: {inc.title.substring(0, 32)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Incident Overview Card */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-blue-700 font-semibold">{currentIncident.id}</span>
            <span className="text-slate-300">·</span>
            <span
              className={`font-semibold ${
                currentIncident.severity === 'Critical'
                  ? 'text-red-600'
                  : currentIncident.severity === 'High'
                  ? 'text-orange-600'
                  : 'text-amber-600'
              }`}
            >
              {currentIncident.severity}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-700">{currentIncident.incidentType}</span>
          </div>
          <h2 className="text-sm font-bold text-slate-900">{currentIncident.title}</h2>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-500" /> {currentIncident.locationName} ({currentIncident.area})
            </span>
            <span className="flex items-center gap-1 font-mono">
              {currentIncident.latitude.toFixed(4)}°N, {currentIncident.longitude.toFixed(4)}°E
            </span>
          </div>
        </div>

        <button
          onClick={() => onViewIncidentDetails(currentIncident)}
          className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shrink-0"
        >
          View Timeline
        </button>
      </div>

      {/* Strategy Selector & Reserve Margin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strategy Selection */}
        <div className="md:col-span-2 p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              Allocation Strategy Model
            </span>
            <span className="text-[11px] text-slate-500">Heuristic weights adjust dynamically</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id: 'Balanced',
                label: 'Balanced (Standard)',
                desc: '40% Type Fit · 35% Distance · 25% Reserve'
              },
              {
                id: 'Fastest Response',
                label: 'Fastest Proximity',
                desc: '55% Distance · 30% Type · 15% Reserve'
              },
              {
                id: 'Maximum Capacity',
                label: 'Max Fleet Capacity',
                desc: '50% Stock · 30% Type · 20% Distance'
              }
            ].map((strat) => {
              const isActive = strategy === strat.id;
              return (
                <button
                  key={strat.id}
                  onClick={() => setStrategy(strat.id as any)}
                  className={`p-2.5 rounded-lg text-left transition-all border ${
                    isActive
                      ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-900">{strat.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{strat.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reserve Threshold Slider */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-800">Depot Safety Reserve</span>
              <span className="font-mono text-xs text-blue-600 font-bold">{reservePercent}%</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Preserves minimum equipment at base depots for secondary emergencies.
            </p>
          </div>

          <div className="mt-3">
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={reservePercent}
              onChange={(e) => setReservePercent(parseInt(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0% (Aggressive)</span>
              <span>20% (Standard)</span>
              <span>40% (High Reserve)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Resource Candidates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recommended Resource Packages</h3>
            <p className="text-xs text-slate-500">Ranked by composite suitability, distance, and reserve score</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {recommendations.length} eligible units analyzed
          </span>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec) => {
            const resource = resources.find((r) => r.id === rec.resourceId);
            if (!resource) return null;

            const isSelected = selectedRecommendations[rec.resourceId] !== undefined;
            const currentSelectedQty = selectedRecommendations[rec.resourceId] || rec.recommendedQuantity;

            return (
              <div
                key={rec.resourceId}
                className={`rounded-xl p-4 transition-all border ${
                  isSelected
                    ? 'bg-blue-50/50 border-blue-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                      <span className="font-mono text-blue-700 font-semibold">{rec.resourceId}</span>
                      <span>·</span>
                      <span className="text-slate-700 font-medium">{rec.category}</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-mono font-semibold">
                        {rec.distanceKm} km from scene
                      </span>
                      <span>·</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                          rec.priorityLevel === 'Immediate'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : rec.priorityLevel === 'Secondary'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {rec.priorityLevel} Tier
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{rec.resourceName}</h4>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      <strong className="text-blue-700">Why recommended:</strong> {rec.rationale}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-0.5">
                      <span>Base: {resource.baseLocation}</span>
                      <span>·</span>
                      <span>Total Fleet: {resource.totalQuantity} {resource.unit}</span>
                      <span>·</span>
                      <span>Available: {resource.availableQuantity} {resource.unit}</span>
                    </div>
                  </div>

                  {/* Right: Match Score & Selection */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Match Score</div>
                      <div className="text-xl font-bold text-blue-600 font-mono">
                        {rec.matchScore}%
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-300">
                        <span className="text-[11px] text-slate-500">Deploy:</span>
                        <input
                          type="number"
                          min="1"
                          max={resource.availableQuantity}
                          value={currentSelectedQty}
                          onChange={(e) =>
                            updateSelectedQuantity(
                              rec.resourceId,
                              parseInt(e.target.value) || 1,
                              resource.availableQuantity
                            )
                          }
                          className="w-16 px-1.5 py-0.5 text-xs text-center border border-slate-300 rounded text-slate-900 font-mono"
                        />
                        <span className="text-[11px] text-slate-500">{resource.unit}</span>
                      </div>
                    )}

                    <button
                      onClick={() => toggleSelectRec(rec.resourceId, rec.recommendedQuantity)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Included</span>
                        </>
                      ) : (
                        <span>+ Include in Plan</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Dispatch Action Bar */}
      <div className="sticky bottom-4 z-20 bg-white border border-slate-200 rounded-xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-900">Proposed Dispatch Plan:</span>
          <p className="text-xs text-slate-600 mt-0.5">
            <strong>{selectedCount}</strong> resources selected for deployment to{' '}
            <span className="text-blue-700 font-semibold">{currentIncident.title}</span>
          </p>
        </div>

        <button
          disabled={selectedCount === 0}
          onClick={() => setShowApprovalModal(true)}
          className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Review & Approve Allocation Plan
        </button>
      </div>

      {/* Approval Confirmation Dialog */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-blue-600">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Authorize Emergency Resource Allocation</h3>
                <p className="text-xs text-slate-500">Coordinator verification before locking depot inventory</p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Incident:</span>
                <span className="font-semibold text-slate-900">{currentIncident.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Strategy Applied:</span>
                <span className="font-semibold text-blue-700">{strategy}</span>
              </div>
              <div className="text-slate-700 font-semibold pt-1">Units to deploy:</div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {Object.entries(selectedRecommendations).map(([resId, qty]) => {
                  const res = resources.find((r) => r.id === resId);
                  return (
                    <div key={resId} className="flex justify-between text-slate-700">
                      <span>• {res?.name || resId}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {qty} {res?.unit || 'Units'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Upon approval, the incident status will advance to <strong>Assigned</strong>, available inventory
              will be updated, and an immutable log entry will be committed.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium"
              >
                Back to Edit
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Authorize & Deploy Units
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
