import React from 'react';
import {
  Menu,
  Shield,
  PhoneCall,
  PlusCircle,
  SlidersHorizontal,
  Lock,
  User,
  ShieldCheck
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenReportModal: () => void;
  currentRole: UserRole;
  userName?: string;
  lastDataChange: string;
  onOpenSettings: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenReportModal,
  currentRole,
  userName,
  lastDataChange,
  onOpenSettings,
  onOpenAuthModal
}) => {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
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

  const isAdministrator = currentRole === 'Administrator';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 md:hidden transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  ResQFlow
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Ballari DDMA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Emergency Resource Allocation Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center: System Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500">System:</span>
          <span className="font-semibold text-slate-800">Operational</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 text-[11px]">
            Sync: <span className="text-slate-700 font-mono font-medium">{formatTime(lastDataChange)}</span>
          </span>
        </div>

        {/* Right: Actions, Read-Only Authenticated Role & Auth Gateway */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick 112 Call */}
          <a
            href="tel:112"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
            title="Call 112"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>112</span>
          </a>

          {/* Report Incident button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report Incident</span>
            <span className="sm:hidden">Report</span>
          </button>

          {/* Read-Only Role Indicator & Auth Gateway Button (Role-switching dropdown permanently removed per critical security requirement 1 & 2) */}
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors group cursor-pointer"
            title={`Authenticated as ${currentRole}. Click to view session details or manage staff authorization.`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="text-[11px] text-slate-500 hidden md:inline">Role:</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(
                currentRole
              )}`}
            >
              {currentRole}
            </span>
          </button>

          {/* Settings: Visible to Administrators, or protected redirect */}
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-lg transition-colors ${
              isAdministrator
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={isAdministrator ? 'Platform Administration Settings' : 'Settings (Admin clearance required)'}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
