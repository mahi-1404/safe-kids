import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, childApi } from '../services/api';
import socketService from '../services/socket';
const AuthContext = createContext(null);
export function AuthProvider({ children: reactChildren }) {
    const [token, setToken] = useState(() => localStorage.getItem('sk_token'));
    const [parent, setParent] = useState(() => {
        const stored = localStorage.getItem('sk_parent');
        return stored ? JSON.parse(stored) : null;
    });
    const [children, setChildren] = useState([]);
    const [activeChildId, setActiveChildId] = useState(() => localStorage.getItem('sk_active_child'));
    const [loading, setLoading] = useState(false);
    const activeChild = children.find(c => c._id === activeChildId) ?? children[0] ?? null;
    const refreshChildren = useCallback(async () => {
        try {
            const res = await childApi.getAll();
            const list = res.data;
            setChildren(list);
            // Auto-select first child if none selected
            if (!activeChildId && list.length > 0) {
                setActiveChildId(list[0]._id);
                localStorage.setItem('sk_active_child', list[0]._id);
            }
        }
        catch {
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
    async function login(email, password) {
        setLoading(true);
        try {
            const res = await authApi.login(email, password);
            const { token: t, parent: p } = res.data;
            localStorage.setItem('sk_token', t);
            localStorage.setItem('sk_parent', JSON.stringify(p));
            setToken(t);
            setParent(p);
        }
        finally {
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
    function selectChild(childId) {
        setActiveChildId(childId);
        localStorage.setItem('sk_active_child', childId);
    }
    return (_jsx(AuthContext.Provider, { value: {
            token, parent, children, activeChild, loading,
            login, logout, selectChild, refreshChildren,
        }, children: reactChildren }));
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
