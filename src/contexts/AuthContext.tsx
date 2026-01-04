import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export interface AuthUser {
  id: number;
  username: string;
  avatar?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    try {
      const res = await fetch('/api/me', { credentials: 'include', cache: 'no-store' });
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMe(); }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    login: () => { window.location.href = '/api/auth/discord/login'; },
    logout: async () => { try { await fetch('/api/logout', { method: 'POST', credentials: 'include' }); } catch {} setUser(null); },
    refresh: async () => { setLoading(true); await loadMe(); },
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
