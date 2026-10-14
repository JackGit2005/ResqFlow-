import React from 'react';
import {
  LayoutDashboard,
  AlertOctagon,
  Truck,
  MapPin,
  Cpu,
  Home,
  FileText,
  BarChart3,
  FlaskConical,
  Settings,
  LifeBuoy,
  ShieldCheck,
  Bot,
  User,
  KeyRound
} from 'lucide-react';
import { UserRole } from '../../types';

export type TabKey =
  | 'dashboard'
  | 'incidents'
  | 'resources'
  | 'map'
  | 'allocation'
  | 'shelters'
  | 'civilian-portal'
  | 'public'
  | 'analytics'
  | 'simulation'
  | 'settings';

interface SidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  openCount: number;
  availableResourceCount: number;
  civilianRequestCount?: number;
  isOpen: boolean;
  onCloseMobile: () => void;
  userRole: UserRole;
  userName?: string;
  onOpenAssistant: () => void;
  onOpenAuthModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  openCount,
  availableResourceCount,
  civilianRequestCount = 0,
  isOpen,
  onCloseMobile,
  userRole,
  userName,
  onOpenAssistant,
  onOpenAuthModal
}) => {
  const isCivilian = userRole === 'Civilian';
  const isResponder = userRole === 'Responder';
  const isCoordinator = userRole === 'Coordinator';
  const isAdministrator = userRole === 'Administrator';

  // Navigation items strictly filtered per RBAC role
  let navItems: {
    id: TabKey;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [];

  if (isCivilian) {
    navItems = [
      {
        id: 'civilian-portal',
        label: 'Civilian Assistance Hub',
        icon: <LifeBuoy className="w-4 h-4" />,
        badge: civilianRequestCount > 0 ? civilianRequestCount : undefined,
        badgeColor: 'bg-blue-100 text-blue-700'
      },
      {
        id: 'dashboard',
        label: 'Situational Overview',
        icon: <LayoutDashboard className="w-4 h-4" />
      },
      {
        id: 'map',
        label: 'Public Emergency Map',
        icon: <MapPin className="w-4 h-4" />
      },
      {
        id: 'shelters',
        label: 'Public Relief Shelters',
        icon: <Home className="w-4 h-4" />
      },
      {
        id: 'public',
        label: 'Report & Awareness Feed',
        icon: <FileText className="w-4 h-4" />
      }
    ];
  } else if (isResponder) {
    navItems = [
      {
        id: 'dashboard',
        label: 'Command Overview',
        icon: <LayoutDashboard className="w-4 h-4" />
      },
      {
        id: 'incidents',
        label: 'Assigned Missions',
        icon: <AlertOctagon className="w-4 h-4" />,
        badge: openCount > 0 ? openCount : undefined,
        badgeColor: 'bg-red-100 text-red-700'
      },
      {
        id: 'map',
        label: 'Tactical Map',
        icon: <MapPin className="w-4 h-4" />
      },
      {
        id: 'shelters',
        label: 'Relief Shelters',
        icon: <Home className="w-4 h-4" />
      },
      {
        id: 'public',
        label: 'Public Awareness Feed',
        icon: <FileText className="w-4 h-4" />
      }
    ];
  } else {
    // Staff: Coordinator & Administrator
    navItems = [
      {
        id: 'dashboard',
        label: 'Command Dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />
      },
      {
        id: 'civilian-portal',
        label: 'Civilian Requests Desk',
        icon: <LifeBuoy className="w-4 h-4" />,
        badge: civilianRequestCount > 0 ? civilianRequestCount : undefined,
        badgeColor: 'bg-amber-100 text-amber-800'
      },
      {
        id: 'incidents',
        label: 'Incident Management',
        icon: <AlertOctagon className="w-4 h-4" />,
        badge: openCount,
        badgeColor: 'bg-red-100 text-red-700'
      },
      {
        id: 'map',
        label: 'Tactical Map',
        icon: <MapPin className="w-4 h-4" />
      },
      {
        id: 'allocation',
        label: 'Allocation Engine',
        icon: <Cpu className="w-4 h-4" />
      },
      {
        id: 'resources',
        label: 'Resource Inventory',
        icon: <Truck className="w-4 h-4" />,
        badge: availableResourceCount,
        badgeColor: 'bg-emerald-100 text-emerald-800'
      },
      {
        id: 'shelters',
        label: 'Relief Shelters',
        icon: <Home className="w-4 h-4" />
      },
      {
        id: 'public',
        label: 'Public Transparency Feed',
        icon: <FileText className="w-4 h-4" />
      },
      {
        id: 'analytics',
        label: 'Analytics & Reports',
        icon: <BarChart3 className="w-4 h-4" />
      },
      {
        id: 'simulation',
        label: 'Disaster Simulation',
        icon: <FlaskConical className="w-4 h-4" />
      }
    ];

    // Only Administrators have access to Settings & Supabase sync
    if (isAdministrator) {
      navItems.push({
        id: 'settings',
        label: 'Settings & Supabase',
        icon: <Settings className="w-4 h-4" />
      });
    }
  }

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Administrator':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Coordinator':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Responder':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Civilian':
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Slim White Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 left-0 z-40 h-[100dvh] md:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out shadow-xs ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>{isCivilian ? 'Citizen Services' : 'Operations Center'}</span>
            <span className="text-[10px] font-mono font-medium text-slate-400">{userRole}</span>
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-blue-600' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Profile & Assistant summon */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {/* ResQAI Assistant button */}
          <button
            onClick={onOpenAssistant}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-600" />
              <span>Ask ResQAI</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1 rounded bg-blue-100 text-blue-800">
              Guidance
            </span>
          </button>

          {/* Active user role card (read-only with auth trigger) */}
          <div
            onClick={onOpenAuthModal}
            className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors cursor-pointer group"
            title="Click to view identity verification & RBAC security audit"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="font-semibold text-slate-900 truncate text-xs">{userName || userRole}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(userRole)}`}>
                    {userRole}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {isCivilian ? 'Ballari Resident' : 'Authorized DDMA Staff'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
