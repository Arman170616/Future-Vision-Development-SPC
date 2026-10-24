'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api';
import type { IndexData, User } from './types';

interface AuthState {
  user: User | null;
  index: IndexData | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshIndex: () => Promise<void>;
  replaceToken: (token: string) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [index, setIndex] = useState<IndexData | null>(null);
  const [ready, setReady] = useState(false);

  const refreshIndex = useCallback(async () => {
    setIndex(await api<IndexData>('/index/'));
  }, []);

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    Promise.all([api<{ user: User }>('/me/'), api<IndexData>('/index/')])
      .then(([me, idx]) => {
        setUser(me.user);
        setIndex(idx);
      })
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  const login = async (username: string, password: string) => {
    const result = await api<{ token: string; user: User }>('/auth/login/', { json: { username, password }, auth: false });
    setToken(result.token);
    setUser(result.user);
    await refreshIndex();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIndex(null);
  };

  const replaceToken = (token: string) => setToken(token);

  return (
    <AuthContext.Provider value={{ user, index, ready, login, logout, refreshIndex, replaceToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
