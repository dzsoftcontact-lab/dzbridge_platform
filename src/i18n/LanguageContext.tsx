import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { DEFAULT_TRANSLATIONS } from './translations';

export type SupportedLang = 'en' | 'fr' | 'ar';

export interface FlatTranslationKey {
  keyPath: string;
  module: string;
  subKey: string;
  en: string;
  fr: string;
  ar: string;
  isCustomized: boolean;
}

interface LanguageContextType {
  lang: SupportedLang;
  setLang: (newLang: SupportedLang) => void;
  translations: Record<SupportedLang, Record<string, any>>;
  t: (keyPath: string, fallback?: string) => string;
  updateTranslation: (targetLang: SupportedLang, keyPath: string, value: string) => void;
  updateAllLanguagesForKey: (
    keyPath: string,
    values: { en?: string; fr?: string; ar?: string },
  ) => void;
  resetTranslations: () => void;
  exportTranslationsJson: () => string;
  importTranslationsJson: (jsonString: string) => boolean;
  allKeys: FlatTranslationKey[];
  customCount: number;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'dz_bridge_user_translations';
const LOCAL_STORAGE_LANG = 'dz_bridge_active_lang';

// Deep clone helper
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Deep get helper
function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

// Deep set helper
function setNestedValue(obj: any, path: string, value: string): void {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<SupportedLang>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_LANG);
    if (saved === 'ar' || saved === 'fr' || saved === 'en') {
      return saved;
    }
    return 'en';
  });

  const [translations, setTranslations] = useState<Record<SupportedLang, Record<string, any>>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults so any new keys are still present
        return {
          en: { ...DEFAULT_TRANSLATIONS.en, ...(parsed.en || {}) },
          fr: { ...DEFAULT_TRANSLATIONS.fr, ...(parsed.fr || {}) },
          ar: { ...DEFAULT_TRANSLATIONS.ar, ...(parsed.ar || {}) },
        };
      }
    } catch (e) {
      console.error('Failed to load translations from localStorage', e);
    }
    return deepClone(DEFAULT_TRANSLATIONS);
  });

  const setLang = (newLang: SupportedLang) => {
    setLangState(newLang);
    localStorage.setItem(LOCAL_STORAGE_LANG, newLang);
  };

  // Sync HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Persist translations when changed
  const saveToLocalStorage = (updated: Record<SupportedLang, Record<string, any>>) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist translations', e);
    }
  };

  // Main lookup function
  const t = (keyPath: string, fallback?: string): string => {
    const val = getNestedValue(translations[lang], keyPath);
    if (val !== undefined && val !== '') {
      return val;
    }
    // Fallback to English
    const enVal = getNestedValue(translations['en'], keyPath);
    if (enVal !== undefined && enVal !== '') {
      return enVal;
    }
    return fallback !== undefined ? fallback : keyPath;
  };

  // Update a single key for a single language
  const updateTranslation = (targetLang: SupportedLang, keyPath: string, value: string) => {
    setTranslations((prev) => {
      const next = deepClone(prev);
      setNestedValue(next[targetLang], keyPath, value);
      saveToLocalStorage(next);
      return next;
    });
  };

  // Update a key across languages
  const updateAllLanguagesForKey = (
    keyPath: string,
    values: { en?: string; fr?: string; ar?: string },
  ) => {
    setTranslations((prev) => {
      const next = deepClone(prev);
      if (values.en !== undefined) setNestedValue(next.en, keyPath, values.en);
      if (values.fr !== undefined) setNestedValue(next.fr, keyPath, values.fr);
      if (values.ar !== undefined) setNestedValue(next.ar, keyPath, values.ar);
      saveToLocalStorage(next);
      return next;
    });
  };

  // Reset all to default official dictionary
  const resetTranslations = () => {
    const defaults = deepClone(DEFAULT_TRANSLATIONS);
    setTranslations(defaults);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // Export JSON string
  const exportTranslationsJson = (): string => {
    return JSON.stringify(translations, null, 2);
  };

  // Import JSON string
  const importTranslationsJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        const next = {
          en: { ...DEFAULT_TRANSLATIONS.en, ...(parsed.en || {}) },
          fr: { ...DEFAULT_TRANSLATIONS.fr, ...(parsed.fr || {}) },
          ar: { ...DEFAULT_TRANSLATIONS.ar, ...(parsed.ar || {}) },
        };
        setTranslations(next);
        saveToLocalStorage(next);
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  };

  // Build flattened key list for the manager
  const { allKeys, customCount } = useMemo(() => {
    const list: FlatTranslationKey[] = [];
    let custom = 0;

    const traverse = (obj: any, path: string, moduleName: string) => {
      if (!obj || typeof obj !== 'object') return;
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          traverse(value, currentPath, moduleName || key);
        } else if (typeof value === 'string') {
          const enVal = getNestedValue(translations.en, currentPath) || '';
          const frVal = getNestedValue(translations.fr, currentPath) || '';
          const arVal = getNestedValue(translations.ar, currentPath) || '';

          const defaultEn = getNestedValue(DEFAULT_TRANSLATIONS.en, currentPath) || '';
          const defaultFr = getNestedValue(DEFAULT_TRANSLATIONS.fr, currentPath) || '';
          const defaultAr = getNestedValue(DEFAULT_TRANSLATIONS.ar, currentPath) || '';

          const isCustomized =
            enVal !== defaultEn || frVal !== defaultFr || arVal !== defaultAr;

          if (isCustomized) custom++;

          list.push({
            keyPath: currentPath,
            module: moduleName || currentPath.split('.')[0] || 'general',
            subKey: key,
            en: enVal,
            fr: frVal,
            ar: arVal,
            isCustomized,
          });
        }
      }
    };

    // Use default EN as structure anchor
    traverse(DEFAULT_TRANSLATIONS.en, '', '');

    return { allKeys: list, customCount: custom };
  }, [translations]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        translations,
        t,
        updateTranslation,
        updateAllLanguagesForKey,
        resetTranslations,
        exportTranslationsJson,
        importTranslationsJson,
        allKeys,
        customCount,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
