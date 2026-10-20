import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface LoginPageProps {
  initialView?: 'login' | 'reset' | 'newpw' | 'register';
  onNavigateLanding: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

const LOGIN_I18N = {
  en: {
    liH: 'Log in',
    email: 'Email',
    emailPh: 'name@example.com',
    pw: 'Password',
    forgot: 'Forgot password?',
    show: 'Show password',
    hide: 'Hide password',
    liBtn: 'Log in',
    magicQ: 'Trouble logging in? Get a one-time link by email.',
    magicBtn: 'Send link',
    or: 'Or sign in with',
    newTo: 'New to DZ-Bridge?',
    create: 'Create an account',
    backLogin: 'Back to log in',
    rsH: 'Reset your password',
    rsS: "Enter your account email and we'll send a reset link.",
    rsBtn: 'Send reset link',
    rsNote: 'For privacy, we confirm the same way whether or not the email exists.',
    inH: 'Check your inbox',
    wrong: 'Wrong address?',
    change: 'Change email',
    demo: 'Demo: open the reset link',
    npH: 'Choose a new password',
    npL: 'New password',
    logoutAll: 'Log out of all other devices',
    npBtn: 'Update password',
    dnH: 'Password updated',
    toDark: 'Switch to dark theme',
    toLight: 'Switch to light theme',
    errH: 'Email or password is incorrect.',
    left: (n: number) => (n === 1 ? '1 attempt left before a 15-minute pause.' : `${n} attempts left before a 15-minute pause.`),
    lockH: 'Too many attempts.',
    lockS: (t: string) => `For your security, try again in ${t} or use a one-time link.`,
    errEmail: 'Enter a valid email address.',
    errPw: 'Enter your password.',
    inReset: (e: string) => `If an account exists for <b>${e}</b>, we sent a password reset link. It expires in 24 hours.`,
    inMagic: (e: string) => `We sent a one-time login link to <b>${e}</b>. It expires in 15 minutes.`,
    resend: 'Resend email',
    resendIn: (t: string) => `Resend email · ${t}`,
    resent: 'Email sent again.',
    short: 'Too short. Use at least 10 characters.',
    fair: 'Fair. Add numbers, symbols or capitals.',
    good: 'Good password.',
    strong: 'Strong password.',
    dnAll: "You've been logged out of all other devices. Log in with your new password.",
    dnOne: 'Log in with your new password.',
    secMail: (e: string) => `Security email sent to ${e}`,
    busy: 'Logging in…',
    ok: 'Logged in. Redirecting…',
    social: (p: string) => `Connecting with ${p}…`,
    // Registration additions
    regH: 'Create an account',
    regS: 'Join the national network of scholars, researchers, and institutions.',
    regRole: 'I am registering as:',
    roleExpert: 'Diaspora or Local Expert',
    roleOrg: 'University or Research Center',
    fullName: 'Full Name',
    fullNamePh: 'e.g. Dr. Amina Benali',
    country: 'Country of Residence',
    city: 'City',
    orgName: 'Institution / Organization Name',
    specialty: 'Domain / Field of Expertise',
    regBtn: 'Create Account',
    hasAccount: 'Already have an account?',
  },
  fr: {
    liH: 'Se connecter',
    email: 'E-mail',
    emailPh: 'nom@exemple.com',
    pw: 'Mot de passe',
    forgot: 'Mot de passe oublié ?',
    show: 'Afficher le mot de passe',
    hide: 'Masquer le mot de passe',
    liBtn: 'Se connecter',
    magicQ: 'Un souci pour vous connecter ? Recevez un lien unique par e-mail.',
    magicBtn: 'Envoyer le lien',
    or: 'Ou se connecter avec',
    newTo: 'Nouveau sur DZ-Bridge ?',
    create: 'Créer un compte',
    backLogin: 'Retour à la connexion',
    rsH: 'Réinitialiser le mot de passe',
    rsS: 'Saisissez l’e-mail de votre compte et nous vous enverrons un lien de réinitialisation.',
    rsBtn: 'Envoyer le lien',
    rsNote: 'Par souci de confidentialité, la confirmation est la même que l’e-mail existe ou non.',
    inH: 'Consultez votre boîte de réception',
    wrong: 'Mauvaise adresse ?',
    change: 'Modifier l’e-mail',
    demo: 'Démo : ouvrir le lien',
    npH: 'Choisissez un nouveau mot de passe',
    npL: 'Nouveau mot de passe',
    logoutAll: 'Se déconnecter de tous les autres appareils',
    npBtn: 'Mettre à jour',
    dnH: 'Mot de passe mis à jour',
    toDark: 'Passer au thème sombre',
    toLight: 'Passer au thème clair',
    errH: 'E-mail ou mot de passe incorrect.',
    left: (n: number) => (n === 1 ? '1 tentative restante avant une pause de 15 minutes.' : `${n} tentatives restantes avant une pause de 15 minutes.`),
    lockH: 'Trop de tentatives.',
    lockS: (t: string) => `Par sécurité, réessayez dans ${t} ou utilisez un lien unique.`,
    errEmail: 'Saisissez une adresse e-mail valide.',
    errPw: 'Saisissez votre mot de passe.',
    inReset: (e: string) => `Si un compte existe pour <b>${e}</b>, nous avons envoyé un lien de réinitialisation. Il expire dans 24 heures.`,
    inMagic: (e: string) => `Nous avons envoyé un lien de connexion unique à <b>${e}</b>. Il expire dans 15 minutes.`,
    resend: 'Renvoyer l’e-mail',
    resendIn: (t: string) => `Renvoyer l’e-mail · ${t}`,
    resent: 'E-mail renvoyé.',
    short: 'Trop court. Utilisez au moins 10 caractères.',
    fair: 'Moyen. Ajoutez des chiffres, symboles ou majuscules.',
    good: 'Bon mot de passe.',
    strong: 'Mot de passe robuste.',
    dnAll: 'Vous avez été déconnecté de tous les autres appareils. Connectez-vous avec votre nouveau mot de passe.',
    dnOne: 'Connectez-vous avec votre nouveau mot de passe.',
    secMail: (e: string) => `E-mail de sécurité envoyé à ${e}`,
    busy: 'Connexion…',
    ok: 'Connecté. Redirection…',
    social: (p: string) => `Connexion avec ${p}…`,
    regH: 'Créer un compte',
    regS: 'Rejoignez le réseau national des chercheurs, experts et institutions.',
    regRole: 'Je m’inscris en tant que :',
    roleExpert: 'Expert (Diaspora ou Local)',
    roleOrg: 'Université ou Centre de Recherche',
    fullName: 'Nom complet',
    fullNamePh: 'ex. Dr. Amina Benali',
    country: 'Pays de résidence',
    city: 'Ville',
    orgName: 'Nom de l’institution ou entreprise',
    specialty: 'Domaine d’expertise',
    regBtn: 'Créer le compte',
    hasAccount: 'Vous avez déjà un compte ?',
  },
  ar: {
    liH: 'تسجيل الدخول',
    email: 'البريد الإلكتروني',
    emailPh: 'name@example.com',
    pw: 'كلمة المرور',
    forgot: 'نسيت كلمة المرور؟',
    show: 'إظهار كلمة المرور',
    hide: 'إخفاء كلمة المرور',
    liBtn: 'تسجيل الدخول',
    magicQ: 'هل تواجه مشكلة في الدخول؟ احصل على رابط لمرة واحدة عبر البريد.',
    magicBtn: 'أرسل الرابط',
    or: 'أو سجّل الدخول عبر',
    newTo: 'جديد على DZ-Bridge؟',
    create: 'أنشئ حسابًا',
    backLogin: 'العودة إلى تسجيل الدخول',
    rsH: 'إعادة تعيين كلمة المرور',
    rsS: 'أدخل بريد حسابك وسنرسل لك رابطًا لإعادة التعيين.',
    rsBtn: 'أرسل رابط إعادة التعيين',
    rsNote: 'حفاظًا على الخصوصية، نؤكد بالطريقة نفسها سواء كان البريد موجودًا أم لا.',
    inH: 'تحقّق من بريدك',
    wrong: 'عنوان خاطئ؟',
    change: 'غيّر البريد',
    demo: 'تجربة: افتح الرابط',
    npH: 'اختر كلمة مرور جديدة',
    npL: 'كلمة المرور الجديدة',
    logoutAll: 'تسجيل الخروج من جميع الأجهزة الأخرى',
    npBtn: 'تحديث كلمة المرور',
    dnH: 'تم تحديث كلمة المرور',
    toDark: 'التبديل إلى الوضع الداكن',
    toLight: 'التبديل إلى الوضع الفاتح',
    errH: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    left: (n: number) => (n === 1 ? 'بقيت محاولة واحدة قبل توقف لمدة 15 دقيقة.' : `بقيت ${n} محاولات قبل توقف لمدة 15 دقيقة.`),
    lockH: 'محاولات كثيرة جدًا.',
    lockS: (t: string) => `حفاظًا على أمانك، أعد المحاولة بعد ${t} أو استخدم رابطًا لمرة واحدة.`,
    errEmail: 'أدخل بريدًا إلكترونيًا صالحًا.',
    errPw: 'أدخل كلمة المرور.',
    inReset: (e: string) => `إذا كان هناك حساب مرتبط بـ <b dir="ltr">${e}</b>، فقد أرسلنا رابط إعادة التعيين. تنتهي صلاحيته بعد 24 ساعة.`,
    inMagic: (e: string) => `أرسلنا رابط دخول لمرة واحدة إلى <b dir="ltr">${e}</b>. تنتهي صلاحيته بعد 15 دقيقة.`,
    resend: 'إعادة الإرسال',
    resendIn: (t: string) => `إعادة الإرسال · ${t}`,
    resent: 'أُعيد إرسال البريد.',
    short: 'قصيرة جدًا. استخدم 10 أحرف على الأقل.',
    fair: 'متوسطة. أضف أرقامًا أو رموزًا أو أحرفًا كبيرة.',
    good: 'كلمة مرور جيدة.',
    strong: 'كلمة مرور قوية.',
    dnAll: 'تم تسجيل خروجك من جميع الأجهزة الأخرى. سجّل الدخول بكلمة المرور الجديدة.',
    dnOne: 'سجّل الدخول بكلمة المرور الجديدة.',
    secMail: (e: string) => `أُرسل بريد أمان إلى ${e}`,
    busy: 'جارٍ تسجيل الدخول…',
    ok: 'تم تسجيل الدخول. جارٍ التحويل…',
    social: (p: string) => `تسجيل الدخول عبر ${p}…`,
    regH: 'إنشاء حساب جديد',
    regS: 'انضم إلى الشبكة الوطنية للعلماء والخبراء والجامعات الجزائرية.',
    regRole: 'أنا أسجل بصفتي:',
    roleExpert: 'خبير (في المهجر أو داخل الوطن)',
    roleOrg: 'جامعة أو مركز بحث أو مؤسسة',
    fullName: 'الاسم الكامل',
    fullNamePh: 'مثال: د. أمينة بن علي',
    country: 'بلد الإقامة',
    city: 'المدينة',
    orgName: 'اسم المؤسسة أو الجامعة',
    specialty: 'مجال التخصص والخبرة',
    regBtn: 'إنشاء الحساب',
    hasAccount: 'هل لديك حساب بالفعل؟',
  },
};

export const LoginPage: React.FC<LoginPageProps> = ({ initialView = 'login', onNavigateLanding, onLoginSuccess }) => {
  const { lang, setLang, theme, toggleTheme, login, register, socialLogin } = useAuth();
  const [view, setView] = useState<'login' | 'reset' | 'sent' | 'newpw' | 'done' | 'register'>(initialView);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<{ title: string; subtitle: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMagicOption, setShowMagicOption] = useState(false);

  // Registration form states
  const [regRole, setRegRole] = useState<'expert' | 'organization'>('expert');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCountry, setRegCountry] = useState('Algeria');
  const [regCity, setRegCity] = useState('');
  const [regOrgName, setRegOrgName] = useState('');
  const [regSpecialty, setRegSpecialty] = useState('');

  // Password reset flow states
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailError, setResetEmailError] = useState<string | null>(null);
  const [sentMode, setSentMode] = useState<'reset' | 'magic'>('reset');
  const [sentEmailTarget, setSentEmailTarget] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // New password states
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [logoutAllDevices, setLogoutAllDevices] = useState(true);

  // Language Dropdown open state
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lockout logic with localStorage
  const [fails, setFails] = useState<number>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('dzb-auth-fails') || '0');
      return typeof saved === 'number' ? saved : 0;
    } catch {
      return 0;
    }
  });

  const [lockUntil, setLockUntil] = useState<number>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('dzb-auth-lock') || '0');
      return typeof saved === 'number' ? saved : 0;
    } catch {
      return 0;
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const t = (k: keyof typeof LOGIN_I18N['en'], ...args: any[]) => {
    const dict = LOGIN_I18N[lang] || LOGIN_I18N['en'];
    const val = (dict as any)[k] || (LOGIN_I18N['en'] as any)[k];
    if (typeof val === 'function') {
      return val(...args);
    }
    return val || '';
  };

  const isLocked = lockUntil > Date.now();

  // Cooldown countdown timer for resend
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  // Lockout countdown timer
  useEffect(() => {
    if (!isLocked) return;
    const interval = setInterval(() => {
      if (Date.now() >= lockUntil) {
        setLockUntil(0);
        setFails(0);
        localStorage.removeItem('dzb-auth-lock');
        localStorage.removeItem('dzb-auth-fails');
        setAlertError(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockUntil]);

  const formatMmSs = (ms: number) => {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Password score calculation 0-4
  const getPasswordScore = (pw: string) => {
    if (!pw || pw.length < 10) return pw.length ? 1 : 0;
    let s = 1;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 1;
    if (/\d/.test(pw)) s += 1;
    if (/[^A-Za-z0-9]/.test(pw)) s += 1;
    if (pw.length >= 14) s += 1;
    return Math.min(4, Math.max(2, s));
  };

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || isSubmitting) return;

    let hasErr = false;
    if (!isValidEmail(email)) {
      setEmailError(t('errEmail'));
      hasErr = true;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError(t('errPw'));
      hasErr = true;
    } else {
      setPasswordError(null);
    }

    if (hasErr) return;

    setIsSubmitting(true);
    setAlertError(null);

    const result = await login(email, password);

    if (result.success && result.user) {
      setFails(0);
      setLockUntil(0);
      localStorage.removeItem('dzb-auth-fails');
      localStorage.removeItem('dzb-auth-lock');
      setIsSubmitting(false);
      showToast(t('ok'));
      setTimeout(() => {
        onLoginSuccess(result.user!.role);
      }, 500);
    } else {
      setIsSubmitting(false);
      setShowMagicOption(true);
      const nextFails = fails + 1;
      setFails(nextFails);
      localStorage.setItem('dzb-auth-fails', JSON.stringify(nextFails));

      if (nextFails >= 5) {
        const lockTime = Date.now() + 15 * 60 * 1000;
        setLockUntil(lockTime);
        localStorage.setItem('dzb-auth-lock', JSON.stringify(lockTime));
        setAlertError({
          title: t('lockH'),
          subtitle: t('lockS', formatMmSs(15 * 60 * 1000)),
        });
      } else {
        setAlertError({
          title: t('errH'),
          subtitle: t('left', 5 - nextFails),
        });
      }
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !isValidEmail(regEmail) || regPassword.length < 8) {
      showToast('Please check the registration fields.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      country: regCountry,
      city: regCity,
      organizationName: regOrgName,
      specialty: regSpecialty,
    });

    setIsSubmitting(false);
    if (result.success && result.user) {
      showToast('Account created successfully!');
      setTimeout(() => {
        onLoginSuccess(result.user!.role);
      }, 500);
    } else {
      showToast(result.error || 'Registration failed');
    }
  };

  // Handle Social Login
  const handleSocialClick = async (provider: 'Google' | 'LinkedIn' | 'Microsoft') => {
    showToast(t('social', provider));
    const res = await socialLogin(provider);
    if (res.success && res.user) {
      showToast(`Logged in as ${res.user.fullName} (${res.user.role})`);
      setTimeout(() => {
        onLoginSuccess(res.user!.role);
      }, 600);
    }
  };

  // Handle Forgot Password Submit
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(resetEmail)) {
      setResetEmailError(t('errEmail'));
      return;
    }
    setResetEmailError(null);
    setIsSubmitting(true);

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
    } catch {}

    setIsSubmitting(false);
    setSentMode('reset');
    setSentEmailTarget(resetEmail);
    setCooldownSeconds(60);
    setView('sent');
  };

  // Handle One-time magic link
  const handleSendMagicLink = async () => {
    const target = email.trim();
    if (!isValidEmail(target)) {
      setEmailError(t('errEmail'));
      return;
    }
    try {
      await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: target }),
      });
    } catch {}
    setSentMode('magic');
    setSentEmailTarget(target);
    setCooldownSeconds(60);
    setView('sent');
  };

  // Handle New Password Submit
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 10) return;
    setIsSubmitting(true);

    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword, email: sentEmailTarget }),
      });
    } catch {}

    setIsSubmitting(false);
    setFails(0);
    setLockUntil(0);
    localStorage.removeItem('dzb-auth-fails');
    localStorage.removeItem('dzb-auth-lock');
    setView('done');
    if (sentEmailTarget) {
      showToast(t('secMail', sentEmailTarget));
    }
  };

  const pwScore = getPasswordScore(newPassword);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] font-['DM_Sans',system-ui,-apple-system,sans-serif] antialiased">
      {/* ------------------------------------------------------------- */}
      {/* HEADER MATCHING LANDING PAGE                                  */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-[color-mix(in_srgb,var(--bg-page)_90%,transparent)] backdrop-blur-md border-b border-[var(--border)] transition-colors">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-[70px] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onNavigateLanding}
            className="flex items-center gap-2.5 font-semibold text-xl tracking-tight text-[var(--text-primary)] hover:opacity-90 transition"
          >
            <span className="w-[34px] h-[34px] rounded-lg bg-[var(--plum-800)] dark:bg-[var(--brand)] text-white dark:text-[var(--text-on-brand)] font-['Fraunces',serif] font-semibold text-base flex items-center justify-center">
              DZ
            </span>
            <span>DZ-Bridge</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
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
                      <g>
                        <path d="M0 0v30h60V0z" fill="#012169" />
                        <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
                        <path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" strokeWidth="4" />
                        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
                        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
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
                      <svg className="w-5 h-3.5 rounded-xs" viewBox="0 0 30 20">
                        <rect width="10" height="20" fill="#002395" /><rect x="10" width="10" height="20" fill="#fff" /><rect x="20" width="10" height="20" fill="#ED2939" />
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
                      <svg className="w-5 h-3.5 rounded-xs" viewBox="0 0 60 30">
                        <path d="M0 0v30h60V0z" fill="#012169" />
                        <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
                        <path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" strokeWidth="4" />
                        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
                        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
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
                      <svg className="w-5 h-3.5 rounded-xs" viewBox="0 0 30 20">
                        <rect width="15" height="20" fill="#006233" /><rect x="15" width="15" height="20" fill="#fff" /><circle cx="15" cy="10" r="5" fill="#D21034" /><circle cx="16.3" cy="10" r="4" fill="#fff" /><path d="M17.6 10l2.9-.95-1.8 2.45V8.5l1.8 2.45z" fill="#D21034" />
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
              className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition"
              aria-label={theme === 'dark' ? t('toLight') : t('toDark')}
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
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN AUTH CONTAINER WITH RADIAL BACKGROUND                    */}
      {/* ------------------------------------------------------------- */}
      <main className="relative flex-1 grid place-items-center py-10 px-4 sm:px-6 overflow-hidden">
        {/* Visual background layers */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_50%_at_50%_25%,color-mix(in_srgb,var(--accent-gold)_14%,transparent),transparent_70%),linear-gradient(180deg,var(--accent-lavender-subtle),var(--bg-page)_70%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(color-mix(in_srgb,var(--text-accent)_35%,transparent)_1px,transparent_1.6px)] [background-size:28px_28px] [-webkit-mask-image:radial-gradient(60%_50%_at_50%_30%,#000,transparent)] [mask-image:radial-gradient(60%_50%_at_50%_30%,#000,transparent)]" />

        {/* VIEW 1: LOG IN */}
        {view === 'login' && (
          <section className="w-full max-w-[420px] p-6 sm:p-9 rounded-[22px] bg-[var(--bg-surface)] border border-[var(--border)] shadow-[0_24px_48px_-28px_rgba(40,1,31,0.35)] transition-all">
            <h1 className="text-2xl sm:text-3xl font-semibold font-['Fraunces',serif] text-[var(--text-primary)] mb-5">
              {t('liH')}
            </h1>

            {/* Lockout or Credential Error Alert */}
            {alertError && (
              <div className="flex gap-2.5 items-start p-3.5 mb-5 rounded-xl border border-[var(--error)] bg-[var(--error-subtle)] text-sm text-[var(--error)]">
                <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong className="block font-semibold">{alertError.title}</strong>
                  <span className="text-xs text-[var(--text-secondary)]">{alertError.subtitle}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[var(--text-primary)]" htmlFor="loginEmail">
                  {t('email')}
                </label>
                <input
                  id="loginEmail"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                  placeholder={t('emailPh')}
                  className={`w-full h-12 px-3.5 rounded-xl border ${
                    emailError ? 'border-[var(--error)] ring-1 ring-[var(--error)]' : 'border-[var(--border-strong)]'
                  } bg-[var(--bg-surface)] focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--border-focus)] transition`}
                />
                {emailError && <p className="text-xs text-[var(--error)] mt-1">{emailError}</p>}
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]" htmlFor="loginPassword">
                    {t('pw')}
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(null); }}
                    className={`w-full h-12 px-3.5 pe-12 rounded-xl border ${
                      passwordError ? 'border-[var(--error)] ring-1 ring-[var(--error)]' : 'border-[var(--border-strong)]'
                    } bg-[var(--bg-surface)] focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--border-focus)] transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-1.5 end-1.5 w-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-subtle)]"
                    aria-label={showPassword ? t('hide') : t('show')}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-2.9 3.9M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
                        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && <p className="text-xs text-[var(--error)] mt-1">{passwordError}</p>}
              </div>

              <div className="text-end">
                <button
                  type="button"
                  onClick={() => { setResetEmail(email); setView('reset'); }}
                  className="text-xs font-semibold text-[var(--text-brand)] hover:underline"
                >
                  {t('forgot')}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLocked || isSubmitting}
                className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--text-on-brand)] hover:bg-[var(--brand-hover)] font-medium text-sm transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-e-transparent rounded-full animate-spin" />
                    <span>{t('busy')}</span>
                  </>
                ) : (
                  <span>{t('liBtn')}</span>
                )}
              </button>
            </form>

            {/* Trouble logging in magic fallback */}
            {showMagicOption && (
              <div className="flex items-center justify-between gap-3 mt-4 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-xs text-[var(--text-secondary)]">
                <span>{t('magicQ')}</span>
                <button
                  type="button"
                  onClick={handleSendMagicLink}
                  className="font-semibold text-[var(--text-brand)] underline shrink-0 hover:opacity-80"
                >
                  {t('magicBtn')}
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3.5 my-6 text-xs text-[var(--text-secondary)]">
              <span className="flex-1 border-t-2 border-dotted border-[var(--border-strong)] opacity-70" />
              <span>{t('or')}</span>
              <span className="flex-1 border-t-2 border-dotted border-[var(--border-strong)] opacity-70" />
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSocialClick('Google')}
                className="h-12 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--bg-surface)] flex items-center justify-center shadow-xs hover:shadow transition"
                aria-label="Sign in with Google"
                title="Google Sign-In"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSocialClick('LinkedIn')}
                className="h-12 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--bg-surface)] flex items-center justify-center shadow-xs hover:shadow transition"
                aria-label="Sign in with LinkedIn"
                title="LinkedIn Sign-In"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="4" fill="#0A66C2" />
                  <path fill="#fff" d="M5.3 9.4h2.9V19H5.3zM6.75 4.9a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4zM10 9.4h2.8v1.3h.04c.39-.74 1.34-1.52 2.76-1.52 2.95 0 3.5 1.94 3.5 4.47V19h-2.9v-4.75c0-1.13-.02-2.59-1.58-2.59-1.58 0-1.82 1.23-1.82 2.5V19H10z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSocialClick('Microsoft')}
                className="h-12 rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--bg-surface)] flex items-center justify-center shadow-xs hover:shadow transition"
                aria-label="Sign in with Microsoft"
                title="Microsoft Sign-In"
              >
                <svg className="w-5 h-5" viewBox="0 0 21 21">
                  <path fill="#F25022" d="M0 0h10v10H0z" />
                  <path fill="#7FBA00" d="M11 0h10v10H11z" />
                  <path fill="#00A4EF" d="M0 11h10v10H0z" />
                  <path fill="#FFB900" d="M11 11h10v10H11z" />
                </svg>
              </button>
            </div>

            {/* Quick Demo Credentials Reminder */}
            <div className="mt-5 p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border)] text-[11px] text-[var(--text-secondary)] space-y-1">
              <div className="font-semibold text-[var(--text-primary)]">Demo Accounts (Password: DZbridge2026!):</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => { setEmail('dzsoft.contact@gmail.com'); setPassword('DZbridge2026!'); }}
                  className="px-2 py-0.5 rounded bg-[var(--bg-surface)] hover:bg-[var(--border)] font-mono text-[10px] text-[var(--text-brand)]"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('admin@dz-bridge.dz'); setPassword('DZbridge2026!'); }}
                  className="px-2 py-0.5 rounded bg-[var(--bg-surface)] hover:bg-[var(--border)] font-mono text-[10px] text-[var(--text-brand)]"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('belgacem.haba@algerian-scholars.dz'); setPassword('DZbridge2026!'); }}
                  className="px-2 py-0.5 rounded bg-[var(--bg-surface)] hover:bg-[var(--border)] font-mono text-[10px] text-[var(--text-brand)]"
                >
                  Prof. Haba
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('direction@esi.dz'); setPassword('DZbridge2026!'); }}
                  className="px-2 py-0.5 rounded bg-[var(--bg-surface)] hover:bg-[var(--border)] font-mono text-[10px] text-[var(--text-brand)]"
                >
                  ESI Algiers
                </button>
              </div>
            </div>

            {/* Link to create account */}
            <p className="mt-5 text-center text-xs text-[var(--text-secondary)]">
              <span>{t('newTo')} </span>
              <button
                type="button"
                onClick={() => setView('register')}
                className="font-semibold text-[var(--text-primary)] underline hover:opacity-80"
              >
                {t('create')}
              </button>
            </p>
          </section>
        )}

        {/* VIEW 2: REGISTRATION */}
        {view === 'register' && (
          <section className="w-full max-w-[460px] p-6 sm:p-9 rounded-[22px] bg-[var(--bg-surface)] border border-[var(--border)] shadow-[0_24px_48px_-28px_rgba(40,1,31,0.35)] transition-all">
            <button
              type="button"
              onClick={() => setView('login')}
              className="inline-flex items-center gap-1.5 mb-4 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <span className="rtl:rotate-180">←</span>
              <span>{t('backLogin')}</span>
            </button>

            <h1 className="text-2xl font-semibold font-['Fraunces',serif] text-[var(--text-primary)] mb-1.5">
              {t('regH')}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              {t('regS')}
            </p>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Role Toggle */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-[var(--text-secondary)]">
                  {t('regRole')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('expert')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition ${
                      regRole === 'expert'
                        ? 'border-[var(--brand)] bg-[var(--accent-lavender-subtle)] text-[var(--brand)] font-semibold'
                        : 'border-[var(--border)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {t('roleExpert')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('organization')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition ${
                      regRole === 'organization'
                        ? 'border-[var(--brand)] bg-[var(--accent-lavender-subtle)] text-[var(--brand)] font-semibold'
                        : 'border-[var(--border)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {t('roleOrg')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-[var(--text-primary)]">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder={t('fullNamePh')}
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-[var(--text-primary)]">
                  {t('email')}
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-[var(--text-primary)]">
                  {t('pw')} (Min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1 text-[var(--text-primary)]">
                    {t('country')}
                  </label>
                  <input
                    type="text"
                    value={regCountry}
                    onChange={(e) => setRegCountry(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-[var(--text-primary)]">
                    {t('city')}
                  </label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="Algiers, Paris, Boston..."
                    className="w-full h-11 px-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>

              {regRole === 'organization' ? (
                <div>
                  <label className="block text-xs font-medium mb-1 text-[var(--text-primary)]">
                    {t('orgName')}
                  </label>
                  <input
                    type="text"
                    value={regOrgName}
                    onChange={(e) => setRegOrgName(e.target.value)}
                    placeholder="e.g. University of Constantine 1"
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium mb-1 text-[var(--text-primary)]">
                    {t('specialty')}
                  </label>
                  <input
                    type="text"
                    value={regSpecialty}
                    onChange={(e) => setRegSpecialty(e.target.value)}
                    placeholder="e.g. AI Hardware, Green Hydrogen, Bioengineering"
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] text-xs focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-full bg-[var(--brand)] text-[var(--text-on-brand)] hover:bg-[var(--brand-hover)] font-medium text-sm transition mt-3 flex items-center justify-center shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Creating account…' : t('regBtn')}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-[var(--text-secondary)]">
              <span>{t('hasAccount')} </span>
              <button
                type="button"
                onClick={() => setView('login')}
                className="font-semibold text-[var(--text-primary)] underline"
              >
                {t('liBtn')}
              </button>
            </p>
          </section>
        )}

        {/* VIEW 3: RESET PASSWORD REQUEST */}
        {view === 'reset' && (
          <section className="w-full max-w-[420px] p-6 sm:p-9 rounded-[22px] bg-[var(--bg-surface)] border border-[var(--border)] shadow-[0_24px_48px_-28px_rgba(40,1,31,0.35)] transition-all">
            <button
              type="button"
              onClick={() => setView('login')}
              className="inline-flex items-center gap-1.5 mb-4 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <span className="rtl:rotate-180">←</span>
              <span>{t('backLogin')}</span>
            </button>

            <h1 className="text-2xl font-semibold font-['Fraunces',serif] text-[var(--text-primary)] mb-2">
              {t('rsH')}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
              {t('rsS')}
            </p>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[var(--text-primary)]">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => { setResetEmail(e.target.value); setResetEmailError(null); }}
                  placeholder={t('emailPh')}
                  className={`w-full h-12 px-3.5 rounded-xl border ${
                    resetEmailError ? 'border-[var(--error)] ring-1 ring-[var(--error)]' : 'border-[var(--border-strong)]'
                  } bg-[var(--bg-surface)] focus:outline-none focus:border-[var(--brand)] transition`}
                />
                {resetEmailError && <p className="text-xs text-[var(--error)] mt-1">{resetEmailError}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--text-on-brand)] hover:bg-[var(--brand-hover)] font-medium text-sm transition shadow-sm"
              >
                {isSubmitting ? 'Sending…' : t('rsBtn')}
              </button>
            </form>

            <p className="mt-4 text-xs text-[var(--text-secondary)] leading-relaxed">
              {t('rsNote')}
            </p>
          </section>
        )}

        {/* VIEW 4: SENT / CHECK INBOX */}
        {view === 'sent' && (
          <section className="w-full max-w-[420px] p-6 sm:p-9 rounded-[22px] bg-[var(--bg-surface)] border border-[var(--border)] shadow-[0_24px_48px_-28px_rgba(40,1,31,0.35)] text-center transition-all">
            <div className="w-14 h-14 rounded-full bg-[var(--accent-lavender)] text-[var(--text-brand)] flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold font-['Fraunces',serif] text-[var(--text-primary)] mb-2.5">
              {t('inH')}
            </h1>

            <p
              className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6"
              dangerouslySetInnerHTML={{
                __html: sentMode === 'magic' ? t('inMagic', sentEmailTarget) : t('inReset', sentEmailTarget),
              }}
            />

            <button
              type="button"
              disabled={cooldownSeconds > 0}
              onClick={() => {
                setCooldownSeconds(60);
                showToast(t('resent'));
              }}
              className="w-full h-11 rounded-full border border-[var(--border-strong)] hover:border-[var(--brand)] text-xs font-semibold text-[var(--text-primary)] transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {cooldownSeconds > 0 ? t('resendIn', `${cooldownSeconds}s`) : t('resend')}
            </button>

            <p className="text-xs text-[var(--text-secondary)]">
              <span>{t('wrong')} </span>
              <button
                type="button"
                onClick={() => setView(sentMode === 'magic' ? 'login' : 'reset')}
                className="font-semibold text-[var(--text-brand)] underline hover:opacity-80"
              >
                {t('change')}
              </button>
            </p>

            {/* Demo direct link to open new password screen */}
            {sentMode === 'reset' && (
              <p className="mt-5 text-[11px] font-mono uppercase text-[var(--text-muted)]">
                <button
                  type="button"
                  onClick={() => setView('newpw')}
                  className="text-[var(--text-brand)] underline hover:opacity-80"
                >
                  {t('demo')}
                </button>
              </p>
            )}
          </section>
        )}

        {/* VIEW 5: CHOOSE A NEW PASSWORD */}
        {view === 'newpw' && (
          <section className="w-full max-w-[420px] p-6 sm:p-9 rounded-[22px] bg-[var(--bg-surface)] border border-[var(--border)] shadow-[0_24px_48px_-28px_rgba(40,1,31,0.35)] transition-all">
            <h1 className="text-2xl font-semibold font-['Fraunces',serif] text-[var(--text-primary)] mb-5">
              {t('npH')}
            </h1>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[var(--text-primary)]">
                  {t('npL')}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-12 px-3.5 pe-12 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] focus:outline-none focus:border-[var(--brand)] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-1.5 end-1.5 w-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-subtle)]"
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-2.9 3.9M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
                        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password strength 4-meter bar */}
                <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                  <span
                    className={`h-1 rounded-full transition-colors ${
                      pwScore >= 1 ? (pwScore === 1 ? 'bg-[var(--error)]' : pwScore === 2 ? 'bg-[var(--warning)]' : 'bg-[var(--success)]') : 'bg-[var(--border)]'
                    }`}
                  />
                  <span
                    className={`h-1 rounded-full transition-colors ${
                      pwScore >= 2 ? (pwScore === 2 ? 'bg-[var(--warning)]' : 'bg-[var(--success)]') : 'bg-[var(--border)]'
                    }`}
                  />
                  <span
                    className={`h-1 rounded-full transition-colors ${
                      pwScore >= 3 ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                    }`}
                  />
                  <span
                    className={`h-1 rounded-full transition-colors ${
                      pwScore >= 4 ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                    }`}
                  />
                </div>

                {newPassword && (
                  <p
                    className={`text-xs mt-1.5 ${
                      pwScore === 1
                        ? 'text-[var(--error)]'
                        : pwScore === 2
                        ? 'text-[var(--warning)]'
                        : 'text-[var(--success)]'
                    }`}
                  >
                    {pwScore === 1
                      ? `⚠ ${t('short')}`
                      : pwScore === 2
                      ? t('fair')
                      : pwScore === 3
                      ? t('good')
                      : t('strong')}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[var(--text-secondary)] select-none">
                <input
                  type="checkbox"
                  checked={logoutAllDevices}
                  onChange={(e) => setLogoutAllDevices(e.target.checked)}
                  className="w-4 h-4 accent-[var(--brand)] rounded"
                />
                <span>{t('logoutAll')}</span>
              </label>

              <button
                type="submit"
                disabled={newPassword.length < 10 || isSubmitting}
                className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--text-on-brand)] hover:bg-[var(--brand-hover)] font-medium text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating…' : t('npBtn')}
              </button>
            </form>
          </section>
        )}

        {/* VIEW 6: PASSWORD UPDATED CONFIRMATION */}
        {view === 'done' && (
          <section className="w-full max-w-[420px] p-6 sm:p-9 rounded-[22px] bg-[var(--bg-surface)] border border-[var(--border)] shadow-[0_24px_48px_-28px_rgba(40,1,31,0.35)] text-center transition-all">
            <div className="w-14 h-14 rounded-full bg-[var(--brand)] text-[var(--text-on-brand)] flex items-center justify-center mx-auto mb-5 shadow-sm">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold font-['Fraunces',serif] text-[var(--text-primary)] mb-2.5">
              {t('dnH')}
            </h1>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
              {logoutAllDevices ? t('dnAll') : t('dnOne')}
            </p>

            <button
              type="button"
              onClick={() => setView('login')}
              className="w-full h-12 rounded-full bg-[var(--brand)] text-[var(--text-on-brand)] hover:bg-[var(--brand-hover)] font-medium text-sm transition shadow-sm"
            >
              {t('liBtn')}
            </button>
          </section>
        )}
      </main>

      {/* Toast popup */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-[var(--plum-900)] dark:bg-[var(--lav-100)] text-white dark:text-[var(--plum-900)] text-xs font-semibold shadow-2xl transition-all animate-bounce"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};
