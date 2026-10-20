import React, { useState } from 'react';
import {
  UserRole,
  CustomKpiItem,
  SchemaTableDef,
  SchemaRelation,
  BackendConnectionConfig,
  ActivityLogItem,
} from '../types';
import { TableRow } from '../services/dbStore';
import { KpiManagementStudio } from './KpiManagementStudio';
import { ApiManagementStudio } from './ApiManagementStudio';
import { DatabaseStudio } from './DatabaseStudio';
import { AnalyticsView } from './AnalyticsView';
import { UserManagementStudio } from './UserManagementStudio';
import { useTranslation } from '../i18n/LanguageContext';
import {
  ShieldCheck,
  Target,
  Terminal,
  Database,
  Activity,
  Key,
  Globe2,
  CheckCircle2,
  Settings,
  Sparkles,
  ArrowRight,
  Server,
  Layers,
  Lock,
  Users,
} from 'lucide-react';

interface AdminConsoleProps {
  customKpis: CustomKpiItem[];
  onAddKpi: (kpi: CustomKpiItem) => void;
  onUpdateKpi: (id: string, updates: Partial<CustomKpiItem>) => void;
  onDeleteKpi: (id: string) => void;
  onResetDefaultKpis: () => void;
  backendConfig: BackendConnectionConfig;
  onUpdateBackendConfig: (config: Partial<BackendConnectionConfig>) => void;
  schemaTables: SchemaTableDef[];
  schemaRelations: SchemaRelation[];
  onUpdateTables: (tables: SchemaTableDef[]) => void;
  onUpdateRelations: (relations: SchemaRelation[]) => void;
  dataStore: Record<string, TableRow[]>;
  onInsertRow: (tableName: string, row: Record<string, any>) => void;
  onUpdateRow: (tableName: string, id: string, updates: Record<string, any>) => void;
  onDeleteRow: (tableName: string, id: string) => void;
  onImportRows: (tableName: string, rows: Record<string, any>[]) => void;
  onResetAllData: () => void;
  onSeedBaselineData: () => void;
  auditLogs: ActivityLogItem[];
  onExportAudit?: () => void;
  onRenameTable?: (oldName: string, newName: string) => void;
  onDeleteTableData?: (tableName: string) => void;
  onExecuteEndpoint: (
    endpointId: string,
    method: string,
    path: string,
    body: any,
    targetEngine: 'django' | 'nestjs' | 'browser',
  ) => Promise<{ statusCode: number; data: any; latencyMs: number }>;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  customKpis,
  onAddKpi,
  onUpdateKpi,
  onDeleteKpi,
  onResetDefaultKpis,
  backendConfig,
  onUpdateBackendConfig,
  schemaTables,
  schemaRelations,
  onUpdateTables,
  onUpdateRelations,
  dataStore,
  onInsertRow,
  onUpdateRow,
  onDeleteRow,
  onImportRows,
  onResetAllData,
  onSeedBaselineData,
  auditLogs,
  onExportAudit,
  onRenameTable,
  onDeleteTableData,
  onExecuteEndpoint,
}) => {
  const { lang, t } = useTranslation();
  const isAr = lang === 'ar';
  const [activeAdminSection, setActiveAdminSection] = useState<'users' | 'kpi' | 'api' | 'database' | 'audit'>('users');

  return (
    <div className="space-y-6">
      {/* 1. Sovereign Admin Features & Capabilities Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>MESRS Sovereign Directorate & Regulatory Console</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
              Super Admin Control Center
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Manage authorized accounts & roles, configure backend APIs, design live custom KPIs, inspect relational schemas, and verify cryptographic audit trails.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Authenticated Super Admin Pill */}
            <div className="flex items-center gap-2.5 px-3 py-2 bg-gradient-to-r from-slate-50 to-amber-50/50 rounded-xl border border-slate-200 text-xs">
              <div className="w-7 h-7 rounded-lg bg-[#3b0a2a] text-[#C89B3C] font-black flex items-center justify-center text-xs shadow-2xs">
                DH
              </div>
              <div>
                <div className="font-extrabold text-slate-900 leading-none">DEGHA HOUSSEM EDDINE</div>
                <div className="text-[10px] text-[#8C6514] font-semibold mt-0.5">Super Admin · dzsoft.contact@gmail.com</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-mono">
              <Server className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-slate-500 text-[10px]">BACKEND GATEWAY</div>
                <div className="font-bold text-slate-900">
                  {backendConfig.status === 'connected' ? 'Port 8000 (DRF) · Port 4000 (NestJS)' : 'In-Browser DB'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Core Admin Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-5">
          <div
            onClick={() => setActiveAdminSection('users')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              activeAdminSection === 'users'
                ? 'bg-purple-50/70 border-[#3B0D2C] shadow-2xs ring-1 ring-[#3B0D2C]/30'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#3B0D2C]" />
                <span>1. User Management</span>
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-900 border border-purple-200 px-1.5 py-0.5 rounded font-mono font-bold">
                RBAC
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              User CRUD, role assignment, account activation, permissions, and institution profiles.
            </p>
          </div>

          <div
            onClick={() => setActiveAdminSection('kpi')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              activeAdminSection === 'kpi'
                ? 'bg-amber-50/70 border-[#C89B3C] shadow-2xs ring-1 ring-[#C89B3C]/30'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#C89B3C]" />
                <span>2. KPI Builder</span>
              </span>
              <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                {customKpis.length} KPIs
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Strategic targets, formula expressions, and front-end landing card publishing.
            </p>
          </div>

          <div
            onClick={() => setActiveAdminSection('api')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              activeAdminSection === 'api'
                ? 'bg-blue-50/70 border-blue-500 shadow-2xs ring-1 ring-blue-500/30'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-blue-600" />
                <span>3. API Gateway</span>
              </span>
              <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                14 Routes
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Backend destinations, Bearer tokens, and RFC-7807 test requests.
            </p>
          </div>

          <div
            onClick={() => setActiveAdminSection('database')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              activeAdminSection === 'database'
                ? 'bg-purple-50/70 border-[#3B0D2C] shadow-2xs ring-1 ring-[#3B0D2C]/30'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#3B0D2C]" />
                <span>4. Database Studio</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                {schemaTables.length} Tables
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              21 relational tables, matching algorithms, evaluation metrics, and schemas.
            </p>
          </div>

          <div
            onClick={() => setActiveAdminSection('audit')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              activeAdminSection === 'audit'
                ? 'bg-emerald-50/70 border-emerald-500 shadow-2xs ring-1 ring-emerald-500/30'
                : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>5. Crypto Audit</span>
              </span>
              <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                {auditLogs.length} Records
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Regulatory compliance verification, immutable event trail, and SHA-256 integrity inspection.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Admin Section View Switcher Body */}
      {activeAdminSection === 'users' && (
        <UserManagementStudio currentRole="super_admin" />
      )}

      {activeAdminSection === 'kpi' && (
        <KpiManagementStudio
          kpis={customKpis}
          onAddKpi={onAddKpi}
          onUpdateKpi={onUpdateKpi}
          onDeleteKpi={onDeleteKpi}
          onResetDefaultKpis={onResetDefaultKpis}
        />
      )}

      {activeAdminSection === 'api' && (
        <ApiManagementStudio
          activeRole="admin"
          dataStore={dataStore}
          schemaTables={schemaTables}
          onInsertRow={onInsertRow}
          onUpdateRow={onUpdateRow}
          onDeleteRow={onDeleteRow}
          onExecuteEndpoint={onExecuteEndpoint}
        />
      )}

      {activeAdminSection === 'database' && (
        <DatabaseStudio
          tables={schemaTables}
          relations={schemaRelations}
          onUpdateTables={onUpdateTables}
          onUpdateRelations={onUpdateRelations}
          dataStore={dataStore}
          onInsertRow={onInsertRow}
          onUpdateRow={onUpdateRow}
          onDeleteRow={onDeleteRow}
          onImportRows={onImportRows}
          onResetAllData={onResetAllData}
          onSeedBaselineData={onSeedBaselineData}
          onRenameTable={onRenameTable}
          onDeleteTableData={onDeleteTableData}
        />
      )}

      {activeAdminSection === 'audit' && (
        <AnalyticsView
          auditLogs={auditLogs}
          onExportAudit={onExportAudit}
        />
      )}
    </div>
  );
};
