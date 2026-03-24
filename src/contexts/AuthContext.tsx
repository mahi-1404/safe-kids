import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, childApi } from '../services/api';
import socketService from '../services/socket';

interface Parent {
  id: string;
  name: string;
  email: string;
}

interface Child {
  _id: string;
  name: string;
  age: number;
  isOnline: boolean;
  lastSeen: string;
  batteryLevel: number;
  riskScore: number;
  deviceModel?: string;
  isPaired: boolean;
  screenTimeLimit: number;
  bedtimeStart: string;
  bedtimeEnd: string;
}

interface AuthContextValue {
  token: string | null;
  parent: Parent | null;
  children: Child[];
  activeChild: Child | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  selectChild: (childId: string) => void;
  refreshChildren: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children: reactChildren }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sk_token'));
  const [parent, setParent] = useState<Parent | null>(() => {
    const stored = localStorage.getItem('sk_parent');
    return stored ? JSON.parse(stored) : null;
  });
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(
    () => localStorage.getItem('sk_active_child')
  );
  const [loading, setLoading] = useState(false);

  const activeChild = children.find(c => c._id === activeChildId) ?? children[0] ?? null;

  const refreshChildren = useCallback(async () => {
    try {
      const res = await childApi.getAll();
      const list: Child[] = res.data;
      setChildren(list);
      // Auto-select first child if none selected
      if (!activeChildId && list.length > 0) {
        setActiveChildId(list[0]._id);
        localStorage.setItem('sk_active_child', list[0]._id);
      }
    } catch {
      // token may have expired — interceptor handles redirect
    }
  }, [activeChildId]);

  useEffect(() => {
    if (token && parent) {
      refreshChildren();
      socketService.connect(token, parent.id);
    }
    return () => {
      socketService.disconnect();
    };
  }, [token, parent, refreshChildren]);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { token: t, parent: p } = res.data;
      localStorage.setItem('sk_token', t);
      localStorage.setItem('sk_parent', JSON.stringify(p));
      setToken(t);
      setParent(p);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.clear();
    setToken(null);
    setParent(null);
    setChildren([]);
    setActiveChildId(null);
    socketService.disconnect();
    window.location.href = '/login';
  }

  function selectChild(childId: string) {
    setActiveChildId(childId);
    localStorage.setItem('sk_active_child', childId);
  }

  return (
    <AuthContext.Provider value={{
      token, parent, children, activeChild, loading,
      login, logout, selectChild, refreshChildren,
    }}>
      {reactChildren}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export type { Child, Parent };
