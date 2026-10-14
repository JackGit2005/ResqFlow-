import { UserRole } from '../types';
import { TabKey } from '../components/layout/Sidebar';

export const isTabPermittedForRole = (tab: TabKey, role: UserRole): boolean => {
  switch (role) {
    case 'Civilian':
      // Civilians can ONLY access citizen-facing hubs: requests, situational overview, public maps, shelters, transparency feed
      return ['civilian-portal', 'dashboard', 'map', 'shelters', 'public'].includes(tab);
    case 'Responder':
      // Responders can ONLY access assigned missions, tactical map, shelters, and overview
      return ['dashboard', 'incidents', 'map', 'shelters', 'public'].includes(tab);
    case 'Coordinator':
      // Coordinators can access all operational dispatch desks, but NOT administrative system settings
      return [
        'dashboard',
        'civilian-portal',
        'incidents',
        'resources',
        'allocation',
        'shelters',
        'map',
        'public',
        'analytics',
        'simulation'
      ].includes(tab);
    case 'Administrator':
      // Administrators have unrestricted governance
      return true;
    default:
      return ['civilian-portal', 'public'].includes(tab);
  }
};

export const getDefaultTabForRole = (role: UserRole): TabKey => {
  switch (role) {
    case 'Civilian':
      return 'civilian-portal';
    case 'Responder':
      return 'incidents';
    case 'Coordinator':
    case 'Administrator':
      return 'dashboard';
  }
};
