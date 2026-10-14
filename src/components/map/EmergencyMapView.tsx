import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  Search,
  AlertOctagon,
  Truck,
  Home,
  HeartPulse,
  Info,
  Maximize2,
  Compass,
  ArrowRight,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { Incident, ResourceItem, Shelter, Hospital, UserRole } from '../../types';
import { BALLARI_CENTER } from '../../data/initialData';

interface EmergencyMapViewProps {
  userRole?: UserRole;
  incidents: Incident[];
  resources: ResourceItem[];
  shelters: Shelter[];
  hospitals: Hospital[];
  onSelectIncident: (incident: Incident) => void;
  onOpenAllocation: (incident: Incident) => void;
}

export const EmergencyMapView: React.FC<EmergencyMapViewProps> = ({
  userRole,
  incidents,
  resources,
  shelters,
  hospitals,
  onSelectIncident,
  onOpenAllocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const isCivilian = userRole === 'Civilian';

  const [activeLayers, setActiveLayers] = useState({
    incidents: true,
    resources: !isCivilian,
    shelters: true,
    hospitals: true
  });

  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'incident' | 'resource' | 'shelter' | 'hospital';
    data: any;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [useFallbackView, setUseFallbackView] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (useFallbackView || !mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [BALLARI_CENTER.lat, BALLARI_CENTER.lng],
          zoom: 13,
          zoomControl: false
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Standard OpenStreetMap Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors | Ballari Emergency Map',
          maxZoom: 18
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;
      }
    } catch (err) {
      console.error('Error creating Leaflet map:', err);
      setUseFallbackView(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, [useFallbackView]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const createCustomIcon = (bgColor: string, text: string) => {
      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="display:flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:50%; background:${bgColor}; color:#fff; font-weight:bold; font-size:12px; box-shadow:0 2px 6px rgba(0,0,0,0.25); border:2px solid #ffffff;">
            <span>${text}</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
    };

    // 1. Incidents
    if (activeLayers.incidents) {
      incidents.forEach((inc) => {
        const color = inc.severity === 'Critical' ? '#DC2626' : inc.severity === 'High' ? '#EA580C' : '#D97706';
        const marker = L.marker([inc.latitude, inc.longitude], {
          icon: createCustomIcon(color, '!')
        });

        marker.on('click', () => {
          setSelectedEntity({ type: 'incident', data: inc });
        });

        marker.bindTooltip(`<b>${inc.id}: ${inc.title}</b><br/>Area: ${inc.area} (${inc.severity})`);
        marker.addTo(markersLayerRef.current!);
      });
    }

    // 2. Resources Bases
    if (activeLayers.resources && !isCivilian) {
      resources.forEach((res) => {
        const marker = L.marker([res.latitude, res.longitude], {
          icon: createCustomIcon('#2563EB', '🚒')
        });

        marker.on('click', () => {
          setSelectedEntity({ type: 'resource', data: res });
        });

        marker.bindTooltip(`<b>${res.name}</b><br/>Base: ${res.baseLocation} (${res.availableQuantity} available)`);
        marker.addTo(markersLayerRef.current!);
      });
    }

    // 3. Shelters
    if (activeLayers.shelters) {
      shelters.forEach((shl) => {
        const marker = L.marker([shl.latitude, shl.longitude], {
          icon: createCustomIcon('#16A34A', '🏠')
        });

        marker.on('click', () => {
          setSelectedEntity({ type: 'shelter', data: shl });
        });

        marker.bindTooltip(`<b>${shl.name}</b><br/>Occupancy: ${shl.currentOccupancy}/${shl.totalCapacity}`);
        marker.addTo(markersLayerRef.current!);
      });
    }

    // 4. Hospitals
    if (activeLayers.hospitals) {
      hospitals.forEach((hosp) => {
        const marker = L.marker([hosp.latitude, hosp.longitude], {
          icon: createCustomIcon('#7C3AED', '🏥')
        });

        marker.on('click', () => {
          setSelectedEntity({ type: 'hospital', data: hosp });
        });

        marker.bindTooltip(`<b>${hosp.name}</b><br/>Available Beds: ${hosp.availableBeds}`);
        marker.addTo(markersLayerRef.current!);
      });
    }
  }, [incidents, resources, shelters, hospitals, activeLayers, useFallbackView, isCivilian]);

  const handleSelectSearchResult = (lat: number, lng: number, entity: any, type: any) => {
    setSelectedEntity({ type, data: entity });
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1 });
    }
  };

  const allSearchable = [
    ...incidents.map((i) => ({ title: i.title, area: i.area, lat: i.latitude, lng: i.longitude, type: 'incident' as const, raw: i })),
    ...resources.map((r) => ({ title: r.name, area: r.baseLocation, lat: r.latitude, lng: r.longitude, type: 'resource' as const, raw: r })),
    ...shelters.map((s) => ({ title: s.name, area: s.area, lat: s.latitude, lng: s.longitude, type: 'shelter' as const, raw: s })),
    ...hospitals.map((h) => ({ title: h.name, area: h.address, lat: h.latitude, lng: h.longitude, type: 'hospital' as const, raw: h }))
  ].filter((item) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.area.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Ballari District Tactical Geospatial Map</h2>
            <p className="text-[11px] text-slate-500">Centered at 15.1394°N, 76.9214°E · OpenStreetMap Layer</p>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            onClick={() => setActiveLayers((p) => ({ ...p, incidents: !p.incidents }))}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeLayers.incidents
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>Incidents ({incidents.length})</span>
          </button>

          {!isCivilian && (
            <button
              onClick={() => setActiveLayers((p) => ({ ...p, resources: !p.resources }))}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeLayers.resources
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-white text-slate-500 border border-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Resources ({resources.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveLayers((p) => ({ ...p, shelters: !p.shelters }))}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeLayers.shelters
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Shelters ({shelters.length})</span>
          </button>

          <button
            onClick={() => setActiveLayers((p) => ({ ...p, hospitals: !p.hospitals }))}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeLayers.hospitals
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            <span>Hospitals ({hospitals.length})</span>
          </button>

          <button
            onClick={() => setUseFallbackView(!useFallbackView)}
            className="px-2.5 py-1 rounded-md bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 text-xs transition-colors ml-auto font-medium"
          >
            {useFallbackView ? 'Street Map View' : 'Grid Coordinate View'}
          </button>
        </div>
      </div>

      {/* Map display area */}
      <div className="relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs min-h-[560px]">
        {/* Floating Search Bar */}
        <div className="absolute top-3 left-3 z-[1000] w-72 max-w-[calc(100%-24px)]">
          <div className="relative shadow-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find Cowl Bazaar, VIMS, Millerpet..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {allSearchable.length > 0 && (
            <div className="mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
              {allSearchable.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    handleSelectSearchResult(item.lat, item.lng, item.raw, item.type);
                    setSearchQuery('');
                  }}
                  className="p-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="font-semibold text-slate-900 truncate">{item.title}</div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{item.area}</span>
                    <span className="uppercase text-[10px] text-blue-600 font-mono">{item.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Container OR Grid Fallback */}
        {!useFallbackView ? (
          <div ref={mapContainerRef} className="w-full h-[560px] z-0" />
        ) : (
          <div className="w-full h-[560px] bg-slate-50 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Tactical Coordinate Grid · Ballari District Coordinates
                </span>
                <span className="text-xs text-slate-500">Offline Matrix Fallback</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedEntity({ type: 'incident', data: inc })}
                    className="p-3 rounded-lg bg-white border border-red-200 hover:border-red-300 cursor-pointer shadow-xs transition-all"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-red-700 font-semibold">{inc.id}</span>
                      <span className="text-slate-500">{inc.area}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{inc.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">
                      {inc.latitude.toFixed(4)}°N, {inc.longitude.toFixed(4)}°E
                    </p>
                  </div>
                ))}

                {shelters.map((shl) => (
                  <div
                    key={shl.id}
                    onClick={() => setSelectedEntity({ type: 'shelter', data: shl })}
                    className="p-3 rounded-lg bg-white border border-emerald-200 hover:border-emerald-300 cursor-pointer shadow-xs transition-all"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-emerald-700 font-semibold">Shelter</span>
                      <span className="text-slate-500">{shl.currentOccupancy}/{shl.totalCapacity} beds</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{shl.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">{shl.area}</p>
                  </div>
                ))}

                {incidents.length === 0 && shelters.length === 0 && (
                  <div className="col-span-full py-12 text-center text-xs text-slate-400">
                    No active incidents or shelters recorded on coordinate matrix yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Selected Entity Card Sheet */}
        {selectedEntity && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[1000] bg-white border border-slate-200 rounded-xl p-4 shadow-xl text-xs animate-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedEntity.type}
                </span>
                <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                  {selectedEntity.data.name || selectedEntity.data.title}
                </span>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="py-2.5 space-y-1 text-slate-600">
              {selectedEntity.type === 'incident' && (
                <>
                  <p className="font-semibold text-slate-900">{selectedEntity.data.title}</p>
                  <p className="text-slate-500 text-[11px] line-clamp-2">{selectedEntity.data.description}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span>Severity: <strong className="text-red-600">{selectedEntity.data.severity}</strong></span>
                    <span>Status: <strong className="text-blue-600">{selectedEntity.data.status}</strong></span>
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onSelectIncident(selectedEntity.data)}
                      className="flex-1 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-center"
                    >
                      View Details
                    </button>
                    {!isCivilian && (
                      <button
                        onClick={() => onOpenAllocation(selectedEntity.data)}
                        className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Cpu className="w-3.5 h-3.5" /> Allocate
                      </button>
                    )}
                  </div>
                </>
              )}

              {selectedEntity.type === 'resource' && (
                <>
                  <p className="font-semibold text-slate-900">{selectedEntity.data.name}</p>
                  <p className="text-slate-500 text-[11px]">{selectedEntity.data.typeDetails}</p>
                  <div className="pt-1 text-[11px]">
                    Base: <strong>{selectedEntity.data.baseLocation}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span>Available: <strong className="text-emerald-700">{selectedEntity.data.availableQuantity} of {selectedEntity.data.totalQuantity}</strong></span>
                    <span>Status: <strong className="text-blue-600">{selectedEntity.data.status}</strong></span>
                  </div>
                </>
              )}

              {selectedEntity.type === 'shelter' && (
                <>
                  <p className="font-semibold text-slate-900">{selectedEntity.data.name}</p>
                  <p className="text-slate-500 text-[11px]">{selectedEntity.data.address}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span>Capacity: {selectedEntity.data.totalCapacity} beds</span>
                    <span>Occupied: <strong className="text-amber-700">{selectedEntity.data.currentOccupancy}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    Contact: {selectedEntity.data.contactPerson} ({selectedEntity.data.contactPhone})
                  </div>
                </>
              )}

              {selectedEntity.type === 'hospital' && (
                <>
                  <p className="font-semibold text-slate-900">{selectedEntity.data.name}</p>
                  <p className="text-slate-500 text-[11px]">{selectedEntity.data.address}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span>Emergency Beds: <strong className="text-emerald-700">{selectedEntity.data.availableBeds} / {selectedEntity.data.emergencyBeds}</strong></span>
                    <span>ICU: <strong className="text-blue-700">{selectedEntity.data.icuAvailable}</strong></span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
