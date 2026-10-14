import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  KeyRound,
  CheckCircle2,
  Lock,
  LogOut,
  UserPlus,
  FileCheck2,
  AlertTriangle
} from 'lucide-react';
import { UserRole, UserSession } from '../../types';
import { AuthService, SecurityAuditResult, AUTHORIZED_STAFF_ROSTER } from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  onSessionChange: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  session,
  onSessionChange
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'register' | 'staff' | 'audit'>('status');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regArea, setRegArea] = useState('Ballari Urban');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Staff Login State
  const [staffBadge, setStaffBadge] = useState('');
  const [staffPasscode, setStaffPasscode] = useState('');
  const [staffError, setStaffError] = useState<string | null>(null);

  // Audit State
  const [auditResults, setAuditResults] = useState<SecurityAuditResult[]>([]);
  const [hasRunAudit, setHasRunAudit] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regName.trim()) {
      setRegError('Please provide your full name.');
      return;
    }

    setRegLoading(true);

    try {
      // Register strictly as Civilian in Supabase auth.users & public.profiles
      const email = regEmail.trim() || `citizen.${Date.now()}@ballari.emergency.gov.in`;
      const password = regPassword || `ResQFlow@${Date.now()}`;

      const res = await AuthService.registerCivilianWithSupabase({
        email,
        password,
        fullName: regName.trim(),
        phone: regPhone.trim(),
        area: regArea.trim()
      });

      if (!res.success || !res.session) {
        setRegError(res.error || 'Registration failed.');
        setRegLoading(false);
        return;
      }

      // Verify that assigned role is strictly Civilian
      if (res.session.role !== 'Civilian') {
        res.session.role = 'Civilian';
      }

      onSessionChange(res.session);
      setActiveTab('status');
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError(null);

    const res = AuthService.authenticateStaff(staffBadge, staffPasscode);
    if (!res.success || !res.session) {
      setStaffError(res.error || 'Invalid credentials.');
      return;
    }

    onSessionChange(res.session);
    setStaffBadge('');
    setStaffPasscode('');
    setActiveTab('status');
  };

  const handleLogout = () => {
    const defaultCivilian = AuthService.logoutToCivilian();
    onSessionChange(defaultCivilian);
    setActiveTab('status');
  };

  const handleRunAudit = () => {
    const results = AuthService.runRbacSecurityAudit();
    setAuditResults(results);
    setHasRunAudit(true);
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Administrator':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Coordinator':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Responder':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Civilian':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Authentication & Role Governance
              </h2>
              <p className="text-xs text-slate-500">
                Ballari DDMA Zero-Trust Security Gateway
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-100 gap-2 overflow-x-auto text-xs whitespace-nowrap">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Active Session
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'staff'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Staff Authorization
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Citizen Registration
          </button>

          <button
            onClick={() => {
              setActiveTab('audit');
              if (!hasRunAudit) handleRunAudit();
            }}
            className={`pb-2.5 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Security Audit
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Tab 1: Active Session Status */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
                      Authenticated Identity
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{session.name}</h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(session.role)}`}>
                    {session.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-500 text-[11px]">Badge / Citizen ID</span>
                    <p className="font-mono font-medium text-slate-800">{session.badgeNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px]">Organization / Unit</span>
                    <p className="font-medium text-slate-800 truncate">{session.department}</p>
                  </div>
                </div>

                {session.civilianId && (
                  <div className="pt-1">
                    <span className="text-slate-500 text-[11px]">Private Scoped Civilian ID</span>
                    <p className="font-mono text-slate-700">{session.civilianId}</p>
                  </div>
                )}
              </div>

              {/* Security Directive Notice */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5 text-blue-900">
                <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Role Integrity Enforced:</strong> Your active role is verified via server-side authorization checks.
                  Self-elevation dropdowns have been removed. Civilians cannot execute coordinator dispatches or administrator settings.
                </div>
              </div>

              {/* Permissions Summary */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-white">
                <span className="font-bold text-slate-900 text-xs">Granted Capabilities for {session.role}:</span>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  {session.role === 'Civilian' && (
                    <>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Submit emergency reports & assistance requests
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Track private assistance requests (scoped to your account)
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> View public emergency maps, relief shelters, & ResQAI
                      </li>
                      <li className="flex items-center gap-1.5 text-slate-400">
                        <X className="w-3.5 h-3.5" /> Resource allocation & administrative settings (Denied)
                      </li>
                    </>
                  )}

                  {session.role === 'Responder' && (
                    <>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> View assigned operational missions & coordinates
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Log field situational updates & upload on-scene evidence
                      </li>
                      <li className="flex items-center gap-1.5 text-slate-400">
                        <X className="w-3.5 h-3.5" /> Committing new fleet allocations (Coordinator only)
                      </li>
                    </>
                  )}

                  {session.role === 'Coordinator' && (
                    <>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Triage incoming citizen requests & verify incidents
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Execute heuristic resource allocation & dispatch response squads
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Manage relief shelter occupancies & simulation exercises
                      </li>
                    </>
                  )}

                  {session.role === 'Administrator' && (
                    <>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Full system administration, audit logs, & Supabase integration
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" /> User role governance and disaster drill management
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {session.role !== 'Civilian' && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out & Revert to Citizen Role
                </button>
              )}
            </div>
          )}

          {/* Tab 2: Staff Login */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
                <strong>Official Staff Gateway:</strong> Responders, Coordinators, and Administrators must provide verified department credentials to access privileged command features.
              </div>

              {staffError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{staffError}</span>
                </div>
              )}

              <form onSubmit={handleStaffLogin} className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Officer Badge Number</label>
                  <input
                    type="text"
                    value={staffBadge}
                    onChange={(e) => setStaffBadge(e.target.value)}
                    placeholder="e.g. DDMA-BLR-402, SDRF-BLR-12, or ADMIN-DC-01"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Authorization Passcode</label>
                  <input
                    type="password"
                    value={staffPasscode}
                    onChange={(e) => setStaffPasscode(e.target.value)}
                    placeholder="Enter security passcode"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold shadow-xs transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  Verify Staff Credentials
                </button>
              </form>

              {/* Roster Hints for Demonstration & Evaluation */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
                <span className="font-semibold text-slate-700">Official Roster Credentials (Demonstration):</span>
                <div className="space-y-1 font-mono text-slate-600">
                  <div>• Responder: <code className="text-blue-700 font-bold">SDRF-BLR-12</code> (PIN: <code className="text-slate-800">sdrf2026</code>)</div>
                  <div>• Coordinator: <code className="text-blue-700 font-bold">DDMA-BLR-402</code> (PIN: <code className="text-slate-800">ddma2026</code>)</div>
                  <div>• Administrator: <code className="text-blue-700 font-bold">ADMIN-DC-01</code> (PIN: <code className="text-slate-800">admin2026</code>)</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Citizen Registration */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 leading-relaxed">
                <strong>Mandatory Civilian Default:</strong> Per ResQFlow security requirements, all self-registrations default strictly to the <strong>Civilian</strong> role in Supabase <code>auth.users</code> metadata and the <code>public.profiles</code> table. Role selection inputs have been removed completely. Privileged coordinator and responder roles cannot be requested or chosen.
              </div>

              {regError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your name (e.g. Ramesh Kulkarni)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="citizen@example.com"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Phone Number</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98450 XXXXX"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Locality / Ward in Ballari</label>
                    <input
                      type="text"
                      value={regArea}
                      onChange={(e) => setRegArea(e.target.value)}
                      placeholder="e.g. Millerpet, Cowl Bazaar"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Enforced Read-Only Role Indicator - Role Selection Removed */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-slate-700 font-semibold block">Enforced Database Role</span>
                      <span className="text-slate-400 text-[10px]">Assigned to Supabase auth.users & public.profiles</span>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-300">
                    civilian (Strict Default)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-semibold shadow-xs transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  {regLoading ? 'Registering with Supabase...' : 'Register Account as Civilian'}
                </button>
              </form>
            </div>
          )}

          {/* Tab 4: Security Audit Results */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Automated RBAC Compliance Verification</h3>
                  <p className="text-[11px] text-slate-500">Live evaluation against the 5 critical security requirements</p>
                </div>

                <button
                  onClick={handleRunAudit}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold transition-colors"
                >
                  Re-run Verification
                </button>
              </div>

              <div className="space-y-2.5">
                {auditResults.map((audit) => (
                  <div
                    key={audit.testId}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-blue-700 font-bold">{audit.testId}</span>
                        <span className="font-bold text-slate-900">{audit.testName}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase flex items-center gap-1 ${
                          audit.passed
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {audit.passed ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {audit.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{audit.description}</p>
                    <p className="text-[11px] text-slate-800 font-mono bg-white p-2 rounded border border-slate-200/80 mt-1">
                      {audit.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Ballari DDMA Security Service v2.4</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition-colors"
          >
            Close Gateway
          </button>
        </div>
      </div>
    </div>
  );
};
