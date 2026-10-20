import React from 'react';
import { UserRole } from '../types';
import { useTranslation, SupportedLang } from '../i18n/LanguageContext';
import {
  Search,
  ShieldCheck,
  GraduationCap,
  Building2,
  HelpCircle,
  Globe2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface TopHeaderProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  latencyMs: number;
  port: number;
  onOpenConnectModal: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab?: string;
  onToggleLanding?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeRole,
  setActiveRole,
  latencyMs,
  port,
  onOpenConnectModal,
  searchQuery,
  setSearchQuery,
  activeTab,
  onToggleLanding,
  isSidebarOpen = true,
  onToggleSidebar,
}) => {
  const { lang, setLang, t } = useTranslation();
  const isAr = lang === 'ar';

  return (
    <header className="sticky top-0 z-40 w-full h-15 bg-white border-b border-slate-200/90 shadow-2xs flex items-center justify-between px-4 sm:px-6 shrink-0">
      {/* Left: Left Panel Toggle & Quick Search */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-xl transition-all flex items-center gap-1.5 border shadow-2xs ${
              isSidebarOpen
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-[#3b0a2a] text-[#C89B3C] border-[#3b0a2a] hover:bg-[#4a0e38] ring-2 ring-[#C89B3C]/40 font-bold'
            }`}
            title={
              isSidebarOpen
                ? isAr
                  ? 'إغلاق اللوحة الجانبية (Ctrl+B)'
                  : 'Close Navigation Panel (Ctrl+B)'
                : isAr
                ? 'فتح اللوحة الجانبية (Ctrl+B)'
                : 'Open Navigation Panel (Ctrl+B)'
            }
            aria-label={isSidebarOpen ? 'Close left panel' : 'Open left panel'}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 shrink-0" />
            ) : (
              <PanelLeftOpen className="w-4 h-4 shrink-0" />
            )}
            <span className="text-xs font-bold hidden sm:inline">
              {isSidebarOpen
                ? isAr
                  ? 'إخفاء القائمة'
                  : 'Close Panel'
                : isAr
                ? 'إظهار القائمة'
                : 'Open Panel'}
            </span>
          </button>
        )}

        <div className="relative w-56 sm:w-72">
          <Search className={`w-4 h-4 text-slate-400 absolute ${isAr ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.searchPlaceholder')}
            className={`w-full h-9 ${
              isAr ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4 text-left'
            } bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#3b0a2a] focus:ring-1 focus:ring-[#3b0a2a] transition-all`}
          />
        </div>
      </div>

      {/* Center/Right: Role Switcher & Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Public Landing Switcher */}
        {onToggleLanding && (
          <button
            onClick={onToggleLanding}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
              activeTab === 'landing'
                ? 'bg-[#C89B3C] text-slate-950 shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Toggle between Public Sovereign Landing Page and Authenticated Workspaces"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#3B0D2C]" />
            <span className="hidden sm:inline">{activeTab === 'landing' ? 'Workspace' : 'Public Landing'}</span>
          </button>
        )}

        {/* Dynamic Role Selector Badge */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2 hidden sm:inline">
            {t('common.role')}:
          </span>
          <button
            onClick={() => setActiveRole('admin')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeRole === 'admin'
                ? 'bg-[#3B0D2C] text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Super Admin (MESRS Governance)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span className="hidden md:inline">{t('roles.adminShort')}</span>
          </button>
          <button
            onClick={() => setActiveRole('expert')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeRole === 'expert'
                ? 'bg-[#3B0D2C] text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Diaspora Scholar"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span className="hidden md:inline">{t('roles.scholarShort')}</span>
          </button>
          <button
            onClick={() => setActiveRole('organization')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeRole === 'organization'
                ? 'bg-[#3B0D2C] text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="University Dean"
          >
            <Building2 className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span className="hidden md:inline">{t('roles.universityShort')}</span>
          </button>
        </div>

        {/* Trilingual Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-medium">
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-0.5 rounded transition-all ${
              lang === 'en'
                ? 'bg-white text-[#3b0a2a] shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('fr')}
            className={`px-2 py-0.5 rounded transition-all ${
              lang === 'fr'
                ? 'bg-white text-[#3b0a2a] shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => setLang('ar')}
            className={`px-2 py-0.5 rounded transition-all font-bold ${
              lang === 'ar'
                ? 'bg-white text-[#3b0a2a] shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            عربي
          </button>
        </div>

        {/* Operational Status Pill */}
        <button
          onClick={onOpenConnectModal}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-[11px] font-medium transition hover:bg-emerald-100"
          title="Click to inspect gateway configuration"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            {t('common.gatewayOnline')} ({latencyMs}ms)
          </span>
        </button>

        {/* System User Pill: DEGHA HOUSSEM EDDINE */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1 bg-gradient-to-r from-slate-50 to-amber-50/50 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ffdea4] to-[#f5c97c] flex items-center justify-center text-[#261900] font-black text-xs border border-[#C89B3C] shadow-2xs shrink-0">
            DH
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black text-slate-900 leading-tight">
              {isAr ? 'دغة حسام الدين' : 'DEGHA HOUSSEM EDDINE'}
            </span>
            <span className="text-[9px] text-[#8C6514] font-bold leading-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {activeRole === 'admin'
                ? 'Super Admin · Architect'
                : activeRole === 'expert'
                ? 'Scholar View'
                : 'Dean View'}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <button
          onClick={onOpenConnectModal}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Backend & Gateway Settings"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
