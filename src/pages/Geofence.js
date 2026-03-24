import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { MapPin, Plus, Trash2, Home, School } from 'lucide-react';
const defaultZones = [
    {
        id: '1', name: 'Home', type: 'home', radius: 200,
        address: '12 Shastri Nagar, Delhi', alertOnExit: true, alertOnEnter: false, active: true
    },
    {
        id: '2', name: 'School', type: 'school', radius: 300,
        address: 'Delhi Public School, R.K. Puram', alertOnExit: true, alertOnEnter: true, active: true
    },
    {
        id: '3', name: 'Grandma\'s House', type: 'custom', radius: 150,
        address: '45 Lajpat Nagar, Delhi', alertOnExit: false, alertOnEnter: true, active: false
    },
];
const typeIcons = { home: Home, school: School, custom: MapPin };
const typeColors = { home: '#3b82f6', school: '#22c55e', custom: '#8b5cf6' };
export default function Geofence() {
    const [zones, setZones] = useState(defaultZones);
    const [selected, setSelected] = useState('1');
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newType, setNewType] = useState('custom');
    const [newRadius, setNewRadius] = useState(200);
    const toggleZone = (id) => setZones(prev => prev.map(z => z.id === id ? { ...z, active: !z.active } : z));
    const deleteZone = (id) => { setZones(prev => prev.filter(z => z.id !== id)); if (selected === id)
        setSelected(null); };
    const toggleAlert = (id, field) => setZones(prev => prev.map(z => z.id === id ? { ...z, [field]: !z[field] } : z));
    const addZone = () => {
        if (!newName || !newAddress)
            return;
        const zone = {
            id: Date.now().toString(), name: newName, type: newType,
            radius: newRadius, address: newAddress,
            alertOnExit: true, alertOnEnter: false, active: true
        };
        setZones(prev => [...prev, zone]);
        setShowAdd(false);
        setNewName('');
        setNewAddress('');
    };
    const sel = zones.find(z => z.id === selected);
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Geofence" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: "Set safe zones and get alerts when Aryan enters or leaves" })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }, children: [_jsxs("div", { style: { background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden' }, children: [_jsxs("div", { style: {
                                    height: 400, background: 'linear-gradient(135deg, #0f172a 0%, #1a2540 50%, #0f172a 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                                }, children: [_jsx("svg", { width: "100%", height: "100%", style: { position: 'absolute', opacity: 0.1 }, children: Array.from({ length: 10 }).map((_, i) => (_jsxs("g", { children: [_jsx("line", { x1: `${i * 10}%`, y1: "0", x2: `${i * 10}%`, y2: "100%", stroke: "#3b82f6", strokeWidth: "1" }), _jsx("line", { x1: "0", y1: `${i * 10}%`, x2: "100%", y2: `${i * 10}%`, stroke: "#3b82f6", strokeWidth: "1" })] }, i))) }), zones.filter(z => z.active).map((zone, i) => {
                                        const positions = [
                                            { cx: '40%', cy: '45%' },
                                            { cx: '60%', cy: '35%' },
                                            { cx: '55%', cy: '60%' },
                                        ];
                                        const pos = positions[i] || { cx: '50%', cy: '50%' };
                                        const color = typeColors[zone.type];
                                        const r = zone.radius / 4;
                                        return (_jsxs("g", { onClick: () => setSelected(zone.id), style: { cursor: 'pointer' }, children: [_jsx("circle", { cx: pos.cx, cy: pos.cy, r: r, fill: color + '22', stroke: color, strokeWidth: selected === zone.id ? 2 : 1, strokeDasharray: "4 2" }), _jsx("circle", { cx: pos.cx, cy: pos.cy, r: 8, fill: color }), _jsx("text", { x: pos.cx, y: `calc(${pos.cy} + 20px)`, textAnchor: "middle", fill: "white", fontSize: "11", fontWeight: "600", children: zone.name })] }, zone.id));
                                    }), _jsx("div", { style: {
                                            position: 'absolute', left: '42%', top: '47%',
                                            width: 14, height: 14, borderRadius: '50%',
                                            background: '#22c55e', border: '2px solid white',
                                            boxShadow: '0 0 0 4px #22c55e33'
                                        } }), _jsx("div", { style: {
                                            position: 'absolute', bottom: 12, left: 12,
                                            background: '#00000088', borderRadius: 8, padding: '6px 12px',
                                            fontSize: 12, color: '#94a3b8'
                                        }, children: "Google Maps \u00B7 Delhi, India" }), _jsxs("div", { style: {
                                            position: 'absolute', bottom: 12, right: 12,
                                            background: '#22c55e22', border: '1px solid #22c55e44',
                                            borderRadius: 8, padding: '6px 12px',
                                            fontSize: 12, color: '#22c55e',
                                            display: 'flex', alignItems: 'center', gap: 6
                                        }, children: [_jsx("div", { style: { width: 6, height: 6, borderRadius: '50%', background: '#22c55e' } }), "Aryan is at Home zone"] }), _jsxs("div", { style: { color: '#334155', textAlign: 'center', pointerEvents: 'none' }, children: [_jsx(MapPin, { size: 48, style: { opacity: 0.2 } }), _jsx("div", { style: { fontSize: 12, color: '#334155', marginTop: 8, opacity: 0.5 }, children: "Interactive map loads with Google Maps API key" })] })] }), _jsx("div", { style: {
                                    padding: '14px 20px', display: 'flex', gap: 24,
                                    borderTop: '1px solid #334155'
                                }, children: [
                                    { label: 'Active zones', value: zones.filter(z => z.active).length },
                                    { label: 'Total zones', value: zones.length },
                                    { label: 'Alerts today', value: 1 },
                                    { label: 'Current zone', value: 'Home' },
                                ].map(({ label, value }) => (_jsxs("div", { children: [_jsx("div", { style: { fontSize: 18, fontWeight: 700 }, children: value }), _jsx("div", { style: { fontSize: 11, color: '#64748b' }, children: label })] }, label))) })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsxs("button", { onClick: () => setShowAdd(v => !v), style: {
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    padding: '12px', borderRadius: 10, border: '1px dashed #334155',
                                    background: 'transparent', color: '#64748b', cursor: 'pointer',
                                    fontWeight: 600, fontSize: 13, width: '100%'
                                }, children: [_jsx(Plus, { size: 16 }), " Add New Zone"] }), showAdd && (_jsxs("div", { style: { background: '#1e293b', borderRadius: 12, padding: 16, border: '1px solid #334155' }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 13, marginBottom: 12 }, children: "New Safe Zone" }), _jsx("input", { value: newName, onChange: e => setNewName(e.target.value), placeholder: "Zone name", style: { width: '100%', marginBottom: 8, padding: '8px 10px', boxSizing: 'border-box', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none' } }), _jsx("input", { value: newAddress, onChange: e => setNewAddress(e.target.value), placeholder: "Address", style: { width: '100%', marginBottom: 8, padding: '8px 10px', boxSizing: 'border-box', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none' } }), _jsx("div", { style: { display: 'flex', gap: 8, marginBottom: 10 }, children: ['home', 'school', 'custom'].map(t => (_jsx("button", { onClick: () => setNewType(t), style: {
                                                flex: 1, padding: '7px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500, textTransform: 'capitalize',
                                                background: newType === t ? typeColors[t] : '#0f172a',
                                                color: newType === t ? 'white' : '#64748b',
                                                border: `1px solid ${newType === t ? typeColors[t] : '#334155'}`
                                            }, children: t }, t))) }), _jsxs("div", { style: { fontSize: 12, color: '#64748b', marginBottom: 6 }, children: ["Radius: ", newRadius, "m"] }), _jsx("input", { type: "range", min: 50, max: 1000, value: newRadius, onChange: e => setNewRadius(Number(e.target.value)), style: { width: '100%', marginBottom: 12 } }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { onClick: () => setShowAdd(false), style: { flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }, children: "Cancel" }), _jsx("button", { onClick: addZone, style: { flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }, children: "Add Zone" })] })] })), zones.map(zone => {
                                const Icon = typeIcons[zone.type];
                                const color = typeColors[zone.type];
                                return (_jsxs("div", { onClick: () => setSelected(zone.id), style: {
                                        background: '#1e293b', borderRadius: 12, padding: 16,
                                        border: `1px solid ${selected === zone.id ? color + '66' : '#334155'}`,
                                        cursor: 'pointer'
                                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }, children: [_jsx("div", { style: { width: 36, height: 36, borderRadius: 9, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Icon, { size: 18, color: color }) }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 14 }, children: zone.name }), _jsx("div", { style: { fontSize: 11, color: '#64748b' }, children: zone.address })] }), _jsx("div", { onClick: e => { e.stopPropagation(); toggleZone(zone.id); }, style: {
                                                        width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                                                        background: zone.active ? '#22c55e' : '#334155', position: 'relative', transition: 'background 0.2s'
                                                    }, children: _jsx("div", { style: { position: 'absolute', top: 2, left: zone.active ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' } }) })] }), _jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 10 }, children: [_jsxs("div", { style: { background: '#0f172a', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#94a3b8' }, children: ["Radius: ", zone.radius, "m"] }), zone.alertOnExit && _jsx("div", { style: { background: '#3f151522', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#ef4444' }, children: "Alert on exit" }), zone.alertOnEnter && _jsx("div", { style: { background: '#14532d22', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#22c55e' }, children: "Alert on enter" })] }), selected === zone.id && (_jsxs("div", { style: { display: 'flex', gap: 8, borderTop: '1px solid #334155', paddingTop: 10 }, children: [_jsxs("button", { onClick: e => { e.stopPropagation(); toggleAlert(zone.id, 'alertOnExit'); }, style: { flex: 1, padding: '6px', borderRadius: 7, border: `1px solid ${zone.alertOnExit ? '#ef444444' : '#334155'}`, background: zone.alertOnExit ? '#3f151533' : 'transparent', color: zone.alertOnExit ? '#ef4444' : '#64748b', cursor: 'pointer', fontSize: 11 }, children: ["Exit alert ", zone.alertOnExit ? 'ON' : 'OFF'] }), _jsxs("button", { onClick: e => { e.stopPropagation(); toggleAlert(zone.id, 'alertOnEnter'); }, style: { flex: 1, padding: '6px', borderRadius: 7, border: `1px solid ${zone.alertOnEnter ? '#22c55e44' : '#334155'}`, background: zone.alertOnEnter ? '#14532d33' : 'transparent', color: zone.alertOnEnter ? '#22c55e' : '#64748b', cursor: 'pointer', fontSize: 11 }, children: ["Enter alert ", zone.alertOnEnter ? 'ON' : 'OFF'] }), _jsx("button", { onClick: e => { e.stopPropagation(); deleteZone(zone.id); }, style: { width: 32, height: 32, borderRadius: 7, border: 'none', background: '#3f151533', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }, children: _jsx(Trash2, { size: 14, color: "#ef4444" }) })] }))] }, zone.id));
                            })] })] })] }));
}
