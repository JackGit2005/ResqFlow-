import { Incident, ResourceItem, Shelter, AppSettings, UserSession, CivilianRequest } from '../types';
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_USER_SESSION
} from '../data/initialData';
import { AuthService } from './authService';

// Live operational data keys - separated from demo/drill archives
const STORAGE_KEYS = {
  LIVE_INCIDENTS: 'resqflow_live_incidents_v3',
  LIVE_RESOURCES: 'resqflow_live_resources_v3',
  LIVE_SHELTERS: 'resqflow_live_shelters_v3',
  LIVE_REQUESTS: 'resqflow_live_requests_v3',
  SETTINGS: 'resqflow_ballari_settings_v3',
  SESSION: 'resqflow_ballari_session_v3',
  LAST_CHANGE: 'resqflow_ballari_last_change_v3',
  DRILL_ARCHIVE: 'resqflow_drill_archive_v3'
};

const memoryStore: Record<string, string> = {};

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch {
      // ignore
    }
    return memoryStore[key] || null;
  },
  setItem: (key: string, val: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, val);
      }
    } catch {
      // ignore
    }
    memoryStore[key] = val;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
    delete memoryStore[key];
  }
};

export class StorageService {
  /**
   * Retrieves genuine operational incidents.
   * Requirement 10: Initial state MUST be 0 incidents.
   * Never preloads hardcoded demo incidents into live operational storage.
   */
  static getIncidents(): Incident[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.LIVE_INCIDENTS);
      if (!data) {
        // Honest zero-data start
        return [];
      }
      const parsed: Incident[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static saveIncidents(incidents: Incident[]): void {
    safeStorage.setItem(STORAGE_KEYS.LIVE_INCIDENTS, JSON.stringify(incidents));
    this.recordDataChange();
  }

  /**
   * Retrieves genuine operational resource inventory.
   * Requirement 10: Initial state MUST be 0 resources until genuine records are added.
   */
  static getResources(): ResourceItem[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.LIVE_RESOURCES);
      if (!data) {
        return [];
      }
      const parsed: ResourceItem[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static saveResources(resources: ResourceItem[]): void {
    safeStorage.setItem(STORAGE_KEYS.LIVE_RESOURCES, JSON.stringify(resources));
    this.recordDataChange();
  }

  /**
   * Retrieves genuine operational relief shelters.
   * Requirement 10: Initial state MUST be 0 shelters until entered.
   */
  static getShelters(): Shelter[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.LIVE_SHELTERS);
      if (!data) {
        return [];
      }
      const parsed: Shelter[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static saveShelters(shelters: Shelter[]): void {
    safeStorage.setItem(STORAGE_KEYS.LIVE_SHELTERS, JSON.stringify(shelters));
    this.recordDataChange();
  }

  /**
   * Retrieves genuine civilian requests.
   * Requirement 10: Initial state MUST be 0 requests.
   */
  static getCivilianRequests(): CivilianRequest[] {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.LIVE_REQUESTS);
      if (!data) {
        return [];
      }
      const parsed: CivilianRequest[] = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static saveCivilianRequests(requests: CivilianRequest[]): void {
    safeStorage.setItem(STORAGE_KEYS.LIVE_REQUESTS, JSON.stringify(requests));
    this.recordDataChange();
  }

  static getSettings(): AppSettings {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_APP_SETTINGS;
      return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_APP_SETTINGS;
    }
  }

  static saveSettings(settings: AppSettings): void {
    safeStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static getSession(): UserSession {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.SESSION);
      if (!data) return DEFAULT_USER_SESSION;
      const parsed = JSON.parse(data);
      return AuthService.validateAndSanitizeSession(parsed);
    } catch {
      return DEFAULT_USER_SESSION;
    }
  }

  static saveSession(session: UserSession): void {
    safeStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }

  static recordDataChange(): void {
    const timestamp = new Date().toISOString();
    safeStorage.setItem(STORAGE_KEYS.LAST_CHANGE, timestamp);
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('resqflow-data-changed', { detail: { timestamp } }));
    }
  }

  static getLastChange(): string {
    return safeStorage.getItem(STORAGE_KEYS.LAST_CHANGE) || new Date().toISOString();
  }

  /**
   * Clear operational records safely without resetting user settings or credentials.
   */
  static clearLiveOperationalRecords(): void {
    safeStorage.setItem(STORAGE_KEYS.LIVE_INCIDENTS, JSON.stringify([]));
    safeStorage.setItem(STORAGE_KEYS.LIVE_RESOURCES, JSON.stringify([]));
    safeStorage.setItem(STORAGE_KEYS.LIVE_SHELTERS, JSON.stringify([]));
    safeStorage.setItem(STORAGE_KEYS.LIVE_REQUESTS, JSON.stringify([]));
    this.recordDataChange();
  }

  static resetToDefault(): void {
    this.clearLiveOperationalRecords();
    this.saveSettings(DEFAULT_APP_SETTINGS);
    this.recordDataChange();
  }
}
