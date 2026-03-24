import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
export default function LiveMap() {
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }, children: [_jsxs("div", { children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Live Map" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: "Aryan's real-time location" })] }), _jsxs("button", { style: {
                            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                            background: '#3b82f6', border: 'none', borderRadius: 8,
                            color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                        }, children: [_jsx(RefreshCw, { size: 16 }), " Refresh"] })] }), _jsxs("div", { style: {
                    background: '#1e293b', borderRadius: 14, border: '1px solid #334155',
                    height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden'
                }, children: [_jsx("div", { style: {
                            position: 'absolute', inset: 0, opacity: 0.1,
                            backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        } }), _jsx(Navigation, { size: 48, color: "#3b82f6" }), _jsx("div", { style: { fontWeight: 600, fontSize: 16 }, children: "Google Maps Integration" }), _jsx("div", { style: { color: '#64748b', fontSize: 13 }, children: "Add your Google Maps API key to enable live tracking" }), _jsxs("div", { style: {
                            background: '#22c55e22', border: '1px solid #22c55e',
                            borderRadius: 8, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8
                        }, children: [_jsx(MapPin, { size: 14, color: "#22c55e" }), _jsx("span", { style: { color: '#22c55e', fontSize: 13 }, children: "Last known: Home \u2014 5 mins ago" })] })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }, children: [
                    { label: 'Current Location', value: 'Home (Safe Zone)', color: '#22c55e' },
                    { label: 'Last Updated', value: '5 minutes ago', color: '#94a3b8' },
                    { label: 'Today\'s Distance', value: '2.4 km', color: '#3b82f6' },
                ].map(({ label, value, color }) => (_jsxs("div", { style: {
                        background: '#1e293b', borderRadius: 12, padding: 16,
                        border: '1px solid #334155'
                    }, children: [_jsx("div", { style: { color: '#64748b', fontSize: 12, marginBottom: 6 }, children: label }), _jsx("div", { style: { color, fontWeight: 600, fontSize: 15 }, children: value })] }, label))) })] }));
}
