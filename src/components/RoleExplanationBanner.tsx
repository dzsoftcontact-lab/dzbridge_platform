import React from 'react';
import { UserRole } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { ShieldCheck, GraduationCap, Building2 } from 'lucide-react';

interface RoleExplanationBannerProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
}

export const RoleExplanationBanner: React.FC<RoleExplanationBannerProps> = ({
  activeRole,
  setActiveRole,
}) => {
  const { lang, t } = useTranslation();
  const isAr = lang === 'ar';

  const roleData = {
    admin: {
      badge: t('roles.superAdmin'),
      title: t('roles.adminTitle'),
      explanation: t('roles.adminExplanation'),
      keyCapabilities: isAr
        ? [
            'اعتماد وتثبيت مشاريع نقل التكنولوجيا عالية التأثير',
            'التعديل المباشر على جداول PostgreSQL وتوليد DDL',
            'إدارة واجهة REST API ومعدلات الطلبات Throttling',
            'فحص سجل الرقابة المشفر وتصدير ملفات CSV',
          ]
        : lang === 'fr'
        ? [
            'Valider et approuver les mises en relation stratégiques',
            'Édition directe PostgreSQL 16 & génération de DDL',
            'Gestion du bac à sable API et limitation de débit',
            'Inspection du journal d\'audit immuable & export CSV',
          ]
        : [
            'Validate & approve high-impact tech transfer matches',
            'Direct PostgreSQL 16 table editing & DDL generation',
            'REST API Sandbox & Rate-limit throttling management',
            'Inspect immutable activity audit trail & export CSVs',
          ],
      color: 'border-[#3B0D2C] bg-[#3B0D2C]/5 text-[#3B0D2C]',
      icon: ShieldCheck,
    },
    expert: {
      badge: t('roles.scholar'),
      title: t('roles.scholarTitle'),
      explanation: t('roles.scholarExplanation'),
      keyCapabilities: isAr
        ? [
            'التصريح بفترات الزيارة للجزائر والمدن المستهدفة',
            'استلام مقترحات مشاريع مرتبة خوارزمياً حسب الأولوية',
            'معاينة تفاصيل التوافق الرباعي (المهارات 45%، التواريخ 25%، المدينة 15%، الجالية 15%)',
            'قبول أو اعتذار بنقرة واحدة مع إتاحة الاتصال المؤسساتي',
          ]
        : lang === 'fr'
        ? [
            'Déclarer vos dates de mission & villes d\'accueil en Algérie',
            'Recevoir des invitations de projets classées par algorithme',
            'Inspecter les scores à 4 facteurs (Compétences 45%, Dates 25%, Ville 15%, Diaspora 15%)',
            'Accepter ou décliner en 1 clic avec déblocage direct des contacts',
          ]
        : [
            'Declare Algeria visit windows & city availability',
            'Receive algorithmically ranked project invitations',
            'Inspect 4-factor compatibility scores (Skills 45%, Dates 25%, Location 15%, Diaspora 15%)',
            'One-click accept or decline with direct institutional contact unlocking',
          ],
      color: 'border-[#C89B3C] bg-[#C89B3C]/10 text-[#7b5900]',
      icon: GraduationCap,
    },
    organization: {
      badge: t('roles.organization'),
      title: t('roles.orgTitle'),
      explanation: t('roles.orgExplanation'),
      keyCapabilities: isAr
        ? [
            'طرح مشاريع دكتوراه وبحث مع توفير التغطية اللوجستية (سفر، إقامة، منحة)',
            'متابعة مسار المشروع عبر آلة الحالات المنضبطة',
            'استقطاب علماء الجالية الجزائريين الزائرين لمدينتكم',
            'توقيع وتثبيت بروتوكولات التعاون والاتفاقيات الرسمية',
          ]
        : lang === 'fr'
        ? [
            'Déposer des projets avec appui logistique garanti (voyage, hôtel, indemnité)',
            'Suivre la machine à états stricte du cycle de vie',
            'Découvrir les sommités de la diaspora en visite dans votre ville',
            'Signer et formaliser les protocoles institutionnels bilatéraux',
          ]
        : [
            'Submit new collaborative projects with offered logistics (travel, hotel, stipend)',
            'Track strict lifecycle finite state machine',
            'Discover top-tier diaspora scholars visiting your city',
            'Sign and execute bilateral institutional protocols',
          ],
      color: 'border-blue-600 bg-blue-50 text-blue-900',
      icon: Building2,
    },
  };

  const current = roleData[activeRole];
  const Icon = current.icon;

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border ${current.color} shadow-2xs transition-all duration-200`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-white shadow-2xs inline-flex items-center justify-center">
              <Icon className="w-4 h-4 text-current" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">
              {current.badge}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] font-semibold text-slate-500">
              {t('roles.whyThisRole')}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            {current.title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {current.explanation}
          </p>

          <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-700">
            {current.keyCapabilities.map((cap, idx) => (
              <span key={idx} className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C89B3C]"></span>
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Role Switcher Buttons */}
        <div
          className={`flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 border-t lg:border-t-0 ${
            isAr ? 'lg:border-r lg:pr-5' : 'lg:border-l lg:pl-5'
          } border-slate-200/80 pt-3 lg:pt-0`}
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            {t('roles.switchPerspective')}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveRole('admin')}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                activeRole === 'admin'
                  ? 'bg-[#3B0D2C] text-white shadow-2xs font-bold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t('roles.adminShort')}
            </button>
            <button
              onClick={() => setActiveRole('expert')}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                activeRole === 'expert'
                  ? 'bg-[#3B0D2C] text-white shadow-2xs font-bold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t('roles.scholarShort')}
            </button>
            <button
              onClick={() => setActiveRole('organization')}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                activeRole === 'organization'
                  ? 'bg-[#3B0D2C] text-white shadow-2xs font-bold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t('roles.universityShort')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
