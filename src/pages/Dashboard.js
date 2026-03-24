import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Clock, Shield, Battery, AlertTriangle, Lock, MessageSquare, Phone, Wifi } from 'lucide-react';
const screenData = [
    { day: 'Mon', hours: 2.5 }, { day: 'Tue', hours: 3.2 },
    { day: 'Wed', hours: 1.8 }, { day: 'Thu', hours: 4.1 },
    { day: 'Fri', hours: 3.5 }, { day: 'Sat', hours: 5.2 },
    { day: 'Sun', hours: 2.9 },
];
const alerts = [
    { type: 'Geofence breach', time: '2h ago', color: '#ef4444', severity: 'High' },
    { type: 'Blocked site attempt', time: '4h ago', color: '#f59e0b', severity: 'Medium' },
    { type: 'Unknown contact added', time: '6h ago', color: '#f59e0b', severity: 'Medium' },
];
const apps = [
    { name: 'YouTube', time: '1h 20m', color: '#ef4444', pct: 70 },
    { name: 'WhatsApp', time: '45m', color: '#22c55e', pct: 37 },
    { name: 'Chrome', time: '30m', color: '#3b82f6', pct: 25 },
    { name: 'PUBG', time: '25m', color: '#f59e0b', pct: 20 },
];
const Card = ({ children, style = {} }) => (_jsx("div", { style: {
        background: '#1e293b', borderRadius: 14, padding: 24,
        border: '1px solid #334155', ...style
    }, children: children }));
export default function Dashboard() {
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 28 }, children: [_jsx("h1", { style: { fontSize: 24, fontWeight: 700, marginBottom: 4 }, children: "Good morning, Mahi \uD83D\uDC4B" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: "Here's Aryan's activity overview for today" })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }, children: [
                    { label: 'Risk Score', value: '23', sub: 'Low Risk', icon: Shield, color: '#22c55e', bg: '#14532d' },
                    { label: 'Screen Time', value: '2h 40m', sub: 'Limit: 4h', icon: Clock, color: '#3b82f6', bg: '#1e3a5f' },
                    { label: 'Location', value: 'Home', sub: 'Safe zone ✓', icon: MapPin, color: '#8b5cf6', bg: '#3b0764' },
                    { label: 'Battery', value: '68%', sub: 'Charging', icon: Battery, color: '#f59e0b', bg: '#451a03' },
                ].map(({ label, value, sub, icon: Icon, color, bg }) => (_jsx(Card, { children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { children: [_jsx("div", { style: { color: '#94a3b8', fontSize: 13, marginBottom: 8 }, children: label }), _jsx("div", { style: { fontSize: 26, fontWeight: 700, marginBottom: 4 }, children: value }), _jsx("div", { style: { fontSize: 12, color }, children: sub })] }), _jsx("div", { style: {
                                    width: 42, height: 42, borderRadius: 10, background: bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }, children: _jsx(Icon, { size: 20, color: color }) })] }) }, label))) }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, marginBottom: 24 }, children: [_jsxs(Card, { children: [_jsx("div", { style: { fontWeight: 600, marginBottom: 20, fontSize: 15 }, children: "Screen Time This Week" }), _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(AreaChart, { data: screenData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "grad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#3b82f6", stopOpacity: 0.3 }), _jsx("stop", { offset: "95%", stopColor: "#3b82f6", stopOpacity: 0 })] }) }), _jsx(XAxis, { dataKey: "day", stroke: "#475569", tick: { fill: '#94a3b8', fontSize: 12 } }), _jsx(YAxis, { stroke: "#475569", tick: { fill: '#94a3b8', fontSize: 12 } }), _jsx(Tooltip, { contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }, labelStyle: { color: '#94a3b8' } }), _jsx(Area, { type: "monotone", dataKey: "hours", stroke: "#3b82f6", fill: "url(#grad)", strokeWidth: 2 })] }) })] }), _jsxs(Card, { children: [_jsxs("div", { style: { fontWeight: 600, marginBottom: 20, fontSize: 15, display: 'flex', justifyContent: 'space-between' }, children: ["Recent Alerts", _jsx("span", { style: { fontSize: 12, color: '#3b82f6', cursor: 'pointer' }, children: "View all" })] }), alerts.map((a, i) => (_jsxs("div", { style: {
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 0', borderBottom: i < alerts.length - 1 ? '1px solid #334155' : 'none'
                                }, children: [_jsx("div", { style: {
                                            width: 8, height: 8, borderRadius: '50%', background: a.color, flexShrink: 0
                                        } }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 500, marginBottom: 2 }, children: a.type }), _jsx("div", { style: { fontSize: 11, color: '#64748b' }, children: a.time })] }), _jsx("span", { style: {
                                            fontSize: 11, padding: '2px 8px', borderRadius: 20,
                                            background: a.color + '22', color: a.color, fontWeight: 600
                                        }, children: a.severity })] }, i))), _jsxs("div", { style: {
                                    marginTop: 16, padding: '10px 16px', background: '#ef444422',
                                    borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8
                                }, children: [_jsx(AlertTriangle, { size: 14, color: "#ef4444" }), _jsx("span", { style: { fontSize: 12, color: '#ef4444', fontWeight: 500 }, children: "3 unread alerts today" })] })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }, children: [_jsxs(Card, { children: [_jsx("div", { style: { fontWeight: 600, marginBottom: 20, fontSize: 15 }, children: "App Usage Today" }), apps.map((app, i) => (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 }, children: [_jsx("span", { style: { fontSize: 13, fontWeight: 500 }, children: app.name }), _jsx("span", { style: { fontSize: 13, color: '#94a3b8' }, children: app.time })] }), _jsx("div", { style: { height: 6, background: '#334155', borderRadius: 3 }, children: _jsx("div", { style: {
                                                height: '100%', width: `${app.pct}%`,
                                                background: app.color, borderRadius: 3,
                                                transition: 'width 0.3s ease'
                                            } }) })] }, i)))] }), _jsxs(Card, { children: [_jsx("div", { style: { fontWeight: 600, marginBottom: 20, fontSize: 15 }, children: "Quick Actions" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }, children: [
                                    { icon: Lock, label: 'Lock Device', color: '#ef4444', bg: '#ef444422' },
                                    { icon: MessageSquare, label: 'Send Message', color: '#3b82f6', bg: '#3b82f622' },
                                    { icon: Phone, label: 'Call Check-in', color: '#22c55e', bg: '#22c55e22' },
                                    { icon: Wifi, label: 'Block WiFi', color: '#f59e0b', bg: '#f59e0b22' },
                                ].map(({ icon: Icon, label, color, bg }) => (_jsxs("button", { style: {
                                        padding: '14px 10px', borderRadius: 10, border: 'none',
                                        background: bg, cursor: 'pointer', display: 'flex',
                                        flexDirection: 'column', alignItems: 'center', gap: 8
                                    }, children: [_jsx(Icon, { size: 22, color: color }), _jsx("span", { style: { fontSize: 12, color, fontWeight: 600 }, children: label })] }, label))) }), _jsxs("div", { style: { marginTop: 20, padding: 16, background: '#0f172a', borderRadius: 10 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 }, children: [_jsx("span", { style: { fontSize: 13, fontWeight: 600 }, children: "Safety Risk Score" }), _jsx("span", { style: { fontSize: 13, color: '#22c55e', fontWeight: 700 }, children: "23 / 100" })] }), _jsx("div", { style: { height: 8, background: '#334155', borderRadius: 4 }, children: _jsx("div", { style: {
                                                height: '100%', width: '23%',
                                                background: 'linear-gradient(90deg, #22c55e, #84cc16)',
                                                borderRadius: 4
                                            } }) }), _jsx("div", { style: { fontSize: 11, color: '#22c55e', marginTop: 6 }, children: "Low Risk \u2014 All good today" })] })] })] })] }));
}
