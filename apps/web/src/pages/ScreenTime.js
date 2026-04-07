import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { screenTimeApi, childApi } from '../services/api';
import socketService from '../services/socket';
const fmt = (min) => {
    if (min === 0)
        return '0m';
    if (min < 60)
        return `${min}m`;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
};
const appColors = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
export default function ScreenTime() {
    const { activeChild } = useAuth();
    const childId = activeChild?._id;
    const [todayData, setTodayData] = useState({ totalMinutes: 0, apps: [] });
    const [childInfo, setChildInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!childId)
            return;
        setLoading(true);
        Promise.all([
            screenTimeApi.getToday(childId),
            childApi.getOne(childId),
        ]).then(([stRes, cRes]) => {
            setTodayData(stRes.data);
            setChildInfo(cRes.data);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [childId]);
    useEffect(() => {
        socketService.on('screentime:update', (data) => {
            if (data.childId === childId) {
                setTodayData({ totalMinutes: data.totalMinutes, apps: data.apps || [] });
            }
        });
        return () => { socketService.off('screentime:update'); };
    }, [childId]);
    const limitMin = childInfo?.screenTimeLimit ?? 180;
    const used = todayData.totalMinutes;
    const remaining = Math.max(0, limitMin - used);
    const pct = Math.min(100, Math.round((used / limitMin) * 100));
    const barColor = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#3b82f6';
    const apps = todayData.apps
        .filter((a) => a.durationMinutes > 0)
        .sort((a, b) => b.durationMinutes - a.durationMinutes);
    const maxApp = Math.max(...apps.map((a) => a.durationMinutes), 1);
    const bedtimeStart = childInfo?.bedtimeStart ?? '21:00';
    const bedtimeEnd = childInfo?.bedtimeEnd ?? '07:00';
    const fmt12 = (t) => {
        const [h, m] = t.split(':').map(Number);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
    };
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Screen Time" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: activeChild ? `Manage daily limits for ${activeChild.name}` : 'No child paired' })] }), loading ? (_jsx("div", { style: { textAlign: 'center', padding: 40, color: '#475569' }, children: "Loading..." })) : (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }, children: [_jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }, children: [_jsx(Clock, { size: 18, color: "#3b82f6" }), _jsx("span", { style: { fontWeight: 600, fontSize: 15 }, children: "Daily Screen Time" })] }), _jsx("div", { style: { fontSize: 40, fontWeight: 800, marginBottom: 4 }, children: fmt(used) }), _jsxs("div", { style: { color: '#94a3b8', fontSize: 13, marginBottom: 16 }, children: ["of ", fmt(limitMin), " limit used"] }), _jsx("div", { style: { height: 10, background: '#334155', borderRadius: 5, marginBottom: 8 }, children: _jsx("div", { style: { height: '100%', width: `${pct}%`, background: barColor, borderRadius: 5, transition: 'width 0.5s ease' } }) }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }, children: [_jsxs("span", { children: [fmt(remaining), " remaining"] }), _jsxs("span", { children: ["Limit: ", fmt(limitMin)] })] })] }), _jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 20 }, children: "Bedtime Schedule" }), _jsx("div", { style: { display: 'flex', gap: 12, marginBottom: 16 }, children: [['Bedtime', bedtimeStart, '#8b5cf6'], ['Wake up', bedtimeEnd, '#22c55e']].map(([label, time, color]) => (_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: 12, color: '#64748b', marginBottom: 6 }, children: label }), _jsx("div", { style: {
                                                        background: '#0f172a', borderRadius: 8, padding: '10px 14px',
                                                        fontSize: 20, fontWeight: 700, color: color
                                                    }, children: fmt12(time) })] }, label))) }), _jsx("div", { style: { background: '#8b5cf622', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#8b5cf6' }, children: "Device locks automatically at bedtime" })] })] }), _jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 20 }, children: "App Usage Today" }), apps.length === 0 ? (_jsx("div", { style: { textAlign: 'center', color: '#475569', padding: '20px 0' }, children: "No app usage recorded today" })) : apps.map((app, i) => (_jsxs("div", { style: {
                                    display: 'flex', alignItems: 'center', gap: 16,
                                    padding: '12px 0', borderBottom: i < apps.length - 1 ? '1px solid #334155' : 'none'
                                }, children: [_jsx("div", { style: {
                                            width: 36, height: 36, borderRadius: 8, background: appColors[i % appColors.length] + '22',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 14, fontWeight: 700, color: appColors[i % appColors.length], flexShrink: 0
                                        }, children: app.appName?.[0] ?? '?' }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 }, children: [_jsx("span", { style: { fontSize: 14, fontWeight: 500 }, children: app.appName }), _jsx("span", { style: { fontSize: 13, color: '#94a3b8' }, children: fmt(app.durationMinutes) })] }), _jsx("div", { style: { height: 4, background: '#334155', borderRadius: 2 }, children: _jsx("div", { style: { height: '100%', width: `${Math.round((app.durationMinutes / maxApp) * 100)}%`, background: appColors[i % appColors.length], borderRadius: 2 } }) })] }), _jsx("span", { style: { fontSize: 11, padding: '4px 10px', borderRadius: 20, background: '#22c55e22', color: '#22c55e', fontWeight: 600, flexShrink: 0 }, children: app.category ?? 'App' })] }, app.packageName ?? app.appName)))] })] }))] }));
}
