import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { MapPin, Navigation, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { locationApi } from '../services/api';
import socketService from '../services/socket';
const timeAgo = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)
        return 'just now';
    if (m < 60)
        return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24)
        return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};
export default function LiveMap() {
    const { activeChild } = useAuth();
    const childId = activeChild?._id;
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [liveConnected, setLiveConnected] = useState(false);
    const fetchLocation = () => {
        if (!childId)
            return;
        setLoading(true);
        locationApi.getLatest(childId).then(r => {
            setLocation(r.data);
        }).catch(() => setLocation(null)).finally(() => setLoading(false));
    };
    useEffect(() => { fetchLocation(); }, [childId]);
    useEffect(() => {
        socketService.on('location:update', (data) => {
            if (data.childId === childId) {
                setLocation({ latitude: data.latitude, longitude: data.longitude, accuracy: data.accuracy, createdAt: data.timestamp });
                setLiveConnected(true);
            }
        });
        return () => { socketService.off('location:update'); };
    }, [childId]);
    const mapsLink = location
        ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
        : null;
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }, children: [_jsxs("div", { children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Live Map" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: activeChild ? `${activeChild.name}'s real-time location` : 'No child paired' })] }), _jsxs("div", { style: { display: 'flex', gap: 10, alignItems: 'center' }, children: [liveConnected && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#22c55e' }, children: [_jsx(Wifi, { size: 14 }), "Live"] })), _jsxs("button", { onClick: fetchLocation, disabled: loading, style: {
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                                    background: '#3b82f6', border: 'none', borderRadius: 8,
                                    color: 'white', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1
                                }, children: [_jsx(RefreshCw, { size: 16, style: { animation: loading ? 'spin 1s linear infinite' : 'none' } }), "Refresh"] })] })] }), _jsxs("div", { style: {
                    background: '#1e293b', borderRadius: 14, border: '1px solid #334155',
                    overflow: 'hidden', marginBottom: 16
                }, children: [_jsxs("div", { style: {
                            height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden',
                            background: 'linear-gradient(135deg, #0f172a 0%, #1a2540 50%, #0f172a 100%)'
                        }, children: [_jsx("div", { style: {
                                    position: 'absolute', inset: 0, opacity: 0.1,
                                    backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                                    backgroundSize: '40px 40px'
                                } }), location ? (_jsx(_Fragment, { children: _jsxs("div", { style: {
                                        position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                                    }, children: [_jsx("div", { style: {
                                                width: 64, height: 64, borderRadius: '50%',
                                                background: '#22c55e33', border: '2px solid #22c55e',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 0 0 12px #22c55e11'
                                            }, children: _jsx(MapPin, { size: 32, color: "#22c55e" }) }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 18, marginBottom: 4 }, children: "Location Found" }), _jsxs("div", { style: { color: '#94a3b8', fontSize: 13 }, children: [location.latitude.toFixed(6), ", ", location.longitude.toFixed(6)] }), location.accuracy && (_jsxs("div", { style: { fontSize: 12, color: '#64748b', marginTop: 4 }, children: ["Accuracy: \u00B1", Math.round(location.accuracy), "m"] }))] }), mapsLink && (_jsxs("a", { href: mapsLink, target: "_blank", rel: "noopener noreferrer", style: {
                                                padding: '10px 20px', background: '#3b82f6', borderRadius: 8,
                                                color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                                                display: 'flex', alignItems: 'center', gap: 8
                                            }, children: [_jsx(Navigation, { size: 14 }), "Open in Google Maps"] }))] }) })) : (_jsxs(_Fragment, { children: [_jsx(WifiOff, { size: 48, color: "#334155" }), _jsx("div", { style: { fontWeight: 600, fontSize: 16, color: '#475569' }, children: "No Location Data" }), _jsx("div", { style: { color: '#334155', fontSize: 13 }, children: activeChild ? 'Waiting for child device to report location...' : 'No child device paired' })] }))] }), location && (_jsxs("div", { style: { padding: '12px 20px', borderTop: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("div", { style: { width: 8, height: 8, borderRadius: '50%', background: '#22c55e' } }), _jsxs("span", { style: { fontSize: 13, color: '#94a3b8' }, children: ["Last updated: ", timeAgo(location.createdAt)] })] }))] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }, children: [
                    {
                        label: 'Latitude',
                        value: location ? location.latitude.toFixed(6) : 'No data',
                        color: location ? '#22c55e' : '#475569'
                    },
                    {
                        label: 'Longitude',
                        value: location ? location.longitude.toFixed(6) : 'No data',
                        color: location ? '#3b82f6' : '#475569'
                    },
                    {
                        label: 'Last Updated',
                        value: location ? timeAgo(location.createdAt) : 'Never',
                        color: location ? '#94a3b8' : '#475569'
                    },
                ].map(({ label, value, color }) => (_jsxs("div", { style: { background: '#1e293b', borderRadius: 12, padding: 16, border: '1px solid #334155' }, children: [_jsx("div", { style: { color: '#64748b', fontSize: 12, marginBottom: 6 }, children: label }), _jsx("div", { style: { color, fontWeight: 600, fontSize: 15 }, children: value })] }, label))) })] }));
}
