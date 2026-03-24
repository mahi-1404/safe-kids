import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Globe, Plus, Trash2, AlertTriangle, Search } from 'lucide-react';
const defaultBlocked = [
    { url: 'pornhub.com', reason: 'Adult content', addedOn: 'Auto-blocked' },
    { url: 'xvideos.com', reason: 'Adult content', addedOn: 'Auto-blocked' },
    { url: 'bet365.com', reason: 'Gambling', addedOn: 'Auto-blocked' },
    { url: 'roblox-hack.com', reason: 'Malware', addedOn: 'Auto-blocked' },
    { url: 'tiktok.com', reason: 'Parent rule', addedOn: 'Mar 10, 2026' },
];
const categories = [
    { name: 'Adult Content', blocked: true, icon: '🔞', count: 12400 },
    { name: 'Gambling', blocked: true, icon: '🎰', count: 3200 },
    { name: 'Violence', blocked: true, icon: '⚠️', count: 5600 },
    { name: 'Drugs & Alcohol', blocked: true, icon: '🚫', count: 1800 },
    { name: 'Social Media', blocked: false, icon: '📱', count: 450 },
    { name: 'Gaming', blocked: false, icon: '🎮', count: 890 },
    { name: 'Streaming', blocked: false, icon: '📺', count: 320 },
    { name: 'Shopping', blocked: false, icon: '🛒', count: 2100 },
];
export default function WebFilter() {
    const [mode, setMode] = useState('blacklist');
    const [blocked, setBlocked] = useState(defaultBlocked);
    const [cats, setCats] = useState(categories);
    const [newUrl, setNewUrl] = useState('');
    const [search, setSearch] = useState('');
    const [safeSearch, setSafeSearch] = useState(true);
    const [youtubeKids, setYoutubeKids] = useState(false);
    const addSite = () => {
        if (!newUrl.trim())
            return;
        setBlocked(prev => [...prev, { url: newUrl.trim(), reason: 'Parent rule', addedOn: 'Just now' }]);
        setNewUrl('');
    };
    const removeSite = (url) => setBlocked(prev => prev.filter(s => s.url !== url));
    const toggleCategory = (name) => setCats(prev => prev.map(c => c.name === name ? { ...c, blocked: !c.blocked } : c));
    const filtered = blocked.filter(s => s.url.includes(search.toLowerCase()));
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Web Filter" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: "Control which websites Aryan can access" })] }), _jsx("div", { style: {
                    background: '#1e293b', borderRadius: 12, padding: 4,
                    display: 'inline-flex', gap: 2, marginBottom: 24,
                    border: '1px solid #334155'
                }, children: ['blacklist', 'whitelist'].map(m => (_jsx("button", { onClick: () => setMode(m), style: {
                        padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
                        background: mode === m ? '#3b82f6' : 'transparent',
                        color: mode === m ? 'white' : '#94a3b8',
                        fontWeight: 600, fontSize: 13, textTransform: 'capitalize'
                    }, children: m === 'blacklist' ? 'Block List' : 'Allow List Only' }, m))) }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 4 }, children: "Category Filters" }), _jsx("div", { style: { color: '#64748b', fontSize: 12, marginBottom: 16 }, children: "Block entire categories of websites automatically" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }, children: cats.map(cat => (_jsxs("div", { onClick: () => toggleCategory(cat.name), style: {
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                                                background: cat.blocked ? '#3f151522' : '#0f172a',
                                                border: `1px solid ${cat.blocked ? '#ef444433' : '#334155'}`
                                            }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("span", { style: { fontSize: 18 }, children: cat.icon }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 13, fontWeight: 500 }, children: cat.name }), _jsxs("div", { style: { fontSize: 11, color: '#64748b' }, children: [cat.count.toLocaleString(), " sites"] })] })] }), _jsx("div", { style: {
                                                        width: 36, height: 20, borderRadius: 10, transition: 'background 0.2s',
                                                        background: cat.blocked ? '#ef4444' : '#334155', position: 'relative'
                                                    }, children: _jsx("div", { style: {
                                                            position: 'absolute', top: 2, transition: 'left 0.2s',
                                                            left: cat.blocked ? 18 : 2,
                                                            width: 16, height: 16, borderRadius: '50%', background: 'white'
                                                        } }) })] }, cat.name))) })] }), _jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }, children: [_jsxs("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 16 }, children: [mode === 'blacklist' ? 'Blocked Sites' : 'Allowed Sites Only', " (", blocked.length, ")"] }), _jsxs("div", { style: { display: 'flex', gap: 10, marginBottom: 16 }, children: [_jsxs("div", { style: { position: 'relative', flex: 1 }, children: [_jsx(Globe, { size: 14, color: "#64748b", style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' } }), _jsx("input", { value: newUrl, onChange: e => setNewUrl(e.target.value), onKeyDown: e => e.key === 'Enter' && addSite(), placeholder: "Enter website URL (e.g. example.com)", style: {
                                                            width: '100%', padding: '10px 12px 10px 34px', boxSizing: 'border-box',
                                                            background: '#0f172a', border: '1px solid #334155',
                                                            borderRadius: 9, color: '#f1f5f9', fontSize: 13, outline: 'none'
                                                        } })] }), _jsxs("button", { onClick: addSite, style: {
                                                    display: 'flex', alignItems: 'center', gap: 6,
                                                    padding: '10px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                                                    background: '#3b82f6', color: 'white', fontWeight: 600, fontSize: 13
                                                }, children: [_jsx(Plus, { size: 15 }), " Add"] })] }), _jsxs("div", { style: { position: 'relative', marginBottom: 12 }, children: [_jsx(Search, { size: 14, color: "#64748b", style: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' } }), _jsx("input", { value: search, onChange: e => setSearch(e.target.value), placeholder: "Search blocked sites...", style: {
                                                    width: '100%', padding: '8px 10px 8px 32px', boxSizing: 'border-box',
                                                    background: '#0f172a', border: '1px solid #334155',
                                                    borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none'
                                                } })] }), filtered.map(site => (_jsxs("div", { style: {
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '10px 0', borderBottom: '1px solid #0f172a'
                                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("div", { style: {
                                                            width: 32, height: 32, borderRadius: 8, background: '#3f151533',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }, children: _jsx(Globe, { size: 15, color: "#ef4444" }) }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 13, fontWeight: 500 }, children: site.url }), _jsxs("div", { style: { fontSize: 11, color: '#64748b' }, children: [site.reason, " \u00B7 ", site.addedOn] })] })] }), _jsx("button", { onClick: () => removeSite(site.url), style: {
                                                    width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                                                    background: '#3f151533', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }, children: _jsx(Trash2, { size: 14, color: "#ef4444" }) })] }, site.url)))] })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [_jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 14, marginBottom: 16 }, children: "Safety Settings" }), [
                                        { label: 'Safe Search', desc: 'Force safe search on Google/Bing', val: safeSearch, set: setSafeSearch },
                                        { label: 'YouTube Kids Mode', desc: 'Restrict YouTube to kids content', val: youtubeKids, set: setYoutubeKids },
                                    ].map(({ label, desc, val, set }) => (_jsxs("div", { style: {
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '12px 0', borderBottom: '1px solid #334155'
                                        }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 13, fontWeight: 500 }, children: label }), _jsx("div", { style: { fontSize: 11, color: '#64748b', marginTop: 2 }, children: desc })] }), _jsx("div", { onClick: () => set(v => !v), style: {
                                                    width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
                                                    background: val ? '#3b82f6' : '#334155', position: 'relative', transition: 'background 0.2s'
                                                }, children: _jsx("div", { style: {
                                                        position: 'absolute', top: 3, left: val ? 20 : 3,
                                                        width: 16, height: 16, borderRadius: '50%',
                                                        background: 'white', transition: 'left 0.2s'
                                                    } }) })] }, label)))] }), _jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 14, marginBottom: 14 }, children: "Today's Stats" }), [
                                        { label: 'Sites visited', value: '47', color: '#3b82f6' },
                                        { label: 'Blocked attempts', value: '3', color: '#ef4444' },
                                        { label: 'Categories blocked', value: cats.filter(c => c.blocked).length.toString(), color: '#f59e0b' },
                                        { label: 'Custom rules', value: blocked.filter(s => s.addedOn !== 'Auto-blocked').length.toString(), color: '#22c55e' },
                                    ].map(({ label, value, color }) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }, children: [_jsx("span", { style: { color: '#64748b' }, children: label }), _jsx("span", { style: { color, fontWeight: 600 }, children: value })] }, label)))] }), _jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 14, marginBottom: 14 }, children: "Blocked Attempts Today" }), [
                                        { url: 'tiktok.com', time: '2h ago' },
                                        { url: 'roblox-hack.com', time: '4h ago' },
                                        { url: 'bet365.com', time: '6h ago' },
                                    ].map(({ url, time }) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }, children: [_jsx(AlertTriangle, { size: 14, color: "#ef4444" }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: 12, fontWeight: 500 }, children: url }), _jsx("div", { style: { fontSize: 11, color: '#64748b' }, children: time })] })] }, url)))] })] })] })] }));
}
