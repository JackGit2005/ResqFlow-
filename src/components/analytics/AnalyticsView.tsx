import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  PieChart,
  Truck,
  Home,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { Incident, ResourceItem, Shelter } from '../../types';

interface AnalyticsViewProps {
  incidents: Incident[];
  resources: ResourceItem[];
  shelters: Shelter[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ incidents, resources, shelters }) => {
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('all');

  const filteredIncidents = useMemo(() => {
    const now = Date.now();
    return incidents.filter((inc) => {
      if (timeFilter === 'all') return true;
      const reportedMs = new Date(inc.reportedAt).getTime();
      const diffHours = (now - reportedMs) / (1000 * 60 * 60);
      if (timeFilter === '24h') return diffHours <= 24;
      if (timeFilter === '7d') return diffHours <= 24 * 7;
      if (timeFilter === '30d') return diffHours <= 24 * 30;
      return true;
    });
  }, [incidents, timeFilter]);

  const totalIncidents = filteredIncidents.length;
  const criticalCount = filteredIncidents.filter((i) => i.severity === 'Critical').length;
  const highCount = filteredIncidents.filter((i) => i.severity === 'High').length;
  const mediumCount = filteredIncidents.filter((i) => i.severity === 'Medium').length;
  const lowCount = filteredIncidents.filter((i) => i.severity === 'Low').length;

  const statusCounts = {
    Open: filteredIncidents.filter((i) => i.status === 'Open').length,
    Assigned: filteredIncidents.filter((i) => i.status === 'Assigned').length,
    InProgress: filteredIncidents.filter((i) => i.status === 'In Progress').length,
    Resolved: filteredIncidents.filter((i) => i.status === 'Resolved').length
  };

  const typeMap: Record<string, number> = {};
  filteredIncidents.forEach((i) => {
    typeMap[i.incidentType] = (typeMap[i.incidentType] || 0) + 1;
  });

  const totalResourceUnits = resources.reduce((acc, r) => acc + r.totalQuantity, 0);
  const availableResourceUnits = resources.reduce((acc, r) => acc + r.availableQuantity, 0);
  const deployedResourceUnits = totalResourceUnits - availableResourceUnits;
  const resourceUtilizationRate = totalResourceUnits > 0 ? Math.round((deployedResourceUnits / totalResourceUnits) * 100) : 0;

  const totalShelterCapacity = shelters.reduce((acc, s) => acc + s.totalCapacity, 0);
  const currentShelterOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const shelterOccupancyRate = totalShelterCapacity > 0 ? Math.round((currentShelterOccupancy / totalShelterCapacity) * 100) : 0;

  const exportIncidentsCSV = () => {
    const headers = [
      'Incident ID',
      'Title',
      'Category',
      'Severity',
      'Status',
      'Area',
      'Latitude',
      'Longitude',
      'Reported Time',
      'Assigned Resources Count'
    ];

    const rows = filteredIncidents.map((i) => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${i.incidentType}"`,
      i.severity,
      i.status,
      `"${i.area}"`,
      i.latitude,
      i.longitude,
      i.reportedAt,
      i.assignedResourceIds.length
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ResQFlow_Ballari_Incidents_${timeFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportResourcesCSV = () => {
    const headers = [
      'Resource ID',
      'Name',
      'Category',
      'Base Location',
      'Total Quantity',
      'Available Quantity',
      'Unit',
      'Status',
      'Contact'
    ];

    const rows = resources.map((r) => [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      r.category,
      `"${r.baseLocation}"`,
      r.totalQuantity,
      r.availableQuantity,
      r.unit,
      r.status,
      `"${r.contactPerson} (${r.contactPhone})"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ResQFlow_Ballari_Resources_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 print:bg-white print:text-black">
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs print:border-none print:shadow-none">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 print:text-black">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Executive Disaster Analytics & Incident Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 print:text-slate-600">
            Ballari District Disaster Management Authority · Quantitative situational review
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap print:hidden">
          {/* Time Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            {[
              { id: '24h', label: '24h' },
              { id: '7d', label: '7d' },
              { id: '30d', label: '30d' },
              { id: 'all', label: 'All Records' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeFilter(t.id as any)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  timeFilter === t.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={exportIncidentsCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors"
            title="Download CSV of filtered incidents"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export CSV</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors"
            title="Print or export PDF"
          >
            <Printer className="w-3.5 h-3.5 text-red-600" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Filtered Incidents</span>
          <p className="text-2xl font-mono font-bold text-slate-900 mt-1">{totalIncidents}</p>
          <span className="text-[11px] text-slate-400">In selected window</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Critical Ratio</span>
          <p className="text-2xl font-mono font-bold text-red-600 mt-1">
            {totalIncidents > 0 ? Math.round((criticalCount / totalIncidents) * 100) : 0}%
          </p>
          <span className="text-[11px] text-red-600 font-medium">{criticalCount} critical alerts</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Fleet Utilization</span>
          <p className="text-2xl font-mono font-bold text-blue-600 mt-1">{resourceUtilizationRate}%</p>
          <span className="text-[11px] text-blue-600 font-medium">{deployedResourceUnits} units deployed</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Shelter Occupancy</span>
          <p className="text-2xl font-mono font-bold text-emerald-600 mt-1">{shelterOccupancyRate}%</p>
          <span className="text-[11px] text-emerald-600 font-medium">
            {totalShelterCapacity > 0 ? `${totalShelterCapacity - currentShelterOccupancy} vacant beds` : '0 shelters registered'}
          </span>
        </div>
      </div>

      {/* Zero Operational Data Notice when empty */}
      {totalIncidents === 0 && resources.length === 0 && shelters.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Zero Operational Records Baseline</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            ResQFlow starts with zero operational records. No demo or fabricated statistics are displayed. Real-time metrics and charts will populate automatically as genuine incident reports, assistance requests, and shelter inventories are recorded.
          </p>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Incident Severity Distribution</h3>
            <p className="text-xs text-slate-500">Proportional classification across recorded emergencies</p>
          </div>

          {totalIncidents === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No operational incident records logged yet.
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Critical', count: criticalCount, color: 'bg-red-600', text: 'text-red-600' },
                { label: 'High', count: highCount, color: 'bg-orange-500', text: 'text-orange-600' },
                { label: 'Medium', count: mediumCount, color: 'bg-amber-400', text: 'text-amber-600' },
                { label: 'Low', count: lowCount, color: 'bg-emerald-500', text: 'text-emerald-600' }
              ].map((item) => {
                const pct = Math.round((item.count / totalIncidents) * 100);
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.label}</span>
                      <span className="font-mono text-slate-500">
                        <strong className={item.text}>{item.count}</strong> ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className={`h-full ${item.color} rounded-full`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Operational Status Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Incident Resolution Lifecycle</h3>
            <p className="text-xs text-slate-500">Current progression from triage to on-scene resolution</p>
          </div>

          {totalIncidents === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No incident lifecycle records logged yet.
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Open (Pending Review)', count: statusCounts.Open, color: 'bg-red-500' },
                { label: 'Assigned (Units Dispatched)', count: statusCounts.Assigned, color: 'bg-amber-500' },
                { label: 'In Progress (Active On-Scene)', count: statusCounts.InProgress, color: 'bg-blue-600' },
                { label: 'Resolved (Closed)', count: statusCounts.Resolved, color: 'bg-emerald-600' }
              ].map((item) => {
                const pct = Math.round((item.count / totalIncidents) * 100);
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.label}</span>
                      <span className="font-mono text-slate-500">
                        <strong>{item.count}</strong> ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className={`h-full ${item.color} rounded-full`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Categories Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Incidents by Disaster Category</h3>
            <p className="text-xs text-slate-500">Flood, Fire, Collapse, and Hazmat occurrence in Ballari</p>
          </div>

          {totalIncidents === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No emergency categories reported yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(typeMap).map(([type, count]) => {
                const pct = Math.round((count / totalIncidents) * 100);
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700">{type}</span>
                      <span className="font-mono text-blue-700 font-bold">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="h-full bg-blue-600 rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shelter Occupancy Ratios */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Shelter Capacity Across Ballari</h3>
              <p className="text-xs text-slate-500">Occupancy loads at designated relief shelters</p>
            </div>
            {shelters.length > 0 && (
              <button
                onClick={exportResourcesCSV}
                className="text-xs text-blue-600 hover:underline print:hidden font-medium"
              >
                Export Inventory
              </button>
            )}
          </div>

          {shelters.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No relief shelters registered yet in the district database.
            </div>
          ) : (
            <div className="space-y-3">
              {shelters.map((shl) => {
                const pct = shl.totalCapacity > 0 ? Math.round((shl.currentOccupancy / shl.totalCapacity) * 100) : 0;
                return (
                  <div key={shl.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]">{shl.name}</span>
                      <span className="font-mono text-slate-500">
                        <strong>{shl.currentOccupancy}</strong> / {shl.totalCapacity} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full ${
                          pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
