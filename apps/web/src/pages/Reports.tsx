import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, Loader, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { reportsApi } from '../services/api'

const fmt = (min: number) => {
  if (min < 60) return `${min}m`
  return `${Math.floor(min / 60)}h ${min % 60}m`
}
const catColors: Record<string, string> = {
  Education: '#22c55e', Entertainment: '#ef4444', Social: '#f59e0b',
  Gaming: '#8b5cf6', Browser: '#3b82f6', Music: '#06b6d4', Other: '#64748b',
}

type ViewMode = 'weekly' | 'monthly'

export default function Reports() {
  const { activeChild } = useAuth()
  const childId = activeChild?._id

  const [view, setView]       = useState<ViewMode>('weekly')
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Monthly nav
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  useEffect(() => {
    if (!childId) return
    setLoading(true)
    const req = view === 'weekly'
      ? reportsApi.getWeekly(childId)
      : reportsApi.getMonthly(childId, year, month)
    req.then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [childId, view, year, month])

  const handleExport = async () => {
    if (!childId) return
    setExporting(true)
    try {
      const res = await reportsApi.exportData(childId)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/json' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `safekids-export-${childId}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {}
    setExporting(false)
  }

  const screenByDay = data?.screenTime?.byDay?.map((d: any) => ({
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric' }),
    hours: +(d.totalMinutes / 60).toFixed(1),
  })) ?? []

  const topApps = data?.screenTime?.topApps ?? []

  const catMap: Record<string, number> = {}
  topApps.forEach((app: any) => {
    const cat = app.category ?? 'Other'
    catMap[cat] = (catMap[cat] ?? 0) + app.totalMinutes
  })
  const totalAppMin = Object.values(catMap).reduce((s: number, v: number) => s + v, 0) || 1
  const pieData = Object.entries(catMap).map(([name, min]) => ({
    name, value: Math.round((min / totalAppMin) * 100),
    color: catColors[name] ?? '#64748b',
  }))

  const alerts    = data?.alerts ?? {}
  const riskScore = data?.child?.riskScore ?? 0
  const avgMin    = data?.screenTime?.avgDailyMinutes ?? 0
  const wellbeing = Math.max(0, 100 - riskScore)
  const totalMin  = data?.screenTime?.totalMinutes ?? 0

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Reports</h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>
            {activeChild ? `${activeChild.name}'s digital wellbeing` : 'No child paired'}
          </p>
          {data?.period && (
            <p style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
              {data.period.start ?? `${MONTHS[month - 1]} ${year}`} — {data.period.end ?? ''}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* View toggle */}
          <div style={{ background: '#1e293b', borderRadius: 10, padding: 3, display: 'flex', border: '1px solid #334155' }}>
            {(['weekly', 'monthly'] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: view === v ? '#3b82f6' : 'transparent',
                color: view === v ? 'white' : '#94a3b8',
                fontWeight: 600, fontSize: 13, textTransform: 'capitalize',
              }}>{v}</button>
            ))}
          </div>
          {/* Export */}
          <button onClick={handleExport} disabled={exporting || !childId} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8, border: '1px solid #334155',
            background: '#1e293b', color: '#94a3b8', fontSize: 13, cursor: 'pointer',
            opacity: exporting ? 0.6 : 1,
          }}>
            {exporting ? <Loader size={14} /> : <Download size={14} />} Export
          </button>
        </div>
      </div>

      {/* Monthly nav */}
      {view === 'monthly' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={prevMonth} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid #334155',
            background: '#1e293b', color: '#94a3b8', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><ChevronLeft size={16} /></button>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{MONTHS[month - 1]} {year}</span>
          <button onClick={nextMonth} disabled={isCurrentMonth} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid #334155',
            background: '#1e293b', color: isCurrentMonth ? '#334155' : '#94a3b8',
            cursor: isCurrentMonth ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><ChevronRight size={16} /></button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>Loading report...</div>
      ) : (
        <>
          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* Screen time chart */}
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Daily Screen Time (hrs)</div>
              {screenByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={screenByDay}>
                    <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                    <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                  No screen time data
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
                  No app usage data
                </div>
              )}
            </div>
          </div>

          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
            {[
              { label: view === 'weekly' ? 'Avg Screen Time' : 'Total Screen Time',
                value: view === 'weekly' ? `${fmt(avgMin)}/day` : fmt(totalMin), color: '#3b82f6' },
              { label: 'Alerts This Period', value: `${alerts.total ?? 0}`, color: '#ef4444' },
              { label: 'Risk Score', value: `${riskScore} / 100`, color: '#f59e0b' },
              { label: 'Wellbeing Score', value: `${wellbeing} / 100`, color: '#22c55e' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#1e293b', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
                <div style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Alert breakdown */}
          {alerts.total > 0 && (
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155', marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Alert Breakdown</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { label: 'Critical', count: alerts.critical ?? 0, color: '#ef4444' },
                  { label: 'High',     count: alerts.high ?? 0,     color: '#f97316' },
                  { label: 'Medium',   count: alerts.medium ?? 0,   color: '#f59e0b' },
                  { label: 'Low',      count: alerts.low ?? 0,      color: '#3b82f6' },
                ].map(({ label, count, color }) => (
                  <div key={label} style={{
                    background: color + '22', borderRadius: 10, padding: '10px 18px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color }}>{count}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly-only: SMS/Call stats */}
          {view === 'monthly' && data?.communications && (
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155', marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Communications</div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{data.communications.smsCount}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>SMS messages</div>
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{data.communications.callCount}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Phone calls</div>
                </div>
              </div>
            </div>
          )}

          {/* Top apps table */}
          {topApps.length > 0 && (
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 24, border: '1px solid #334155' }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>
                Top Apps {view === 'weekly' ? 'This Week' : `in ${MONTHS[month - 1]}`}
              </div>
              {topApps.map((app: any, i: number) => (
                <div key={app.name} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 0', borderBottom: i < topApps.length - 1 ? '1px solid #334155' : 'none',
                }}>
                  <span style={{ color: '#475569', width: 20, fontSize: 13 }}>#{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{app.name}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{app.category ?? 'Other'}</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#3b82f6' }}>{fmt(app.totalMinutes)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
