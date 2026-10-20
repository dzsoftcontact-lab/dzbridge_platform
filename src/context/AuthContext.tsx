import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount } from '../types';

interface AuthContextType {
  user: UserAccount | null;
  token: string | null;
  isLoading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  lang: 'en' | 'fr' | 'ar';
  setLang: (lang: 'en' | 'fr' | 'ar') => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; user?: UserAccount }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string; user?: UserAccount }>;
  socialLogin: (provider: 'Google' | 'LinkedIn' | 'Microsoft') => Promise<{ success: boolean; error?: string; user?: UserAccount }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserAccount>) => Promise<{ success: boolean; error?: string; user?: UserAccount }>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('dzb-token');
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('dzb-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Language state
  const [lang, setLangState] = useState<'en' | 'fr' | 'ar'>(() => {
    try {
      const saved = localStorage.getItem('dzb-lang');
      if (saved === 'en' || saved === 'fr' || saved === 'ar') return saved;
      const nl = (navigator.language || '').slice(0, 2);
      return nl === 'ar' || nl === 'fr' ? nl : 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = (newLang: 'en' | 'fr' | 'ar') => {
    setLangState(newLang);
    try {
      localStorage.setItem('dzb-lang', newLang);
    } catch {}
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('dzb-theme', next);
    } catch {}
    document.documentElement.setAttribute('data-theme', next);
  };

  // Sync theme & language to document root on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [theme, lang]);

  // Handle URL tokens from OAuth callbacks or check /api/auth/me on boot
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      try {
        localStorage.setItem('dzb-token', urlToken);
      } catch {}
      // Clean query string
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState(null, '', newUrl);
    }

    const currentToken = urlToken || token;
    if (currentToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` },
      })
        .then((r) => {
          if (r.ok) return r.json();
          throw new Error('Invalid token');
        })
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          // Fallback or demo user
          localStorage.removeItem('dzb-token');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Authentication failed' };
      }

      setUser(data.user);
      setToken(data.token);
      try {
        localStorage.setItem('dzb-token', data.token);
      } catch {}
      setIsLoading(false);
      return { success: true, user: data.user };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Registration failed' };
      }

      setUser(data.user);
      setToken(data.token);
      try {
        localStorage.setItem('dzb-token', data.token);
      } catch {}
      setIsLoading(false);
      return { success: true, user: data.user };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Network error during registration' };
    }
  };

  const socialLogin = async (provider: 'Google' | 'LinkedIn' | 'Microsoft') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Social login failed' };
      }

      setUser(data.user);
      setToken(data.token);
      try {
        localStorage.setItem('dzb-token', data.token);
      } catch {}
      setIsLoading(false);
      return { success: true, user: data.user };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Social login error' };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('dzb-token');
    } catch {}
  };

  const updateProfile = async (data: Partial<UserAccount>) => {
    if (!token) return { success: false, error: 'Unauthenticated' };
    try {
      const res = await fetch('/api/profile/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) return { success: false, error: resData.error || 'Update failed' };
      setUser(resData.user);
      return { success: true, user: resData.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    if (!token) return { success: false, error: 'Unauthenticated' };
    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Password update failed' };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        theme,
        toggleTheme,
        lang,
        setLang,
        login,
        register,
        socialLogin,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
