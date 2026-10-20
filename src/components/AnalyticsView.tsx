import React, { useState } from 'react';
import { ActivityLogItem } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { ShieldCheck, Users, Sparkles, Clock, Star, Activity, Plane, FileSpreadsheet, Check } from 'lucide-react';

interface AnalyticsViewProps {
  logs?: ActivityLogItem[];
  auditLogs?: ActivityLogItem[];
  onExportAudit?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ logs, auditLogs, onExportAudit }) => {
  const activeLogs = auditLogs || logs || [];
  const { lang, t } = useTranslation();
  const isAr = lang === 'ar';
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const escapeCsvValue = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const handleExportCsv = () => {
    if (activeLogs.length === 0) return;
    const headers = [
      'Log ID',
      'Timestamp (ISO)',
      'Formatted Time',
      'Action Type',
      'User ID',
      'User Name',
      'User Role',
      'Entity Type',
      'Entity ID',
      'IP Address',
      'Audit Metadata',
    ];

    const rows = activeLogs.map((log) => [
      escapeCsvValue(log.id),
      escapeCsvValue(log.createdAt),
      escapeCsvValue(new Date(log.createdAt).toLocaleString()),
      escapeCsvValue(log.actionType),
      escapeCsvValue(log.userId || 'N/A'),
      escapeCsvValue(log.userName || 'Anonymous / System'),
      escapeCsvValue(log.userRole || 'anonymous'),
      escapeCsvValue(log.entityType || 'general'),
      escapeCsvValue(log.entityId || 'N/A'),
      escapeCsvValue(log.ipAddress || '127.0.0.1'),
      escapeCsvValue(log.metadata || {}),
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `dz_bridge_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B0D2C]/10 text-[#3B0D2C] text-xs font-bold mb-2 border border-[#3B0D2C]/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C89B3C]" />
            Regulatory Compliance: /api/v1/admin/analytics & /api/v1/audit/logs/
          </div>
          <h2 className="text-xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
            {t('analytics.title')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('analytics.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-800 font-mono bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
          <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Audit Engine: Active & Enforced</span>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{isAr ? 'المستخدمون المسجلون' : 'Registered Users'}</span>
            <Users className="w-4 h-4 text-[#3B0D2C]" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">84</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-[#3B0D2C] font-bold">56</span> Experts · <span className="text-blue-600 font-bold">28</span> Orgs
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{t('dashboard.matchSuccessRate')}</span>
            <Sparkles className="w-4 h-4 text-[#C89B3C]" />
          </div>
          <div className="text-2xl font-black text-[#8C6514] mt-2 font-mono">91.3%</div>
          <div className="text-[11px] text-slate-500 mt-1">42 / 46 accepted</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{isAr ? 'متوسط وقت المواءمة' : 'Avg Time to Match'}</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2 font-mono">2.3 days</div>
          <div className="text-[11px] text-slate-500 mt-1">Submission to 1st match</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{isAr ? 'مشاركة الجالية' : 'Diaspora Engagement'}</span>
            <Plane className="w-4 h-4 text-[#3B0D2C]" />
          </div>
          <div className="text-2xl font-black text-[#3B0D2C] mt-2 font-mono">67.8%</div>
          <div className="text-[11px] text-slate-500 mt-1">38 Diaspora scholars</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{t('dashboard.mutualSatisfaction')}</span>
            <Star className="w-4 h-4 text-[#C89B3C] fill-[#C89B3C]" />
          </div>
          <div className="text-2xl font-black text-[#8C6514] mt-2 font-mono">4.88 / 5</div>
          <div className="text-[11px] text-slate-500 mt-1">32 Post-collab surveys</div>
        </div>
      </div>

      {/* Immutable Activity Logs Stream */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {isAr ? 'سجل العمليات والرقابة المشفر' : 'Immutable Activity Logs (ActivityLoggerMiddleware)'}
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                {activeLogs.length} records available
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr
                ? 'توثيق فوري لكافة عمليات التسجيل، طرح المشاريع، المواءمة وتغيير الحالات.'
                : 'All major actions (registration, projects, matches, status changes) are persistently recorded.'}
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={activeLogs.length === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${
              downloadSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-[#3B0D2C] hover:bg-[#4A1238] text-white'
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>{isAr ? 'تم تصدير CSV' : 'CSV Exported'}</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 text-[#C89B3C]" />
                <span>{t('analytics.exportAuditCsv')}</span>
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                <th className="py-2.5 px-3">{t('analytics.timestamp')}</th>
                <th className="py-2.5 px-3">{t('analytics.action')}</th>
                <th className="py-2.5 px-3">{t('analytics.actor')}</th>
                <th className="py-2.5 px-3">{t('analytics.ip')}</th>
                <th className="py-2.5 px-3">{t('analytics.metadata')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-[#3B0D2C]/10 text-[#3B0D2C] border border-[#3B0D2C]/20 px-2 py-0.5 rounded text-[11px] font-bold">
                      {log.actionType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <span className="uppercase text-[10px] tracking-wider font-semibold">
                      {log.userRole || 'anonymous'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{log.ipAddress}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans text-[11px] truncate max-w-xs">
                    {JSON.stringify(log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
