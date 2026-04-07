import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, Home, School } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { geofenceApi } from '../services/api';
const typeIcons = { home: Home, school: School, custom: MapPin };
const typeColors = { home: '#3b82f6', school: '#22c55e', custom: '#8b5cf6' };
const emptyForm = { name: '', latitude: '', longitude: '', type: 'custom', radiusMeters: 200, alertOnExit: true, alertOnEnter: false };
export default function Geofence() {
    const { activeChild } = useAuth();
    const childId = activeChild?._id;
    const [zones, setZones] = useState([]);
    const [selected, setSelected] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        if (!childId)
            return;
        setLoading(true);
        geofenceApi.getAll(childId).then(r => {
            setZones(r.data);
            if (r.data.length > 0)
                setSelected(r.data[0]._id);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [childId]);
    const toggleActive = async (zone) => {
        try {
            const updated = await geofenceApi.update(zone._id, { active: !zone.active });
            setZones(prev => prev.map(z => z._id === zone._id ? updated.data : z));
        }
        catch { }
    };
    const toggleAlert = async (zone, field) => {
        try {
            const updated = await geofenceApi.update(zone._id, { [field]: !zone[field] });
            setZones(prev => prev.map(z => z._id === zone._id ? updated.data : z));
        }
        catch { }
    };
    const deleteZone = async (id) => {
        try {
            await geofenceApi.delete(id);
            setZones(prev => prev.filter(z => z._id !== id));
            if (selected === id)
                setSelected(null);
        }
        catch { }
    };
    const addZone = async () => {
        if (!childId || !form.name || !form.latitude || !form.longitude)
            return;
        setSaving(true);
        try {
            const res = await geofenceApi.create({
                childId,
                name: form.name,
                type: form.type,
                latitude: parseFloat(form.latitude),
                longitude: parseFloat(form.longitude),
                radiusMeters: form.radiusMeters,
                alertOnExit: form.alertOnExit,
                alertOnEnter: form.alertOnEnter,
            });
            setZones(prev => [...prev, res.data]);
            setShowAdd(false);
            setForm(emptyForm);
        }
        catch { }
        setSaving(false);
    };
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Geofence" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: activeChild ? `Set safe zones and get alerts for ${activeChild.name}` : 'No child paired' })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }, children: [_jsxs("div", { style: { background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden' }, children: [_jsxs("div", { style: {
                                    height: 400, background: 'linear-gradient(135deg, #0f172a 0%, #1a2540 50%, #0f172a 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                                }, children: [_jsx("svg", { width: "100%", height: "100%", style: { position: 'absolute', opacity: 0.08 }, children: Array.from({ length: 10 }).map((_, i) => (_jsxs("g", { children: [_jsx("line", { x1: `${i * 10}%`, y1: "0", x2: `${i * 10}%`, y2: "100%", stroke: "#3b82f6", strokeWidth: "1" }), _jsx("line", { x1: "0", y1: `${i * 10}%`, x2: "100%", y2: `${i * 10}%`, stroke: "#3b82f6", strokeWidth: "1" })] }, i))) }), zones.filter(z => z.active).map((zone, i) => {
                                        const positions = [{ cx: '38%', cy: '42%' }, { cx: '60%', cy: '35%' }, { cx: '55%', cy: '62%' }, { cx: '30%', cy: '60%' }];
                                        const pos = positions[i % positions.length];
                                        const color = typeColors[zone.type];
                                        return (_jsxs("g", { onClick: () => setSelected(zone._id), style: { cursor: 'pointer' }, children: [_jsx("circle", { cx: pos.cx, cy: pos.cy, r: zone.radiusMeters / 5, fill: color + '22', stroke: color, strokeWidth: selected === zone._id ? 2 : 1, strokeDasharray: "4 2" }), _jsx("circle", { cx: pos.cx, cy: pos.cy, r: 8, fill: color }), _jsx("text", { x: pos.cx, y: `calc(${pos.cy} + 20px)`, textAnchor: "middle", fill: "white", fontSize: "11", fontWeight: "600", children: zone.name })] }, zone._id));
                                    }), _jsxs("div", { style: { color: '#334155', textAlign: 'center', pointerEvents: 'none', position: 'relative', zIndex: 1 }, children: [_jsx(MapPin, { size: 48, style: { opacity: 0.2 } }), _jsx("div", { style: { fontSize: 12, color: '#475569', marginTop: 8 }, children: "Zone map \u2014 add lat/lng coordinates when creating zones" })] })] }), _jsx("div", { style: { padding: '14px 20px', display: 'flex', gap: 24, borderTop: '1px solid #334155' }, children: [
                                    { label: 'Active zones', value: zones.filter(z => z.active).length },
                                    { label: 'Total zones', value: zones.length },
                                ].map(({ label, value }) => (_jsxs("div", { children: [_jsx("div", { style: { fontSize: 18, fontWeight: 700 }, children: value }), _jsx("div", { style: { fontSize: 11, color: '#64748b' }, children: label })] }, label))) })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsxs("button", { onClick: () => setShowAdd(v => !v), style: {
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    padding: '12px', borderRadius: 10, border: '1px dashed #334155',
                                    background: 'transparent', color: '#64748b', cursor: 'pointer',
                                    fontWeight: 600, fontSize: 13, width: '100%'
                                }, children: [_jsx(Plus, { size: 16 }), " Add New Zone"] }), showAdd && (_jsxs("div", { style: { background: '#1e293b', borderRadius: 12, padding: 16, border: '1px solid #334155' }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 13, marginBottom: 12 }, children: "New Safe Zone" }), [
                                        { placeholder: 'Zone name', key: 'name', type: 'text' },
                                        { placeholder: 'Latitude (e.g. 28.6139)', key: 'latitude', type: 'number' },
                                        { placeholder: 'Longitude (e.g. 77.2090)', key: 'longitude', type: 'number' },
                                    ].map(({ placeholder, key, type }) => (_jsx("input", { type: type, value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })), placeholder: placeholder, style: {
                                            width: '100%', marginBottom: 8, padding: '8px 10px', boxSizing: 'border-box',
                                            background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
                                            color: '#f1f5f9', fontSize: 13, outline: 'none'
                                        } }, key))), _jsx("div", { style: { display: 'flex', gap: 8, marginBottom: 10 }, children: ['home', 'school', 'custom'].map(t => (_jsx("button", { onClick: () => setForm(f => ({ ...f, type: t })), style: {
                                                flex: 1, padding: '7px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500, textTransform: 'capitalize',
                                                background: form.type === t ? typeColors[t] : '#0f172a',
                                                color: form.type === t ? 'white' : '#64748b',
                                                border: `1px solid ${form.type === t ? typeColors[t] : '#334155'}`
                                            }, children: t }, t))) }), _jsxs("div", { style: { fontSize: 12, color: '#64748b', marginBottom: 6 }, children: ["Radius: ", form.radiusMeters, "m"] }), _jsx("input", { type: "range", min: 50, max: 1000, value: form.radiusMeters, onChange: e => setForm(f => ({ ...f, radiusMeters: Number(e.target.value) })), style: { width: '100%', marginBottom: 12 } }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { onClick: () => { setShowAdd(false); setForm(emptyForm); }, style: {
                                                    flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #334155',
                                                    background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 13
                                                }, children: "Cancel" }), _jsx("button", { onClick: addZone, disabled: saving || !form.name || !form.latitude || !form.longitude, style: {
                                                    flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                                                    background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                                                    opacity: saving ? 0.7 : 1
                                                }, children: saving ? 'Saving...' : 'Add Zone' })] })] })), loading ? (_jsx("div", { style: { textAlign: 'center', padding: 20, color: '#475569' }, children: "Loading zones..." })) : zones.length === 0 ? (_jsx("div", { style: { textAlign: 'center', padding: 20, color: '#475569', fontSize: 13 }, children: "No zones yet. Add one above." })) : zones.map(zone => {
                                const Icon = typeIcons[zone.type];
                                const color = typeColors[zone.type];
                                return (_jsxs("div", { onClick: () => setSelected(zone._id), style: {
                                        background: '#1e293b', borderRadius: 12, padding: 16,
                                        border: `1px solid ${selected === zone._id ? color + '66' : '#334155'}`,
                                        cursor: 'pointer'
                                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }, children: [_jsx("div", { style: { width: 36, height: 36, borderRadius: 9, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Icon, { size: 18, color: color }) }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 14 }, children: zone.name }), _jsxs("div", { style: { fontSize: 11, color: '#64748b' }, children: [zone.latitude.toFixed(4), ", ", zone.longitude.toFixed(4)] })] }), _jsx("div", { onClick: e => { e.stopPropagation(); toggleActive(zone); }, style: {
                                                        width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                                                        background: zone.active ? '#22c55e' : '#334155', position: 'relative', transition: 'background 0.2s'
                                                    }, children: _jsx("div", { style: { position: 'absolute', top: 2, left: zone.active ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' } }) })] }), _jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }, children: [_jsxs("div", { style: { background: '#0f172a', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#94a3b8' }, children: ["Radius: ", zone.radiusMeters, "m"] }), zone.alertOnExit && _jsx("div", { style: { background: '#3f151522', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#ef4444' }, children: "Alert on exit" }), zone.alertOnEnter && _jsx("div", { style: { background: '#14532d22', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#22c55e' }, children: "Alert on enter" })] }), selected === zone._id && (_jsxs("div", { style: { display: 'flex', gap: 8, borderTop: '1px solid #334155', paddingTop: 10 }, children: [_jsxs("button", { onClick: e => { e.stopPropagation(); toggleAlert(zone, 'alertOnExit'); }, style: {
                                                        flex: 1, padding: '6px', borderRadius: 7,
                                                        border: `1px solid ${zone.alertOnExit ? '#ef444444' : '#334155'}`,
                                                        background: zone.alertOnExit ? '#3f151533' : 'transparent',
                                                        color: zone.alertOnExit ? '#ef4444' : '#64748b', cursor: 'pointer', fontSize: 11
                                                    }, children: ["Exit alert ", zone.alertOnExit ? 'ON' : 'OFF'] }), _jsxs("button", { onClick: e => { e.stopPropagation(); toggleAlert(zone, 'alertOnEnter'); }, style: {
                                                        flex: 1, padding: '6px', borderRadius: 7,
                                                        border: `1px solid ${zone.alertOnEnter ? '#22c55e44' : '#334155'}`,
                                                        background: zone.alertOnEnter ? '#14532d33' : 'transparent',
                                                        color: zone.alertOnEnter ? '#22c55e' : '#64748b', cursor: 'pointer', fontSize: 11
                                                    }, children: ["Enter alert ", zone.alertOnEnter ? 'ON' : 'OFF'] }), _jsx("button", { onClick: e => { e.stopPropagation(); deleteZone(zone._id); }, style: {
                                                        width: 32, height: 32, borderRadius: 7, border: 'none',
                                                        background: '#3f151533', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                                    }, children: _jsx(Trash2, { size: 14, color: "#ef4444" }) })] }))] }, zone._id));
                            })] })] })] }));
}
