import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, Globe, UserPlus, Battery, Bell, ShieldAlert, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { alertApi } from '../services/api';
import socketService from '../services/socket';
const typeIcon = {
    geofence_breach: MapPin,
    blocked_content: Globe,
    unknown_contact: UserPlus,
    low_battery: Battery,
    suspicious_app: ShieldAlert,
};
const severityColor = {
    critical: '#ef4444', high: '#ef4444', medium: '#f59e0b', low: '#3b82f6', info: '#8b5cf6'
};
const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)
        return 'just now';
    if (m < 60)
        return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)
        return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};
export default function Alerts() {
    const { activeChild } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    useEffect(() => {
        setLoading(true);
        alertApi.getAll().then(r => {
            setAlerts(r.data);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [activeChild?._id]);
    useEffect(() => {
        socketService.on('alert:new', (alert) => {
            setAlerts(prev => [alert, ...prev]);
        });
        return () => { socketService.off('alert:new'); };
    }, []);
    const markRead = (id) => {
        alertApi.markRead(id).then(() => {
            setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
        }).catch(() => { });
    };
    const displayed = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);
    const unread = alerts.filter(a => !a.isRead).length;
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Alerts" }), _jsxs("p", { style: { color: '#94a3b8', fontSize: 14 }, children: [activeChild ? `All safety alerts for ${activeChild.name}` : 'No child paired', unread > 0 && _jsxs("span", { style: { marginLeft: 8, background: '#ef444422', color: '#ef4444', fontSize: 12, padding: '2px 8px', borderRadius: 20 }, children: [unread, " unread"] })] })] }), _jsx("div", { style: { display: 'flex', gap: 12, marginBottom: 24 }, children: ['all', 'high', 'medium', 'low'].map(f => (_jsx("button", { onClick: () => setFilter(f === 'all' ? 'all' : f), style: {
                        padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: filter === f ? '#3b82f6' : '#1e293b',
                        color: filter === f ? 'white' : '#94a3b8', fontSize: 13, fontWeight: 500,
                        textTransform: 'capitalize'
                    }, children: f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) }, f))) }), loading ? (_jsx("div", { style: { textAlign: 'center', padding: 40, color: '#475569' }, children: "Loading alerts..." })) : displayed.length === 0 ? (_jsxs("div", { style: { textAlign: 'center', padding: 40, color: '#475569' }, children: [_jsx(Bell, { size: 40, style: { opacity: 0.3, marginBottom: 12 } }), _jsx("div", { children: "No alerts found" })] })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: displayed.map((a) => {
                    const color = severityColor[a.severity] ?? '#64748b';
                    const Icon = typeIcon[a.type] ?? AlertTriangle;
                    return (_jsxs("div", { style: {
                            background: '#1e293b', borderRadius: 12, padding: '16px 20px',
                            border: `1px solid ${a.isRead ? '#334155' : color + '44'}`,
                            display: 'flex', alignItems: 'center', gap: 16,
                            opacity: a.isRead ? 0.7 : 1
                        }, children: [_jsx("div", { style: {
                                    width: 42, height: 42, borderRadius: 10,
                                    background: color + '22', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }, children: _jsx(Icon, { size: 20, color: color }) }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 14, marginBottom: 3 }, children: a.title }), _jsx("div", { style: { color: '#94a3b8', fontSize: 13 }, children: a.message })] }), _jsxs("div", { style: { textAlign: 'right', flexShrink: 0 }, children: [_jsx("span", { style: {
                                            fontSize: 11, padding: '3px 10px', borderRadius: 20,
                                            background: color + '22', color, fontWeight: 600,
                                            display: 'block', marginBottom: 6, textTransform: 'capitalize'
                                        }, children: a.severity }), _jsx("span", { style: { fontSize: 12, color: '#64748b' }, children: timeAgo(a.createdAt) })] }), !a.isRead && (_jsx("button", { onClick: () => markRead(a._id), title: "Mark as read", style: {
                                    background: '#22c55e22', border: 'none', borderRadius: 6,
                                    padding: '6px', cursor: 'pointer', flexShrink: 0
                                }, children: _jsx(Check, { size: 14, color: "#22c55e" }) }))] }, a._id));
                }) }))] }));
}
