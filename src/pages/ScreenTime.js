import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Clock, Plus } from 'lucide-react';
const apps = [
    { name: 'YouTube', time: '1h 20m', pct: 70, color: '#ef4444', blocked: false },
    { name: 'WhatsApp', time: '45m', pct: 37, color: '#22c55e', blocked: false },
    { name: 'Chrome', time: '30m', pct: 25, color: '#3b82f6', blocked: false },
    { name: 'PUBG Mobile', time: '25m', pct: 20, color: '#f59e0b', blocked: true },
    { name: 'Instagram', time: '0m', pct: 0, color: '#8b5cf6', blocked: true },
];
export default function ScreenTime() {
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Screen Time" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: "Manage daily limits for Aryan" })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }, children: [_jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }, children: [_jsx(Clock, { size: 18, color: "#3b82f6" }), _jsx("span", { style: { fontWeight: 600, fontSize: 15 }, children: "Daily Screen Time" })] }), _jsx("div", { style: { fontSize: 40, fontWeight: 800, marginBottom: 4 }, children: "2h 40m" }), _jsx("div", { style: { color: '#94a3b8', fontSize: 13, marginBottom: 16 }, children: "of 4h limit used" }), _jsx("div", { style: { height: 10, background: '#334155', borderRadius: 5, marginBottom: 8 }, children: _jsx("div", { style: { height: '100%', width: '66%', background: '#3b82f6', borderRadius: 5 } }) }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }, children: [_jsx("span", { children: "1h 20m remaining" }), _jsx("span", { children: "Limit: 4h" })] })] }), _jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 20 }, children: "Bedtime Schedule" }), _jsx("div", { style: { display: 'flex', gap: 12, marginBottom: 16 }, children: ['Bedtime', 'Wake up'].map((label, i) => (_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: 12, color: '#64748b', marginBottom: 6 }, children: label }), _jsx("div", { style: {
                                                background: '#0f172a', borderRadius: 8, padding: '10px 14px',
                                                fontSize: 20, fontWeight: 700, color: i === 0 ? '#8b5cf6' : '#22c55e'
                                            }, children: i === 0 ? '9:00 PM' : '7:00 AM' })] }, label))) }), _jsx("div", { style: {
                                    background: '#8b5cf622', borderRadius: 8, padding: '8px 12px',
                                    fontSize: 12, color: '#8b5cf6'
                                }, children: "Device locks automatically at bedtime" })] })] }), _jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, children: [_jsx("span", { style: { fontWeight: 600, fontSize: 15 }, children: "App Usage & Controls" }), _jsxs("button", { style: {
                                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                                    background: '#3b82f6', border: 'none', borderRadius: 8,
                                    color: 'white', fontSize: 13, cursor: 'pointer'
                                }, children: [_jsx(Plus, { size: 14 }), " Add Block"] })] }), apps.map((app, i) => (_jsxs("div", { style: {
                            display: 'flex', alignItems: 'center', gap: 16,
                            padding: '12px 0', borderBottom: i < apps.length - 1 ? '1px solid #334155' : 'none'
                        }, children: [_jsx("div", { style: {
                                    width: 36, height: 36, borderRadius: 8, background: app.color + '22',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 14, fontWeight: 700, color: app.color, flexShrink: 0
                                }, children: app.name[0] }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 }, children: [_jsx("span", { style: { fontSize: 14, fontWeight: 500 }, children: app.name }), _jsx("span", { style: { fontSize: 13, color: '#94a3b8' }, children: app.time })] }), _jsx("div", { style: { height: 4, background: '#334155', borderRadius: 2 }, children: _jsx("div", { style: { height: '100%', width: `${app.pct}%`, background: app.color, borderRadius: 2 } }) })] }), _jsx("span", { style: {
                                    fontSize: 11, padding: '4px 10px', borderRadius: 20,
                                    background: app.blocked ? '#ef444422' : '#22c55e22',
                                    color: app.blocked ? '#ef4444' : '#22c55e',
                                    fontWeight: 600, flexShrink: 0
                                }, children: app.blocked ? 'Blocked' : 'Allowed' })] }, i)))] })] }));
}
