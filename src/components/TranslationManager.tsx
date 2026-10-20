import React, { useState, useMemo } from 'react';
import { useTranslation, SupportedLang, FlatTranslationKey } from '../i18n/LanguageContext';
import {
  Languages,
  Search,
  Filter,
  Download,
  Upload,
  RotateCcw,
  Check,
  Edit3,
  Globe,
  Sparkles,
  Save,
  X,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Layers,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const TranslationManager: React.FC = () => {
  const {
    lang,
    setLang,
    t,
    allKeys,
    updateTranslation,
    updateAllLanguagesForKey,
    resetTranslations,
    exportTranslationsJson,
    importTranslationsJson,
    customCount,
  } = useTranslation();

  const isAr = lang === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [showOnlyCustom, setShowOnlyCustom] = useState(false);

  // Active Key being edited in Modal/Drawer
  const [editingKey, setEditingKey] = useState<FlatTranslationKey | null>(null);
  const [editValues, setEditValues] = useState<{ en: string; fr: string; ar: string }>({
    en: '',
    fr: '',
    ar: '',
  });

  // Inline fast-edit tracking
  const [inlineEditKey, setInlineEditKey] = useState<string | null>(null);
  const [inlineValues, setInlineValues] = useState<{ en: string; fr: string; ar: string }>({
    en: '',
    fr: '',
    ar: '',
  });

  // Import / Export Modal
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Success toast indicator
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 3500);
  };

  // Modules list
  const modules = useMemo(() => {
    const set = new Set<string>();
    allKeys.forEach((k) => set.add(k.module));
    return ['all', ...Array.from(set)];
  }, [allKeys]);

  // Filtered keys
  const filteredKeys = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allKeys.filter((item) => {
      if (selectedModule !== 'all' && item.module !== selectedModule) {
        return false;
      }
      if (showOnlyCustom && !item.isCustomized) {
        return false;
      }
      if (!q) return true;
      return (
        item.keyPath.toLowerCase().includes(q) ||
        item.en.toLowerCase().includes(q) ||
        item.fr.toLowerCase().includes(q) ||
        item.ar.toLowerCase().includes(q)
      );
    });
  }, [allKeys, selectedModule, showOnlyCustom, searchQuery]);

  // Open edit modal
  const handleOpenEdit = (item: FlatTranslationKey) => {
    setEditingKey(item);
    setEditValues({
      en: item.en,
      fr: item.fr,
      ar: item.ar,
    });
  };

  // Save from edit modal
  const handleSaveModal = () => {
    if (!editingKey) return;
    updateAllLanguagesForKey(editingKey.keyPath, editValues);
    showToast(isAr ? 'تم حفظ التعديلات بنجاح وتطبيقها في كامل المنظومة!' : 'Translation saved and applied instantly across the entire app!');
    setEditingKey(null);
  };

  // Inline quick save
  const handleStartInlineEdit = (item: FlatTranslationKey) => {
    setInlineEditKey(item.keyPath);
    setInlineValues({ en: item.en, fr: item.fr, ar: item.ar });
  };

  const handleSaveInline = (keyPath: string) => {
    updateAllLanguagesForKey(keyPath, inlineValues);
    setInlineEditKey(null);
    showToast(isAr ? 'تم حفظ النص فورياً!' : 'Saved translation string!');
  };

  // Handle Export
  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportTranslationsJson());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dz_bridge_translations_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(isAr ? 'تم تحميل ملف الترجمة بنجاح' : 'Translation pack JSON downloaded!');
  };

  // Handle Import
  const handlePerformImport = () => {
    if (!importJsonText.trim()) {
      setImportStatus({ success: false, message: isAr ? 'يرجى لصق كود JSON أولاً' : 'Please paste a JSON translation object first.' });
      return;
    }
    const success = importTranslationsJson(importJsonText);
    if (success) {
      setImportStatus({ success: true, message: t('translationHub.importSuccess') });
      showToast(t('translationHub.importSuccess'));
      setTimeout(() => setShowImportExportModal(false), 1200);
    } else {
      setImportStatus({ success: false, message: t('translationHub.importError') });
    }
  };

  // Handle Reset Defaults
  const handleResetConfirm = () => {
    if (window.confirm(t('translationHub.resetConfirm'))) {
      resetTranslations();
      showToast(isAr ? 'تمت استعادة القاموس الرسمي بنجاح' : 'Reset to official dictionary completed!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3b0a2a] text-white px-5 py-3 rounded-xl shadow-lg border border-[#C89B3C]/50 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#C89B3C]" />
          <span className="text-xs font-semibold">{savedToast}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#C89B3C]/10 via-[#3b0a2a]/5 to-transparent pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3b0a2a] to-[#261900] flex items-center justify-center text-[#C89B3C] shadow-sm shrink-0 border border-[#C89B3C]/40">
              <Languages className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-950 font-['Plus_Jakarta_Sans']">
                  {t('translationHub.title')}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdea4] text-[#261900] border border-[#C89B3C]/40 font-mono">
                  v2.6 Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {t('translationHub.subtitle')}
              </p>
            </div>
          </div>

          {/* Quick Actions & Live Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Real-time Language Switch Preview Buttons */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2">
                {isAr ? 'معاينة الواجهة:' : 'Preview in:'}
              </span>
              <button
                onClick={() => setLang('ar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  lang === 'ar'
                    ? 'bg-[#3b0a2a] text-[#C89B3C] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={t('translationHub.switchToArabic')}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>العربية</span>
              </button>
              <button
                onClick={() => setLang('fr')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  lang === 'fr'
                    ? 'bg-[#3b0a2a] text-[#C89B3C] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={t('translationHub.switchToFrench')}
              >
                <span>Français</span>
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  lang === 'en'
                    ? 'bg-[#3b0a2a] text-[#C89B3C] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={t('translationHub.switchToEnglish')}
              >
                <span>English</span>
              </button>
            </div>

            <button
              onClick={() => {
                setImportJsonText(exportTranslationsJson());
                setShowImportExportModal(true);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
            >
              <FileCode className="w-3.5 h-3.5 text-[#3b0a2a]" />
              <span>{isAr ? 'استيراد / تصدير' : 'Import / Export'}</span>
            </button>

            <button
              onClick={handleResetConfirm}
              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition"
              title={t('translationHub.resetDefaults')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('translationHub.resetDefaults')}</span>
            </button>
          </div>
        </div>

        {/* Live Hint bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <Sparkles className="w-4 h-4 text-[#C89B3C] shrink-0" />
          <span>{t('translationHub.liveHint')}</span>
        </div>
      </div>

      {/* 2. Localization Coverage & Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            {t('translationHub.statsTotalKeys')}
          </div>
          <div className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans'] mt-1">
            {allKeys.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {isAr ? 'نصاً قابلاً للتعديل الفوري' : 'Fully editable live UI keys'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider">
              {t('translationHub.statsArabicCoverage')}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-bold text-emerald-900 font-['Plus_Jakarta_Sans'] mt-1">
            100%
          </div>
          <div className="text-[10px] text-emerald-700 mt-1 font-semibold">
            {isAr ? 'تعريب متكامل وشامل' : 'Native Algerian terminology'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-blue-800 uppercase tracking-wider">
              {t('translationHub.statsFrenchCoverage')}
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="text-2xl font-bold text-blue-900 font-['Plus_Jakarta_Sans'] mt-1">
            100%
          </div>
          <div className="text-[10px] text-blue-700 mt-1 font-semibold">
            {isAr ? 'صياغة أكاديمية رسمية' : 'French academic terminology'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-purple-800 uppercase tracking-wider">
              {t('translationHub.statsEnglishCoverage')}
            </span>
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          </div>
          <div className="text-2xl font-bold text-purple-900 font-['Plus_Jakarta_Sans'] mt-1">
            100%
          </div>
          <div className="text-[10px] text-purple-700 mt-1 font-semibold">
            {isAr ? 'معايير النشر الدولي' : 'International standard'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#C89B3C]/40 bg-[#ffdea4]/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#7b5900] uppercase tracking-wider">
              {t('translationHub.customEditsCount')}
            </span>
            <Edit3 className="w-3.5 h-3.5 text-[#7b5900]" />
          </div>
          <div className="text-2xl font-bold text-[#261900] font-['Plus_Jakarta_Sans'] mt-1">
            {customCount}
          </div>
          <div className="text-[10px] text-[#7b5900] mt-1 font-semibold">
            {customCount > 0
              ? isAr
                ? 'تعديلات شخصية محفوظة محلياً'
                : 'Custom user modifications active'
              : isAr
              ? 'القاموس الرسمي المعتمد نشط'
              : 'Using official defaults'}
          </div>
        </div>
      </div>

      {/* 3. Search & Module Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('translationHub.searchPlaceholder')}
              className="w-full h-9 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#3b0a2a] focus:ring-1 focus:ring-[#3b0a2a] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOnlyCustom}
                onChange={(e) => setShowOnlyCustom(e.target.checked)}
                className="rounded text-[#3b0a2a] focus:ring-[#3b0a2a] w-3.5 h-3.5 cursor-pointer"
              />
              <span className="font-medium">
                {isAr ? 'عرض النصوص المعدلة فقط' : 'Show customized keys only'}
              </span>
            </label>

            <span className="text-slate-300">|</span>

            <span className="text-xs font-semibold text-slate-500 font-mono">
              {filteredKeys.length} {t('translationHub.keysFound')}
            </span>
          </div>
        </div>

        {/* Module Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            {t('translationHub.filterModule')}:
          </span>
          {modules.map((m) => {
            const isSelected = selectedModule === m;
            return (
              <button
                key={m}
                onClick={() => setSelectedModule(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#3b0a2a] text-[#C89B3C] font-bold shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m === 'all'
                  ? t('translationHub.allNamespaces')
                  : m}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Main Translation Dictionary Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-52">{t('translationHub.keyPath')}</th>
                <th className="py-3 px-4 w-72">{t('translationHub.englishText')}</th>
                <th className="py-3 px-4 w-72">{t('translationHub.frenchText')}</th>
                <th className="py-3 px-4 w-72">{t('translationHub.arabicText')}</th>
                <th className="py-3 px-4 text-center w-28">{t('translationHub.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium">
                      {isAr ? 'لم يتم العثور على نصوص مطابقة' : 'No translation keys match your search filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredKeys.map((item) => {
                  const isInlineEditing = inlineEditKey === item.keyPath;

                  return (
                    <tr
                      key={item.keyPath}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        item.isCustomized ? 'bg-[#ffdea4]/10' : ''
                      }`}
                    >
                      {/* Key Path & Module */}
                      <td className="py-3 px-4 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono font-bold text-slate-800 text-[11px] break-all">
                            {item.keyPath}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {item.module}
                            </span>
                            {item.isCustomized && (
                              <span className="text-[9px] font-bold uppercase font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                {isAr ? 'معدل' : 'Custom'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* English (EN) */}
                      <td className="py-3 px-4 align-top text-slate-700">
                        {isInlineEditing ? (
                          <textarea
                            value={inlineValues.en}
                            onChange={(e) =>
                              setInlineValues((prev) => ({ ...prev, en: e.target.value }))
                            }
                            rows={2}
                            className="w-full p-1.5 text-xs bg-white border border-[#3b0a2a] rounded focus:outline-none"
                          />
                        ) : (
                          <div className="line-clamp-3 hover:line-clamp-none transition-all">
                            {item.en}
                          </div>
                        )}
                      </td>

                      {/* Français (FR) */}
                      <td className="py-3 px-4 align-top text-slate-700">
                        {isInlineEditing ? (
                          <textarea
                            value={inlineValues.fr}
                            onChange={(e) =>
                              setInlineValues((prev) => ({ ...prev, fr: e.target.value }))
                            }
                            rows={2}
                            className="w-full p-1.5 text-xs bg-white border border-[#3b0a2a] rounded focus:outline-none"
                          />
                        ) : (
                          <div className="line-clamp-3 hover:line-clamp-none transition-all">
                            {item.fr}
                          </div>
                        )}
                      </td>

                      {/* العربية (AR) */}
                      <td className="py-3 px-4 align-top text-slate-900 font-medium font-['Plus_Jakarta_Sans',sans-serif]" dir="rtl">
                        {isInlineEditing ? (
                          <textarea
                            value={inlineValues.ar}
                            onChange={(e) =>
                              setInlineValues((prev) => ({ ...prev, ar: e.target.value }))
                            }
                            rows={2}
                            dir="rtl"
                            className="w-full p-1.5 text-xs bg-white border border-[#3b0a2a] rounded focus:outline-none text-right font-['Plus_Jakarta_Sans',sans-serif]"
                          />
                        ) : (
                          <div className="line-clamp-3 hover:line-clamp-none transition-all text-right">
                            {item.ar}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 align-top text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isInlineEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveInline(item.keyPath)}
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition"
                                title={t('common.save')}
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setInlineEditKey(null)}
                                className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                                title={t('common.cancel')}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                                title={t('translationHub.editTitle')}
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#3b0a2a]" />
                              </button>
                              <button
                                onClick={() => handleStartInlineEdit(item)}
                                className="px-2 py-1 rounded-md text-[10px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                                title="Quick inline edit"
                              >
                                {isAr ? 'سريع' : 'Quick'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Detailed Translation Edit Modal */}
      {editingKey && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#3b0a2a] text-[#C89B3C] flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950 font-['Plus_Jakarta_Sans']">
                    {t('translationHub.editTitle')}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-500">{editingKey.keyPath}</div>
                </div>
              </div>
              <button
                onClick={() => setEditingKey(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input fields for EN, FR, AR */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  {t('translationHub.englishText')}
                </label>
                <textarea
                  value={editValues.en}
                  onChange={(e) => setEditValues((prev) => ({ ...prev, en: e.target.value }))}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#3b0a2a] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {t('translationHub.frenchText')}
                </label>
                <textarea
                  value={editValues.fr}
                  onChange={(e) => setEditValues((prev) => ({ ...prev, fr: e.target.value }))}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#3b0a2a] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {t('translationHub.arabicText')} (اللغة العربية)
                </label>
                <textarea
                  value={editValues.ar}
                  onChange={(e) => setEditValues((prev) => ({ ...prev, ar: e.target.value }))}
                  rows={2}
                  dir="rtl"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#3b0a2a] focus:bg-white font-['Plus_Jakarta_Sans',sans-serif] text-right"
                />
              </div>
            </div>

            {/* Live Preview of active string */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {t('translationHub.livePreview')} ({lang.toUpperCase()}):
              </span>
              <div
                className="text-xs font-bold text-[#3b0a2a]"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              >
                {lang === 'ar' ? editValues.ar : lang === 'fr' ? editValues.fr : editValues.en}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingKey(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveModal}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#3b0a2a] text-[#C89B3C] hover:bg-[#4a0e38] transition flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{t('translationHub.saveString')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Import / Export JSON Modal */}
      {showImportExportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#3b0a2a]" />
                <h3 className="text-sm font-bold text-slate-950 font-['Plus_Jakarta_Sans']">
                  {isAr ? 'استيراد وتصدير حزم الترجمة' : 'Translation Pack Import & Export'}
                </h3>
              </div>
              <button
                onClick={() => setShowImportExportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {isAr
                ? 'يمكنك تنزيل قاموس الترجمة الكامل كملف JSON أو لصق كود حزمة جديدة لتحديث نصوص النظام بشكل فوري.'
                : 'Download the full multilingual translation dictionary as a JSON file or paste a modified translation pack to update the entire application.'}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadJson}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>{t('translationHub.exportPack')}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isAr ? 'أو الصق كود JSON للاستيراد:' : 'Or paste translation JSON below to import:'}
              </label>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                rows={8}
                className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#3b0a2a] focus:bg-white"
                placeholder='{ "en": { ... }, "fr": { ... }, "ar": { ... } }'
              />
            </div>

            {importStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  importStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {importStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>{importStatus.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowImportExportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                {t('common.close')}
              </button>
              <button
                onClick={handlePerformImport}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#3b0a2a] text-[#C89B3C] hover:bg-[#4a0e38] transition flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>{t('translationHub.importPack')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
