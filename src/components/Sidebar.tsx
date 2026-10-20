import React from 'react';
import { UserRole } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import {
  LayoutDashboard,
  Database,
  PlayCircle,
  FileText,
  Settings,
  Terminal,
  Code,
  GraduationCap,
  Building2,
  Languages,
  Globe2,
  Target,
  ShieldCheck,
  PanelLeftClose,
  Users,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  onOpenConnectModal: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  onOpenConnectModal,
  isOpen = true,
  onToggle,
}) => {
  const { lang, t } = useTranslation();
  const isAr = lang === 'ar';

  // Navigation items structured with role relevance and i18n
  const allNavItems = [
    // Public Sovereign Landing Page
    {
      id: 'landing',
      label: isAr ? 'البوابة العامة والتقديم' : 'Public Sovereign Landing',
      icon: Globe2,
      badge: 'Public',
      badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono',
      roles: ['admin', 'expert', 'organization'],
    },
    // Shared Overview
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      badge: null,
      roles: ['admin', 'expert', 'organization'],
    },
    // Expert Dedicated Workspace
    {
      id: 'scholar-space',
      label: t('nav.scholarSpace'),
      icon: GraduationCap,
      badge: 'Laureate',
      badgeColor: 'bg-[#ffdea4] text-[#261900]',
      roles: ['expert', 'admin'],
    },
    // Organization Dedicated Portal
    {
      id: 'university-portal',
      label: t('nav.universityPortal'),
      icon: Building2,
      badge: 'ESI/USTHB',
      badgeColor: 'bg-blue-100 text-blue-900',
      roles: ['organization', 'admin'],
    },
    // Front-End API Management (Main Requested Feature)
    {
      id: 'api-management',
      label: t('nav.apiManager'),
      icon: Terminal,
      badge: 'v1 Core',
      badgeColor: 'bg-[#3B0D2C] text-[#C89B3C] font-mono',
      roles: ['admin', 'expert', 'organization'],
    },
    // Translation Hub / Manager (Requested Hub for Editing Translations)
    {
      id: 'translation-hub',
      label: t('nav.translationHub'),
      icon: Languages,
      badge: 'i18n Hub',
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300 font-mono',
      roles: ['admin', 'expert', 'organization'],
    },
    // Django REST Framework Test Client
    {
      id: 'django-client',
      label: t('nav.djangoClient'),
      icon: Code,
      badge: 'Python DRF',
      badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
      roles: ['admin', 'expert', 'organization'],
    },
    // Database Studio (Schema, D3 ERD, Data Browser)
    {
      id: 'schema',
      label: t('nav.databaseStudio'),
      icon: Database,
      badge: 'D3 + SQL',
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
      roles: ['admin'],
    },
    // Automated Lifecycle Sequences
    {
      id: 'sequence',
      label: t('nav.lifecycleSequences'),
      icon: PlayCircle,
      badge: '7 Steps',
      badgeColor: 'bg-purple-100 text-purple-900',
      roles: ['admin'],
    },
    // Super Admin Unified Console (KPIs, APIs, DB, Audit)
    {
      id: 'admin-console',
      label: isAr ? 'لوحة تحكم المشرف العام' : 'Super Admin Console',
      icon: ShieldCheck,
      badge: 'MESRS',
      badgeColor: 'bg-[#3B0D2C] text-[#C89B3C] font-mono',
      roles: ['admin'],
    },
    // Dedicated User Management & RBAC Interface
    {
      id: 'user-management',
      label: isAr ? 'إدارة المستخدمين والصلاحيات' : 'User Management & RBAC',
      icon: Users,
      badge: 'Users',
      badgeColor: 'bg-purple-100 text-purple-900 border border-purple-300 font-mono',
      roles: ['admin'],
    },
    // Custom KPI Studio
    {
      id: 'kpi-studio',
      label: isAr ? 'استوديو بناء مؤشرات الأداء' : 'Custom KPI Studio',
      icon: Target,
      badge: 'Metrics',
      badgeColor: 'bg-[#C89B3C]/15 text-[#8C6514] border border-[#C89B3C]/30 font-mono',
      roles: ['admin'],
    },
    // Audit & Governance
    {
      id: 'analytics',
      label: t('nav.auditLogs'),
      icon: FileText,
      badge: null,
      roles: ['admin'],
    },
  ];

  const visibleItems = allNavItems.filter((item) => item.roles.includes(activeRole));

  return (
    <aside
      className={`${
        isOpen ? 'w-64 p-4 opacity-100' : 'w-0 p-0 opacity-0 overflow-hidden border-0 pointer-events-none'
      } transition-all duration-300 ease-in-out bg-white border-slate-200/90 shadow-2xs flex flex-col justify-between shrink-0 select-none z-30 ${
        isAr ? 'border-l' : 'border-r'
      }`}
    >
      {/* Top Brand Section */}
      <div className="flex flex-col gap-3 min-w-[224px]">
        {/* Brand Crest & Monogram */}
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b0a2a] via-[#4a0e38] to-[#12000a] p-0.5 shadow-sm shrink-0 flex items-center justify-center border border-[#C89B3C]/40">
              <span className="text-white font-black text-sm tracking-tighter">DZ</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-950 tracking-tight text-base font-['Plus_Jakarta_Sans'] truncate">
                {t('common.appName')}
              </span>
              <span className="text-[11px] text-[#8C6514] font-semibold truncate">
                {t('common.appSubtitle')}
              </span>
            </div>
          </div>
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title={isAr ? 'إغلاق اللوحة الجانبية (Ctrl+B)' : 'Close Navigation Panel (Ctrl+B)'}
              aria-label="Close navigation panel"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Primary Role Context Pill */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">
            {t('nav.activeRole')}:
          </div>
          <div className="text-slate-900 font-bold mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C89B3C]"></span>
            <span>
              {activeRole === 'admin'
                ? t('nav.superAdmin')
                : activeRole === 'expert'
                ? t('nav.diasporaScholar')
                : t('nav.universityHost')}
            </span>
          </div>
        </div>

        {/* Navigation Items List */}
        <nav className="flex flex-col gap-1 mt-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 text-left group ${
                  isActive
                    ? `bg-[#eff4ff] text-[#3b0a2a] font-bold shadow-xs ${
                        isAr ? 'border-r-3' : 'border-l-3'
                      } border-[#3b0a2a]`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-[#3b0a2a] scale-105' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                      item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && !item.badge && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C89B3C] shrink-0"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Configuration Section */}
      <div className="border-t border-slate-200/80 pt-3 flex flex-col gap-2 min-w-[224px]">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200/60 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffdea4] to-[#f5c97c] flex items-center justify-center text-[#261900] font-black text-xs border border-[#C89B3C] shadow-2xs shrink-0">
              {activeRole === 'admin' ? 'DH' : activeRole === 'expert' ? 'BH' : 'ESI'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black text-slate-900 truncate">
                {activeRole === 'admin'
                  ? isAr ? 'دغة حسام الدين' : 'DEGHA HOUSSEM EDDINE'
                  : activeRole === 'expert'
                  ? isAr ? 'أ.د. بلقاسم حبة' : 'Prof. B. Haba'
                  : isAr ? 'المعهد العالي للإعلام الآلي' : 'Dr. R. Haddad'}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {activeRole === 'admin' ? 'dzsoft.contact@gmail.com' : activeRole === 'expert' ? 'b.haba@univ-biskra.dz' : 'contact@esi.dz'}
              </span>
              <span className="text-[9px] text-[#8C6514] font-bold uppercase truncate">
                {activeRole === 'admin' ? 'Super Admin · Architect' : activeRole === 'expert' ? t('roles.scholarShort') : t('roles.universityShort')}
              </span>
            </div>
          </div>
          <button
            onClick={onOpenConnectModal}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-white"
            title="Gateway Configuration"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Action button to collapse panel */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[11px] text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-dashed border-slate-200"
            title={isAr ? 'إغلاق اللوحة الجانبية (Ctrl+B)' : 'Close Navigation Panel (Ctrl+B)'}
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
            <span>{isAr ? 'إغلاق اللوحة الجانبية' : 'Close Left Panel'}</span>
          </button>
        )}

        <div className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{t('nav.sovereignBridge')}</span>
        </div>
      </div>
    </aside>
  );
};
