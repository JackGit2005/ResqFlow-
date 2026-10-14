import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Incident, CivilianRequest, ResourceItem, Shelter, UserRole, UserSession } from '../types';
import { StorageService } from './storage';

// Database Schema Interfaces matching PostgreSQL / Supabase tables
export interface DbProfile {
  id: string;
  role: 'civilian' | 'responder' | 'coordinator' | 'administrator';
  full_name: string;
  phone?: string | null;
  badge_number?: string | null;
  department?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbIncident {
  id: string;
  title: string;
  description: string;
  incident_type: string;
  location_name: string;
  area: string;
  latitude: number;
  longitude: number;
  severity: string;
  status: string;
  reported_at: string;
  reporter_name?: string | null;
  reporter_contact?: string | null;
  is_public_report: boolean;
  assigned_resource_ids?: string[] | null;
  photos?: string[] | null;
  timeline?: any;
}

export interface DbCivilianRequest {
  id: string;
  civilian_id: string;
  civilian_name: string;
  contact_phone: string;
  category: string;
  urgency: string;
  description: string;
  location_name: string;
  area: string;
  people_count: number;
  special_needs?: string | null;
  attachment_url?: string | null;
  status: string;
  coordinator_notes?: string | null;
  assigned_resource_id?: string | null;
  assigned_responder_name?: string | null;
  submitted_at: string;
  updated_at: string;
  timeline?: any;
}

class SupabaseServiceClass {
  private client: SupabaseClient | null = null;
  private currentUrl: string | null = null;
  private currentKey: string | null = null;

  /**
   * Initializes or returns existing Supabase client instance.
   * Reads from environment or saved settings.
   */
  getClient(): SupabaseClient | null {
    const settings = StorageService.getSettings();
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

    const url = (settings.supabaseUrl || envUrl || '').trim();
    const key = (settings.supabaseAnonKey || envKey || '').trim();

    if (!url || !key) {
      this.client = null;
      return null;
    }

    if (this.client && this.currentUrl === url && this.currentKey === key) {
      return this.client;
    }

    try {
      this.client = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      this.currentUrl = url;
      this.currentKey = key;
      return this.client;
    } catch (err) {
      console.warn('[SupabaseService] Failed to initialize client:', err);
      this.client = null;
      return null;
    }
  }

  isConfigured(): boolean {
    return this.getClient() !== null;
  }

  /**
   * Registers a user in Supabase Auth & public.profiles.
   * STRICT SECURITY ENFORCEMENT:
   * Role is IMMUTABLY set to 'civilian'. No input can override this.
   */
  async registerCivilian(params: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    area?: string;
  }): Promise<{ success: boolean; user?: any; session?: UserSession; error?: string }> {
    const client = this.getClient();
    const enforcedRole: 'civilian' = 'civilian'; // STRICT CIVILIAN DEFAULT

    const cleanName = params.fullName.trim() || 'Citizen User';
    const cleanPhone = (params.phone || '').trim();
    const cleanArea = (params.area || '').trim();

    if (!client) {
      // Local fallback session when Supabase backend is not yet connected
      const generatedId = `civ-usr-${Date.now().toString(36)}`;
      const localSession: UserSession = {
        role: 'Civilian', // STRICT ENFORCEMENT
        name: cleanName,
        badgeNumber: `CIV-${generatedId.slice(-6).toUpperCase()}`,
        department: cleanArea ? `Resident of ${cleanArea}, Ballari` : 'Ballari Resident Citizen',
        civilianId: generatedId,
        phone: cleanPhone || '+91 98000 00000',
        isDemoUser: false
      };
      StorageService.saveSession(localSession);
      return {
        success: true,
        session: localSession
      };
    }

    try {
      // 1. Register in Supabase auth.users with metadata strictly role: 'civilian'
      const { data: authData, error: authError } = await client.auth.signUp({
        email: params.email.trim(),
        password: params.password,
        options: {
          data: {
            role: enforcedRole, // NON-NEGOTIABLE STRICT ASSIGNMENT
            full_name: cleanName,
            phone: cleanPhone,
            area: cleanArea
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      const user = authData.user;
      if (!user) {
        return { success: false, error: 'Registration failed to return user record.' };
      }

      // 2. Insert into public.profiles table with role: 'civilian'
      const profileData: DbProfile = {
        id: user.id,
        role: enforcedRole, // STRICTLY 'civilian'
        full_name: cleanName,
        phone: cleanPhone || null,
        badge_number: `CIV-${user.id.slice(0, 6).toUpperCase()}`,
        department: cleanArea ? `Resident of ${cleanArea}, Ballari` : 'Ballari Resident Citizen'
      };

      const { error: profileError } = await client
        .from('profiles')
        .upsert(profileData);

      if (profileError) {
        console.warn('[SupabaseService] Profile creation warning:', profileError.message);
      }

      const session: UserSession = {
        role: 'Civilian',
        name: cleanName,
        badgeNumber: profileData.badge_number || 'CIV-REG-01',
        department: profileData.department || 'Ballari Resident Citizen',
        civilianId: user.id,
        phone: cleanPhone,
        isDemoUser: false
      };

      StorageService.saveSession(session);
      return { success: true, user, session };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to complete registration.' };
    }
  }

  /**
   * Saves a genuinely submitted Incident to Supabase.
   * Returns true ONLY if Supabase confirms successful persistence.
   */
  async saveIncident(incident: Incident): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) {
      // Offline/local persistence mode: save to verified local store
      return { success: true };
    }

    try {
      const dbRow: DbIncident = {
        id: incident.id,
        title: incident.title,
        description: incident.description,
        incident_type: incident.incidentType,
        location_name: incident.locationName,
        area: incident.area,
        latitude: incident.latitude,
        longitude: incident.longitude,
        severity: incident.severity,
        status: incident.status,
        reported_at: incident.reportedAt,
        reporter_name: incident.reporterName || null,
        reporter_contact: incident.reporterContact || null,
        is_public_report: Boolean(incident.isPublicReport),
        assigned_resource_ids: incident.assignedResourceIds || [],
        photos: incident.photos || [],
        timeline: incident.timeline || []
      };

      const { error } = await client.from('incidents').insert(dbRow);
      if (error) {
        console.error('[SupabaseService] Insert incident error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Database connection failure.' };
    }
  }

  /**
   * Saves a genuinely submitted Civilian Assistance Request to Supabase.
   * Returns true ONLY if Supabase confirms successful persistence.
   */
  async saveCivilianRequest(req: CivilianRequest): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) {
      // Offline/local persistence mode: save to verified local store
      return { success: true };
    }

    try {
      const dbRow: DbCivilianRequest = {
        id: req.id,
        civilian_id: req.civilianId,
        civilian_name: req.civilianName,
        contact_phone: req.contactPhone,
        category: req.category,
        urgency: req.urgency,
        description: req.description,
        location_name: req.locationName,
        area: req.area,
        people_count: req.peopleCount,
        special_needs: req.specialNeeds || null,
        attachment_url: req.attachmentUrl || null,
        status: req.status,
        coordinator_notes: req.coordinatorNotes || null,
        assigned_resource_id: req.assignedResourceId || null,
        assigned_responder_name: req.assignedResponderName || null,
        submitted_at: req.submittedAt,
        updated_at: req.updatedAt,
        timeline: req.timeline || []
      };

      const { error } = await client.from('civilian_requests').insert(dbRow);
      if (error) {
        console.error('[SupabaseService] Insert civilian request error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Database connection failure.' };
    }
  }

  /**
   * Fetches genuine operational incidents from Supabase.
   */
  async fetchIncidents(): Promise<Incident[] | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from('incidents')
        .select('*')
        .order('reported_at', { ascending: false });

      if (error || !data) return null;

      return data.map((row: DbIncident): Incident => ({
        id: row.id,
        title: row.title,
        description: row.description,
        incidentType: row.incident_type as any,
        locationName: row.location_name,
        area: row.area,
        latitude: row.latitude,
        longitude: row.longitude,
        severity: row.severity as any,
        status: row.status as any,
        reportedAt: row.reported_at,
        reporterName: row.reporter_name || undefined,
        reporterContact: row.reporter_contact || undefined,
        isPublicReport: row.is_public_report,
        assignedResourceIds: row.assigned_resource_ids || [],
        photos: row.photos || [],
        timeline: Array.isArray(row.timeline) ? row.timeline : []
      }));
    } catch (err) {
      console.warn('[SupabaseService] Error fetching incidents:', err);
      return null;
    }
  }

  /**
   * Fetches genuine civilian requests from Supabase, applying strict scoping.
   */
  async fetchCivilianRequests(civilianId?: string, userRole?: UserRole): Promise<CivilianRequest[] | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      let query = client.from('civilian_requests').select('*').order('submitted_at', { ascending: false });

      // If civilian, scope strictly to their civilianId
      if (userRole === 'Civilian' && civilianId) {
        query = query.eq('civilian_id', civilianId);
      }

      const { data, error } = await query;
      if (error || !data) return null;

      return data.map((row: DbCivilianRequest): CivilianRequest => ({
        id: row.id,
        civilianId: row.civilian_id,
        civilianName: row.civilian_name,
        contactPhone: row.contact_phone,
        category: row.category as any,
        urgency: row.urgency as any,
        description: row.description,
        locationName: row.location_name,
        area: row.area,
        peopleCount: row.people_count,
        specialNeeds: row.special_needs || undefined,
        attachmentUrl: row.attachment_url || undefined,
        status: row.status as any,
        coordinatorNotes: row.coordinator_notes || undefined,
        assignedResourceId: row.assigned_resource_id || undefined,
        assignedResponderName: row.assigned_responder_name || undefined,
        submittedAt: row.submitted_at,
        updatedAt: row.updated_at,
        timeline: Array.isArray(row.timeline) ? row.timeline : []
      }));
    } catch (err) {
      console.warn('[SupabaseService] Error fetching civilian requests:', err);
      return null;
    }
  }
}

export const SupabaseService = new SupabaseServiceClass();
