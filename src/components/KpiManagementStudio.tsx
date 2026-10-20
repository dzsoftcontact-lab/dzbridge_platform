import React, { useState } from 'react';
import { CustomKpiItem } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import {
  BarChart3,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Activity,
  Layers,
  Eye,
  EyeOff,
  X,
  Target,
  FileCode,
  Download,
  Filter,
} from 'lucide-react';

interface KpiManagementStudioProps {
  kpis: CustomKpiItem[];
  onAddKpi: (kpi: CustomKpiItem) => void;
  onUpdateKpi: (id: string, updates: Partial<CustomKpiItem>) => void;
  onDeleteKpi: (id: string) => void;
  onResetDefaultKpis: () => void;
}

export const KpiManagementStudio: React.FC<KpiManagementStudioProps> = ({
  kpis,
  onAddKpi,
  onUpdateKpi,
  onDeleteKpi,
  onResetDefaultKpis,
}) => {
  const { lang, t } = useTranslation();
  const isAr = lang === 'ar';

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingKpi, setEditingKpi] = useState<CustomKpiItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<CustomKpiItem['category']>('National Impact');
  const [formCurrentVal, setFormCurrentVal] = useState('0');
  const [formTargetVal, setFormTargetVal] = useState('100');
  const [formUnit, setFormUnit] = useState('%');
  const [formProgress, setFormProgress] = useState(75);
  const [formStatus, setFormStatus] = useState<CustomKpiItem['status']>('on_track');
  const [formVisType, setFormVisType] = useState<CustomKpiItem['visualizationType']>('progress');
  const [formDisplayLanding, setFormDisplayLanding] = useState(true);
  const [formFormula, setFormFormula] = useState('COUNT(protocols) / TARGET * 100');

  const openAddModal = () => {
    setEditingKpi(null);
    setFormName('');
    setFormDesc('');
    setFormCategory('National Impact');
    setFormCurrentVal('42');
    setFormTargetVal('50');
    setFormUnit('Protocols');
    setFormProgress(84);
    setFormStatus('on_track');
    setFormVisType('progress');
    setFormDisplayLanding(true);
    setFormFormula('COUNT(collaborations) WHERE status = "active"');
    setShowAddModal(true);
  };

  const openEditModal = (kpi: CustomKpiItem) => {
    setEditingKpi(kpi);
    setFormName(kpi.name);
    setFormDesc(kpi.description);
    setFormCategory(kpi.category);
    setFormCurrentVal(kpi.currentValue);
    setFormTargetVal(kpi.targetValue);
    setFormUnit(kpi.unit || '');
    setFormProgress(kpi.progressPercentage);
    setFormStatus(kpi.status);
    setFormVisType(kpi.visualizationType);
    setFormDisplayLanding(kpi.displayOnLanding);
    setFormFormula(kpi.formulaOrSource || '');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    if (editingKpi) {
      onUpdateKpi(editingKpi.id, {
        name: formName,
        description: formDesc,
        category: formCategory,
        currentValue: formCurrentVal,
        targetValue: formTargetVal,
        unit: formUnit,
        progressPercentage: Number(formProgress),
        status: formStatus,
        visualizationType: formVisType,
        displayOnLanding: formDisplayLanding,
        formulaOrSource: formFormula,
      });
    } else {
      const newKpi: CustomKpiItem = {
        id: `kpi-${Date.now()}`,
        name: formName,
        description: formDesc,
        category: formCategory,
        currentValue: formCurrentVal,
        targetValue: formTargetVal,
        unit: formUnit,
        progressPercentage: Number(formProgress),
        status: formStatus,
        visualizationType: formVisType,
        displayOnLanding: formDisplayLanding,
        formulaOrSource: formFormula,
        createdAt: new Date().toISOString(),
      };
      onAddKpi(newKpi);
    }

    setShowAddModal(false);
    setEditingKpi(null);
  };

  const filteredKpis = kpis.filter((k) => {
    if (activeCategoryFilter === 'all') return true;
    return k.category === activeCategoryFilter;
  });

  const categories = ['all', 'National Impact', 'Academic Research', 'Diaspora Outreach', 'Governance'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B0D2C]/10 text-[#3B0D2C] border border-[#3B0D2C]/20 text-xs font-bold mb-2">
            <Target className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span>MESRS Sovereign KPI Builder & Management Engine</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 font-['Plus_Jakarta_Sans']">
            <span>Custom Performance Indicators & Goals</span>
            <span className="text-xs font-mono font-bold bg-[#C89B3C]/15 text-[#8C6514] px-2.5 py-0.5 rounded-full border border-[#C89B3C]/30">
              Live Mutable Engine
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure, calculate, and publish strategic metrics across national university research, diaspora engagement, and bilateral protocols for real-time front-end and landing page consumption.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetDefaultKpis}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition"
          >
            Reset Official KPIs
          </button>
          <button
            onClick={openAddModal}
            className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#C89B3C]" />
            <span>Create New Custom KPI</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-2 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeCategoryFilter === cat
                  ? 'bg-white text-[#3B0D2C] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? 'All Metrics' : cat} ({cat === 'all' ? kpis.length : kpis.filter((k) => k.category === cat).length})
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-mono">
          <span>Landing Page Visible: </span>
          <strong className="text-slate-900">{kpis.filter((k) => k.displayOnLanding).length}</strong> / {kpis.length}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredKpis.map((kpi) => (
          <div
            key={kpi.id}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-[#8C6514] bg-[#C89B3C]/15 px-2.5 py-0.5 rounded-full border border-[#C89B3C]/30">
                  {kpi.category}
                </span>
                <div className="flex items-center gap-1">
                  {kpi.displayOnLanding ? (
                    <span
                      title="Published on Public Landing Page"
                      className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Landing
                    </span>
                  ) : (
                    <span
                      title="Internal Admin Console Only"
                      className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"
                    >
                      <EyeOff className="w-3 h-3" />
                      Internal
                    </span>
                  )}
                  <button
                    onClick={() => openEditModal(kpi)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                    title="Edit KPI Definition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteKpi(kpi.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="Delete KPI"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
                {kpi.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {kpi.description}
              </p>
            </div>

            {/* Metric Value & Progress */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900 font-mono tracking-tight tabular-nums">
                    {kpi.currentValue}
                  </span>
                  {kpi.unit && <span className="text-xs font-bold text-slate-500 ml-1">{kpi.unit}</span>}
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Target</span>
                  <span className="font-mono font-bold text-slate-700 tabular-nums">{kpi.targetValue}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-600">Fulfillment</span>
                  <span className="font-mono font-bold text-[#3B0D2C] tabular-nums">
                    {kpi.progressPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
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

              {kpi.formulaOrSource && (
                <div className="bg-slate-50 p-2 rounded-lg font-mono text-[10px] text-slate-600 truncate border border-slate-150">
                  <span className="text-slate-400">Formula: </span>
                  {kpi.formulaOrSource}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[9px] font-mono">
                <span className="bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-bold">
                  🔗 FK algorithm: Standard 4-Factor v2.6
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                  🏛️ FK institution: institutions
                </span>
                <span className="bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded font-bold">
                  📋 FK audited: kpi_evaluations
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create / Edit Custom KPI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#C89B3C]" />
                {editingKpi ? 'Edit Custom Performance Indicator' : 'Construct New Custom Metric (KPI)'}
              </h4>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingKpi(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">KPI Title / Metric Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bilateral Doctoral Co-Supervision Rate"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Methodology & Description</label>
                <input
                  type="text"
                  placeholder="Institutional goal, frequency of calculation, and criteria"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                  >
                    <option value="National Impact">National Impact</option>
                    <option value="Academic Research">Academic Research</option>
                    <option value="Diaspora Outreach">Diaspora Outreach</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Status Classification</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                  >
                    <option value="on_track">On Track (Nominal)</option>
                    <option value="exceeded">Exceeded Target</option>
                    <option value="attention_required">Attention Required</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Current Value</label>
                  <input
                    type="text"
                    required
                    value={formCurrentVal}
                    onChange={(e) => setFormCurrentVal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Target Value</label>
                  <input
                    type="text"
                    required
                    value={formTargetVal}
                    onChange={(e) => setFormTargetVal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Unit / Suffix</label>
                  <input
                    type="text"
                    placeholder="%, Protocols, Laureates"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Progress Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={formProgress}
                    onChange={(e) => setFormProgress(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Visualization Style</label>
                  <select
                    value={formVisType}
                    onChange={(e) => setFormVisType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  >
                    <option value="progress">Linear Progress Bar</option>
                    <option value="gauge">Radial Gauge</option>
                    <option value="stat_counter">Stat Counter Only</option>
                    <option value="sparkline">Trend Sparkline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Data Source Formula / SQL Query</label>
                <input
                  type="text"
                  placeholder="e.g. COUNT(matches) WHERE status = 'accepted'"
                  value={formFormula}
                  onChange={(e) => setFormFormula(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 text-[11px]"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formDisplayLanding}
                  onChange={(e) => setFormDisplayLanding(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3B0D2C] focus:ring-[#3B0D2C] accent-[#3B0D2C]"
                />
                <span className="font-semibold text-slate-700">
                  Feature this KPI on the Public Sovereign Landing Page
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingKpi(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white font-bold px-4 py-2 rounded-xl transition shadow"
                >
                  {editingKpi ? 'Save Changes' : 'Create KPI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
