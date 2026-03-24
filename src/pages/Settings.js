import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { User, Bell, Shield, CreditCard } from 'lucide-react';
export default function Settings() {
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Settings" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: "Manage your account and child profiles" })] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }, children: [
                    { icon: User, label: 'Parent Profile', desc: 'Update your name, email and password', color: '#3b82f6' },
                    { icon: Bell, label: 'Alert Preferences', desc: 'Choose which alerts to receive and how', color: '#f59e0b' },
                    { icon: Shield, label: 'Child Profile — Aryan', desc: 'Age preset, screen time, bedtime, geofences', color: '#22c55e' },
                    { icon: CreditCard, label: 'Subscription', desc: 'Current plan: Free — Upgrade to Premium', color: '#8b5cf6' },
                ].map(({ icon: Icon, label, desc, color }) => (_jsxs("div", { style: {
                        background: '#1e293b', borderRadius: 12, padding: '16px 20px',
                        border: '1px solid #334155', display: 'flex', alignItems: 'center',
                        gap: 16, cursor: 'pointer'
                    }, children: [_jsx("div", { style: {
                                width: 42, height: 42, borderRadius: 10,
                                background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }, children: _jsx(Icon, { size: 20, color: color }) }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600, fontSize: 14, marginBottom: 3 }, children: label }), _jsx("div", { style: { color: '#64748b', fontSize: 13 }, children: desc })] }), _jsx("div", { style: { marginLeft: 'auto', color: '#475569', fontSize: 18 }, children: "\u203A" })] }, label))) })] }));
}
