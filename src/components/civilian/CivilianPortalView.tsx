import React, { useState } from 'react';
import {
  LifeBuoy,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  MapPin,
  Truck,
  Phone,
  Home,
  ShieldCheck,
  ChevronRight,
  Filter,
  Search,
  AlertOctagon,
  XCircle,
  ArrowRight,
  Camera
} from 'lucide-react';
import { CivilianRequest, UserRole, ResourceItem, Shelter, RequestStatus } from '../../types';

interface CivilianPortalViewProps {
  userRole: UserRole;
  requests: CivilianRequest[];
  resources: ResourceItem[];
  shelters: Shelter[];
  civilianId?: string;
  onOpenNewRequestModal: () => void;
  onUpdateCivilianRequestStatus: (
    requestId: string,
    newStatus: RequestStatus,
    note?: string,
    assignedResourceId?: string,
    responderName?: string
  ) => void;
}

export const CivilianPortalView: React.FC<CivilianPortalViewProps> = ({
  userRole,
  requests,
  resources,
  shelters,
  civilianId,
  onOpenNewRequestModal,
  onUpdateCivilianRequestStatus
}) => {
  const [selectedRequest, setSelectedRequest] = useState<CivilianRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'my-requests' | 'shelters' | 'guidelines'>('my-requests');
  const [coordinatorActionReq, setCoordinatorActionReq] = useState<CivilianRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'assign' | 'complete' | null>(null);
  const [coordinatorNote, setCoordinatorNote] = useState('');
  const [selectedResId, setSelectedResId] = useState('');
  const [selectedResponder, setSelectedResponder] = useState('SDRF Unit Lead Mallikarjun');

  const isCivilian = userRole === 'Civilian';
  const isCoordinator = userRole === 'Coordinator' || userRole === 'Administrator';
  const isResponder = userRole === 'Responder';

  // Scope civilian requests strictly to the authenticated civilian's account per security requirement 11
  const scopedRequests = isCivilian
    ? requests.filter((r) => Boolean(civilianId) && r.civilianId === civilianId)
    : requests;

  // Available resources to assign
  const availableResources = resources.filter((r) => r.availableQuantity > 0);

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'Pending Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Approved':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Progress':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleCoordinatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordinatorActionReq || !actionType) return;

    if (actionType === 'approve') {
      onUpdateCivilianRequestStatus(
        coordinatorActionReq.id,
        'Approved',
        coordinatorNote || 'Approved by District Emergency Coordinator.'
      );
    } else if (actionType === 'reject') {
      onUpdateCivilianRequestStatus(
        coordinatorActionReq.id,
        'Rejected',
        coordinatorNote || 'Unable to fulfill at this moment due to localized constraints.'
      );
    } else if (actionType === 'assign') {
      const res = resources.find((r) => r.id === selectedResId);
      onUpdateCivilianRequestStatus(
        coordinatorActionReq.id,
        'In Progress',
        `Assigned ${res?.name || 'Response Unit'} to mission. ${coordinatorNote}`,
        selectedResId,
        selectedResponder
      );
    } else if (actionType === 'complete') {
      onUpdateCivilianRequestStatus(
        coordinatorActionReq.id,
        'Completed',
        coordinatorNote || 'Assistance successfully delivered and verified.'
      );
    }

    setCoordinatorActionReq(null);
    setActionType(null);
    setCoordinatorNote('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              {isCivilian ? 'Community Assistance Portal' : 'Civilian Assistance Coordination Desk'}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Ballari District Authority</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {isCivilian
              ? 'Request Emergency Relief & Track Live Assistance'
              : 'Civilian Emergency Requests Triage & Dispatch Desk'}
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            {isCivilian
              ? 'Citizens can request medical assistance, water tankers, dry food ration kits, flood evacuation, and shelter accommodation.'
              : 'Review incoming citizen requests, verify urgency, assign available fleets, and dispatch responders.'}
          </p>
        </div>

        <button
          onClick={onOpenNewRequestModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Request Emergency Aid
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('my-requests')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'my-requests'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {isCivilian ? 'My Assistance Requests' : 'All Civilian Requests'} ({scopedRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('shelters')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'shelters'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Public Emergency Shelters ({shelters.length})
        </button>

        <button
          onClick={() => setActiveTab('guidelines')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'guidelines'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Emergency Guidance & 112 Protocol
        </button>
      </div>

      {activeTab === 'my-requests' && (
        <div className="space-y-4">
          {/* Privacy Scoping Banner for Civilians */}
          {isCivilian && (
            <div className="flex items-center justify-between text-xs text-blue-900 bg-blue-50 border border-blue-200 p-3 rounded-xl shadow-2xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Privacy Scoped View:</strong> Displaying only your personal assistance requests ({scopedRequests.length}).
                  Other citizens' private records and phone numbers are protected from public access.
                </span>
              </div>
            </div>
          )}

          {scopedRequests.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <LifeBuoy className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-semibold text-slate-800 text-sm">No assistance requests on file for your account</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                If you or your family require emergency aid, click &quot;Request Emergency Aid&quot; above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scopedRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono font-semibold text-blue-600">{req.id}</span>
                          <span>·</span>
                          <span>{req.category}</span>
                          <span>·</span>
                          <span
                            className={`font-semibold ${
                              req.urgency === 'Critical'
                                ? 'text-red-600'
                                : req.urgency === 'High'
                                ? 'text-orange-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {req.urgency} Urgency
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">
                          {req.peopleCount} {req.peopleCount === 1 ? 'person' : 'people'} in {req.area}
                        </h3>
                      </div>

                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {req.description}
                    </p>

                    {/* Location & Details */}
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{req.locationName}</span>
                      </div>
                      {req.specialNeeds && (
                        <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200/60">
                          <strong>Special Requirement:</strong> {req.specialNeeds}
                        </div>
                      )}
                      {req.assignedResponderName && (
                        <div className="flex items-center gap-1.5 text-blue-700 font-medium pt-1">
                          <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Assigned Team: {req.assignedResponderName}</span>
                        </div>
                      )}
                      {req.attachmentUrl && (
                        <div className="pt-1.5 flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5 text-slate-400" /> Attached Photo Evidence:
                          </span>
                          <a
                            href={req.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-600 hover:underline font-medium"
                          >
                            View Evidence Image
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-slate-400">
                      Filed {new Date(req.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                      >
                        Track Timeline
                      </button>

                      {/* Coordinator action trigger */}
                      {isCoordinator && req.status === 'Pending Review' && (
                        <button
                          onClick={() => {
                            setCoordinatorActionReq(req);
                            setActionType('approve');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                        >
                          Review & Approve
                        </button>
                      )}

                      {isCoordinator && req.status === 'Approved' && (
                        <button
                          onClick={() => {
                            setCoordinatorActionReq(req);
                            setActionType('assign');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                        >
                          Assign Resource
                        </button>
                      )}

                      {(isCoordinator || isResponder) && (req.status === 'In Progress' || req.status === 'Approved') && (
                        <button
                          onClick={() => {
                            setCoordinatorActionReq(req);
                            setActionType('complete');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Shelters Public Directory Tab */}
      {activeTab === 'shelters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shelters.map((s) => {
            const freeBeds = s.totalCapacity - s.currentOccupancy;
            return (
              <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                    <p className="text-xs text-slate-500">{s.address} ({s.area})</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {freeBeds} beds available
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>Capacity: {s.currentOccupancy} / {s.totalCapacity} occupants</div>
                  <div className="flex items-center gap-1.5 text-blue-700">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contact: {s.contactPerson} (<a href={`tel:${s.contactPhone}`} className="underline">{s.contactPhone}</a>)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guidelines Tab */}
      {activeTab === 'guidelines' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 max-w-2xl text-xs text-slate-700 leading-relaxed">
          <h3 className="font-bold text-slate-900 text-sm">Disaster Preparedness & 112 Emergency Protocol</h3>
          <p>
            The ResQFlow Civilian Portal coordinates humanitarian aid for Ballari residents during floods, fires, structural collapses, and industrial emergencies.
          </p>
          <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-100 space-y-1 text-blue-900">
            <strong>Key Emergency Contacts:</strong>
            <div>• <strong>112</strong>: National Emergency Helpline (Immediate Life Danger)</div>
            <div>• <strong>108</strong>: EMRI Ambulance Service</div>
            <div>• <strong>101</strong>: Fire and Rescue Control</div>
            <div>• <strong>08392-277100 / 1077</strong>: Ballari District Disaster Control Room</div>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs text-blue-600 font-bold">{selectedRequest.id}</span>
                <h3 className="font-bold text-slate-900 text-sm">Request Operational Timeline</h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pl-2 border-l-2 border-blue-500 ml-2">
              {selectedRequest.timeline.map((item, idx) => (
                <div key={idx} className="relative pl-4 pb-2">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-800">{item.actor}</span>
                    <span className="font-mono">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5">{item.action}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coordinator Review & Resource Assignment Modal */}
      {coordinatorActionReq && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {actionType === 'approve'
                ? 'Approve Assistance Request'
                : actionType === 'assign'
                ? 'Assign Response Fleet & Responder'
                : actionType === 'complete'
                ? 'Confirm Mission Completion'
                : 'Reject Request'}
            </h3>

            <form onSubmit={handleCoordinatorSubmit} className="space-y-3 text-xs">
              {actionType === 'assign' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Select Available Fleet *</label>
                    <select
                      value={selectedResId}
                      onChange={(e) => setSelectedResId(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                    >
                      <option value="">-- Choose resource from Ballari inventory --</option>
                      {availableResources.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.availableQuantity} {r.unit} available)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Designated Responder Lead</label>
                    <input
                      type="text"
                      value={selectedResponder}
                      onChange={(e) => setSelectedResponder(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Operational Note / Log Entry
                </label>
                <textarea
                  rows={2}
                  value={coordinatorNote}
                  onChange={(e) => setCoordinatorNote(e.target.value)}
                  placeholder="Add notes for the civilian and dispatch record..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCoordinatorActionReq(null);
                    setActionType(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded-lg text-white font-semibold text-xs transition-colors ${
                    actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Confirm Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
