import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Clock, Shield, Battery, AlertTriangle, Lock, MessageSquare, Phone, Wifi } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { reportsApi, alertApi, screenTimeApi, commandApi } from '../services/api';
import socketService from '../services/socket';
const fmt = (min) => min < 60 ? `${min}m` : `${Math.floor(min / 60)}h ${min % 60}m`;
const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60)
        return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)
        return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};
const severityColor = {
    critical: '#ef4444', high: '#ef4444', medium: '#f59e0b', low: '#3b82f6', info: '#8b5cf6'
};
const Card = ({ children, style = {} }) => (_jsx("div", { style: { background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155', ...style }, children: children }));
export default function Dashboard() {
    const { parent, activeChild } = useAuth();
    const childId = activeChild?._id;
    const [stats, setStats] = useState(null);
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [weekData, setWeekData] = useState([]);
    const [topApps, setTopApps] = useState([]);
    const [sending, setSending] = useState(null);
    useEffect(() => {
        if (!childId)
            return;
        reportsApi.getDashboard(childId).then(r => setStats(r.data)).catch(() => { });
        alertApi.getAll().then(r => setRecentAlerts(r.data.slice(0, 3))).catch(() => { });
        screenTimeApi.getWeek(childId).then(r => {
            setWeekData(r.data.map((d) => ({
                day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
                hours: +(d.totalMinutes / 60).toFixed(1),
            })));
        }).catch(() => { });
        reportsApi.getWeekly(childId).then(r => setTopApps(r.data.screenTime.topApps.slice(0, 4))).catch(() => { });
    }, [childId]);
    useEffect(() => {
        socketService.on('location:update', (data) => {
            if (data.childId === childId) {
                setStats((s) => s ? { ...s, lastLocation: data } : s);
            }
        });
        socketService.on('screentime:update', (data) => {
            if (data.childId === childId) {
                setStats((s) => s ? { ...s, screenTime: { ...s.screenTime, todayMinutes: data.totalMinutes } } : s);
            }
        });
        socketService.on('alert:new', (alert) => {
            setRecentAlerts(prev => [alert, ...prev].slice(0, 3));
        });
        return () => {
            socketService.off('location:update');
            socketService.off('screentime:update');
            socketService.off('alert:new');
        };
    }, [childId]);
    const sendCommand = async (type) => {
        if (!childId)
            return;
        setSending(type);
        try {
            await commandApi.send(childId, type);
        }
        catch { }
        setSending(null);
    };
    const riskScore = stats?.riskScore ?? 0;
    const riskColor = riskScore < 30 ? '#22c55e' : riskScore < 60 ? '#f59e0b' : '#ef4444';
    const riskLabel = riskScore < 30 ? 'Low Risk' : riskScore < 60 ? 'Medium Risk' : 'High Risk';
    const todayMin = stats?.screenTime?.todayMinutes ?? 0;
    const limitMin = stats?.screenTime?.limitMinutes ?? 180;
    const battery = stats?.batteryLevel ?? 0;
    const isOnline = stats?.isOnline ?? activeChild?.isOnline ?? false;
    const locText = stats?.lastLocation
        ? `${stats.lastLocation.latitude?.toFixed(4)}, ${stats.lastLocation.longitude?.toFixed(4)}`
        : 'No data';
    const appColors = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];
    const maxApp = Math.max(...topApps.map((a) => a.totalMinutes), 1);
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 28 }, children: [_jsxs("h1", { style: { fontSize: 24, fontWeight: 700, marginBottom: 4 }, children: ["Good ", new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening', ", ", parent?.name?.split(' ')[0] ?? 'Parent'] }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: activeChild ? `Here's ${activeChild.name}'s activity overview for today` : 'No child device paired yet' })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }, children: [
                    { label: 'Risk Score', value: String(riskScore), sub: riskLabel, icon: Shield, color: riskColor, bg: '#14532d' },
                    { label: 'Screen Time', value: fmt(todayMin), sub: `Limit: ${fmt(limitMin)}`, icon: Clock, color: '#3b82f6', bg: '#1e3a5f' },
                    { label: 'Location', value: stats?.lastLocation ? 'Tracked' : 'Unknown', sub: locText, icon: MapPin, color: '#8b5cf6', bg: '#3b0764' },
                    { label: 'Battery', value: `${battery}%`, sub: isOnline ? 'Online' : 'Offline', icon: Battery, color: '#f59e0b', bg: '#451a03' },
                ].map(({ label, value, sub, icon: Icon, color, bg }) => (_jsx(Card, { children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { children: [_jsx("div", { style: { color: '#94a3b8', fontSize: 13, marginBottom: 8 }, children: label }), _jsx("div", { style: { fontSize: 26, fontWeight: 700, marginBottom: 4 }, children: value }), _jsx("div", { style: { fontSize: 12, color }, children: sub })] }), _jsx("div", { style: { width: 42, height: 42, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Icon, { size: 20, color: color }) })] }) }, label))) }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, marginBottom: 24 }, children: [_jsxs(Card, { children: [_jsx("div", { style: { fontWeight: 600, marginBottom: 20, fontSize: 15 }, children: "Screen Time This Week" }), weekData.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(AreaChart, { data: weekData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "grad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#3b82f6", stopOpacity: 0.3 }), _jsx("stop", { offset: "95%", stopColor: "#3b82f6", stopOpacity: 0 })] }) }), _jsx(XAxis, { dataKey: "day", stroke: "#475569", tick: { fill: '#94a3b8', fontSize: 12 } }), _jsx(YAxis, { stroke: "#475569", tick: { fill: '#94a3b8', fontSize: 12 } }), _jsx(Tooltip, { contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }, labelStyle: { color: '#94a3b8' } }), _jsx(Area, { type: "monotone", dataKey: "hours", stroke: "#3b82f6", fill: "url(#grad)", strokeWidth: 2 })] }) })) : (_jsx("div", { style: { height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }, children: "No screen time data yet" }))] }), _jsxs(Card, { children: [_jsxs("div", { style: { fontWeight: 600, marginBottom: 20, fontSize: 15, display: 'flex', justifyContent: 'space-between' }, children: ["Recent Alerts", _jsx("span", { style: { fontSize: 12, color: '#3b82f6', cursor: 'pointer' }, children: "View all" })] }), recentAlerts.length > 0 ? recentAlerts.map((a, i) => {
                                const color = severityColor[a.severity] ?? '#64748b';
                                return (_jsxs("div", { style: {
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '12px 0', borderBottom: i < recentAlerts.length - 1 ? '1px solid #334155' : 'none'
                                    }, children: [_jsx("div", { style: { width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 } }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 500, marginBottom: 2 }, children: a.title }), _jsx("div", { style: { fontSize: 11, color: '#64748b' }, children: timeAgo(a.createdAt) })] }), _jsx("span", { style: { fontSize: 11, padding: '2px 8px', borderRadius: 20, background: color + '22', color, fontWeight: 600, textTransform: 'capitalize' }, children: a.severity })] }, a._id ?? i));
                            }) : (_jsx("div", { style: { textAlign: 'center', color: '#475569', padding: '20px 0' }, children: "No alerts" })), recentAlerts.length > 0 && (_jsxs("div", { style: { marginTop: 16, padding: '10px 16px', background: '#ef444422', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx(AlertTriangle, { size: 14, color: "#ef4444" }), _jsxs("span", { style: { fontSize: 12, color: '#ef4444', fontWeight: 500 }, children: [recentAlerts.filter((a) => !a.isRead).length, " unread alerts"] })] }))] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }, children: [_jsxs(Card, { children: [_jsx("div", { style: { fontWeight: 600, marginBottom: 20, fontSize: 15 }, children: "App Usage Today" }), topApps.length > 0 ? topApps.map((app, i) => (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 }, children: [_jsx("span", { style: { fontSize: 13, fontWeight: 500 }, children: app.name }), _jsx("span", { style: { fontSize: 13, color: '#94a3b8' }, children: fmt(app.totalMinutes) })] }), _jsx("div", { style: { height: 6, background: '#334155', borderRadius: 3 }, children: _jsx("div", { style: { height: '100%', width: `${Math.round((app.totalMinutes / maxApp) * 100)}%`, background: appColors[i % appColors.length], borderRadius: 3 } }) })] }, app.name))) : (_jsx("div", { style: { textAlign: 'center', color: '#475569', padding: '20px 0' }, children: "No app usage data yet" }))] }), _jsxs(Card, { children: [_jsx("div", { style: { fontWeight: 600, marginBottom: 20, fontSize: 15 }, children: "Quick Actions" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }, children: [
                                    { icon: Lock, label: 'Lock Device', color: '#ef4444', bg: '#ef444422', cmd: 'lock_device' },
                                    { icon: MessageSquare, label: 'Send Message', color: '#3b82f6', bg: '#3b82f622', cmd: 'send_message' },
                                    { icon: Phone, label: 'Call Check-in', color: '#22c55e', bg: '#22c55e22', cmd: 'call_checkin' },
                                    { icon: Wifi, label: 'Block WiFi', color: '#f59e0b', bg: '#f59e0b22', cmd: 'block_wifi' },
                                ].map(({ icon: Icon, label, color, bg, cmd }) => (_jsxs("button", { onClick: () => sendCommand(cmd), disabled: !childId || sending === cmd, style: {
                                        padding: '14px 10px', borderRadius: 10, border: 'none',
                                        background: bg, cursor: childId ? 'pointer' : 'not-allowed',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                                        opacity: sending === cmd ? 0.6 : 1
                                    }, children: [_jsx(Icon, { size: 22, color: color }), _jsx("span", { style: { fontSize: 12, color, fontWeight: 600 }, children: sending === cmd ? 'Sending...' : label })] }, label))) }), _jsxs("div", { style: { marginTop: 20, padding: 16, background: '#0f172a', borderRadius: 10 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 }, children: [_jsx("span", { style: { fontSize: 13, fontWeight: 600 }, children: "Safety Risk Score" }), _jsxs("span", { style: { fontSize: 13, color: riskColor, fontWeight: 700 }, children: [riskScore, " / 100"] })] }), _jsx("div", { style: { height: 8, background: '#334155', borderRadius: 4 }, children: _jsx("div", { style: { height: '100%', width: `${riskScore}%`, background: riskColor, borderRadius: 4 } }) }), _jsx("div", { style: { fontSize: 11, color: riskColor, marginTop: 6 }, children: riskLabel })] })] })] })] }));
}
