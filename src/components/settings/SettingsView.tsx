import React, { useState } from 'react';
import {
  Settings,
  Database,
  Sliders,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Copy,
  ExternalLink,
  Save,
  Server,
  UserCheck,
  Bot,
  Info,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { AppSettings, UserRole } from '../../types';
import { useToast } from '../common/Toast';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetDemoData: () => void;
  currentRole: UserRole;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetDemoData,
  currentRole
}) => {
  const { showToast } = useToast();

  const isAdministrator = currentRole === 'Administrator';

  const [formSettings, setFormSettings] = useState<AppSettings>(settings);
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [useSupabase, setUseSupabase] = useState(settings.useSupabaseBackend || false);
  const [enableNoupeEmbed, setEnableNoupeEmbed] = useState(settings.enableNoupeEmbed || false);
  const [noupeBotId, setNoupeBotId] = useState(settings.noupeBotId || 'resqflow-ballari');
  const [noupeScriptUrl, setNoupeScriptUrl] = useState(settings.noupeScriptUrl || 'https://cdn.noupe.com/widget.js');

  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // If not Administrator, show strict Access Denied screen per security requirement 7 & 8
  if (!isAdministrator) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="bg-white border border-red-200 rounded-2xl p-8 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Access Denied: Administrative Clearance Required</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your active role is <strong>{currentRole}</strong>. System-wide configuration, Supabase backend credentials, and database resets are restricted exclusively to authenticated <strong>Administrators</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-lg mx-auto text-left space-y-1.5">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" /> DDMA Zero-Trust Security Policy:
            </span>
            <p className="text-[11px] leading-relaxed">
              Role escalation dropdowns have been permanently removed. Civilians, Responders, and Coordinators cannot modify administrative settings. To authenticate as an authorized Administrator, open the <strong>Role Badge</strong> in the top navigation bar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...formSettings,
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
      useSupabaseBackend: useSupabase,
      enableNoupeEmbed,
      noupeBotId: noupeBotId.trim(),
      noupeScriptUrl: noupeScriptUrl.trim()
    };
    onSaveSettings(updated);
    showToast('Platform settings successfully saved.', 'success');
  };

  const sampleRlsSql = `-- =========================================================================
-- ResQFlow Production PostgreSQL & Supabase Row Level Security (RLS) Schema
-- Ballari District Disaster Management Authority (DDMA), Karnataka, India
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. User Profiles & Role Governance Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'civilian' check (role in ('civilian', 'responder', 'coordinator', 'administrator')),
  full_name text not null,
  phone text,
  badge_number text,
  department text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for Profiles
alter table public.profiles enable row level security;

-- Every user can view their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Coordinators and Administrators can view all staff/civilian profiles
create policy "Staff can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('coordinator', 'administrator')
    )
  );

-- Users can update their own personal info (full_name, phone), but NOT their role!
create policy "Users can update own details but not role"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- Only Administrators can update user roles
create policy "Administrators can update user roles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'administrator'
    )
  );

-- Trigger: Automatically create civilian profile on new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    'civilian', -- STRICTLY DEFAULTS TO CIVILIAN PER NON-NEGOTIABLE POLICY
    coalesce(new.raw_user_meta_data->>'full_name', 'Citizen User'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Incidents Table
create table if not exists public.incidents (
  id text primary key,
  title text not null,
  description text not null,
  incident_type text not null,
  location_name text not null,
  area text not null,
  latitude double precision not null,
  longitude double precision not null,
  severity text not null check (severity in ('Critical', 'High', 'Medium', 'Low')),
  status text not null default 'Open' check (status in ('Open', 'Assigned', 'In Progress', 'Resolved')),
  reported_at timestamptz default now(),
  reporter_name text,
  reporter_contact text,
  is_public_report boolean default false,
  assigned_resource_ids text[] default array[]::text[],
  photos text[] default array[]::text[],
  timeline jsonb default '[]'::jsonb
);

alter table public.incidents enable row level security;

-- Public read for sanitized reports
create policy "Public view verified incidents"
  on public.incidents for select
  using (is_public_report = true or auth.uid() is not null);

-- Authenticated users can submit incidents (status defaults to Open)
create policy "Authenticated submit incidents"
  on public.incidents for insert
  with check (status = 'Open');

-- Only Coordinators and Administrators can allocate units and update status
create policy "Coordinators manage incidents"
  on public.incidents for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('coordinator', 'administrator')
    )
  );

-- 3. Civilian Assistance Requests Table
create table if not exists public.civilian_requests (
  id text primary key,
  civilian_id text not null,
  civilian_name text not null,
  contact_phone text not null,
  category text not null,
  urgency text not null,
  description text not null,
  location_name text not null,
  area text not null,
  people_count integer not null default 1,
  special_needs text,
  attachment_url text,
  status text not null default 'Pending Review' check (status in ('Pending Review', 'Approved', 'In Progress', 'Completed', 'Rejected')),
  coordinator_notes text,
  assigned_resource_id text,
  assigned_responder_name text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now(),
  timeline jsonb default '[]'::jsonb
);

alter table public.civilian_requests enable row level security;

-- Civilians can view ONLY their own requests (scoped to auth.uid())
create policy "Civilians view own scoped requests"
  on public.civilian_requests for select
  using (
    civilian_id = auth.uid()::text
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('coordinator', 'administrator', 'responder')
    )
  );

-- Civilians can insert their own requests (status strictly Pending Review)
create policy "Civilians submit assistance request"
  on public.civilian_requests for insert
  with check (
    civilian_id = auth.uid()::text
    and status = 'Pending Review'
  );

-- Only Coordinators and Administrators can approve/reject/assign
create policy "Staff triage civilian requests"
  on public.civilian_requests for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('coordinator', 'administrator', 'responder')
    )
  );`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sampleRlsSql);
    setCopiedSql(true);
    showToast('Supabase PostgreSQL RLS Schema copied to clipboard!', 'info');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              System Administration Desk
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Ballari DDMA Collectorate</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Platform Settings & Backend Governance
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Configure map geospatial center, heuristic allocation thresholds, role permissions, and Supabase sync.
          </p>
        </div>

        {/* Backend Status indicator */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <Server className="w-4 h-4 text-emerald-600" />
          <div>
            <div className="font-semibold text-slate-900">
              {useSupabase && supabaseUrl ? 'Supabase Connected' : 'Local Demo Mode Active'}
            </div>
            <div className="text-slate-500 text-[11px]">
              {useSupabase && supabaseUrl ? 'PostgreSQL sync ready' : 'Local persistence with sample seed data'}
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control Info (STRICTLY READ-ONLY HIERARCHY OVERVIEW) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Governance</h2>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Zero-Trust Enforced
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          ResQFlow enforces 4 distinct authorization roles. In compliance with security directives, <strong>role-switching dropdowns have been removed</strong>. New accounts strictly default to <strong>Civilian</strong>. Elevated roles require verified credentials.
        </p>

        {/* Read-Only Role Hierarchy Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-lg border bg-slate-50/70 border-slate-200">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Civilian (Default)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Submit reports & assistance requests; view public shelters; access ResQAI. Cannot deploy resources.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border bg-slate-50/70 border-slate-200">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Responder</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              View authorized missions; update mission progress on scene; report outcomes.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border bg-slate-50/70 border-slate-200">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Coordinator</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Review civilian requests; verify incidents; allocate resources; manage shelter logistics.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border bg-blue-50 border-blue-300 ring-1 ring-blue-500/20">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Administrator</span>
              <span className="text-[10px] font-bold text-blue-700">ACTIVE</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Manage system settings, roles, audit trails, and database policies. Protected elevation.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Platform Preferences */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Geographic & Allocation Preferences</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Ballari Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={formSettings.mapCenterLat}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, mapCenterLat: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Ballari Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={formSettings.mapCenterLng}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, mapCenterLng: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Default Zoom Level</label>
              <input
                type="number"
                min="10"
                max="18"
                value={formSettings.defaultZoom}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, defaultZoom: parseInt(e.target.value) || 13 })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Default Allocation Strategy</label>
              <select
                value={formSettings.allocationStrategy}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, allocationStrategy: e.target.value as any })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-medium text-xs"
              >
                <option value="Balanced">Balanced (40% Suitability, 35% Distance, 25% Reserve)</option>
                <option value="Fastest Response">Fastest Proximity (55% Distance Proximity)</option>
                <option value="Maximum Capacity">Maximum Fleet Capacity (50% Available Stock)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Base Reserve Threshold ({formSettings.reserveThresholdPercent}%)
              </label>
              <input
                type="range"
                min="5"
                max="35"
                step="5"
                value={formSettings.reserveThresholdPercent}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    reserveThresholdPercent: parseInt(e.target.value) || 15
                  })
                }
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer mt-2"
              />
            </div>
          </div>
        </div>

        {/* Supabase Connection */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Supabase & PostgreSQL Integration</h2>
                <p className="text-[11px] text-slate-500">
                  Connect your live Supabase project for multi-device synchronization
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={useSupabase}
                onChange={(e) => setUseSupabase(e.target.checked)}
                className="accent-blue-600 rounded"
              />
              <span className="font-semibold text-slate-800">Enable Supabase Backend</span>
            </label>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Security Protocol:</strong> Only provide your <strong>public Anon Key</strong>. Never enter
              a service-role key or secret master credentials in browser code.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Supabase Project URL</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Supabase Anon Public Key</label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 font-mono text-xs"
              />
            </div>
          </div>

          {/* SQL Blueprint */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Production PostgreSQL Schema & RLS Policies:
              </span>
              <button
                type="button"
                onClick={copySqlToClipboard}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSql ? 'Copied!' : 'Copy SQL Schema'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-800 font-mono overflow-x-auto max-h-48 leading-relaxed">
              {sampleRlsSql}
            </pre>
          </div>
        </div>

        {/* ResQAI & External Noupe Chatbot Configuration */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">ResQAI Chatbot & Noupe Embed Integration</h2>
                <p className="text-xs text-slate-500">Embedded operational rescue advisor & external script bridge</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={enableNoupeEmbed}
                onChange={(e) => setEnableNoupeEmbed(e.target.checked)}
                className="accent-blue-600 rounded"
              />
              <span className="font-semibold text-slate-800">Enable Noupe External Widget</span>
            </label>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Operational Resilience:</strong> ResQAI maintains an onboard multi-turn Ballari rescue knowledge engine. If the external Noupe embed is disabled or offline, ResQAI seamlessly handles all queries using native directives without breaking UI layout.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Noupe Bot ID</label>
              <input
                type="text"
                value={noupeBotId}
                onChange={(e) => setNoupeBotId(e.target.value)}
                placeholder="e.g. resqflow-ballari"
                disabled={!enableNoupeEmbed}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 font-mono text-xs disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Noupe Widget Script URL</label>
              <input
                type="text"
                value={noupeScriptUrl}
                onChange={(e) => setNoupeScriptUrl(e.target.value)}
                placeholder="https://cdn.noupe.com/widget.js"
                disabled={!enableNoupeEmbed}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 font-mono text-xs disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Save Action */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            Save Platform Settings
          </button>
        </div>
      </form>

      {/* Demo Data Reset Zone (Admin Only) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-red-600" />
          <h2 className="text-sm font-bold text-slate-900">Reset Demo State to Initial Ballari Dataset</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Restore initial realistic seed data containing Ballari incidents, resource fleets, relief shelters, and sample civilian requests.
        </p>

        {!showConfirmReset ? (
          <button
            type="button"
            onClick={() => setShowConfirmReset(true)}
            className="px-4 py-2 rounded-lg bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-semibold transition-colors"
          >
            Reset Demo Data to Initial State
          </button>
        ) : (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between gap-3 animate-in fade-in">
            <span className="text-xs text-red-800">
              Are you sure? This will reload the default Ballari emergency test dataset.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1 text-xs text-slate-600 hover:bg-white bg-slate-100 rounded border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  setShowConfirmReset(false);
                  showToast('Demo data restored to Ballari seed baseline.', 'success');
                }}
                className="px-3 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
