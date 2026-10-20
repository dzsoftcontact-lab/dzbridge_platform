import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Calendar,
  Download,
  GraduationCap,
  FlaskConical,
  Handshake,
  CheckCircle2,
  Filter,
  Eye,
  MapPin,
  Lock,
  Send,
  Star,
  ArrowUp,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
} from 'recharts';

import { CustomKpiItem } from '../types';
import { Target } from 'lucide-react';

interface DashboardOverviewProps {
  onExportAudit?: () => void;
  customKpis?: CustomKpiItem[];
  onNavigateKpiStudio?: () => void;
}

interface MatchRecord {
  id: string;
  projectTitle: string;
  institution: string;
  institutionCity: string;
  scholarName: string;
  scholarAffiliation: string;
  isDiaspora: boolean;
  missionDates: string;
  matchScore: number;
  statusLabel: string;
  statusColor: string;
  dotColor: string;
  skillsScore: number;
  travelScore: number;
  labScore: number;
  committeeNote: string;
  verifier: string;
}

const SAMPLE_MATCHES: MatchRecord[] = [
  {
    id: '#MTC-2026-89',
    projectTitle: 'Smart Grid Optimization & Storage',
    institution: 'USTHB Bab Ezzouar',
    institutionCity: 'Algiers',
    scholarName: 'Prof. Karim Mansouri',
    scholarAffiliation: 'CNRS Paris, FR',
    isDiaspora: true,
    missionDates: 'Aug 12 - Aug 24',
    matchScore: 98,
    statusLabel: 'Pending Consent',
    statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
    dotColor: 'bg-amber-500',
    skillsScore: 98,
    travelScore: 100,
    labScore: 94,
    committeeNote: 'Scholar indicated willingness to donate dual FPGA testing benches to the Bab Ezzouar laboratory upon project completion.',
    verifier: 'DEGHA Houssem Eddine · 16:40 CET',
  },
  {
    id: '#MTC-2026-92',
    projectTitle: 'Algerian Dialect LLM Localization',
    institution: 'ESI Oued Smar',
    institutionCity: 'Algiers',
    scholarName: 'Dr. Amina Benali',
    scholarAffiliation: 'CNRS Paris & Sorbonne',
    isDiaspora: true,
    missionDates: 'Nov 05 - Nov 18',
    matchScore: 97.5,
    statusLabel: 'Contact Approved',
    statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotColor: 'bg-emerald-500',
    skillsScore: 100,
    travelScore: 100,
    labScore: 90,
    committeeNote: 'Direct match for national computing center doctoral school curricula.',
    verifier: 'MESRS Academic Committee',
  },
  {
    id: '#MTC-2026-95',
    projectTitle: 'Perovskite Photovoltaic Cell Degradation',
    institution: 'CDER Bouzaréah',
    institutionCity: 'Algiers',
    scholarName: 'Dr. Nachida Kasbadji',
    scholarAffiliation: 'CDER Solar Research',
    isDiaspora: false,
    missionDates: 'Sep 01 - Sep 30',
    matchScore: 96,
    statusLabel: 'Pending Consent',
    statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
    dotColor: 'bg-amber-500',
    skillsScore: 98,
    travelScore: 92,
    labScore: 96,
    committeeNote: 'Bilateral agreement draft submitted for clean room access protocols.',
    verifier: 'National Solar Commission',
  },
  {
    id: '#MTC-2026-98',
    projectTitle: 'Heritage Adobe Structural Modeling',
    institution: 'Univ Constantine 3',
    institutionCity: 'Constantine',
    scholarName: 'Dr. Naima Benkari',
    scholarAffiliation: 'Sultan Qaboos University',
    isDiaspora: true,
    missionDates: 'Dec 10 - Dec 22',
    matchScore: 94.8,
    statusLabel: 'Pending Consent',
    statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
    dotColor: 'bg-amber-500',
    skillsScore: 96,
    travelScore: 90,
    labScore: 98,
    committeeNote: 'Focus on Mzab Valley earthen architectural preservation technologies.',
    verifier: 'DEGHA Houssem Eddine',
  },
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onExportAudit,
  customKpis,
  onNavigateKpiStudio,
}) => {
  const { lang, t } = useTranslation();
  const isAr = lang === 'ar';

  const [selectedMatch, setSelectedMatch] = useState<MatchRecord>(SAMPLE_MATCHES[0]);
  const [activeQueueTab, setActiveQueueTab] = useState<'review' | 'progress' | 'completed'>('review');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [approvedIds, setApprovedIds] = useState<string[]>(['#MTC-2026-92']);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Visualization mode states for Recharts
  const [statusViewMode, setStatusViewMode] = useState<'donut' | 'bar'>('donut');
  const [collabViewMode, setCollabViewMode] = useState<'hubs' | 'trend'>('hubs');

  const handleApprove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!approvedIds.includes(id)) {
      setApprovedIds((prev) => [...prev, id]);
      setActionSuccessMsg(
        isAr
          ? `تم اعتماد المواءمة ${id} وإرسال إشعار التوصيل الثنائي!`
          : `Match ${id} approved! Bilateral notifications dispatched.`,
      );
      setTimeout(() => setActionSuccessMsg(null), 3500);
    }
  };

  const handleSendIntro = () => {
    setActionSuccessMsg(
      isAr
        ? `تم إرسال خطاب التقديم الثنائي الرسمي للمشروع ${selectedMatch.projectTitle} بنجاح!`
        : `Formal bilateral introduction package transmitted for ${selectedMatch.projectTitle}!`,
    );
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Recharts Data with translated status labels
  const projectStatusDistribution = useMemo(() => [
    { name: t('charts.statusDraft'), count: 18, color: '#94A3B8' },
    { name: t('charts.statusSubmitted'), count: 52, color: '#64748B' },
    { name: t('charts.statusUnderReview'), count: 34, color: '#F59E0B' },
    { name: t('charts.statusMatched'), count: 46, color: '#D97706' },
    { name: t('charts.statusContactInitiated'), count: 42, color: '#3B0D2C' },
    { name: t('charts.statusConfirmed'), count: 36, color: '#059669' },
    { name: t('charts.statusInProgress'), count: 20, color: '#2563EB' },
    { name: t('charts.statusCompleted'), count: 28, color: '#C89B3C' },
  ], [t]);

  const collaborationStatsByHub = useMemo(() => [
    { hub: 'ESI Algiers', missions: 16, mentoredResearchers: 48, protocolsSigned: 9 },
    { hub: 'USTHB Bab Ezzouar', missions: 14, mentoredResearchers: 52, protocolsSigned: 8 },
    { hub: 'Univ Constantine 1/3', missions: 11, mentoredResearchers: 36, protocolsSigned: 7 },
    { hub: 'Univ Oran 1 Senia', missions: 9, mentoredResearchers: 29, protocolsSigned: 5 },
    { hub: 'CDER Bouzaréah', missions: 8, mentoredResearchers: 25, protocolsSigned: 5 },
    { hub: 'Univ Ouargla / Biskra', missions: 5, mentoredResearchers: 22, protocolsSigned: 4 },
  ], []);

  const monthlyCollaborationsTrend = useMemo(() => [
    { month: isAr ? 'جانفي' : 'Jan', missions: 3, researchers: 8, protocols: 2 },
    { month: isAr ? 'فيفري' : 'Feb', missions: 5, researchers: 16, protocols: 3 },
    { month: isAr ? 'مارس' : 'Mar', missions: 8, researchers: 24, protocols: 5 },
    { month: isAr ? 'أفريل' : 'Apr', missions: 11, researchers: 38, protocols: 6 },
    { month: isAr ? 'ماي' : 'May', missions: 14, researchers: 52, protocols: 9 },
    { month: isAr ? 'جوان' : 'Jun', missions: 12, researchers: 46, protocols: 7 },
    { month: isAr ? 'جويلية' : 'Jul', missions: 10, researchers: 28, protocols: 6 },
  ], [isAr]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-950 font-['Plus_Jakarta_Sans'] tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('dashboard.term')}</span>
          </div>
          <button
            onClick={onExportAudit}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('dashboard.exportAudit')}</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Strategic Custom Performance Indicators (Configured by Admin) */}
      {customKpis && customKpis.length > 0 && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#C89B3C]/15 text-[#8C6514]">
                <Target className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Custom Strategic Goals & National Performance Indicators</span>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    Live Formula Sync
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Dynamic institutional targets configured via the Super Admin KPI Builder.
                </p>
              </div>
            </div>

            {onNavigateKpiStudio && (
              <button
                onClick={onNavigateKpiStudio}
                className="text-xs font-bold text-[#3B0D2C] hover:text-[#C89B3C] flex items-center gap-1"
              >
                <span>Manage Custom KPIs</span>
                <span className="font-mono">→</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {customKpis.slice(0, 3).map((kpi) => (
              <div
                key={kpi.id}
                className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl hover:border-[#C89B3C] transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <span>{kpi.category}</span>
                  <span className="font-mono text-[#3B0D2C]">{kpi.progressPercentage}%</span>
                </div>
                <div className="font-bold text-xs text-slate-900 truncate">{kpi.name}</div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-lg font-black text-slate-900 font-mono tabular-nums">
                    {kpi.currentValue}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ {kpi.targetValue}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      kpi.status === 'exceeded'
                        ? 'bg-emerald-600'
                        : kpi.status === 'attention_required'
                        ? 'bg-amber-500'
                        : 'bg-[#3B0D2C]'
                    }`}
                    style={{ width: `${Math.min(kpi.progressPercentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4 Metric KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-[#3b0a2a]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t('dashboard.activeExperts')}</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-[#3b0a2a]">
              <GraduationCap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
                1,420
              </span>
              <span className="text-emerald-700 text-xs font-semibold flex items-center">
                <ArrowUp className="w-3 h-3" />
                12.4%
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-slate-900 font-medium">{t('dashboard.diasporaRatio')}</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-[#3b0a2a]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t('dashboard.submittedProjects')}</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-[#3b0a2a]">
              <FlaskConical className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
                385
              </span>
              <span className="text-emerald-700 text-xs font-semibold flex items-center">
                <ArrowUp className="w-3 h-3" />
                8.1%
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{t('dashboard.acrossHubs')}</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-[#C89B3C]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t('dashboard.matchSuccessRate')}</span>
            <span className="p-1.5 rounded-lg bg-[#ffdea4]/50 text-[#7b5900]">
              <Handshake className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#7b5900] tracking-tight font-['Plus_Jakarta_Sans']">
                91.3%
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#ffdea4] text-[#261900] text-[10px] font-bold font-mono">
                OPTIMAL
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{t('dashboard.avgDays')}</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-[#3b0a2a]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t('dashboard.mutualSatisfaction')}</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-[#3b0a2a]">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
                4.88<span className="text-sm font-normal text-slate-400">/5.0</span>
              </span>
              <span className="text-[#C89B3C] text-xs font-semibold flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-[#C89B3C]" />
                {t('dashboard.confidential')}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-emerald-700 font-medium">{t('dashboard.satisfactionNote')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Transfer Lifecycle Funnel */}
      <section className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#3b0a2a]" />
            <h2 className="text-sm font-bold text-slate-950 font-['Plus_Jakarta_Sans']">
              {t('dashboard.funnelTitle')}
            </h2>
            <span className="text-slate-600 text-[11px] bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
              {t('dashboard.livePipeline')}
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1 md:mt-0">
            {t('dashboard.conversionRate')}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative bg-slate-50/70 p-3 rounded-lg border border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Step 1</span>
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            </div>
            <div className="my-2">
              <div className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                {t('dashboard.stepSubmitted')}
              </div>
              <div className="text-[11px] text-slate-500">52 projects</div>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">{t('dashboard.ingestionRate')}</div>
          </div>

          <div className="relative bg-slate-50/70 p-3 rounded-lg border border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Step 2</span>
              <span className="w-2 h-2 rounded-full bg-[#C89B3C]"></span>
            </div>
            <div className="my-2">
              <div className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                {t('dashboard.stepMatched')}
              </div>
              <div className="text-[11px] text-slate-500">46 proposals</div>
            </div>
            <div className="text-[10px] text-emerald-700 font-medium">{t('dashboard.algorithmFit')}</div>
          </div>

          <div className="relative bg-slate-50/70 p-3 rounded-lg border border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Step 3</span>
              <span className="w-2 h-2 rounded-full bg-[#3b0a2a]"></span>
            </div>
            <div className="my-2">
              <div className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                {t('dashboard.stepContact')}
              </div>
              <div className="text-[11px] text-slate-500">42 accepted</div>
            </div>
            <div className="text-[10px] text-emerald-700 font-medium">{t('dashboard.optInRate')}</div>
          </div>

          <div className="relative bg-slate-50/70 p-3 rounded-lg border border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Step 4</span>
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            </div>
            <div className="my-2">
              <div className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                {t('dashboard.stepConfirmed')}
              </div>
              <div className="text-[11px] text-slate-500">36 protocols</div>
            </div>
            <div className="text-[10px] text-emerald-700 font-medium">{t('dashboard.travelScheduled')}</div>
          </div>

          <div className="relative bg-[#ffdea4]/20 p-3 rounded-lg border border-[#C89B3C]/50 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7b5900] uppercase tracking-wider">Step 5</span>
              <CheckCircle2 className="w-4 h-4 text-[#7b5900]" />
            </div>
            <div className="my-2">
              <div className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                {t('dashboard.stepCompleted')}
              </div>
              <div className="text-[11px] text-slate-500">28 transfers</div>
            </div>
            <div className="text-[10px] text-[#7b5900] font-bold">{t('dashboard.protocolSigned')}</div>
          </div>
        </div>
      </section>

      {/* RECHARTS DATA VISUALIZATION SECTION */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#3B0D2C]" />
              {t('charts.analyticsTitle')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('charts.analyticsSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-[#8C6514] bg-[#ffdea4]/30 px-2.5 py-1 rounded-full border border-[#C89B3C]/30">
            <span>{t('charts.trackedCount')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* CHART 1: PROJECT STATUS DISTRIBUTION */}
          <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
                  <PieIcon className="w-4 h-4 text-[#3B0D2C]" />
                  {t('charts.projectStatusTitle')}
                </h3>
                <span className="text-[11px] text-slate-500">
                  {t('charts.projectStatusSubtitle')}
                </span>
              </div>

              {/* View Switcher: Donut vs Bar */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setStatusViewMode('donut')}
                  className={`px-2.5 py-1 rounded-md transition font-semibold flex items-center gap-1 ${
                    statusViewMode === 'donut'
                      ? 'bg-white text-[#3B0D2C] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PieIcon className="w-3 h-3 text-[#C89B3C]" />
                  {t('charts.donut')}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusViewMode('bar')}
                  className={`px-2.5 py-1 rounded-md transition font-semibold flex items-center gap-1 ${
                    statusViewMode === 'bar'
                      ? 'bg-white text-[#3B0D2C] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3 h-3 text-[#C89B3C]" />
                  {t('charts.rankedBar')}
                </button>
              </div>
            </div>

            {/* Chart Canvas Area */}
            <div className="w-full h-64 pt-2">
              {statusViewMode === 'donut' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const total = projectStatusDistribution.reduce((acc, cur) => acc + cur.count, 0);
                          const percentage = ((data.count / total) * 100).toFixed(1);
                          return (
                            <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-700 font-mono">
                              <div className="font-bold flex items-center gap-1.5" style={{ color: data.color }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }}></span>
                                {data.name}
                              </div>
                              <div className="mt-1 text-slate-300">
                                <strong>{data.count}</strong> ({percentage}%)
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={projectStatusDistribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={88}
                      paddingAngle={3}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    >
                      {projectStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={projectStatusDistribution}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#334155' }}
                      width={100}
                    />
                    <RechartsTooltip
                      formatter={(val: any) => [`${val}`, t('charts.totalProjects')]}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '12px',
                        border: '1px solid #1E293B',
                        color: '#F8FAFC',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {projectStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Color-Coded Compact Legend Strip */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-medium text-slate-600">
              {projectStatusDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="truncate">{item.name}</span>
                  <span className="font-mono font-bold text-slate-900 ml-auto">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CHART 2: ACTIVE COLLABORATIONS STATISTICS */}
          <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans'] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#C89B3C]" />
                  {t('charts.activeCollabTitle')}
                </h3>
                <span className="text-[11px] text-slate-500">
                  {t('charts.activeCollabSubtitle')}
                </span>
              </div>

              {/* View Switcher: Hubs vs Monthly Trend */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setCollabViewMode('hubs')}
                  className={`px-2.5 py-1 rounded-md transition font-semibold flex items-center gap-1 ${
                    collabViewMode === 'hubs'
                      ? 'bg-white text-[#3B0D2C] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3 h-3 text-[#3B0D2C]" />
                  {t('charts.byUniversity')}
                </button>
                <button
                  type="button"
                  onClick={() => setCollabViewMode('trend')}
                  className={`px-2.5 py-1 rounded-md transition font-semibold flex items-center gap-1 ${
                    collabViewMode === 'trend'
                      ? 'bg-white text-[#3B0D2C] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 text-[#C89B3C]" />
                  {t('charts.monthlyTrend')}
                </button>
              </div>
            </div>

            {/* Chart Canvas Area */}
            <div className="w-full h-64 pt-2">
              {collabViewMode === 'hubs' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={collaborationStatsByHub}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="hub"
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      tickFormatter={(val) => val.split(' ')[0]}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '12px',
                        border: '1px solid #1E293B',
                        color: '#F8FAFC',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                      formatter={(val: any, name: any) => {
                        const label =
                          name === 'missions'
                            ? t('charts.missions')
                            : name === 'mentoredResearchers'
                            ? t('charts.researchers')
                            : t('charts.protocols');
                        return [`${val}`, label];
                      }}
                    />
                    <Bar
                      dataKey="missions"
                      fill="#3B0D2C"
                      radius={[4, 4, 0, 0]}
                      name="missions"
                    />
                    <Bar
                      dataKey="mentoredResearchers"
                      fill="#C89B3C"
                      radius={[4, 4, 0, 0]}
                      name="mentoredResearchers"
                    />
                    <Bar
                      dataKey="protocolsSigned"
                      fill="#2563EB"
                      radius={[4, 4, 0, 0]}
                      name="protocolsSigned"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyCollaborationsTrend}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorResearchers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C89B3C" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#C89B3C" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorMissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B0D2C" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B0D2C" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '12px',
                        border: '1px solid #1E293B',
                        color: '#F8FAFC',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="researchers"
                      stroke="#C89B3C"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorResearchers)"
                      name={t('charts.researchers')}
                    />
                    <Area
                      type="monotone"
                      dataKey="missions"
                      stroke="#3B0D2C"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMissions)"
                      name={t('charts.missions')}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Quick KPI Footer Strip */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B0D2C]"></span>
                <strong>63</strong> {t('charts.missions')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C89B3C]"></span>
                <strong>212</strong> {t('charts.researchers')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
                <strong>38</strong> {t('charts.protocols')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Workbench Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Match Queue Table */}
        <div className="xl:col-span-8 bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveQueueTab('review')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeQueueTab === 'review'
                    ? 'text-[#3b0a2a] bg-[#eff4ff] border-b-2 border-[#3b0a2a]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('dashboard.needsReview')} (4)
              </button>
              <button
                onClick={() => setActiveQueueTab('progress')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeQueueTab === 'progress'
                    ? 'text-[#3b0a2a] bg-[#eff4ff] border-b-2 border-[#3b0a2a]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('dashboard.inProgress')} (36)
              </button>
              <button
                onClick={() => setActiveQueueTab('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeQueueTab === 'completed'
                    ? 'text-[#3b0a2a] bg-[#eff4ff] border-b-2 border-[#3b0a2a]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('dashboard.completedQueue')} (28)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-8 px-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg focus:outline-none"
              >
                <option value="All">{isAr ? 'جميع المدن (الجزائر، وهران، قسنطينة...)' : 'All Cities (Algiers, Oran, Constantine...)'}</option>
                <option value="Algiers">{isAr ? 'الجزائر العاصمة' : 'Algiers'}</option>
                <option value="Oran">{isAr ? 'وهران' : 'Oran'}</option>
                <option value="Constantine">{isAr ? 'قسنطينة' : 'Constantine'}</option>
                <option value="Ouargla">{isAr ? 'ورقلة' : 'Ouargla'}</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-9 bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200/80 font-medium">
                  <th className="px-4 py-2">{t('dashboard.projectAndInstitution')}</th>
                  <th className="px-4 py-2">{t('dashboard.matchedScholar')}</th>
                  <th className="px-4 py-2">{t('dashboard.missionDates')}</th>
                  <th className="px-4 py-2">{t('dashboard.alignment')}</th>
                  <th className="px-4 py-2">{t('dashboard.status')}</th>
                  <th className="px-4 py-2 text-right">{t('dashboard.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {SAMPLE_MATCHES.map((row) => {
                  const isSelected = selectedMatch.id === row.id;
                  const isApproved = approvedIds.includes(row.id);
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedMatch(row)}
                      className={`hover:bg-slate-50/60 transition-colors cursor-pointer ${
                        isSelected ? `bg-[#eff4ff]/40 ${isAr ? 'border-r-2' : 'border-l-2'} border-[#3b0a2a]` : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 truncate max-w-[210px] font-['Plus_Jakarta_Sans']">
                          {row.projectTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{row.institution}, {row.institutionCity}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{row.scholarName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <span className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                            {row.isDiaspora ? (isAr ? 'جالية' : 'Diaspora') : (isAr ? 'جامعة وطنية' : 'Local')}
                          </span>
                          <span>{row.scholarAffiliation}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                        {row.missionDates}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdea4] text-[#261900] font-mono text-[11px] font-bold border border-[#C89B3C]/40">
                          <Star className="w-3 h-3 fill-[#7b5900] text-[#7b5900]" />
                          {row.matchScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${row.statusColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${row.dotColor}`}></span>
                          {isApproved ? t('dashboard.done') : row.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMatch(row);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#3b0a2a] hover:bg-slate-100 transition-colors"
                            title={t('dashboard.inspectDetail')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleApprove(row.id, e)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                              isApproved
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#3b0a2a] hover:bg-[#4a0e38] text-white shadow-2xs'
                            }`}
                          >
                            {isApproved ? `✓ ${t('dashboard.done')}` : t('dashboard.approve')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Detail Inspection Drawer */}
        <div className="xl:col-span-4 bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col gap-4 sticky top-20">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C89B3C]"></span>
              <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
                {t('dashboard.inspectDetail')}
              </h3>
            </div>
            <span className="font-mono text-[11px] text-slate-400">ID: {selectedMatch.id}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#7b5900] uppercase">
                  {selectedMatch.institution} · {selectedMatch.scholarName}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5 font-['Plus_Jakarta_Sans']">
                  {selectedMatch.projectTitle}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#ffdea4] text-[#261900] font-bold font-mono text-[11px]">
                {selectedMatch.matchScore}%
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              {t('dashboard.confidenceBreakdown')}
            </span>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700">{t('dashboard.skillsAlignment')}</span>
                <span className="font-mono font-bold text-slate-900">{selectedMatch.skillsScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3b0a2a] rounded-full transition-all duration-300"
                  style={{ width: `${selectedMatch.skillsScore}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700">{t('dashboard.travelSync')}</span>
                <span className="font-mono font-bold text-emerald-700">{selectedMatch.travelScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${selectedMatch.travelScore}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700">{t('dashboard.labCompatibility')}</span>
                <span className="font-mono font-bold text-[#7b5900]">{selectedMatch.labScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C89B3C] rounded-full transition-all duration-300"
                  style={{ width: `${selectedMatch.labScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
            <div className="flex items-center gap-1.5 text-slate-900 text-xs font-semibold mb-1">
              <Lock className="w-3.5 h-3.5 text-[#C89B3C]" />
              <span>{t('dashboard.committeeNote')}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "{selectedMatch.committeeNote}"
            </p>
            <div className="mt-2 text-[10px] font-mono text-slate-400">
              {isAr ? 'تم الاعتماد من قبل: ' : 'Verified by: '} {selectedMatch.verifier}
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleSendIntro}
              className="w-full py-2 px-3 bg-[#3b0a2a] hover:bg-[#4a0e38] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Send className="w-3.5 h-3.5 text-[#C89B3C]" />
              <span>{t('dashboard.sendBilateralIntro')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
