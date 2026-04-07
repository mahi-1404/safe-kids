import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Search, Clock, Ban, CheckCircle } from 'lucide-react';
const initialApps = [
    { name: 'YouTube', category: 'Entertainment', usage: '1h 20m today', status: 'limited', icon: '▶️', timeLimit: '1h 30m' },
    { name: 'WhatsApp', category: 'Social', usage: '45m today', status: 'allowed', icon: '💬' },
    { name: 'PUBG Mobile', category: 'Gaming', usage: '0m today', status: 'blocked', icon: '🎮' },
    { name: 'Instagram', category: 'Social', usage: '0m today', status: 'blocked', icon: '📸' },
    { name: 'Chrome', category: 'Browser', usage: '30m today', status: 'allowed', icon: '🌐' },
    { name: 'Netflix', category: 'Entertainment', usage: '0m today', status: 'blocked', icon: '🎬' },
    { name: 'Spotify', category: 'Music', usage: '22m today', status: 'allowed', icon: '🎵' },
    { name: 'TikTok', category: 'Social', usage: '0m today', status: 'blocked', icon: '🎵' },
    { name: 'Snapchat', category: 'Social', usage: '0m today', status: 'blocked', icon: '👻' },
    { name: 'Khan Academy', category: 'Education', usage: '40m today', status: 'allowed', icon: '📚' },
    { name: 'Calculator', category: 'Utility', usage: '5m today', status: 'allowed', icon: '🧮' },
    { name: 'Camera', category: 'Utility', usage: '10m today', status: 'allowed', icon: '📷' },
];
const categories = ['All', 'Social', 'Entertainment', 'Gaming', 'Browser', 'Education', 'Music', 'Utility'];
const statusColors = {
    allowed: { bg: '#14532d', color: '#22c55e', label: 'Allowed' },
    blocked: { bg: '#3f1515', color: '#ef4444', label: 'Blocked' },
    limited: { bg: '#451a03', color: '#f59e0b', label: 'Limited' },
};
export default function AppControl() {
    const [apps, setApps] = useState(initialApps);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [filter, setFilter] = useState('all');
    const toggle = (name, newStatus) => {
        setApps(prev => prev.map(a => a.name === name ? { ...a, status: newStatus } : a));
    };
    const filtered = apps.filter(a => {
        const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = category === 'All' || a.category === category;
        const matchFilter = filter === 'all' || a.status === filter;
        return matchSearch && matchCat && matchFilter;
    });
    const counts = {
        allowed: apps.filter(a => a.status === 'allowed').length,
        blocked: apps.filter(a => a.status === 'blocked').length,
        limited: apps.filter(a => a.status === 'limited').length,
    };
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "App Control" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: "Block, allow, or set time limits on Aryan's apps" })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }, children: [
                    ['allowed', CheckCircle, 'Allowed'],
                    ['blocked', Ban, 'Blocked'],
                    ['limited', Clock, 'Time Limited'],
                ].map(([key, Icon, label]) => (_jsxs("div", { onClick: () => setFilter(filter === key ? 'all' : key), style: {
                        background: '#1e293b', borderRadius: 12, padding: '16px 20px',
                        border: `1px solid ${filter === key ? statusColors[key].color + '66' : '#334155'}`,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14
                    }, children: [_jsx("div", { style: {
                                width: 40, height: 40, borderRadius: 10,
                                background: statusColors[key].bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }, children: _jsx(Icon, { size: 20, color: statusColors[key].color }) }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 22, fontWeight: 700 }, children: counts[key] }), _jsx("div", { style: { fontSize: 12, color: '#64748b' }, children: label })] })] }, key))) }), _jsxs("div", { style: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }, children: [_jsxs("div", { style: { position: 'relative', flex: 1, minWidth: 200 }, children: [_jsx(Search, { size: 15, color: "#64748b", style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' } }), _jsx("input", { value: search, onChange: e => setSearch(e.target.value), placeholder: "Search apps...", style: {
                                    width: '100%', padding: '10px 12px 10px 36px',
                                    background: '#1e293b', border: '1px solid #334155',
                                    borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                                } })] }), _jsx("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: categories.map(cat => (_jsx("button", { onClick: () => setCategory(cat), style: {
                                padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                                background: category === cat ? '#3b82f6' : '#1e293b',
                                color: category === cat ? 'white' : '#94a3b8',
                                border: category === cat ? 'none' : '1px solid #334155',
                            }, children: cat }, cat))) })] }), _jsxs("div", { style: { background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden' }, children: [filtered.map((app, i) => (_jsxs("div", { style: {
                            display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
                            borderBottom: i < filtered.length - 1 ? '1px solid #1e293b' : 'none',
                            background: i % 2 === 0 ? '#1e293b' : '#1a2540'
                        }, children: [_jsx("div", { style: {
                                    width: 42, height: 42, borderRadius: 12, background: '#0f172a',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0
                                }, children: app.icon }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 14 }, children: app.name }), _jsxs("div", { style: { fontSize: 12, color: '#64748b' }, children: [app.category, " \u00B7 ", app.usage] })] }), app.status === 'limited' && app.timeLimit && (_jsxs("div", { style: {
                                    background: '#451a03', borderRadius: 6, padding: '3px 10px',
                                    fontSize: 12, color: '#f59e0b', fontWeight: 500, flexShrink: 0
                                }, children: ["Limit: ", app.timeLimit] })), _jsx("div", { style: {
                                    background: statusColors[app.status].bg, borderRadius: 6,
                                    padding: '3px 10px', fontSize: 12,
                                    color: statusColors[app.status].color, fontWeight: 500, flexShrink: 0
                                }, children: statusColors[app.status].label }), _jsxs("div", { style: { display: 'flex', gap: 6, flexShrink: 0 }, children: [_jsx("button", { onClick: () => toggle(app.name, 'allowed'), style: {
                                            padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                                            background: app.status === 'allowed' ? '#14532d' : '#0f172a',
                                            color: app.status === 'allowed' ? '#22c55e' : '#64748b',
                                            border: `1px solid ${app.status === 'allowed' ? '#22c55e44' : '#334155'}`
                                        }, children: "Allow" }), _jsx("button", { onClick: () => toggle(app.name, 'limited'), style: {
                                            padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                                            background: app.status === 'limited' ? '#451a03' : '#0f172a',
                                            color: app.status === 'limited' ? '#f59e0b' : '#64748b',
                                            border: `1px solid ${app.status === 'limited' ? '#f59e0b44' : '#334155'}`
                                        }, children: "Limit" }), _jsx("button", { onClick: () => toggle(app.name, 'blocked'), style: {
                                            padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                                            background: app.status === 'blocked' ? '#3f1515' : '#0f172a',
                                            color: app.status === 'blocked' ? '#ef4444' : '#64748b',
                                            border: `1px solid ${app.status === 'blocked' ? '#ef444444' : '#334155'}`
                                        }, children: "Block" })] })] }, app.name))), filtered.length === 0 && (_jsx("div", { style: { padding: 40, textAlign: 'center', color: '#475569' }, children: "No apps found matching your filters" }))] })] }));
}
