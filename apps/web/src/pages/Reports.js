import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { reportsApi } from '../services/api';
const fmt = (min) => {
    if (min < 60)
        return `${min}m`;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
};
const catColors = {
    Education: '#22c55e', Entertainment: '#ef4444', Social: '#f59e0b',
    Gaming: '#8b5cf6', Browser: '#3b82f6', Music: '#06b6d4', Other: '#64748b'
};
export default function Reports() {
    const { activeChild } = useAuth();
    const childId = activeChild?._id;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!childId)
            return;
        setLoading(true);
        reportsApi.getWeekly(childId).then(r => setData(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, [childId]);
    if (loading) {
        return (_jsxs("div", { children: [_jsx("div", { style: { marginBottom: 24 }, children: _jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Weekly Report" }) }), _jsx("div", { style: { textAlign: 'center', padding: 60, color: '#475569' }, children: "Loading report..." })] }));
    }
    const screenByDay = data?.screenTime?.byDay?.map((d) => ({
        day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
        hours: +(d.totalMinutes / 60).toFixed(1),
    })) ?? [];
    const topApps = data?.screenTime?.topApps ?? [];
    // Build category split from top apps
    const catMap = {};
    topApps.forEach((app) => {
        const cat = app.category ?? 'Other';
        catMap[cat] = (catMap[cat] ?? 0) + app.totalMinutes;
    });
    const totalAppMin = Object.values(catMap).reduce((s, v) => s + v, 0) || 1;
    const pieData = Object.entries(catMap).map(([name, min]) => ({
        name, value: Math.round((min / totalAppMin) * 100),
        color: catColors[name] ?? '#64748b'
    }));
    const alerts = data?.alerts ?? {};
    const riskScore = data?.child?.riskScore ?? 0;
    const avgMin = data?.screenTime?.avgDailyMinutes ?? 0;
    const wellbeing = Math.max(0, 100 - riskScore);
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Weekly Report" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: activeChild ? `${activeChild.name}'s digital wellbeing — this week` : 'No child paired' }), data?.period && (_jsxs("p", { style: { color: '#64748b', fontSize: 12, marginTop: 4 }, children: [data.period.start, " to ", data.period.end] }))] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }, children: [_jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 20 }, children: "Daily Screen Time (hrs)" }), screenByDay.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(BarChart, { data: screenByDay, children: [_jsx(XAxis, { dataKey: "day", stroke: "#475569", tick: { fill: '#94a3b8', fontSize: 12 } }), _jsx(YAxis, { stroke: "#475569", tick: { fill: '#94a3b8', fontSize: 12 } }), _jsx(Tooltip, { contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8 } }), _jsx(Bar, { dataKey: "hours", fill: "#3b82f6", radius: [4, 4, 0, 0] })] }) })) : (_jsx("div", { style: { height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }, children: "No screen time data this week" }))] }), _jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 20 }, children: "App Category Split" }), pieData.length > 0 ? (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 20 }, children: [_jsx(PieChart, { width: 160, height: 160, children: _jsx(Pie, { data: pieData, cx: 75, cy: 75, innerRadius: 45, outerRadius: 70, dataKey: "value", children: pieData.map((entry, i) => _jsx(Cell, { fill: entry.color }, i)) }) }), _jsx("div", { style: { flex: 1 }, children: pieData.map(({ name, value, color }) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }, children: [_jsx("div", { style: { width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 } }), _jsx("span", { style: { fontSize: 13, flex: 1 }, children: name }), _jsxs("span", { style: { fontSize: 13, fontWeight: 600, color }, children: [value, "%"] })] }, name))) })] })) : (_jsx("div", { style: { height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }, children: "No app usage data this week" }))] })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }, children: [
                    { label: 'Avg Screen Time', value: `${fmt(avgMin)}/day`, color: '#3b82f6' },
                    { label: 'Alerts This Week', value: `${alerts.total ?? 0} alerts`, color: '#ef4444' },
                    { label: 'Risk Score', value: `${riskScore} / 100`, color: '#f59e0b' },
                    { label: 'Wellbeing Score', value: `${wellbeing} / 100`, color: '#22c55e' },
                ].map(({ label, value, color }) => (_jsxs("div", { style: { background: '#1e293b', borderRadius: 12, padding: 16, border: '1px solid #334155' }, children: [_jsx("div", { style: { color: '#64748b', fontSize: 12, marginBottom: 8 }, children: label }), _jsx("div", { style: { fontSize: 20, fontWeight: 700, color }, children: value })] }, label))) }), topApps.length > 0 && (_jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155', marginTop: 16 }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 16 }, children: "Top Apps This Week" }), topApps.map((app, i) => (_jsxs("div", { style: {
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '10px 0', borderBottom: i < topApps.length - 1 ? '1px solid #334155' : 'none'
                        }, children: [_jsxs("span", { style: { color: '#475569', width: 20, fontSize: 13 }, children: ["#", i + 1] }), _jsx("span", { style: { flex: 1, fontSize: 14, fontWeight: 500 }, children: app.name }), _jsx("span", { style: { fontSize: 12, color: '#64748b' }, children: app.category ?? 'Other' }), _jsx("span", { style: { fontWeight: 600, fontSize: 14, color: '#3b82f6' }, children: fmt(app.totalMinutes) })] }, app.name)))] }))] }));
}
