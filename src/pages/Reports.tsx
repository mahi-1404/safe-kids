import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const weekly = [
  { day: 'Mon', screen: 2.5, risk: 20 }, { day: 'Tue', screen: 3.2, risk: 35 },
  { day: 'Wed', screen: 1.8, risk: 15 }, { day: 'Thu', screen: 4.1, risk: 45 },
  { day: 'Fri', screen: 3.5, risk: 30 }, { day: 'Sat', screen: 5.2, risk: 55 },
  { day: 'Sun', screen: 2.9, risk: 23 },
]

const appSplit = [
  { name: 'Education', value: 35, color: '#22c55e' },
  { name: 'Entertainment', value: 45, color: '#ef4444' },
  { name: 'Social', value: 12, color: '#f59e0b' },
  { name: 'Other', value: 8, color: '#64748b' },
]

export default function Reports() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Weekly Report</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Aryan's digital wellbeing — this week</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Screen time chart */}
        <div style={{ background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Daily Screen Time (hrs)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly}>
              <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="screen" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* App category split */}
        <div style={{ background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>App Category Split</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <PieChart width={160} height={160}>
              <Pie data={appSplit} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value">
                {appSplit.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div style={{ flex: 1 }}>
              {appSplit.map(({ name, value, color }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, flex: 1 }}>{name}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Avg Screen Time', value: '3h 20m/day', color: '#3b82f6' },
          { label: 'Alerts This Week', value: '7 alerts', color: '#ef4444' },
          { label: 'Avg Risk Score', value: '31 / 100', color: '#f59e0b' },
          { label: 'Wellbeing Score', value: '72 / 100', color: '#22c55e' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: '#1e293b', borderRadius: 12, padding: 16, border: '1px solid #334155'
          }}>
            <div style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
