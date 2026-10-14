import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ToastProvider, useToast } from './components/common/Toast';
import { EmergencyBanner } from './components/layout/EmergencyBanner';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TabKey } from './components/layout/Sidebar';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { CivilianPortalView } from './components/civilian/CivilianPortalView';
import { CivilianRequestModal } from './components/civilian/CivilianRequestModal';
import { IncidentListView } from './components/incidents/IncidentListView';
import { IncidentDetailModal } from './components/incidents/IncidentDetailModal';
import { NewIncidentModal } from './components/incidents/NewIncidentModal';
import { ResourceListView } from './components/resources/ResourceListView';
import { NewResourceModal } from './components/resources/NewResourceModal';
import { EmergencyMapView } from './components/map/EmergencyMapView';
import { AllocationView } from './components/allocation/AllocationView';
import { ShelterListView } from './components/shelters/ShelterListView';
import { NewShelterModal } from './components/shelters/NewShelterModal';
import { PublicReportingView } from './components/public/PublicReportingView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SimulationView } from './components/simulation/SimulationView';
import { SettingsView } from './components/settings/SettingsView';
import { ResQAIChatbot } from './components/chatbot/ResQAIChatbot';
import { AuthModal } from './components/auth/AuthModal';

// Services and Initial Data
import { StorageService } from './services/storage';
import { AuthService } from './services/authService';
import { SupabaseService } from './services/supabaseService';
import { BALLARI_HOSPITALS } from './data/initialData';
import {
  Incident,
  ResourceItem,
  Shelter,
  Hospital,
  IncidentStatus,
  UserRole,
  UserSession,
  AppSettings,
  SimulationScenario,
  CivilianRequest,
  RequestStatus
} from './types';

import { isTabPermittedForRole, getDefaultTabForRole } from './services/permissionService';

const MainAppContent: React.FC = () => {
  const { showToast } = useToast();

  // Authentication & Session State (Default strictly Civilian per security requirement 3 & 10)
  const [session, setSession] = useState<UserSession>(() => StorageService.getSession());
  const currentRole: UserRole = session.role;

  // State Management
  const [incidents, setIncidents] = useState<Incident[]>(() => StorageService.getIncidents());
  const [resources, setResources] = useState<ResourceItem[]>(() => StorageService.getResources());
  const [shelters, setShelters] = useState<Shelter[]>(() => StorageService.getShelters());
  const [civilianRequests, setCivilianRequests] = useState<CivilianRequest[]>(() =>
    StorageService.getCivilianRequests()
  );
  const [hospitals] = useState<Hospital[]>(BALLARI_HOSPITALS);
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [lastDataChange, setLastDataChange] = useState<string>(() => StorageService.getLastChange());

  // Active Tab with Role Guard
  const [activeTab, setActiveTab] = useState<TabKey>(() => getDefaultTabForRole(session.role));

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isNewIncidentModalOpen, setIsNewIncidentModalOpen] = useState(false);
  const [isNewResourceModalOpen, setIsNewResourceModalOpen] = useState(false);
  const [isNewShelterModalOpen, setIsNewShelterModalOpen] = useState(false);
  const [isNewCivilianRequestModalOpen, setIsNewCivilianRequestModalOpen] = useState(false);
  const [allocationTargetIncident, setAllocationTargetIncident] = useState<Incident | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Tab Selection with Strict Server/Client RBAC Route Guard (Requirement 8)
  const handleSelectTab = useCallback(
    (targetTab: TabKey) => {
      if (!isTabPermittedForRole(targetTab, currentRole)) {
        const fallback = getDefaultTabForRole(currentRole);
        showToast(
          `Access Denied: Your assigned role (${currentRole}) does not have clearance for ${targetTab}. Redirected to ${fallback}.`,
          'error'
        );
        setActiveTab(fallback);
        return;
      }
      setActiveTab(targetTab);
    },
    [currentRole, showToast]
  );

  // Auto-Redirect if user is currently on an unauthorized tab
  useEffect(() => {
    if (!isTabPermittedForRole(activeTab, currentRole)) {
      const fallback = getDefaultTabForRole(currentRole);
      setActiveTab(fallback);
    }
  }, [currentRole, activeTab]);

  // Session Change Handler (Triggered via AuthModal only)
  const handleSessionChange = useCallback(
    (newSession: UserSession) => {
      setSession(newSession);
      const fallback = getDefaultTabForRole(newSession.role);
      setActiveTab(fallback);
      showToast(
        `Session authenticated as ${newSession.name} (${newSession.role}). Privileges updated.`,
        'success'
      );
    },
    [showToast]
  );

  useEffect(() => {
    const handleDataChanged = (e: any) => {
      setLastDataChange(e.detail?.timestamp || new Date().toISOString());
    };
    window.addEventListener('resqflow-data-changed', handleDataChanged);
    return () => window.removeEventListener('resqflow-data-changed', handleDataChanged);
  }, []);

  // Supabase Database Sync on Mount / Session Change
  useEffect(() => {
    let isMounted = true;
    const syncWithSupabase = async () => {
      if (!SupabaseService.isConfigured()) return;
      try {
        const remoteIncidents = await SupabaseService.fetchIncidents();
        if (isMounted && remoteIncidents !== null) {
          setIncidents(remoteIncidents);
          StorageService.saveIncidents(remoteIncidents);
        }
        const remoteRequests = await SupabaseService.fetchCivilianRequests(session.civilianId, session.role);
        if (isMounted && remoteRequests !== null) {
          setCivilianRequests(remoteRequests);
          StorageService.saveCivilianRequests(remoteRequests);
        }
      } catch (err) {
        console.warn('Supabase initial synchronization notice:', err);
      }
    };
    syncWithSupabase();
    return () => {
      isMounted = false;
    };
  }, [session.civilianId, session.role]);

  // 1. CIVILIAN REQUEST HANDLERS
  const handleCreateCivilianRequest = useCallback(
    async (reqData: Omit<CivilianRequest, 'id' | 'submittedAt' | 'updatedAt' | 'timeline' | 'status'>) => {
      const generatedId = `REQ-2026-${String(Math.floor(Math.random() * 900 + 100))}`;
      const now = new Date().toISOString();
      const newRequest: CivilianRequest = {
        ...reqData,
        id: generatedId,
        status: 'Pending Review',
        submittedAt: now,
        updatedAt: now,
        timeline: [
          {
            timestamp: now,
            action: `Assistance request filed for ${reqData.peopleCount} ${
              reqData.peopleCount === 1 ? 'person' : 'people'
            } (${reqData.urgency} Urgency)`,
            actor: reqData.civilianName
          }
        ]
      };

      // Requirement 10: Validate and save to Supabase. Only confirm and increment count after database confirms success.
      const saveResult = await SupabaseService.saveCivilianRequest(newRequest);
      if (!saveResult.success) {
        showToast(
          `Submission Failed: ${saveResult.error || 'Database rejected record'}. Count not incremented.`,
          'error'
        );
        return;
      }

      // Confirmed database persistence: update state and local store
      const updated = [newRequest, ...civilianRequests];
      setCivilianRequests(updated);
      StorageService.saveCivilianRequests(updated);
      showToast(
        `Assistance request ${generatedId} saved to database. Ballari DDMA desk alerted.`,
        'success'
      );
    },
    [civilianRequests, showToast]
  );

  const handleUpdateCivilianRequestStatus = useCallback(
    (
      requestId: string,
      newStatus: RequestStatus,
      note?: string,
      assignedResourceId?: string,
      responderName?: string
    ) => {
      // Permission check: Civilians cannot update request statuses (Requirement 4 & 10)
      if (currentRole === 'Civilian') {
        showToast('Access Denied: Civilians cannot approve, reject, or assign requests.', 'error');
        return;
      }

      // Responders can only complete missions
      if (currentRole === 'Responder' && newStatus !== 'Completed') {
        showToast('Responders can only mark assigned missions as Completed.', 'warning');
        return;
      }

      const now = new Date().toISOString();
      const updated = civilianRequests.map((req) => {
        if (req.id === requestId) {
          const actionText =
            newStatus === 'Approved'
              ? `Request approved by Coordinator. ${note || ''}`
              : newStatus === 'In Progress'
              ? `Mission dispatched: ${responderName || 'Responder unit assigned'}. ${note || ''}`
              : newStatus === 'Completed'
              ? `Mission completed and verified. ${note || ''}`
              : `Request marked ${newStatus}. ${note || ''}`;

          return {
            ...req,
            status: newStatus,
            coordinatorNotes: note || req.coordinatorNotes,
            assignedResourceId: assignedResourceId || req.assignedResourceId,
            assignedResponderName: responderName || req.assignedResponderName,
            updatedAt: now,
            timeline: [
              {
                timestamp: now,
                action: actionText.trim(),
                actor: currentRole
              },
              ...req.timeline
            ]
          };
        }
        return req;
      });

      setCivilianRequests(updated);
      StorageService.saveCivilianRequests(updated);
      showToast(`Request ${requestId} status updated to ${newStatus}.`, 'info');
    },
    [civilianRequests, currentRole, showToast]
  );

  // 2. INCIDENT HANDLERS
  const handleCreateIncident = useCallback(
    async (newIncData: Omit<Incident, 'id' | 'reportedAt' | 'timeline' | 'assignedResourceIds'>) => {
      const generatedId = `INC-2026-${String(Math.floor(Math.random() * 900 + 100))}`;
      const now = new Date().toISOString();

      // Civilians reports are always flagged as public citizen reports with Open status
      const isPublic = currentRole === 'Civilian' ? true : Boolean(newIncData.isPublicReport);

      const newIncident: Incident = {
        ...newIncData,
        id: generatedId,
        reportedAt: now,
        isPublicReport: isPublic,
        status: 'Open',
        assignedResourceIds: [],
        timeline: [
          {
            timestamp: now,
            action: isPublic
              ? 'Public emergency report submitted by citizen, routed to DDMA triage queue'
              : 'Incident logged via DDMA internal control desk',
            user: session.name || currentRole
          }
        ]
      };

      // Requirement 10: Validate and save to Supabase. Only confirm and increment count after database confirms success.
      const saveResult = await SupabaseService.saveIncident(newIncident);
      if (!saveResult.success) {
        showToast(
          `Submission Failed: ${saveResult.error || 'Database connection failure'}. Record not added.`,
          'error'
        );
        return;
      }

      const updated = [newIncident, ...incidents];
      setIncidents(updated);
      StorageService.saveIncidents(updated);
      showToast(`Incident ${generatedId} logged and saved successfully into Ballari control room.`, 'success');
    },
    [incidents, currentRole, session.name, showToast]
  );

  const handleUpdateIncidentStatus = useCallback(
    (incidentId: string, newStatus: IncidentStatus) => {
      // Permission check: Civilians cannot update incident status (Requirement 4)
      if (currentRole === 'Civilian') {
        showToast('Access Denied: Civilians cannot update incident operational status.', 'error');
        return;
      }

      // Responders can only advance status to In Progress or Resolved
      if (currentRole === 'Responder' && newStatus !== 'In Progress' && newStatus !== 'Resolved') {
        showToast('Responders can only update mission status to In Progress or Resolved.', 'warning');
        return;
      }

      const updated = incidents.map((inc) => {
        if (inc.id === incidentId) {
          const now = new Date().toISOString();
          return {
            ...inc,
            status: newStatus,
            resolvedAt: newStatus === 'Resolved' ? now : inc.resolvedAt,
            timeline: [
              {
                timestamp: now,
                action: `Operational status updated to ${newStatus}`,
                user: currentRole
              },
              ...inc.timeline
            ]
          };
        }
        return inc;
      });

      setIncidents(updated);
      StorageService.saveIncidents(updated);

      if (selectedIncident && selectedIncident.id === incidentId) {
        setSelectedIncident(updated.find((i) => i.id === incidentId) || null);
      }

      showToast(`Incident status updated to ${newStatus}.`, 'info');
    },
    [incidents, currentRole, selectedIncident, showToast]
  );

  const handleAddTimelineEntry = useCallback(
    (incidentId: string, action: string) => {
      if (currentRole === 'Civilian') {
        showToast('Access Denied: Only authorized responders or coordinators can log dispatch updates.', 'error');
        return;
      }

      const now = new Date().toISOString();
      const updated = incidents.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            timeline: [
              {
                timestamp: now,
                action,
                user: currentRole
              },
              ...inc.timeline
            ]
          };
        }
        return inc;
      });

      setIncidents(updated);
      StorageService.saveIncidents(updated);

      if (selectedIncident && selectedIncident.id === incidentId) {
        setSelectedIncident(updated.find((i) => i.id === incidentId) || null);
      }

      showToast('Timeline log appended.', 'success');
    },
    [incidents, currentRole, selectedIncident, showToast]
  );

  const handleAddPhotoToIncident = useCallback(
    (incidentId: string, photoUrl: string) => {
      const now = new Date().toISOString();
      const updated = incidents.map((inc) => {
        if (inc.id === incidentId) {
          const existingPhotos = inc.photos || [];
          return {
            ...inc,
            photos: [...existingPhotos, photoUrl],
            timeline: [
              {
                timestamp: now,
                action: `Attached new field photo evidence to record`,
                user: currentRole
              },
              ...inc.timeline
            ]
          };
        }
        return inc;
      });

      setIncidents(updated);
      StorageService.saveIncidents(updated);

      if (selectedIncident && selectedIncident.id === incidentId) {
        setSelectedIncident(updated.find((i) => i.id === incidentId) || null);
      }

      showToast('New photo evidence saved to incident.', 'success');
    },
    [incidents, currentRole, selectedIncident, showToast]
  );

  // 3. RESOURCE ALLOCATION COMMIT HANDLER (Coordinator & Administrator Only)
  const handleCommitAllocation = useCallback(
    (incidentId: string, allocations: { resourceId: string; quantity: number }[]) => {
      if (currentRole !== 'Coordinator' && currentRole !== 'Administrator') {
        showToast(
          'Access Denied: Resource allocation requires Coordinator or Administrator authorization.',
          'error'
        );
        return;
      }

      if (allocations.length === 0) return;

      const now = new Date().toISOString();
      const allocatedResourceNames: string[] = [];

      const updatedResources = resources.map((res) => {
        const match = allocations.find((a) => a.resourceId === res.id);
        if (match) {
          const deployQty = match.quantity;
          const newAvail = Math.max(0, res.availableQuantity - deployQty);
          allocatedResourceNames.push(`${res.name} (${deployQty} ${res.unit})`);
          return {
            ...res,
            availableQuantity: newAvail,
            status: newAvail === 0 ? ('Deployed' as const) : res.status,
            assignedIncidentIds: Array.from(new Set([...res.assignedIncidentIds, incidentId])),
            lastUpdated: now
          };
        }
        return res;
      });

      const updatedIncidents = incidents.map((inc) => {
        if (inc.id === incidentId) {
          const newAssignedIds = Array.from(
            new Set([...inc.assignedResourceIds, ...allocations.map((a) => a.resourceId)])
          );
          return {
            ...inc,
            assignedResourceIds: newAssignedIds,
            status: inc.status === 'Open' ? ('Assigned' as const) : inc.status,
            timeline: [
              {
                timestamp: now,
                action: `Smart Allocation executed: ${allocatedResourceNames.join(', ')} dispatched`,
                user: `${currentRole} (Heuristic Engine)`
              },
              ...inc.timeline
            ]
          };
        }
        return inc;
      });

      setResources(updatedResources);
      setIncidents(updatedIncidents);
      StorageService.saveResources(updatedResources);
      StorageService.saveIncidents(updatedIncidents);

      showToast(
        `Successfully allocated ${allocations.length} resource packages to incident ${incidentId}.`,
        'success'
      );
    },
    [resources, incidents, currentRole, showToast]
  );

  // 4. RELEASE RESOURCE HANDLER (Coordinator & Administrator Only)
  const handleReleaseResource = useCallback(
    (incidentId: string, resourceId: string) => {
      if (currentRole !== 'Coordinator' && currentRole !== 'Administrator') {
        showToast('Access Denied: Only Coordinators and Administrators can release deployed units.', 'error');
        return;
      }

      const now = new Date().toISOString();
      let releasedResName = '';

      const updatedResources = resources.map((res) => {
        if (res.id === resourceId) {
          releasedResName = res.name;
          const returnedAvail = Math.min(res.totalQuantity, res.availableQuantity + 1);
          return {
            ...res,
            availableQuantity: returnedAvail,
            status: 'Ready' as const,
            assignedIncidentIds: res.assignedIncidentIds.filter((id) => id !== incidentId),
            lastUpdated: now
          };
        }
        return res;
      });

      const updatedIncidents = incidents.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            assignedResourceIds: inc.assignedResourceIds.filter((id) => id !== resourceId),
            timeline: [
              {
                timestamp: now,
                action: `Unit stood down and returned to base: ${releasedResName || resourceId}`,
                user: currentRole
              },
              ...inc.timeline
            ]
          };
        }
        return inc;
      });

      setResources(updatedResources);
      setIncidents(updatedIncidents);
      StorageService.saveResources(updatedResources);
      StorageService.saveIncidents(updatedIncidents);

      if (selectedIncident && selectedIncident.id === incidentId) {
        setSelectedIncident(updatedIncidents.find((i) => i.id === incidentId) || null);
      }

      showToast(`Released unit back to base depot.`, 'info');
    },
    [resources, incidents, currentRole, selectedIncident, showToast]
  );

  // 5. RESOURCE CRUD & QUANTITY (Coordinator & Administrator Only)
  const handleCreateResource = useCallback(
    (newResData: Omit<ResourceItem, 'id' | 'assignedIncidentIds' | 'lastUpdated'>) => {
      if (currentRole !== 'Coordinator' && currentRole !== 'Administrator') {
        showToast('Access Denied: Resource registration is restricted to authorized staff.', 'error');
        return;
      }

      const generatedId = `RES-${String(Math.floor(Math.random() * 900 + 100))}`;
      const now = new Date().toISOString();
      const newRes: ResourceItem = {
        ...newResData,
        id: generatedId,
        assignedIncidentIds: [],
        lastUpdated: now
      };

      const updated = [...resources, newRes];
      setResources(updated);
      StorageService.saveResources(updated);
      showToast(`Resource ${newRes.name} registered into inventory.`, 'success');
    },
    [resources, currentRole, showToast]
  );

  const handleUpdateResourceQuantity = useCallback(
    (resourceId: string, delta: number) => {
      if (currentRole !== 'Coordinator' && currentRole !== 'Administrator') {
        showToast('Access Denied: Inventory adjustments require coordinator clearance.', 'error');
        return;
      }

      const now = new Date().toISOString();
      const updated = resources.map((r) => {
        if (r.id === resourceId) {
          const newAvail = Math.max(0, Math.min(r.totalQuantity, r.availableQuantity + delta));
          return {
            ...r,
            availableQuantity: newAvail,
            status: newAvail === 0 ? ('Exhausted' as const) : ('Ready' as const),
            lastUpdated: now
          };
        }
        return r;
      });

      setResources(updated);
      StorageService.saveResources(updated);
      showToast('Resource quantity adjusted.', 'info');
    },
    [resources, currentRole, showToast]
  );

  const handleUpdateResourceStatus = useCallback(
    (resourceId: string, status: ResourceItem['status']) => {
      if (currentRole !== 'Coordinator' && currentRole !== 'Administrator') {
        showToast('Access Denied: Status changes require coordinator clearance.', 'error');
        return;
      }

      const now = new Date().toISOString();
      const updated = resources.map((r) => {
        if (r.id === resourceId) {
          return { ...r, status, lastUpdated: now };
        }
        return r;
      });

      setResources(updated);
      StorageService.saveResources(updated);
      showToast(`Resource status changed to ${status}.`, 'info');
    },
    [resources, currentRole, showToast]
  );

  // 6. SHELTER CRUD & OCCUPANCY (Coordinator & Administrator Only)
  const handleCreateShelter = useCallback(
    (newShelterData: Omit<Shelter, 'id' | 'status'>) => {
      if (currentRole !== 'Coordinator' && currentRole !== 'Administrator') {
        showToast('Access Denied: Creating relief shelters requires operational authorization.', 'error');
        return;
      }

      const generatedId = `SHL-${String(Math.floor(Math.random() * 90 + 10))}`;
      const newShelter: Shelter = {
        ...newShelterData,
        id: generatedId,
        status: newShelterData.currentOccupancy >= newShelterData.totalCapacity ? 'Full' : 'Active'
      };

      const updated = [...shelters, newShelter];
      setShelters(updated);
      StorageService.saveShelters(updated);
      showToast(`Relief Shelter ${newShelter.name} created successfully.`, 'success');
    },
    [shelters, currentRole, showToast]
  );

  const handleUpdateShelterOccupancy = useCallback(
    (shelterId: string, newOccupancy: number) => {
      if (currentRole !== 'Coordinator' && currentRole !== 'Administrator') {
        showToast('Access Denied: Occupancy management requires operational authorization.', 'error');
        return;
      }

      const updated = shelters.map((s) => {
        if (s.id === shelterId) {
          const boundedOccupancy = Math.max(0, Math.min(s.totalCapacity, newOccupancy));
          const status: Shelter['status'] =
            boundedOccupancy >= s.totalCapacity
              ? 'Full'
              : boundedOccupancy >= s.totalCapacity * 0.8
              ? 'Near Capacity'
              : 'Active';

          return {
            ...s,
            currentOccupancy: boundedOccupancy,
            status
          };
        }
        return s;
      });

      setShelters(updated);
      StorageService.saveShelters(updated);
      showToast('Shelter occupancy updated.', 'info');
    },
    [shelters, currentRole, showToast]
  );

  // 7. SIMULATION INJECTION (Coordinator & Administrator Only)
  const handleInjectSimulatedIncident = useCallback(
    (scenario: SimulationScenario) => {
      if (currentRole !== 'Coordinator' && currentRole !== 'Administrator') {
        showToast('Access Denied: Disaster simulation drills can only be initiated by authorized staff.', 'error');
        return;
      }

      const generatedId = `SIM-DRILL-${String(Math.floor(Math.random() * 900 + 100))}`;
      const now = new Date().toISOString();
      const drillIncident: Incident = {
        id: generatedId,
        title: `[DRILL] ${scenario.name}`,
        description: `Operational exercise scenario: ${scenario.description}. Projected casualties: ${scenario.estimatedCasualties}. Required ambulances: ${scenario.requiredAmbulances}, rescue teams: ${scenario.requiredRescueTeams}.`,
        incidentType: 'Flood / Waterlogging',
        locationName: scenario.affectedArea,
        area: scenario.affectedArea,
        latitude: 15.1482,
        longitude: 76.9288,
        severity: scenario.simulatedSeverity,
        status: 'Open',
        reportedAt: now,
        reporterName: 'Ballari DDMA Simulation Officer',
        reporterContact: 'Internal Drill Room',
        isPublicReport: false,
        assignedResourceIds: [],
        timeline: [
          {
            timestamp: now,
            action: `Disaster simulation drill injected into live command queue for training`,
            user: currentRole
          }
        ]
      };

      const updated = [drillIncident, ...incidents];
      setIncidents(updated);
      StorageService.saveIncidents(updated);
      handleSelectTab('allocation');
      setAllocationTargetIncident(drillIncident);
      showToast(`Drill Incident ${generatedId} injected! Allocation engine opened.`, 'warning');
    },
    [incidents, currentRole, handleSelectTab, showToast]
  );

  // 8. RESET DEMO DATA (Administrator Only)
  const handleResetDemoData = useCallback(() => {
    if (currentRole !== 'Administrator') {
      showToast('Access Denied: Resetting demo state requires Administrator privileges.', 'error');
      return;
    }

    StorageService.resetToDefault();
    setIncidents(StorageService.getIncidents());
    setResources(StorageService.getResources());
    setShelters(StorageService.getShelters());
    setCivilianRequests(StorageService.getCivilianRequests());
    setSettings(StorageService.getSettings());
    setLastDataChange(StorageService.getLastChange());
    showToast('Platform data reset to Ballari default baseline.', 'success');
  }, [currentRole, showToast]);

  const handleOpenAllocationForIncident = useCallback(
    (incident: Incident) => {
      if (currentRole !== 'Coordinator' && currentRole !== 'Administrator') {
        showToast('Access Denied: Resource allocation requires Coordinator clearance.', 'error');
        return;
      }
      setAllocationTargetIncident(incident);
      handleSelectTab('allocation');
    },
    [currentRole, handleSelectTab, showToast]
  );

  // Scoped metrics for sidebar badges
  const openIncidentsCount = incidents.filter((i) => i.status === 'Open').length;
  const availableResourcesCount = resources.filter((r) => r.availableQuantity > 0).length;

  const pendingRequestsCount = useMemo(() => {
    const list =
      currentRole === 'Civilian'
        ? civilianRequests.filter((r) => Boolean(session.civilianId) && r.civilianId === session.civilianId)
        : civilianRequests;
    return list.filter((r) => r.status === 'Pending Review' || r.status === 'Approved').length;
  }, [civilianRequests, currentRole, session.civilianId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 112 India Emergency Notice Banner */}
      <EmergencyBanner />

      {/* Primary White Navigation Bar (Role-switching dropdown removed; read-only role indicator) */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
        onOpenReportModal={() => setIsNewIncidentModalOpen(true)}
        currentRole={currentRole}
        userName={session.name}
        lastDataChange={lastDataChange}
        onOpenSettings={() => handleSelectTab('settings')}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Workspace: Sidebar + Body */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          openCount={openIncidentsCount}
          availableResourceCount={availableResourcesCount}
          civilianRequestCount={pendingRequestsCount}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          userRole={currentRole}
          userName={session.name}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Content View Container */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              userRole={currentRole}
              incidents={incidents}
              resources={resources}
              shelters={shelters}
              hospitals={hospitals}
              onNavigate={handleSelectTab}
              onOpenReportModal={() => setIsNewIncidentModalOpen(true)}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              lastDataChange={lastDataChange}
            />
          )}

          {activeTab === 'civilian-portal' && (
            <CivilianPortalView
              userRole={currentRole}
              requests={civilianRequests}
              resources={resources}
              shelters={shelters}
              civilianId={session.civilianId}
              onOpenNewRequestModal={() => setIsNewCivilianRequestModalOpen(true)}
              onUpdateCivilianRequestStatus={handleUpdateCivilianRequestStatus}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentListView
              userRole={currentRole}
              incidents={incidents}
              resources={resources}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              onOpenNewModal={() => setIsNewIncidentModalOpen(true)}
              onOpenAllocation={handleOpenAllocationForIncident}
              onQuickResolve={(id) => handleUpdateIncidentStatus(id, 'Resolved')}
            />
          )}

          {activeTab === 'resources' && (
            <ResourceListView
              userRole={currentRole}
              resources={resources}
              onOpenNewModal={() => setIsNewResourceModalOpen(true)}
              onUpdateQuantity={handleUpdateResourceQuantity}
              onUpdateStatus={handleUpdateResourceStatus}
            />
          )}

          {activeTab === 'map' && (
            <EmergencyMapView
              userRole={currentRole}
              incidents={incidents}
              resources={resources}
              shelters={shelters}
              hospitals={hospitals}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              onOpenAllocation={handleOpenAllocationForIncident}
            />
          )}

          {activeTab === 'allocation' && (
            <AllocationView
              incidents={incidents}
              resources={resources}
              preselectedIncident={allocationTargetIncident}
              onCommitAllocation={handleCommitAllocation}
              onViewIncidentDetails={(inc) => setSelectedIncident(inc)}
            />
          )}

          {activeTab === 'shelters' && (
            <ShelterListView
              userRole={currentRole}
              shelters={shelters}
              onOpenNewModal={() => setIsNewShelterModalOpen(true)}
              onUpdateOccupancy={handleUpdateShelterOccupancy}
              onViewOnMap={() => handleSelectTab('map')}
            />
          )}

          {activeTab === 'public' && (
            <PublicReportingView
              incidents={incidents}
              onSubmitPublicReport={handleCreateIncident}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              incidents={incidents}
              resources={resources}
              shelters={shelters}
            />
          )}

          {activeTab === 'simulation' && (
            <SimulationView
              resources={resources}
              shelters={shelters}
              onInjectSimulatedIncident={handleInjectSimulatedIncident}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={(s) => {
                setSettings(s);
                StorageService.saveSettings(s);
              }}
              onResetDemoData={handleResetDemoData}
              currentRole={currentRole}
            />
          )}
        </main>
      </div>

      {/* Incident Detail Modal */}
      <IncidentDetailModal
        userRole={currentRole}
        incident={selectedIncident}
        allResources={resources}
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
        onUpdateStatus={handleUpdateIncidentStatus}
        onAddTimelineEntry={handleAddTimelineEntry}
        onReleaseResource={handleReleaseResource}
        onOpenAllocation={handleOpenAllocationForIncident}
        onAddPhoto={handleAddPhotoToIncident}
      />

      {/* New Incident Modal */}
      <NewIncidentModal
        isOpen={isNewIncidentModalOpen}
        onClose={() => setIsNewIncidentModalOpen(false)}
        onSubmit={handleCreateIncident}
      />

      {/* New Resource Modal */}
      <NewResourceModal
        isOpen={isNewResourceModalOpen}
        onClose={() => setIsNewResourceModalOpen(false)}
        onSubmit={handleCreateResource}
      />

      {/* New Shelter Modal */}
      <NewShelterModal
        isOpen={isNewShelterModalOpen}
        onClose={() => setIsNewShelterModalOpen(false)}
        onSubmit={handleCreateShelter}
      />

      {/* Civilian Request Modal */}
      <CivilianRequestModal
        isOpen={isNewCivilianRequestModalOpen}
        onClose={() => setIsNewCivilianRequestModalOpen(false)}
        onSubmit={handleCreateCivilianRequest}
        defaultCivilianId={session.civilianId}
        defaultCivilianName={session.name}
        defaultPhone={session.phone}
      />

      {/* ResQAI Floating Chatbot */}
      <ResQAIChatbot
        isOpenExternal={isAssistantOpen}
        onCloseExternal={() => setIsAssistantOpen(false)}
      />

      {/* Auth & Identity Governance Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        session={session}
        onSessionChange={handleSessionChange}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
}
