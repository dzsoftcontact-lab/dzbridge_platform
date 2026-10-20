import React, { useState } from 'react';
import { ProjectItem, ProjectStatus, MatchItem, CollaborationItem } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Building2,
  PlusCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Calendar,
  Sparkles,
  Users,
  Handshake,
  Search,
  Filter,
} from 'lucide-react';

interface OrganizationPortalProps {
  currentOrgName: string;
  projects: ProjectItem[];
  matches: MatchItem[];
  collaborations: CollaborationItem[];
  onCreateProject: (proj: Partial<ProjectItem>) => void;
  onTransitionStatus: (projectId: string, targetStatus: ProjectStatus, notes?: string) => void;
  onConfirmCollaboration: (projectId: string, expertId: string, notes?: string) => void;
}

const LIFECYCLE_STEPS: ProjectStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'matched',
  'contact_initiated',
  'confirmed',
  'in_progress',
  'completed',
];

const ALLOWED_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['under_review', 'cancelled'],
  under_review: ['matched', 'unsuccessful', 'cancelled'],
  matched: ['contact_initiated', 'unsuccessful', 'cancelled'],
  contact_initiated: ['confirmed', 'unsuccessful', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  unsuccessful: ['under_review'],
};

export const OrganizationPortal: React.FC<OrganizationPortalProps> = ({
  currentOrgName,
  projects,
  matches,
  collaborations,
  onCreateProject,
  onTransitionStatus,
  onConfirmCollaboration,
}) => {
  const { lang, t } = useTranslation();
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'projects' | 'discovery' | 'agreements'>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState('');
  const [transitionNotes, setTransitionNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New Project Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [location, setLocation] = useState('Algiers');
  const [startDate, setStartDate] = useState('2026-11-05');
  const [endDate, setEndDate] = useState('2026-11-15');
  const [travel, setTravel] = useState(true);
  const [lodging, setLodging] = useState(true);
  const [stipend, setStipend] = useState(true);
  const [logisticsNotes, setLogisticsNotes] = useState('Flight tickets, hotel lodging, and research transport covered.');

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectMatches = matches.filter((m) => m.projectId === selectedProject?.id);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onCreateProject({
      title,
      description,
      skillsRequired: skills.length > 0 ? skills : ['Artificial Intelligence', 'Data Science'],
      location,
      startDate,
      endDate,
      logisticsOffered: {
        travel,
        lodging,
        stipend,
        notes: logisticsNotes,
      },
      status: 'submitted',
    });
    setShowCreateModal(false);
    setTitle('');
    setDescription('');
    setSkillsStr('');
    setActionSuccess(
      isAr
        ? `تم تسجيل المبادرة "${title}" بنجاح في المنظومة الوطنية!`
        : `Project "${title}" submitted to the national matchmaking queue.`,
    );
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleStatusChange = (targetStatus: ProjectStatus) => {
    if (!selectedProject) return;
    onTransitionStatus(selectedProject.id, targetStatus, transitionNotes);
    setTransitionNotes('');
    setActionSuccess(
      isAr
        ? `تم ترقية حالة المشروع إلى: ${targetStatus}`
        : `Project status transitioned to ${targetStatus.toUpperCase()}.`,
    );
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleExecuteProtocol = (expertId: string, expertName: string) => {
    if (!selectedProject) return;
    onConfirmCollaboration(selectedProject.id, expertId, `Bilateral partnership agreement executed between ${currentOrgName} and ${expertName}.`);
    setActionSuccess(
      isAr
        ? `تم تثبيت وتوقيع بروتوكول التعاون الأكاديمي مع ${expertName}!`
        : `Cooperation protocol successfully confirmed with ${expertName}.`,
    );
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 border-2 border-[#C89B3C] text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            ESI
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                {currentOrgName}
              </h2>
              <span className="text-[11px] font-mono font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full border border-blue-200">
                {t('organization.institutionTitle')}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {t('organization.subtitle')}
            </p>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
              <span>{projects.length} {isAr ? 'مشاريع مسجلة' : 'Active Proposals'}</span>
              <span>·</span>
              <span className="text-[#3B0D2C] font-semibold">{projectMatches.length} {isAr ? 'مواءمات مع علماء الجالية' : 'Diaspora Matches'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'projects'
                  ? 'bg-white text-[#3B0D2C] shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('organization.myProjectsTab')} ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('discovery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'discovery'
                  ? 'bg-white text-[#3B0D2C] shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('organization.matchedScholarsTab')} ({matches.length})
            </button>
            <button
              onClick={() => setActiveTab('agreements')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'agreements'
                  ? 'bg-white text-[#3B0D2C] shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('organization.protocolsTab')} ({collaborations.length})
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#3B0D2C] hover:bg-[#4A1238] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4 text-[#C89B3C]" />
            <span>{t('organization.submitProjectBtn')}</span>
          </button>
        </div>
      </div>

      {/* University Host Active Features & Capabilities Hub */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2.5">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-blue-900">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>University Host Features & Capabilities</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">4 Modules Active</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div
            onClick={() => setShowCreateModal(true)}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-500 cursor-pointer transition shadow-2xs"
          >
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Research Challenges</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Post doctoral initiatives with skill criteria and logistics packages.
            </p>
          </div>
          <div
            onClick={() => setActiveTab('discovery')}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-500 cursor-pointer transition shadow-2xs"
          >
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-[#C89B3C]" />
              <span>2. Diaspora Pairing</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Instantly review top-matched Algerian diaspora laureate fellows.
            </p>
          </div>
          <div
            onClick={() => setActiveTab('projects')}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-500 cursor-pointer transition shadow-2xs"
          >
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>3. 8-Phase Lifecycle</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Advance state machine from draft to confirmed institutional protocol.
            </p>
          </div>
          <div
            onClick={() => setActiveTab('agreements')}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-500 cursor-pointer transition shadow-2xs"
          >
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <Handshake className="w-3.5 h-3.5 text-emerald-600" />
              <span>4. Bilateral Protocols</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Ratify formal academic cooperation agreements and thesis co-supervision.
            </p>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* TAB 1: PROJECTS & FINITE STATE MACHINE */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Projects List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              <span>{t('organization.myProjectsTab')}</span>
              <span className="font-mono text-slate-400">{projects.length} Total</span>
            </div>

            {projects.map((proj) => {
              const isSelected = selectedProject?.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#3B0D2C] ring-2 ring-[#3B0D2C]/20 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{proj.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase font-mono">
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{proj.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C89B3C]" />
                      {proj.location}
                    </span>
                    <span className="font-mono">{proj.startDate}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Project Finite State Machine Inspector */}
          <div className="lg:col-span-7">
            {selectedProject ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 sticky top-20">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#3B0D2C] uppercase tracking-wider">
                      {t('organization.fsmTitle')}
                    </span>
                    <span className="text-xs font-mono font-bold bg-[#3B0D2C] text-white px-2.5 py-0.5 rounded-full">
                      {selectedProject.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{selectedProject.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">{selectedProject.description}</p>
                </div>

                {/* State Machine Step Progress */}
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    {isAr ? 'مسار حياة المشروع (آلة الحالات)' : 'Lifecycle Progress Bar'}
                  </span>
                  <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {LIFECYCLE_STEPS.map((step, idx) => {
                      const isCurrent = selectedProject.status === step;
                      const isPassed =
                        LIFECYCLE_STEPS.indexOf(selectedProject.status) >= idx;
                      return (
                        <div
                          key={step}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shrink-0 flex items-center gap-1 ${
                            isCurrent
                              ? 'bg-[#3B0D2C] text-[#C89B3C] shadow-xs ring-2 ring-[#C89B3C]/50'
                              : isPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isPassed && !isCurrent && <span>✓</span>}
                          <span>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* State Machine Transitions */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">
                    {t('organization.advanceState')}:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(ALLOWED_TRANSITIONS[selectedProject.status] || []).map((target) => (
                      <button
                        key={target}
                        onClick={() => handleStatusChange(target)}
                        className="px-3 py-1.5 bg-white border border-[#3B0D2C] hover:bg-[#3B0D2C] text-[#3B0D2C] hover:text-white rounded-lg text-xs font-bold transition shadow-2xs flex items-center gap-1.5"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Advance to: {target.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Matched Candidates */}
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    {t('organization.matchedScholarsTab')} ({projectMatches.length})
                  </span>
                  <div className="space-y-2">
                    {projectMatches.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-slate-900 block">{m.expertName}</strong>
                          <span className="text-slate-500 text-[11px]">{m.expertAffiliation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#C89B3C] bg-white px-2 py-0.5 rounded border border-slate-200">
                            {m.compatibilityScore}%
                          </span>
                          <button
                            onClick={() => handleExecuteProtocol(m.expertId, m.expertName)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition shadow-2xs"
                          >
                            {t('organization.confirmPartnership')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 2: DISCOVERY & MATCHES */}
      {activeTab === 'discovery' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">{t('organization.matchedScholarsTab')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m) => (
              <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{m.expertName}</h4>
                    <span className="text-[11px] text-slate-500">{m.expertAffiliation}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#C89B3C] bg-white px-2 py-0.5 rounded border">
                    {m.compatibilityScore}%
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  {m.projectTitle}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROTOCOLS & AGREEMENTS */}
      {activeTab === 'agreements' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">{t('organization.protocolsTab')}</h3>
          <div className="space-y-3">
            {collaborations.map((collab) => (
              <div key={collab.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{collab.projectTitle}</h4>
                  <span className="text-[11px] text-slate-500">{collab.expertName} · {collab.organizationName}</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase">
                  {collab.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT NEW PROJECT */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#3B0D2C]" />
              {t('organization.createProposal')}
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">{t('organization.projectTitle')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced AI in Healthcare Workshop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">{t('organization.descriptionScope')}</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe knowledge transfer objectives, doctoral target audience, and lab requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  {t('organization.requiredSkills')}
                </label>
                <input
                  type="text"
                  placeholder={t('organization.skillsPlaceholder')}
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">{t('organization.hostCity')}</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                  >
                    <option value="Algiers">Algiers (ESI / USTHB)</option>
                    <option value="Oran">Oran (USTO / Univ Oran 1)</option>
                    <option value="Constantine">Constantine (Univ Frères Mentouri)</option>
                    <option value="Annaba">Annaba (Univ Badji Mokhtar)</option>
                    <option value="Ouargla">Ouargla (Univ Kasdi Merbah)</option>
                    <option value="Remote">Remote Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">{t('organization.startDate')}</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <label className="text-slate-700 font-bold block">{t('organization.logisticsOffered')}</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={travel}
                      onChange={(e) => setTravel(e.target.checked)}
                      className="rounded text-[#3B0D2C]"
                    />
                    <span>{t('organization.flights')}</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lodging}
                      onChange={(e) => setLodging(e.target.checked)}
                      className="rounded text-[#3B0D2C]"
                    />
                    <span>{t('organization.lodging')}</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stipend}
                      onChange={(e) => setStipend(e.target.checked)}
                      className="rounded text-[#3B0D2C]"
                    />
                    <span>{t('organization.stipend')}</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white font-bold px-5 py-2 rounded-xl transition shadow-xs"
                >
                  {t('organization.submitProjectBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
