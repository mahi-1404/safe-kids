import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
const weekly = [
    { day: 'Mon', screen: 2.5, risk: 20 }, { day: 'Tue', screen: 3.2, risk: 35 },
    { day: 'Wed', screen: 1.8, risk: 15 }, { day: 'Thu', screen: 4.1, risk: 45 },
    { day: 'Fri', screen: 3.5, risk: 30 }, { day: 'Sat', screen: 5.2, risk: 55 },
    { day: 'Sun', screen: 2.9, risk: 23 },
];
const appSplit = [
    { name: 'Education', value: 35, color: '#22c55e' },
    { name: 'Entertainment', value: 45, color: '#ef4444' },
    { name: 'Social', value: 12, color: '#f59e0b' },
    { name: 'Other', value: 8, color: '#64748b' },
];
export default function Reports() {
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Weekly Report" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: "Aryan's digital wellbeing \u2014 this week" })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }, children: [_jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 20 }, children: "Daily Screen Time (hrs)" }), _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(BarChart, { data: weekly, children: [_jsx(XAxis, { dataKey: "day", stroke: "#475569", tick: { fill: '#94a3b8', fontSize: 12 } }), _jsx(YAxis, { stroke: "#475569", tick: { fill: '#94a3b8', fontSize: 12 } }), _jsx(Tooltip, { contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8 } }), _jsx(Bar, { dataKey: "screen", fill: "#3b82f6", radius: [4, 4, 0, 0] })] }) })] }), _jsxs("div", { style: { background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 20 }, children: "App Category Split" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 20 }, children: [_jsx(PieChart, { width: 160, height: 160, children: _jsx(Pie, { data: appSplit, cx: 75, cy: 75, innerRadius: 45, outerRadius: 70, dataKey: "value", children: appSplit.map((entry, i) => _jsx(Cell, { fill: entry.color }, i)) }) }), _jsx("div", { style: { flex: 1 }, children: appSplit.map(({ name, value, color }) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }, children: [_jsx("div", { style: { width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 } }), _jsx("span", { style: { fontSize: 13, flex: 1 }, children: name }), _jsxs("span", { style: { fontSize: 13, fontWeight: 600, color }, children: [value, "%"] })] }, name))) })] })] })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }, children: [
                    { label: 'Avg Screen Time', value: '3h 20m/day', color: '#3b82f6' },
                    { label: 'Alerts This Week', value: '7 alerts', color: '#ef4444' },
                    { label: 'Avg Risk Score', value: '31 / 100', color: '#f59e0b' },
                    { label: 'Wellbeing Score', value: '72 / 100', color: '#22c55e' },
                ].map(({ label, value, color }) => (_jsxs("div", { style: {
                        background: '#1e293b', borderRadius: 12, padding: 16, border: '1px solid #334155'
                    }, children: [_jsx("div", { style: { color: '#64748b', fontSize: 12, marginBottom: 8 }, children: label }), _jsx("div", { style: { fontSize: 20, fontWeight: 700, color }, children: value })] }, label))) })] }));
}
