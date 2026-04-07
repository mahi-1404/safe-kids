import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { reportsApi } from '../services/api'

const fmt = (min: number) => {
  if (min < 60) return `${min}m`
  return `${Math.floor(min / 60)}h ${min % 60}m`
}
const catColors: Record<string, string> = {
  Education: '#22c55e', Entertainment: '#ef4444', Social: '#f59e0b',
  Gaming: '#8b5cf6', Browser: '#3b82f6', Music: '#06b6d4', Other: '#64748b'
}

export default function Reports() {
  const { activeChild } = useAuth()
  const childId = activeChild?._id

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    setLoading(true)
    reportsApi.getWeekly(childId).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [childId])

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Weekly Report</h1>
        </div>
        <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>Loading report...</div>
      </div>
    )
  }

  const screenByDay = data?.screenTime?.byDay?.map((d: any) => ({
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    hours: +(d.totalMinutes / 60).toFixed(1),
  })) ?? []

  const topApps = data?.screenTime?.topApps ?? []

  // Build category split from top apps
  const catMap: Record<string, number> = {}
  topApps.forEach((app: any) => {
    const cat = app.category ?? 'Other'
    catMap[cat] = (catMap[cat] ?? 0) + app.totalMinutes
  })
  const totalAppMin = Object.values(catMap).reduce((s: number, v: number) => s + v, 0) || 1
  const pieData = Object.entries(catMap).map(([name, min]) => ({
    name, value: Math.round((min / totalAppMin) * 100),
    color: catColors[name] ?? '#64748b'
  }))

  const alerts = data?.alerts ?? {}
  const riskScore = data?.child?.riskScore ?? 0
  const avgMin = data?.screenTime?.avgDailyMinutes ?? 0
  const wellbeing = Math.max(0, 100 - riskScore)

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Weekly Report</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          {activeChild ? `${activeChild.name}'s digital wellbeing — this week` : 'No child paired'}
        </p>
        {data?.period && (
          <p style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
            {data.period.start} to {data.period.end}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Screen time chart */}
        <div style={{ background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Daily Screen Time (hrs)</div>
          {screenByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={screenByDay}>
                <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              No screen time data this week
            </div>
          )}
        </div>

        {/* App category split */}
        <div style={{ background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>App Category Split</div>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <PieChart width={160} height={160}>
                <Pie data={pieData} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
              <div style={{ flex: 1 }}>
                {pieData.map(({ name, value, color }) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, flex: 1 }}>{name}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              No app usage data this week
            </div>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Avg Screen Time', value: `${fmt(avgMin)}/day`, color: '#3b82f6' },
          { label: 'Alerts This Week', value: `${alerts.total ?? 0} alerts`, color: '#ef4444' },
          { label: 'Risk Score', value: `${riskScore} / 100`, color: '#f59e0b' },
          { label: 'Wellbeing Score', value: `${wellbeing} / 100`, color: '#22c55e' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#1e293b', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
            <div style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Top apps table */}
      {topApps.length > 0 && (
        <div style={{ background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155', marginTop: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Top Apps This Week</div>
          {topApps.map((app: any, i: number) => (
            <div key={app.name} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '10px 0', borderBottom: i < topApps.length - 1 ? '1px solid #334155' : 'none'
            }}>
              <span style={{ color: '#475569', width: 20, fontSize: 13 }}>#{i + 1}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{app.name}</span>
              <span style={{ fontSize: 12, color: '#64748b' }}>{app.category ?? 'Other'}</span>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#3b82f6' }}>{fmt(app.totalMinutes)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
