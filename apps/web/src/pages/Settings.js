import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { User, Bell, Shield, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
const fmt = (min) => {
    if (min < 60)
        return `${min}m`;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
};
const fmt12 = (t) => {
    if (!t)
        return '--';
    const [h, m] = t.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
};
export default function Settings() {
    const { parent, activeChild } = useAuth();
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Settings" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: "Account and child profile details" })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }, children: [_jsxs("div", { style: { background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }, children: [_jsxs("div", { style: { padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #334155' }, children: [_jsx("div", { style: { width: 42, height: 42, borderRadius: 10, background: '#3b82f622', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, children: _jsx(User, { size: 20, color: "#3b82f6" }) }), _jsx("div", { style: { fontWeight: 600, fontSize: 15 }, children: "Parent Profile" })] }), _jsx("div", { style: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }, children: [
                                    { label: 'Name', value: parent?.name ?? '—' },
                                    { label: 'Email', value: parent?.email ?? '—' },
                                ].map(({ label, value }) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { style: { color: '#64748b', fontSize: 13 }, children: label }), _jsx("span", { style: { fontSize: 13, fontWeight: 500 }, children: value })] }, label))) })] }), activeChild && (_jsxs("div", { style: { background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }, children: [_jsxs("div", { style: { padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #334155' }, children: [_jsx("div", { style: { width: 42, height: 42, borderRadius: 10, background: '#22c55e22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, children: _jsx(Shield, { size: 20, color: "#22c55e" }) }), _jsxs("div", { style: { fontWeight: 600, fontSize: 15 }, children: ["Child Profile \u2014 ", activeChild.name] })] }), _jsx("div", { style: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }, children: [
                                    { label: 'Name', value: activeChild.name },
                                    { label: 'Age', value: `${activeChild.age} years` },
                                    { label: 'Screen Time Limit', value: fmt(activeChild.screenTimeLimit ?? 180) },
                                    { label: 'Bedtime', value: fmt12(activeChild.bedtimeStart ?? '21:00') },
                                    { label: 'Wake Up', value: fmt12(activeChild.bedtimeEnd ?? '07:00') },
                                    { label: 'Status', value: activeChild.isOnline ? '● Online' : '○ Offline' },
                                    { label: 'Battery', value: `${activeChild.batteryLevel ?? 0}%` },
                                    { label: 'Risk Score', value: `${activeChild.riskScore ?? 0} / 100` },
                                ].map(({ label, value }) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { style: { color: '#64748b', fontSize: 13 }, children: label }), _jsx("span", { style: { fontSize: 13, fontWeight: 500 }, children: value })] }, label))) })] })), _jsxs("div", { style: { background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }, children: [_jsxs("div", { style: { padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #334155' }, children: [_jsx("div", { style: { width: 42, height: 42, borderRadius: 10, background: '#f59e0b22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, children: _jsx(Smartphone, { size: 20, color: "#f59e0b" }) }), _jsx("div", { style: { fontWeight: 600, fontSize: 15 }, children: "Device Info" })] }), _jsx("div", { style: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }, children: [
                                    { label: 'Device Model', value: activeChild?.deviceModel ?? 'Unknown' },
                                    { label: 'Last Seen', value: activeChild?.lastSeen ? new Date(activeChild.lastSeen).toLocaleString() : 'Never' },
                                    { label: 'Paired', value: activeChild?.isPaired ? 'Yes' : 'No' },
                                ].map(({ label, value }) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { style: { color: '#64748b', fontSize: 13 }, children: label }), _jsx("span", { style: { fontSize: 13, fontWeight: 500 }, children: value })] }, label))) })] }), _jsxs("div", { style: { background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }, children: [_jsxs("div", { style: { padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #334155' }, children: [_jsx("div", { style: { width: 42, height: 42, borderRadius: 10, background: '#8b5cf622', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, children: _jsx(Bell, { size: 20, color: "#8b5cf6" }) }), _jsx("div", { style: { fontWeight: 600, fontSize: 15 }, children: "Alert Notifications" })] }), _jsx("div", { style: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }, children: [
                                    { label: 'Geofence breaches', enabled: true },
                                    { label: 'Blocked app/site attempts', enabled: true },
                                    { label: 'Screen time limit reached', enabled: true },
                                    { label: 'Low battery', enabled: true },
                                ].map(({ label, enabled }) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { style: { fontSize: 13 }, children: label }), _jsx("div", { style: {
                                                width: 36, height: 20, borderRadius: 10,
                                                background: enabled ? '#22c55e' : '#334155', position: 'relative'
                                            }, children: _jsx("div", { style: { position: 'absolute', top: 2, left: enabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white' } }) })] }, label))) })] })] })] }));
}
