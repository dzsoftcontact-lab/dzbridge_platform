import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onSelectRole: (role: UserRole) => void;
}

const LANDING_I18N = {
  en: {
    nav1: 'How it works',
    nav2: 'Experts',
    nav3: 'Organizations',
    nav4: 'Events',
    login: 'Log in',
    h1: 'Linking <em>Algerian expertise</em> with the organizations that need it.',
    exT: "I'm an Expert",
    orT: "We're an Organization",
    hwH: 'From profile to impact in four steps.',
    s1T: 'Create your profile',
    s1D: 'Sign up as an expert or institution and complete your profile.',
    s2T: 'Find opportunities',
    s2D: 'Explore collaboration projects or discover relevant experts.',
    s3T: 'Connect & collaborate',
    s3D: 'Initiate contact, plan your collaboration and get to work.',
    s4T: 'Create impact',
    s4D: 'Share knowledge, transfer technology and build the future.',
    gK: 'Our commitments',
    gH: 'Your trust <em>comes first</em>.',
    g1: 'Anonymous until you accept',
    g1d: 'Organizations see skills and fit, never names, until the expert says yes.',
    g2: 'Two-step approval',
    g2d: 'The expert confirms interest before the organization is notified.',
    g3: 'Private feedback',
    g3d: 'Ratings after each collaboration improve matching and are never published.',
    evH: 'Events',
    evAll: 'All events',
    e1tag: 'Workshop',
    e1date: '27 Nov 2026 · Biskra',
    e1T: 'Solar irrigation workshop',
    e1D: 'University of Biskra · Agronomy department',
    e2tag: 'Research day',
    e2date: '04 Dec 2026 · Algiers',
    e2T: 'Green hydrogen research day',
    e2D: 'USTHB · Open to the public',
    e3tag: 'Forum',
    e3date: '15 Jan 2027 · Oran',
    e3T: 'Desalination & water forum',
    e3D: 'ENP Oran · Industry partners',
    ctaH: 'Ready to <em>build the bridge</em>?',
    ctaS: 'Create your profile in a few minutes and we will let you know when a match comes up.',
    partK: 'Our partners',
    fc1: 'Platform',
    fc1c: 'Success stories',
    fc2: 'Trust',
    fc2a: 'Privacy & anonymity',
    fc2b: 'Verification',
    fc2c: 'Code of conduct',
    fc3: 'Contact',
    fc3a: 'Help centre',
    fc3b: 'Partners',
    copy: '© 2026 DZ-Bridge. All rights reserved.',
    faff: 'DZ-Bridge is affiliated with the',
    affN: 'Algerian Scholar Award Foundation',
    priv: 'Privacy',
    terms: 'Terms',
    cook: 'Cookies',
  },
  fr: {
    nav1: 'À propos',
    nav2: 'Experts',
    nav3: 'Organisations',
    nav4: 'Événements',
    login: 'Se connecter',
    h1: "Relier <em>l'expertise algérienne</em> aux organisations qui en ont besoin.",
    exT: 'Je suis expert',
    orT: 'Nous sommes une organisation',
    hwH: "Du profil à l'impact en quatre étapes.",
    s1T: 'Créez votre profil',
    s1D: "Inscrivez-vous en tant qu'expert ou institution et complétez votre profil.",
    s2T: 'Trouvez des opportunités',
    s2D: 'Explorez des projets de collaboration ou découvrez les experts pertinents.',
    s3T: 'Connectez-vous et collaborez',
    s3D: 'Prenez contact, planifiez votre collaboration et passez à l’action.',
    s4T: 'Créez de l’impact',
    s4D: 'Partagez vos connaissances, transférez la technologie et construisez l’avenir.',
    gK: 'Nos engagements',
    gH: 'Votre confiance <em>avant tout</em>.',
    g1: "Anonyme jusqu'à votre accord",
    g1d: "Les organisations voient les compétences et l'adéquation, jamais les noms, jusqu'à l'accord de l'expert.",
    g2: 'Validation en deux temps',
    g2d: "L'expert confirme son intérêt avant que l'organisation soit notifiée.",
    g3: 'Avis privés',
    g3d: 'Les évaluations après chaque collaboration améliorent les correspondances et ne sont jamais publiées.',
    evH: 'Événements',
    evAll: 'Tous les événements',
    e1tag: 'Atelier',
    e1date: '27 nov. 2026 · Biskra',
    e1T: "Atelier d'irrigation solaire",
    e1D: "Université de Biskra · Département d'agronomie",
    e2tag: 'Journée de recherche',
    e2date: '04 déc. 2026 · Alger',
    e2T: "Journée de recherche sur l'hydrogène vert",
    e2D: 'USTHB · Ouvert au public',
    e3tag: 'Forum',
    e3date: '15 janv. 2027 · Oran',
    e3T: 'Forum dessalement et eau',
    e3D: 'ENP Oran · Partenaires industriels',
    ctaH: 'Prêt à <em>bâtir le pont</em> ?',
    ctaS: 'Créez votre profil en quelques minutes, nous vous prévenons dès qu’une correspondance apparaît.',
    partK: 'Nos partenaires',
    fc1: 'Plateforme',
    fc1c: 'Témoignages',
    fc2: 'Confiance',
    fc2a: 'Confidentialité et anonymat',
    fc2b: 'Vérification',
    fc2c: 'Code de conduite',
    fc3: 'Contact',
    fc3a: "Centre d'aide",
    fc3b: 'Partenaires',
    copy: '© 2026 DZ-Bridge. Tous droits réservés.',
    faff: 'DZ-Bridge est affiliée à la',
    affN: 'Fondation Wisam Al-Alim Al-Djazairi',
    priv: 'Confidentialité',
    terms: 'Conditions',
    cook: 'Cookies',
  },
  ar: {
    nav1: 'كيف يعمل',
    nav2: 'الخبراء',
    nav3: 'المؤسسات',
    nav4: 'الفعاليات',
    login: 'تسجيل الدخول',
    h1: 'ربط <em>الكفاءات الجزائرية</em> بالمؤسسات التي تحتاج إليها.',
    exT: 'أنا خبير',
    orT: 'نحن مؤسسة',
    hwH: 'من الملف الشخصي إلى الأثر في أربع خطوات.',
    s1T: 'أنشئ ملفك',
    s1D: 'سجّل كخبير أو كمؤسسة وأكمل ملفك الشخصي.',
    s2T: 'اكتشف الفرص',
    s2D: 'تصفّح مشاريع التعاون أو اعثر على الخبراء المناسبين.',
    s3T: 'تواصل وتعاون',
    s3D: 'ابدأ التواصل، خطّط لتعاونك وانطلق في العمل.',
    s4T: 'اصنع الأثر',
    s4D: 'شارك معرفتك، انقل التكنولوجيا وابنِ المستقبل.',
    gK: 'التزاماتنا',
    gH: 'ثقتك <em>أولًا</em>.',
    g1: 'هويتك مخفية حتى تقبل',
    g1d: 'ترى المؤسسات المهارات ومدى التوافق، لا الأسماء، حتى يوافق الخبير.',
    g2: 'موافقة على مرحلتين',
    g2d: 'يؤكد الخبير اهتمامه قبل إشعار المؤسسة.',
    g3: 'تقييمات خاصة',
    g3d: 'التقييمات بعد كل تعاون تحسّن المطابقة ولا تُنشر أبدًا.',
    evH: 'الفعاليات',
    evAll: 'كل الفعاليات',
    e1tag: 'ورشة',
    e1date: '27 نوفمبر 2026 · بسكرة',
    e1T: 'ورشة الري بالطاقة الشمسية',
    e1D: 'جامعة بسكرة · قسم العلوم الفلاحية',
    e2tag: 'يوم بحثي',
    e2date: '04 ديسمبر 2026 · الجزائر العاصمة',
    e2T: 'يوم بحثي حول الهيدروجين الأخضر',
    e2D: 'جامعة هواري بومدين · مفتوح للجمهور',
    e3tag: 'منتدى',
    e3date: '15 جانفي 2027 · وهران',
    e3T: 'منتدى تحلية المياه والموارد المائية',
    e3D: 'المدرسة الوطنية المتعددة التقنيات بوهران · شركاء صناعيون',
    ctaH: 'مستعد <em>لبناء الجسر</em>؟',
    ctaS: 'أنشئ ملفك في دقائق، وسنُعلمك عند ظهور مطابقة مناسبة.',
    partK: 'شركاؤنا',
    fc1: 'المنصة',
    fc1c: 'قصص نجاح',
    fc2: 'الثقة',
    fc2a: 'الخصوصية وإخفاء الهوية',
    fc2b: 'التحقق',
    fc2c: 'مدونة السلوك',
    fc3: 'اتصل بنا',
    fc3a: 'مركز المساعدة',
    fc3b: 'الشركاء',
    copy: '© 2026 DZ-Bridge. جميع الحقوق محفوظة.',
    faff: 'DZ-Bridge منصة تابعة لـ',
    affN: 'مؤسسة وسام العالم الجزائري',
    priv: 'الخصوصية',
    terms: 'الشروط',
    cook: 'ملفات تعريف الارتباط',
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateLogin, onSelectRole }) => {
  const { lang, setLang, theme, toggleTheme } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = (key: keyof typeof LANDING_I18N['en']) => {
    return LANDING_I18N[lang][key] || LANDING_I18N['en'][key];
  };

  const handleSelectRole = (role: UserRole) => {
    onSelectRole(role);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] font-['DM_Sans',system-ui,-apple-system,sans-serif] antialiased">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER                                                    */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-[color-mix(in_srgb,var(--bg-page)_90%,transparent)] backdrop-blur-md border-b border-[var(--border)] transition-colors">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-[70px] flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-2.5 font-semibold text-xl tracking-tight text-[var(--text-primary)]">
            <span className="w-[34px] h-[34px] rounded-lg bg-[var(--plum-800)] text-white font-['Fraunces',serif] font-semibold text-base flex items-center justify-center">
              DZ
            </span>
            <span>DZ-Bridge</span>
          </a>

          {/* Nav links */}
          <nav
            className={`${
              mobileMenuOpen ? 'flex' : 'hidden'
            } md:flex absolute md:static top-[70px] inset-x-0 bg-[var(--bg-page)] md:bg-transparent flex-col md:flex-row items-center gap-6 md:gap-8 p-6 md:p-0 border-b md:border-b-0 border-[var(--border)] shadow-lg md:shadow-none text-sm font-medium text-[var(--text-secondary)]`}
          >
            <a href="#how" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--text-primary)] transition-colors">
              {t('nav1')}
            </a>
            <a href="#how" onClick={() => { setMobileMenuOpen(false); handleSelectRole('expert'); }} className="hover:text-[var(--text-primary)] transition-colors">
              {t('nav2')}
            </a>
            <a href="#how" onClick={() => { setMobileMenuOpen(false); handleSelectRole('organization'); }} className="hover:text-[var(--text-primary)] transition-colors">
              {t('nav3')}
            </a>
            <a href="#events" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--text-primary)] transition-colors">
              {t('nav4')}
            </a>
          </nav>

          {/* Right Action Toolbar */}
          <div className="flex items-center gap-2.5">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 h-10 px-3 rounded-full border border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs font-['DM_Mono',monospace] font-medium tracking-wider transition"
              >
                <span>
                  {lang === 'fr' && (
                    <svg className="w-5 h-3.5 rounded-xs shadow-2xs inline-block" viewBox="0 0 30 20">
                      <rect width="10" height="20" fill="#002395" />
                      <rect x="10" width="10" height="20" fill="#fff" />
                      <rect x="20" width="10" height="20" fill="#ED2939" />
                    </svg>
                  )}
                  {lang === 'en' && (
                    <svg className="w-5 h-3.5 rounded-xs shadow-2xs inline-block" viewBox="0 0 60 30">
                      <clipPath id="ukc-lp"><path d="M0 0h60v30H0z"/></clipPath>
                      <g clipPath="url(#ukc-lp)">
                        <path d="M0 0v30h60V0z" fill="#012169"/>
                        <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6"/>
                        <path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" strokeWidth="4"/>
                        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
                        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
                      </g>
                    </svg>
                  )}
                  {lang === 'ar' && (
                    <svg className="w-5 h-3.5 rounded-xs shadow-2xs inline-block" viewBox="0 0 30 20">
                      <rect width="15" height="20" fill="#006233" />
                      <rect x="15" width="15" height="20" fill="#fff" />
                      <circle cx="15" cy="10" r="5" fill="#D21034" />
                      <circle cx="16.3" cy="10" r="4" fill="#fff" />
                      <path d="M17.6 10l2.9-.95-1.8 2.45V8.5l1.8 2.45z" fill="#D21034" />
                    </svg>
                  )}
                </span>
                <span>{lang.toUpperCase()}</span>
                <span className="text-[var(--text-secondary)]">▾</span>
              </button>

              {langMenuOpen && (
                <ul className="absolute top-[calc(100%+8px)] end-0 min-w-[190px] p-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-xl z-50 space-y-1">
                  <li>
                    <button
                      type="button"
                      onClick={() => { setLang('fr'); setLangMenuOpen(false); }}
                      className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-left text-sm transition ${
                        lang === 'fr' ? 'bg-[var(--bg-subtle)] font-bold' : 'hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <svg className="w-5 h-3.5 rounded-xs shadow-2xs" viewBox="0 0 30 20">
                        <rect width="10" height="20" fill="#002395" />
                        <rect x="10" width="10" height="20" fill="#fff" />
                        <rect x="20" width="10" height="20" fill="#ED2939" />
                      </svg>
                      <span className="flex-1">Français</span>
                      <span className="text-xs text-[var(--text-muted)] font-mono">FR</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => { setLang('en'); setLangMenuOpen(false); }}
                      className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-left text-sm transition ${
                        lang === 'en' ? 'bg-[var(--bg-subtle)] font-bold' : 'hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <svg className="w-5 h-3.5 rounded-xs shadow-2xs" viewBox="0 0 60 30">
                        <g>
                          <path d="M0 0v30h60V0z" fill="#012169"/>
                          <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6"/>
                          <path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" strokeWidth="4"/>
                          <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
                          <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
                        </g>
                      </svg>
                      <span className="flex-1">English</span>
                      <span className="text-xs text-[var(--text-muted)] font-mono">EN</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => { setLang('ar'); setLangMenuOpen(false); }}
                      className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-left text-sm font-['Cairo',sans-serif] transition ${
                        lang === 'ar' ? 'bg-[var(--bg-subtle)] font-bold' : 'hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <svg className="w-5 h-3.5 rounded-xs shadow-2xs" viewBox="0 0 30 20">
                        <rect width="15" height="20" fill="#006233" />
                        <rect x="15" width="15" height="20" fill="#fff" />
                        <circle cx="15" cy="10" r="5" fill="#D21034" />
                        <circle cx="16.3" cy="10" r="4" fill="#fff" />
                        <path d="M17.6 10l2.9-.95-1.8 2.45V8.5l1.8 2.45z" fill="#D21034" />
                      </svg>
                      <span className="flex-1">العربية</span>
                      <span className="text-xs text-[var(--text-muted)] font-mono">AR</span>
                    </button>
                  </li>
                </ul>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
                  <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
                </svg>
              )}
            </button>

            {/* Login CTA */}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="h-10 px-5 rounded-full bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] font-medium text-sm transition shadow-sm"
            >
              {t('login')}
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-primary)]"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 6h14M3 10h14M3 14h14" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION                                                  */}
      {/* ------------------------------------------------------------- */}
      <section id="top" className="relative isolation-auto text-center pt-16 md:pt-24 pb-36 md:pb-52 overflow-hidden">
        {/* SVG Suspension Bridge Background */}
        <div className="absolute top-[-70px] bottom-0 left-1/2 w-screen max-w-none -translate-x-1/2 -z-10 overflow-hidden bg-[radial-gradient(45%_55%_at_50%_30%,color-mix(in_srgb,var(--accent-gold)_16%,transparent),transparent_70%),linear-gradient(180deg,var(--accent-lavender-subtle),var(--bg-page))]">
          <svg className="absolute left-0 bottom-0 w-full h-[140px] md:h-[240px] text-[var(--text-accent)] opacity-40 dark:opacity-55" viewBox="0 0 1440 260" preserveAspectRatio="xMidYMax slice">
            <g fill="none" stroke="currentColor" strokeLinecap="round">
              <path d="M0 210H1440" strokeWidth="3" />
              <path d="M462 232V36M478 232V36M962 232V36M978 232V36" strokeWidth="3" />
              <path d="M462 70H478M462 130H478M962 70H978M962 130H978" strokeWidth="2" />
              <path d="M0 160Q235 210 470 40Q720 300 970 40Q1205 210 1440 160" strokeWidth="2.5" />
              <path d="M495 64.7V210M520 86.8V210M545 106.3V210M570 123.2V210M595 137.5V210M620 149.2V210M645 158.3V210M670 164.8V210M695 168.7V210M720 170.0V210M745 168.7V210M770 164.8V210M795 158.3V210M820 149.2V210M845 137.5V210M870 123.2V210M895 106.3V210M920 86.8V210M945 64.7V210" strokeWidth="1" />
              <path d="M200 238q40-6 80 0t80 0M640 246q40-6 80 0t80 0M1060 238q40-6 80 0t80 0" strokeWidth="1.5" opacity=".6" />
            </g>
          </svg>
        </div>

        <div className="max-w-[900px] mx-auto px-4 sm:px-6 flex flex-col items-center">
          <p className="inline-flex items-center gap-3 text-xs uppercase font-['DM_Mono',monospace] tracking-widest text-[var(--text-accent)] mb-4">
            <span className="w-6 h-[1.5px] bg-[var(--gold-500)]"></span>
            DZ-Bridge
            <span className="w-6 h-[1.5px] bg-[var(--gold-500)]"></span>
          </p>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-['Fraunces',serif] font-semibold tracking-tight text-[var(--text-primary)] mb-9 leading-tight"
            dangerouslySetInnerHTML={{ __html: t('h1') }}
          />

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleSelectRole('expert')}
              className="h-[50px] px-7 rounded-full bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] font-medium text-base transition shadow-sm flex items-center gap-2"
            >
              <span>{t('exT')}</span>
              <svg className="w-4 h-4 rtl:rotate-180" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 10h11M11 5l5 5-5 5" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRole('organization')}
              className="h-[50px] px-7 rounded-full bg-[var(--gold-500)] text-[var(--plum-900)] hover:bg-[var(--gold-700)] hover:text-white font-medium text-base transition shadow-sm flex items-center gap-2"
            >
              <span>{t('orT')}</span>
              <svg className="w-4 h-4 rtl:rotate-180" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 10h11M11 5l5 5-5 5" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* HOW IT WORKS (4 STEPS WITH MINI ILLUSTRATIONS)                */}
      {/* ------------------------------------------------------------- */}
      <section id="how" className="relative py-16 md:py-24">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-['Fraunces',serif] font-semibold text-[var(--text-primary)] tracking-tight">
              {t('hwH')}
            </h2>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 list-none p-0 m-0">
            {/* Step 1 */}
            <li className="relative p-7 pt-9 text-center rounded-[22px] bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--gold-500)] text-[var(--text-brand)] font-['Fraunces',serif] font-semibold text-lg flex items-center justify-center">
                1
              </span>
              <div className="h-[136px] rounded-2xl bg-[var(--accent-lavender-subtle)] flex items-center justify-center overflow-hidden mb-5">
                <div className="w-[72%] p-3 rounded-xl bg-[var(--bg-surface)] shadow-md grid grid-cols-[auto_1fr] gap-2 items-center text-left">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-lavender)] text-[var(--plum-800)] flex items-center justify-center">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c.8-4.3 4-6.5 8-6.5s7.2 2.2 8 6.5z" />
                    </svg>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-[70%] bg-[color-mix(in_srgb,var(--text-primary)_15%,transparent)] rounded-full"></div>
                    <div className="h-2 w-[45%] bg-[color-mix(in_srgb,var(--text-primary)_15%,transparent)] rounded-full"></div>
                  </div>
                  <div className="col-span-2 flex gap-1.5 pt-1">
                    <span className="flex-1 h-3.5 rounded-full bg-[var(--gold-500)]"></span>
                    <span className="flex-1 h-3.5 rounded-full border border-slate-300"></span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-medium font-['DM_Sans',sans-serif] text-[var(--text-primary)] mb-2">
                {t('s1T')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('s1D')}
              </p>
            </li>

            {/* Step 2 */}
            <li className="relative p-7 pt-9 text-center rounded-[22px] bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--gold-500)] text-[var(--text-brand)] font-['Fraunces',serif] font-semibold text-lg flex items-center justify-center">
                2
              </span>
              <div className="h-[136px] rounded-2xl bg-[var(--accent-lavender-subtle)] flex flex-col items-center justify-center gap-2 px-6 overflow-hidden mb-5">
                <div className="w-full flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--plum-800)] text-[var(--plum-800)] text-xs">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L20 20" />
                  </svg>
                  <div className="h-1.5 flex-1 bg-slate-300 rounded-full"></div>
                </div>
                <div className="w-full flex items-center gap-2 p-1.5 rounded-lg bg-[var(--bg-surface)] shadow-xs">
                  <span className="w-3.5 h-3.5 rounded-full bg-[var(--accent-lavender)]"></span>
                  <div className="h-1.5 w-[55%] bg-slate-200 rounded-full"></div>
                </div>
                <div className="w-full flex items-center gap-2 p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--gold-500)] shadow-xs">
                  <span className="w-3.5 h-3.5 rounded-full bg-[var(--accent-lavender)]"></span>
                  <div className="h-1.5 w-[40%] bg-slate-300 rounded-full"></div>
                  <span className="ms-auto w-3.5 h-3.5 rounded-full bg-[var(--gold-500)] text-[var(--plum-900)] flex items-center justify-center text-[9px] font-bold">✓</span>
                </div>
              </div>
              <h3 className="text-lg font-medium font-['DM_Sans',sans-serif] text-[var(--text-primary)] mb-2">
                {t('s2T')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('s2D')}
              </p>
            </li>

            {/* Step 3 */}
            <li className="relative p-7 pt-9 text-center rounded-[22px] bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--gold-500)] text-[var(--text-brand)] font-['Fraunces',serif] font-semibold text-lg flex items-center justify-center">
                3
              </span>
              <div className="h-[136px] rounded-2xl bg-[var(--accent-lavender-subtle)] flex items-center justify-center gap-1 overflow-hidden mb-5">
                <div className="w-9 h-9 rounded-full bg-[var(--accent-lavender)] border-2 border-[var(--bg-surface)] shadow-md flex items-center justify-center text-xs font-bold text-[var(--plum-800)]">
                  EXP
                </div>
                <div className="relative w-16 flex items-center justify-center">
                  <div className="w-full border-t-2 border-dashed border-[var(--gold-500)]"></div>
                  <div className="absolute w-6 h-6 rounded-full bg-[var(--plum-800)] text-white flex items-center justify-center">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
                      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
                    </svg>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-[var(--gold-100)] border-2 border-[var(--bg-surface)] shadow-md flex items-center justify-center text-xs font-bold text-[var(--gold-700)]">
                  ESI
                </div>
              </div>
              <h3 className="text-lg font-medium font-['DM_Sans',sans-serif] text-[var(--text-primary)] mb-2">
                {t('s3T')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('s3D')}
              </p>
            </li>

            {/* Step 4 */}
            <li className="relative p-7 pt-9 text-center rounded-[22px] bg-[var(--bg-surface)] border border-[var(--border)] shadow-sm">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--gold-500)] text-[var(--text-brand)] font-['Fraunces',serif] font-semibold text-lg flex items-center justify-center">
                4
              </span>
              <div className="h-[136px] rounded-2xl bg-[var(--accent-lavender-subtle)] relative flex items-center justify-center overflow-hidden mb-5">
                <div className="w-12 h-12 rounded-full bg-[var(--gold-500)] text-[var(--plum-900)] flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" />
                  </svg>
                </div>
                <span className="absolute top-4 left-4 px-2 py-1 bg-[var(--bg-surface)] rounded-full text-[9px] shadow-xs font-mono font-bold text-[var(--text-brand)]">
                  Patents
                </span>
                <span className="absolute bottom-4 right-4 px-2 py-1 bg-[var(--plum-800)] text-white rounded-full text-[9px] shadow-xs font-mono font-bold">
                  Doctorate
                </span>
              </div>
              <h3 className="text-lg font-medium font-['DM_Sans',sans-serif] text-[var(--text-primary)] mb-2">
                {t('s4T')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('s4D')}
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* COMMITMENTS / TRUST                                           */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
          <div className="p-8 md:p-14 rounded-[22px] bg-[var(--lav-100)] dark:bg-[var(--bg-surface)] border border-[var(--lav-200)] dark:border-[var(--border)]">
            <div className="text-center max-w-[680px] mx-auto mb-10">
              <p className="inline-flex items-center gap-2 text-xs uppercase font-['DM_Mono',monospace] tracking-widest text-[var(--text-accent)] mb-2">
                <span className="w-4 h-[1.5px] bg-[var(--gold-500)]"></span>
                {t('gK')}
                <span className="w-4 h-[1.5px] bg-[var(--gold-500)]"></span>
              </p>
              <h2
                className="text-3xl sm:text-4xl font-['Fraunces',serif] font-semibold text-[var(--text-primary)] tracking-tight"
                dangerouslySetInnerHTML={{ __html: t('gH') }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {/* Card 1 */}
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] text-[var(--plum-800)] flex items-center justify-center mx-auto mb-4 shadow-sm border border-[var(--border)]">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                    <circle cx="12" cy="8" r="3.2" />
                    <path d="M6.5 19c.8-3.3 3-5 5.5-5s4.7 1.7 5.5 5M4 4l16 16" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                  {t('g1')}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {t('g1d')}
                </p>
              </div>

              {/* Card 2 */}
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] text-[var(--plum-800)] flex items-center justify-center mx-auto mb-4 shadow-sm border border-[var(--border)]">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                    <path d="M3 12.5l3.5 3.5 6-7" />
                    <path d="M11 15l1 1 8-9" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                  {t('g2')}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {t('g2d')}
                </p>
              </div>

              {/* Card 3 */}
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] text-[var(--plum-800)] flex items-center justify-center mx-auto mb-4 shadow-sm border border-[var(--border)]">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
                    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                  {t('g3')}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {t('g3d')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* EVENTS SECTION                                                */}
      {/* ------------------------------------------------------------- */}
      <section id="events" className="py-16">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl font-['Fraunces',serif] font-semibold text-[var(--text-primary)] tracking-tight">
              {t('evH')}
            </h2>
            <a href="#events" className="text-xs font-bold text-[var(--text-brand)] hover:underline flex items-center gap-1.5">
              <span>{t('evAll')}</span>
              <span className="rtl:rotate-180">→</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Event 1 */}
            <div className="flex flex-col rounded-[22px] bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden shadow-xs hover:shadow-md transition">
              <div className="relative aspect-video bg-gradient-to-tr from-[var(--plum-900)] to-[var(--gold-700)] flex items-center justify-center p-4 text-center">
                <span className="absolute top-3.5 start-3.5 px-2.5 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--text-brand)] font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-wider shadow">
                  {t('e1tag')}
                </span>
                <span className="text-white/80 font-['Fraunces',serif] text-xl font-bold">Biskra Solar Agro</span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-['DM_Mono',monospace] text-[var(--text-accent)] font-medium uppercase tracking-wider mb-1.5">
                    {t('e1date')}
                  </p>
                  <h3 className="text-base font-medium text-[var(--text-primary)] mb-1">
                    {t('e1T')}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t('e1D')}
                  </p>
                </div>
              </div>
            </div>

            {/* Event 2 */}
            <div className="flex flex-col rounded-[22px] bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden shadow-xs hover:shadow-md transition">
              <div className="relative aspect-video bg-gradient-to-tr from-[#003B22] to-[var(--gold-500)] flex items-center justify-center p-4 text-center">
                <span className="absolute top-3.5 start-3.5 px-2.5 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--text-brand)] font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-wider shadow">
                  {t('e2tag')}
                </span>
                <span className="text-white/80 font-['Fraunces',serif] text-xl font-bold">USTHB H2 Lab</span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-['DM_Mono',monospace] text-[var(--text-accent)] font-medium uppercase tracking-wider mb-1.5">
                    {t('e2date')}
                  </p>
                  <h3 className="text-base font-medium text-[var(--text-primary)] mb-1">
                    {t('e2T')}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t('e2D')}
                  </p>
                </div>
              </div>
            </div>

            {/* Event 3 */}
            <div className="flex flex-col rounded-[22px] bg-[var(--bg-surface)] border border-[var(--border)] overflow-hidden shadow-xs hover:shadow-md transition">
              <div className="relative aspect-video bg-gradient-to-tr from-[#1E293B] to-[#0284C7] flex items-center justify-center p-4 text-center">
                <span className="absolute top-3.5 start-3.5 px-2.5 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--text-brand)] font-['DM_Mono',monospace] text-[10px] font-bold uppercase tracking-wider shadow">
                  {t('e3tag')}
                </span>
                <span className="text-white/80 font-['Fraunces',serif] text-xl font-bold">ENP Oran Water</span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-['DM_Mono',monospace] text-[var(--text-accent)] font-medium uppercase tracking-wider mb-1.5">
                    {t('e3date')}
                  </p>
                  <h3 className="text-base font-medium text-[var(--text-primary)] mb-1">
                    {t('e3T')}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t('e3D')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* CALL TO ACTION BANNER                                         */}
      {/* ------------------------------------------------------------- */}
      <section id="join" className="py-12">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
          <div className="rounded-[22px] bg-[var(--bg-inverse)] text-[var(--text-on-brand)] border border-slate-800 p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left rtl:md:text-right">
              <h2
                className="text-2xl md:text-3xl font-['Fraunces',serif] font-semibold text-white mb-2"
                dangerouslySetInnerHTML={{ __html: t('ctaH') }}
              />
              <p className="text-sm text-slate-300 max-w-lg">
                {t('ctaS')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleSelectRole('expert')}
                className="h-11 px-6 rounded-full bg-[var(--accent-gold)] text-[var(--brand-pressed)] hover:bg-[var(--accent-gold-subtle)] font-medium text-sm transition shadow"
              >
                {t('exT')}
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole('organization')}
                className="h-11 px-6 rounded-full border border-white/60 text-white hover:bg-white/10 font-medium text-sm transition"
              >
                {t('orT')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* PARTNERS LOGO STRIP                                           */}
      {/* ------------------------------------------------------------- */}
      <section className="py-8 border-t border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-6">
          <p className="text-xs uppercase font-['DM_Mono',monospace] tracking-wider text-[var(--text-accent)] shrink-0">
            {t('partK')}
          </p>
          <div className="flex flex-wrap items-center justify-around gap-6 flex-1 text-xs font-mono font-bold text-[var(--text-muted)]">
            <span className="px-4 py-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-subtle)]">
              ESI Algiers
            </span>
            <span className="px-4 py-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-subtle)]">
              USTHB Bab Ezzouar
            </span>
            <span className="px-4 py-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-subtle)]">
              ENP Oran
            </span>
            <span className="px-4 py-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-subtle)]">
              MESRS Research Directorate
            </span>
            <span className="px-4 py-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-subtle)]">
              DGRSDT
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FOOTER                                                        */}
      {/* ------------------------------------------------------------- */}
      <footer className="bg-[var(--plum-800)] text-white pt-16 pb-8">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/20">
            <div>
              <a href="#top" className="flex items-center gap-2 font-semibold text-lg text-white mb-4">
                <span className="w-8 h-8 rounded-lg bg-[var(--gold-500)] text-[var(--plum-900)] font-['Fraunces',serif] font-bold flex items-center justify-center">
                  DZ
                </span>
                <span>DZ-Bridge</span>
              </a>
              <p className="text-xs text-white/80 leading-relaxed max-w-xs mb-4">
                Connecting Algerian scholars and diaspora leaders with domestic universities and research laboratories.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--gold-500)]">
                <button type="button" onClick={() => setLang('ar')} className="hover:underline">
                  العربية
                </button>
                <span>·</span>
                <button type="button" onClick={() => setLang('fr')} className="hover:underline">
                  Français
                </button>
                <span>·</span>
                <button type="button" onClick={() => setLang('en')} className="hover:underline">
                  English
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase font-['DM_Mono',monospace] tracking-wider text-[var(--gold-500)] font-bold mb-3">
                {t('fc1')}
              </h4>
              <ul className="space-y-2 text-xs text-white/80 list-none p-0">
                <li><a href="#how" className="hover:text-[var(--gold-500)] transition">{t('nav1')}</a></li>
                <li><a href="#events" className="hover:text-[var(--gold-500)] transition">{t('nav4')}</a></li>
                <li><a href="#events" className="hover:text-[var(--gold-500)] transition">{t('fc1c')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase font-['DM_Mono',monospace] tracking-wider text-[var(--gold-500)] font-bold mb-3">
                {t('fc2')}
              </h4>
              <ul className="space-y-2 text-xs text-white/80 list-none p-0">
                <li><a href="#how" className="hover:text-[var(--gold-500)] transition">{t('fc2a')}</a></li>
                <li><a href="#how" className="hover:text-[var(--gold-500)] transition">{t('fc2b')}</a></li>
                <li><a href="#how" className="hover:text-[var(--gold-500)] transition">{t('fc2c')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase font-['DM_Mono',monospace] tracking-wider text-[var(--gold-500)] font-bold mb-3">
                {t('fc3')}
              </h4>
              <ul className="space-y-2 text-xs text-white/80 list-none p-0">
                <li><a href="#how" className="hover:text-[var(--gold-500)] transition">{t('fc3a')}</a></li>
                <li><a href="#how" className="hover:text-[var(--gold-500)] transition">{t('fc3b')}</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/70">
            <div className="flex flex-wrap items-center gap-3">
              <span>{t('copy')}</span>
              <span className="flex items-center gap-1.5 text-[var(--gold-500)] font-medium">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3 6.3 7 .9-5.1 4.7 1.3 7-6.2-3.4-6.2 3.4 1.3-7-5.1-4.7 7-.9z" />
                </svg>
                <span>{t('faff')} <strong className="text-white">{t('affN')}</strong></span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a href="#top" className="hover:underline">{t('priv')}</a>
              <span>·</span>
              <a href="#top" className="hover:underline">{t('terms')}</a>
              <span>·</span>
              <a href="#top" className="hover:underline">{t('cook')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
