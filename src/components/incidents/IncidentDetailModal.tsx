import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  AlertOctagon,
  Clock,
  MapPin,
  CheckCircle2,
  Truck,
  Plus,
  Send,
  Cpu,
  ShieldAlert,
  ArrowRight,
  Camera,
  Eye,
  ShieldCheck,
  Upload,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { Incident, IncidentStatus, IncidentSeverity, ResourceItem, UserRole } from '../../types';

interface IncidentDetailModalProps {
  userRole?: UserRole;
  incident: Incident | null;
  allResources: ResourceItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus) => void;
  onAddTimelineEntry: (incidentId: string, action: string) => void;
  onReleaseResource: (incidentId: string, resourceId: string) => void;
  onOpenAllocation: (incident: Incident) => void;
  onAddPhoto?: (incidentId: string, photoUrl: string) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  userRole,
  incident,
  allResources,
  isOpen,
  onClose,
  onUpdateStatus,
  onAddTimelineEntry,
  onReleaseResource,
  onOpenAllocation,
  onAddPhoto
}) => {
  const [newLogAction, setNewLogAction] = useState('');
  const [showConfirmResolve, setShowConfirmResolve] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !incident) return null;

  const isCivilian = userRole === 'Civilian';

  const assignedResources = allResources.filter((r) =>
    incident.assignedResourceIds.includes(r.id)
  );

  const allPhotos: string[] = [
    ...(incident.photos || []),
    ...(incident.imageUrl ? [incident.imageUrl] : [])
  ];

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogAction.trim()) return;
    onAddTimelineEntry(incident.id, newLogAction.trim());
    setNewLogAction('');
  };

  const handleResolve = () => {
    onUpdateStatus(incident.id, 'Resolved');
    setShowConfirmResolve(false);
  };

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files (JPG, PNG, WebP) are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onAddPhoto?.(incident.id, event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : allPhotos.length - 1));
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((prev) => (prev !== null && prev < allPhotos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-blue-700 font-semibold">{incident.id}</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-bold text-red-600">{incident.severity} Severity</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {incident.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">{incident.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
          {/* Status Quick Actions Bar (Visible to Responders and Coordinators) */}
          {!isCivilian && (
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">Update Status:</span>
                <div className="flex items-center gap-1.5">
                  {(['Open', 'Assigned', 'In Progress', 'Resolved'] as IncidentStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        if (st === 'Resolved') {
                          setShowConfirmResolve(true);
                        } else {
                          onUpdateStatus(incident.id, st);
                        }
                      }}
                      className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                        incident.status === st
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenAllocation(incident);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Cpu className="w-3.5 h-3.5" />
                Smart Allocate Resources
              </button>
            </div>
          )}

          {/* Confirm Resolve Prompt */}
          {showConfirmResolve && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-red-800 text-xs">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>Confirm resolving this incident? Assigned response teams will be notified.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConfirmResolve(false)}
                  className="px-2.5 py-1 text-xs text-slate-600 hover:bg-white bg-slate-100 rounded border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded"
                >
                  Confirm Resolved
                </button>
              </div>
            </div>
          )}

          {/* Incident Meta & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-500">Incident Category</span>
                <p className="text-slate-900 font-semibold">{incident.incidentType}</p>
              </div>

              <div>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" /> Location in Ballari
                </span>
                <p className="text-slate-900 font-medium">{incident.locationName}</p>
                <p className="text-xs text-slate-500 font-mono">
                  Area: {incident.area} · Coords: {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Reported Timestamp
                </span>
                <p className="text-slate-800 font-mono text-xs">{new Date(incident.reportedAt).toLocaleString()}</p>
              </div>

              <div>
                <span className="text-xs text-slate-500">Reporter & Origin</span>
                <p className="text-slate-700">
                  {incident.reporterName || 'Citizen Report'}{' '}
                  <span className="text-slate-500 text-xs font-mono">({incident.reporterContact || 'Direct 112 Ingest'})</span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-500">Detailed Situation Assessment</span>
            <p className="mt-1 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed text-xs">
              {incident.description}
            </p>
          </div>

          {/* Attached Incident Photo Gallery & Preview Grid */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-600" /> Photo Gallery & Field Evidence
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {allPhotos.length} {allPhotos.length === 1 ? 'image' : 'images'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> EXIF Sanitized
                </span>

                {/* Upload Field Evidence button for authorized coordinators / responders */}
                {!isCivilian && onAddPhoto && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUploadPhoto}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                      title="Attach on-scene photo evidence"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Attach Evidence
                    </button>
                  </>
                )}
              </div>
            </div>

            {uploadError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {uploadError}
              </div>
            )}

            {allPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {allPhotos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 cursor-pointer shadow-xs hover:border-blue-500 hover:shadow-md transition-all duration-200"
                  >
                    <img
                      src={photoUrl}
                      alt={`Incident Evidence ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                    {/* Top index badge */}
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white font-mono font-medium">
                      #{idx + 1}
                    </div>

                    {/* Hover Inspection Overlay */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 gap-1 p-2">
                      <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-xs">
                        <Eye className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold tracking-wide">Click to Enlarge</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-400 mx-auto flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">No photo attachments linked to this record</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Incident was logged via direct dispatch. Field responders can upload photo evidence above.
                  </p>
                </div>
                {!isCivilian && onAddPhoto && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-white border border-slate-200 hover:border-blue-300 rounded-lg shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Field Evidence
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Currently Assigned Resources */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" /> Assigned Units ({assignedResources.length})
              </span>
              {!isCivilian && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAllocation(incident);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Assign More
                </button>
              )}
            </div>

            {assignedResources.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                No units assigned yet.
              </div>
            ) : (
              <div className="space-y-2">
                {assignedResources.map((res) => (
                  <div
                    key={res.id}
                    className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs shadow-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{res.name}</div>
                      <div className="text-slate-500 text-[11px]">
                        {res.category} · Base: {res.baseLocation} · Officer: {res.contactPerson} ({res.contactPhone})
                      </div>
                    </div>
                    {!isCivilian && (
                      <button
                        onClick={() => onReleaseResource(incident.id, res.id)}
                        className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-medium transition-colors"
                      >
                        Release Unit
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline / Action Log */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" /> Operational Dispatch Timeline
            </span>

            <div className="space-y-2 border-l-2 border-slate-200 pl-4">
              {incident.timeline.map((item, idx) => (
                <div key={idx} className="relative pb-2">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-800">{item.user}</span>
                    <span className="font-mono">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5">{item.action}</p>
                </div>
              ))}
            </div>

            {/* Append action entry form */}
            {!isCivilian && (
              <form onSubmit={handleAddLog} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newLogAction}
                  onChange={(e) => setNewLogAction(e.target.value)}
                  placeholder="Log dispatch update, radio check, or casualty count..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Log
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>

      {/* High-Resolution Interactive Lightbox Modal */}
      {activePhotoIndex !== null && allPhotos[activePhotoIndex] && (
        <div
          onClick={() => setActivePhotoIndex(null)}
          className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in"
        >
          {/* Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl flex items-center justify-between text-white pb-3"
          >
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-xs font-mono font-semibold">
                {incident.id}
              </span>
              <span className="text-sm font-semibold text-slate-200 truncate max-w-md">
                {incident.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                Photo {activePhotoIndex + 1} of {allPhotos.length}
              </span>
              <a
                href={allPhotos[activePhotoIndex]}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
                title="Open in new window"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </a>
              <button
                onClick={() => setActivePhotoIndex(null)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Image with Navigation Controls */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex items-center justify-center flex-1 max-w-5xl w-full my-auto overflow-hidden"
          >
            {allPhotos.length > 1 && (
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 sm:left-4 z-10 p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-slate-700 shadow-xl transition-all hover:scale-105 active:scale-95"
                title="Previous photo (Left arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={allPhotos[activePhotoIndex]}
              alt={`Full resolution evidence ${activePhotoIndex + 1}`}
              className="max-h-[72vh] max-w-full w-auto object-contain rounded-xl shadow-2xl select-none animate-in zoom-in-95 duration-150"
            />

            {allPhotos.length > 1 && (
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 sm:right-4 z-10 p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white border border-slate-700 shadow-xl transition-all hover:scale-105 active:scale-95"
                title="Next photo (Right arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Filmstrip Thumbnails */}
          {allPhotos.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl flex items-center justify-center gap-2 pt-3 overflow-x-auto py-1"
            >
              {allPhotos.map((thumbUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative rounded-lg overflow-hidden border-2 aspect-video w-16 h-11 shrink-0 transition-all ${
                    idx === activePhotoIndex
                      ? 'border-blue-500 scale-105 shadow-md ring-2 ring-blue-500/30'
                      : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={thumbUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
