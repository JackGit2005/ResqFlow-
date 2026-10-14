import React, { useState } from 'react';
import {
  FlaskConical,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  TrendingDown,
  Layers,
  Truck,
  Home,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { SimulationScenario, ResourceItem, Shelter, Incident } from '../../types';
import { SIMULATION_SCENARIOS } from '../../data/initialData';

interface SimulationViewProps {
  resources: ResourceItem[];
  shelters: Shelter[];
  onInjectSimulatedIncident: (scenario: SimulationScenario) => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  resources,
  shelters,
  onInjectSimulatedIncident
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SIMULATION_SCENARIOS[0].id);
  const [strategyTest, setStrategyTest] = useState<'Fastest Response' | 'Maximum Capacity' | 'Balanced'>('Balanced');
  const [showConfirmInject, setShowConfirmInject] = useState(false);

  const scenario = SIMULATION_SCENARIOS.find((s) => s.id === selectedScenarioId) || SIMULATION_SCENARIOS[0];

  // Calculate live inventory numbers
  const liveAmbulances = resources
    .filter((r) => r.category === 'Ambulance')
    .reduce((acc, r) => acc + r.availableQuantity, 0);

  const liveRescueTeams = resources
    .filter((r) => r.category === 'Rescue Team')
    .reduce((acc, r) => acc + r.availableQuantity, 0);

  const liveWaterTrucks = resources
    .filter((r) => r.category === 'Potable Water')
    .reduce((acc, r) => acc + r.availableQuantity, 0);

  const liveFoodKits = resources
    .filter((r) => r.category === 'Food & Ration')
    .reduce((acc, r) => acc + r.availableQuantity, 0);

  const totalShelterCapacity = shelters.reduce((acc, s) => acc + s.totalCapacity, 0);
  const currentShelterOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const liveShelterBeds = totalShelterCapacity - currentShelterOccupancy;

  // Shortage calculations
  const ambulanceDelta = liveAmbulances - scenario.requiredAmbulances;
  const rescueTeamDelta = liveRescueTeams - scenario.requiredRescueTeams;
  const waterDelta = liveWaterTrucks - scenario.requiredWaterTrucks;
  const foodDelta = liveFoodKits - scenario.requiredFoodKits;
  const shelterDelta = liveShelterBeds - scenario.requiredShelterBeds;

  const hasAnyShortage =
    ambulanceDelta < 0 ||
    rescueTeamDelta < 0 ||
    waterDelta < 0 ||
    foodDelta < 0 ||
    shelterDelta < 0;

  const handleInjectConfirmed = () => {
    onInjectSimulatedIncident(scenario);
    setShowConfirmInject(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">
              Disaster Stress Testing Sandbox
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-500">Isolated Simulation Environment</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-600" />
            Emergency Scenario Simulation & Capacity Stress Test
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Model catastrophic flood, industrial hazmat, and urban fire shock scenarios to detect resource bottlenecks before disaster strikes.
          </p>
        </div>

        {/* Sandbox Notice */}
        <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-[11px] text-purple-800 flex items-center gap-2 shrink-0 font-medium">
          <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
          <span>Simulation memory isolated: Live records remain untouched</span>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Select Disaster Scenario Model:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SIMULATION_SCENARIOS.map((sc) => {
            const isSelected = sc.id === scenario.id;
            return (
              <div
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-purple-50/60 border-purple-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-purple-700 font-bold">{sc.id}</span>
                  <span
                    className={`font-semibold ${
                      sc.simulatedSeverity === 'Critical' ? 'text-red-600' : 'text-orange-600'
                    }`}
                  >
                    {sc.simulatedSeverity}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{sc.name}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{sc.description}</p>
                <div className="mt-3 text-[11px] text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2">
                  <span>Zone: {sc.affectedArea}</span>
                  <span className="font-mono text-red-600 font-bold">~{sc.estimatedCasualties} casualties</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resource Deficit & Surplus Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Projected Resource Balance & Shortage Analysis</h3>
            <p className="text-xs text-slate-500">Comparing scenario demands against current Ballari depot reserves</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Strategy Weight:</span>
            <select
              value={strategyTest}
              onChange={(e) => setStrategyTest(e.target.value as any)}
              className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-300 text-slate-800"
            >
              <option value="Balanced">Balanced Strategy</option>
              <option value="Fastest Response">Fastest Proximity</option>
              <option value="Maximum Capacity">Maximum Fleet</option>
            </select>
          </div>
        </div>

        {/* Shortage Metrics Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Resource Type</th>
                <th className="py-2.5 px-3">Scenario Demand</th>
                <th className="py-2.5 px-3">Current Available</th>
                <th className="py-2.5 px-3">Projected Net Balance</th>
                <th className="py-2.5 px-3">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Ambulances */}
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">108 ALS Ambulances</td>
                <td className="py-3 px-3 font-mono text-slate-600">{scenario.requiredAmbulances} Vehicles</td>
                <td className="py-3 px-3 font-mono text-slate-600">{liveAmbulances} Vehicles</td>
                <td className="py-3 px-3 font-mono font-bold">
                  <span className={ambulanceDelta >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {ambulanceDelta >= 0 ? `+${ambulanceDelta}` : ambulanceDelta}
                  </span>
                </td>
                <td className="py-3 px-3">
                  {ambulanceDelta >= 0 ? (
                    <span className="text-emerald-700 font-semibold">Sufficient Reserve</span>
                  ) : (
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Shortage (Deficit of {Math.abs(ambulanceDelta)})
                    </span>
                  )}
                </td>
              </tr>

              {/* Rescue Teams */}
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">SDRF / Fire Rescue Platoons</td>
                <td className="py-3 px-3 font-mono text-slate-600">{scenario.requiredRescueTeams} Teams</td>
                <td className="py-3 px-3 font-mono text-slate-600">{liveRescueTeams} Teams</td>
                <td className="py-3 px-3 font-mono font-bold">
                  <span className={rescueTeamDelta >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {rescueTeamDelta >= 0 ? `+${rescueTeamDelta}` : rescueTeamDelta}
                  </span>
                </td>
                <td className="py-3 px-3">
                  {rescueTeamDelta >= 0 ? (
                    <span className="text-emerald-700 font-semibold">Sufficient Reserve</span>
                  ) : (
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Shortage (Deficit of {Math.abs(rescueTeamDelta)})
                    </span>
                  )}
                </td>
              </tr>

              {/* Potable Water */}
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Potable Water Tankers (10KL)</td>
                <td className="py-3 px-3 font-mono text-slate-600">{scenario.requiredWaterTrucks} Tankers</td>
                <td className="py-3 px-3 font-mono text-slate-600">{liveWaterTrucks} Tankers</td>
                <td className="py-3 px-3 font-mono font-bold">
                  <span className={waterDelta >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {waterDelta >= 0 ? `+${waterDelta}` : waterDelta}
                  </span>
                </td>
                <td className="py-3 px-3">
                  {waterDelta >= 0 ? (
                    <span className="text-emerald-700 font-semibold">Sufficient Reserve</span>
                  ) : (
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Shortage (Deficit of {Math.abs(waterDelta)})
                    </span>
                  )}
                </td>
              </tr>

              {/* Food & Ration */}
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Emergency Meal & Nutrition Kits</td>
                <td className="py-3 px-3 font-mono text-slate-600">{scenario.requiredFoodKits} Kits</td>
                <td className="py-3 px-3 font-mono text-slate-600">{liveFoodKits} Kits</td>
                <td className="py-3 px-3 font-mono font-bold">
                  <span className={foodDelta >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {foodDelta >= 0 ? `+${foodDelta}` : foodDelta}
                  </span>
                </td>
                <td className="py-3 px-3">
                  {foodDelta >= 0 ? (
                    <span className="text-emerald-700 font-semibold">Sufficient Reserve</span>
                  ) : (
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Shortage (Deficit of {Math.abs(foodDelta)})
                    </span>
                  )}
                </td>
              </tr>

              {/* Shelter Beds */}
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-900">Designated Shelter Bedding</td>
                <td className="py-3 px-3 font-mono text-slate-600">{scenario.requiredShelterBeds} Beds</td>
                <td className="py-3 px-3 font-mono text-slate-600">{liveShelterBeds} Vacant</td>
                <td className="py-3 px-3 font-mono font-bold">
                  <span className={shelterDelta >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {shelterDelta >= 0 ? `+${shelterDelta}` : shelterDelta}
                  </span>
                </td>
                <td className="py-3 px-3">
                  {shelterDelta >= 0 ? (
                    <span className="text-emerald-700 font-semibold">Sufficient Reserve</span>
                  ) : (
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Shortage (Deficit of {Math.abs(shelterDelta)})
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tactical Recommendation */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Automated Recommendation for {scenario.name}:
          </span>
          <p className="text-xs text-slate-700 leading-relaxed">
            {hasAnyShortage ? (
              <>
                ⚠️ <strong>Resource Shortage Detected:</strong> Under {strategyTest} mode, current Ballari
                local reserves cannot absorb this shock without inter-district requisition. Recommendation:
                Alert neighboring <strong>Koppal and Vijayanagara DDMA control centers</strong> for mutual aid
                compacts and activate secondary school relief shelters immediately.
              </>
            ) : (
              <>
                ✅ <strong>Sufficient District Reserves:</strong> All five primary logistical vectors show positive
                surplus margins. Projected deployment will preserve the 15% safety threshold at base depots.
              </>
            )}
          </p>
        </div>

        {/* Inject Drill Incident */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Want to test response workflows with this scenario?
          </span>
          <button
            onClick={() => setShowConfirmInject(true)}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors shadow-xs"
          >
            Inject Scenario as Live Drill Incident
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmInject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-purple-700">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Inject Simulated Drill Incident?</h3>
                <p className="text-xs text-slate-500">Separate explicit confirmation required</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will create an active incident in your operational queue titled{' '}
              <strong>[DRILL] {scenario.name}</strong> located in {scenario.affectedArea}.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmInject(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleInjectConfirmed}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Injection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
