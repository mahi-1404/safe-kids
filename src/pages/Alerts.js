import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MapPin, Globe, UserPlus, Battery } from 'lucide-react';
const alerts = [
    { icon: MapPin, type: 'Geofence Breach', msg: 'Aryan left the school zone at 3:45 PM', time: '2h ago', severity: 'high', color: '#ef4444' },
    { icon: Globe, type: 'Blocked Site Attempt', msg: 'Tried to access blocked website: gaming-site.com', time: '4h ago', severity: 'medium', color: '#f59e0b' },
    { icon: UserPlus, type: 'Unknown Contact', msg: 'New unknown contact added: +91 98765 43210', time: '6h ago', severity: 'medium', color: '#f59e0b' },
    { icon: Battery, type: 'Low Battery', msg: 'Device battery at 15%', time: '8h ago', severity: 'low', color: '#3b82f6' },
    { icon: Globe, type: 'Blocked Site Attempt', msg: 'Tried to access: adult-content.com', time: 'Yesterday', severity: 'high', color: '#ef4444' },
];
export default function Alerts() {
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Alerts" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: "All safety alerts for Aryan" })] }), _jsx("div", { style: { display: 'flex', gap: 12, marginBottom: 24 }, children: ['All', 'High', 'Medium', 'Low'].map((f, i) => (_jsx("button", { style: {
                        padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: i === 0 ? '#3b82f6' : '#1e293b',
                        color: i === 0 ? 'white' : '#94a3b8', fontSize: 13, fontWeight: 500
                    }, children: f }, f))) }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: alerts.map((a, i) => (_jsxs("div", { style: {
                        background: '#1e293b', borderRadius: 12, padding: '16px 20px',
                        border: `1px solid ${a.color}44`,
                        display: 'flex', alignItems: 'center', gap: 16
                    }, children: [_jsx("div", { style: {
                                width: 42, height: 42, borderRadius: 10,
                                background: a.color + '22', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }, children: _jsx(a.icon, { size: 20, color: a.color }) }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 14, marginBottom: 3 }, children: a.type }), _jsx("div", { style: { color: '#94a3b8', fontSize: 13 }, children: a.msg })] }), _jsxs("div", { style: { textAlign: 'right', flexShrink: 0 }, children: [_jsx("span", { style: {
                                        fontSize: 11, padding: '3px 10px', borderRadius: 20,
                                        background: a.color + '22', color: a.color, fontWeight: 600,
                                        display: 'block', marginBottom: 6, textTransform: 'capitalize'
                                    }, children: a.severity }), _jsx("span", { style: { fontSize: 12, color: '#64748b' }, children: a.time })] })] }, i))) })] }));
}
