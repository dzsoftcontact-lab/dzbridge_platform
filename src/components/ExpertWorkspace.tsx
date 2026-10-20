import React, { useState } from 'react';
import { UserProfile, ExpertAvailability, MatchItem, ProjectItem, CollaborationItem } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import {
  GraduationCap,
  Calendar,
  MapPin,
  Sparkles,
  Plane,
  Plus,
  CheckCircle2,
  FileText,
  Upload,
  BookOpen,
  Award,
  Send,
  Building2,
  ChevronRight,
} from 'lucide-react';

interface ExpertWorkspaceProps {
  currentExpert: {
    id: string;
    email: string;
    profile: UserProfile;
    availabilities: ExpertAvailability[];
  };
  matches: MatchItem[];
  projects: ProjectItem[];
  collaborations: CollaborationItem[];
  onAddAvailability: (avail: Partial<ExpertAvailability>) => void;
  onRespondMatch: (matchId: string, decision: 'accepted' | 'rejected', notes?: string) => void;
  onUploadDocument: (doc: { name: string; type: any; url: string; size_bytes?: number }) => void;
}

export const ExpertWorkspace: React.FC<ExpertWorkspaceProps> = ({
  currentExpert,
  matches,
  projects,
  collaborations,
  onAddAvailability,
  onRespondMatch,
  onUploadDocument,
}) => {
  const { lang, t } = useTranslation();
  const isAr = lang === 'ar';

  const [activeSubTab, setActiveSubTab] = useState<'invitations' | 'availability' | 'profile' | 'missions'>('invitations');
  const [showAddAvailModal, setShowAddAvailModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(matches[0] || null);

  // Availability form state
  const [availCity, setAvailCity] = useState('Algiers');
  const [availStart, setAvailStart] = useState('2026-11-01');
  const [availEnd, setAvailEnd] = useState('2026-11-20');
  const [availNotes, setAvailNotes] = useState('Keynote lectures, doctoral workshops, and thesis jury participation.');

  // Document upload form
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<'cv' | 'publication' | 'patent'>('publication');
  const [docUrl, setDocUrl] = useState('');

  // Response notes
  const [responseNotes, setResponseNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const expertMatches = matches.filter((m) => m.expertId === currentExpert.id || m.expertName.includes(currentExpert.profile.fullName));
  const expertCollabs = collaborations.filter((c) => c.expertId === currentExpert.id || c.expertName.includes(currentExpert.profile.fullName));

  const handleAddAvailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!availCity || !availStart || !availEnd) return;
    const s = new Date(availStart);
    const end = new Date(availEnd);
    const diff = Math.max(1, Math.round((end.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    onAddAvailability({
      city: availCity,
      startDate: availStart,
      endDate: availEnd,
      durationDays: diff,
      notes: availNotes,
    });
    setShowAddAvailModal(false);
    setActionSuccess(
      isAr
        ? `تم تسجيل فترة الزيارة في ${availCity} (${diff} يوماً) بنجاح!`
        : `Algeria visit window in ${availCity} (${diff} days) registered successfully.`,
    );
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;
    onUploadDocument({
      name: docName,
      type: docType,
      url: docUrl || `https://storage.dz-bridge.dz/docs/${docName.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      size_bytes: 1840000,
    });
    setShowUploadModal(false);
    setDocName('');
    setDocUrl('');
    setActionSuccess(
      isAr
        ? `تم إيداع الوثيقة "${docName}" في الملف العلمي بنجاح!`
        : `Document "${docName}" added to academic dossier.`,
    );
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleDecision = (decision: 'accepted' | 'rejected') => {
    if (!selectedMatch) return;
    onRespondMatch(selectedMatch.id, decision, responseNotes);
    setActionSuccess(
      isAr
        ? `تم تسجيل ردك على الدعوة بنجاح (${decision === 'accepted' ? 'قبول' : 'اعتذار'}).`
        : `Invitation for "${selectedMatch.projectTitle}" marked as ${decision.toUpperCase()}.`,
    );
    setResponseNotes('');
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Scholar Laureate Identity */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B0D2C] via-[#4A1238] to-[#1F0717] border-2 border-[#C89B3C] text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            {currentExpert.profile.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-black text-slate-900 font-['Plus_Jakarta_Sans']">
                {currentExpert.profile.fullName}
              </h2>
              {currentExpert.profile.isDiaspora && (
                <span className="text-[11px] font-mono font-bold bg-[#C89B3C]/15 text-[#8C6514] px-2.5 py-0.5 rounded-full border border-[#C89B3C]/30 flex items-center gap-1">
                  <Plane className="w-3 h-3 text-[#C89B3C]" />
                  {t('expert.diasporaScholar')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {currentExpert.profile.titleOrRank || 'Senior Research Fellow'} ·{' '}
              <strong className="text-slate-900">{currentExpert.profile.affiliation || currentExpert.profile.organizationName}</strong>
            </p>
            <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C89B3C]" />
                {currentExpert.profile.city}, {currentExpert.profile.country}
              </span>
              <span>·</span>
              <span className="font-mono text-[#3B0D2C] font-semibold">{currentExpert.email}</span>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('invitations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'invitations'
                ? 'bg-white text-[#3B0D2C] shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C89B3C]" />
            {t('expert.invitationsTab')} ({expertMatches.length})
          </button>
          <button
            onClick={() => setActiveSubTab('availability')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'availability'
                ? 'bg-white text-[#3B0D2C] shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            {t('expert.visitWindowsTab')} ({currentExpert.availabilities.length})
          </button>
          <button
            onClick={() => setActiveSubTab('missions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'missions'
                ? 'bg-white text-[#3B0D2C] shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            {t('expert.partnershipsTab')} ({expertCollabs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'profile'
                ? 'bg-white text-[#3B0D2C] shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#C89B3C]" />
            {t('expert.dossierTab')}
          </button>
        </div>
      </div>

      {/* Scholar Profile Active Features & Capabilities Hub */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2.5">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-[#8C6514]">
            <Award className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span>Scholar Profile Features & Capabilities</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">4 Modules Active</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div
            onClick={() => setActiveSubTab('availability')}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-[#C89B3C] cursor-pointer transition shadow-2xs"
          >
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#C89B3C]" />
              <span>1. Algeria Visit Windows</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Declare mission availability with flight, villa, and research stipend coverage.
            </p>
          </div>
          <div
            onClick={() => setActiveSubTab('invitations')}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-[#C89B3C] cursor-pointer transition shadow-2xs"
          >
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>2. 4-Factor Matching</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Receive high-compat doctoral proposals (45% skills + 25% timeline overlap).
            </p>
          </div>
          <div
            onClick={() => setActiveSubTab('profile')}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-[#C89B3C] cursor-pointer transition shadow-2xs"
          >
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Academic Dossier</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Upload CV, ORCID IDs, and manage research tags recognized nationally.
            </p>
          </div>
          <div
            onClick={() => setActiveSubTab('missions')}
            className="p-3 bg-white rounded-xl border border-slate-200 hover:border-[#C89B3C] cursor-pointer transition shadow-2xs"
          >
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              <span>4. Bilateral Protocols</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Track ratified institutional research agreements and joint co-supervisions.
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

      {/* SUB-TAB 1: MATCH INVITATIONS */}
      {activeSubTab === 'invitations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Invitations List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              <span>{t('expert.pendingInvitations')} ({expertMatches.length})</span>
              <span className="text-[#C89B3C] font-semibold">{isAr ? 'مرتب حسب التوافق' : 'Ranked by Fit'}</span>
            </div>

            {expertMatches.length > 0 ? (
              expertMatches.map((match) => {
                const isSelected = selectedMatch?.id === match.id;
                return (
                  <div
                    key={match.id}
                    onClick={() => setSelectedMatch(match)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#3B0D2C] ring-2 ring-[#3B0D2C]/20 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#3B0D2C] uppercase font-bold tracking-wider">
                          {match.organizationName}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">
                          {match.projectTitle}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-[#C89B3C] font-mono">
                          {match.compatibilityScore}%
                        </span>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Match</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          match.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : match.status === 'rejected'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {match.status === 'accepted'
                          ? isAr ? 'مقبول' : 'Accepted'
                          : match.status === 'rejected'
                          ? isAr ? 'معتذر عنه' : 'Declined'
                          : isAr ? 'قيد الانتظار' : 'Pending'}
                      </span>
                      <span className="text-[#3B0D2C] font-semibold flex items-center gap-1 text-[11px]">
                        {isAr ? 'معاينة التفاصيل' : 'Review Details'} <ChevronRight className="w-3 h-3 text-[#C89B3C]" />
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs">{t('expert.noInvitations')}</p>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Match Inspector */}
          <div className="lg:col-span-7">
            {selectedMatch ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 sticky top-20">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#3B0D2C] uppercase tracking-wider">
                      {selectedMatch.organizationName}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1 font-['Plus_Jakarta_Sans']">
                      {selectedMatch.projectTitle}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#C89B3C]" />
                      <span>{selectedMatch.organizationCity || 'Algiers'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-br from-[#3B0D2C] to-[#2B0A20] text-white rounded-xl text-center shadow-xs">
                    <div className="text-2xl font-black text-[#C89B3C] font-mono">
                      {selectedMatch.compatibilityScore}%
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-amber-200 font-bold">
                      {isAr ? 'التوافق الإجمالي' : 'Overall Match'}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    {t('expert.transparentScoring')}
                  </span>

                  {/* Skills (45%) */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 font-medium">{t('expert.skillsOverlap')}</span>
                      <span className="font-mono font-bold text-[#C89B3C]">
                        {selectedMatch.scoreBreakdown.skills_score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#C89B3C] h-full rounded-full transition-all"
                        style={{ width: `${selectedMatch.scoreBreakdown.skills_score}%` }}
                      ></div>
                    </div>
                    {selectedMatch.scoreBreakdown.matched_skills && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {selectedMatch.scoreBreakdown.matched_skills.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Availability (25%) */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 font-medium">{t('expert.visitOverlap')}</span>
                      <span className="font-mono font-bold text-blue-600">
                        {selectedMatch.scoreBreakdown.availability_score}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${selectedMatch.scoreBreakdown.availability_score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Location & Diaspora */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">{t('expert.locationSync')}</span>
                      <strong className="text-slate-900 font-mono text-sm">{selectedMatch.scoreBreakdown.location_score}%</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">{t('expert.diasporaBoost')}</span>
                      <strong className="text-emerald-700 font-mono text-sm">+{selectedMatch.scoreBreakdown.diaspora_bonus}%</strong>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleDecision('accepted')}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('expert.acceptAndUnlock')}</span>
                  </button>
                  <button
                    onClick={() => handleDecision('rejected')}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    {t('expert.decline')}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: VISIT WINDOWS */}
      {activeSubTab === 'availability' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">{t('expert.visitWindowsTab')}</h3>
              <p className="text-xs text-slate-500">{t('expert.subtitle')}</p>
            </div>
            <button
              onClick={() => setShowAddAvailModal(true)}
              className="px-3.5 py-1.5 bg-[#3B0D2C] hover:bg-[#4A1238] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5 text-[#C89B3C]" />
              <span>{t('expert.declareWindow')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {currentExpert.availabilities.map((av) => (
              <div key={av.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C89B3C]" />
                    {av.city}
                  </span>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                    {av.durationDays} {isAr ? 'يوماً' : 'days'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-mono">
                  {av.startDate} → {av.endDate}
                </div>
                {av.notes && <p className="text-xs text-slate-500 italic mt-1">{av.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ACTIVE PARTNERSHIPS */}
      {activeSubTab === 'missions' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">{t('expert.currentPartnerships')}</h3>
          <div className="space-y-3">
            {expertCollabs.map((collab) => (
              <div key={collab.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{collab.projectTitle}</h4>
                  <span className="text-[11px] text-slate-500">{collab.organizationName}</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                  {collab.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ACADEMIC DOSSIER */}
      {activeSubTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">{t('expert.academicDossier')}</h3>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3.5 py-1.5 bg-[#3B0D2C] hover:bg-[#4A1238] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
            >
              <Upload className="w-3.5 h-3.5 text-[#C89B3C]" />
              <span>{t('expert.uploadDoc')}</span>
            </button>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              {t('expert.academicDossier')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentExpert.profile.expertiseTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-slate-100 text-slate-800 font-semibold rounded-lg text-xs border border-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              {t('expert.registeredDocs')}
            </span>
            <div className="space-y-2">
              {(currentExpert.profile.documents || []).map((doc) => (
                <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#3B0D2C]" />
                    <span className="font-semibold text-slate-900">{doc.name}</span>
                  </div>
                  <span className="font-mono text-slate-400 uppercase text-[10px]">{doc.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD AVAILABILITY */}
      {showAddAvailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#3B0D2C]" />
              {t('expert.declareWindow')}
            </h3>
            <form onSubmit={handleAddAvailSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">{t('expert.algerianCity')}</label>
                <select
                  value={availCity}
                  onChange={(e) => setAvailCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                >
                  <option value="Algiers">Algiers (الجزائر العاصمة)</option>
                  <option value="Oran">Oran (وهران)</option>
                  <option value="Constantine">Constantine (قسنطينة)</option>
                  <option value="Annaba">Annaba (عنابة)</option>
                  <option value="Setif">Sétif (سطيف)</option>
                  <option value="Batna">Batna (باتنة)</option>
                  <option value="Ouargla">Ouargla (ورقلة)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">{t('expert.startDate')}</label>
                  <input
                    type="date"
                    required
                    value={availStart}
                    onChange={(e) => setAvailStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">{t('expert.endDate')}</label>
                  <input
                    type="date"
                    required
                    value={availEnd}
                    onChange={(e) => setAvailEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">{t('expert.missionNotes')}</label>
                <textarea
                  rows={3}
                  value={availNotes}
                  onChange={(e) => setAvailNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAvailModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white font-bold px-4 py-2 rounded-xl transition shadow-xs"
                >
                  {t('expert.postWindow')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD DOCUMENT */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#3B0D2C]" />
              {t('expert.uploadNewDoc')}
            </h3>
            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">{t('expert.documentName')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Curriculum_Vitae_2026.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">{t('expert.documentType')}</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                >
                  <option value="cv">Curriculum Vitae (CV)</option>
                  <option value="publication">Research Publication / Pre-print</option>
                  <option value="patent">Issued Patent Summary</option>
                  <option value="certificate">Academic Certificate / Award</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white font-bold px-4 py-2 rounded-xl transition shadow-xs"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
