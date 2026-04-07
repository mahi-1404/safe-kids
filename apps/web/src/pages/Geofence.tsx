import { useEffect, useState } from 'react'
import { MapPin, Plus, Trash2, Home, School } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { geofenceApi } from '../services/api'

interface Zone {
  _id: string
  name: string
  type: 'home' | 'school' | 'custom'
  radiusMeters: number
  latitude: number
  longitude: number
  alertOnExit: boolean
  alertOnEnter: boolean
  active: boolean
}

const typeIcons = { home: Home, school: School, custom: MapPin }
const typeColors = { home: '#3b82f6', school: '#22c55e', custom: '#8b5cf6' }

const emptyForm = { name: '', latitude: '', longitude: '', type: 'custom' as Zone['type'], radiusMeters: 200, alertOnExit: true, alertOnEnter: false }

export default function Geofence() {
  const { activeChild } = useAuth()
  const childId = activeChild?._id

  const [zones, setZones] = useState<Zone[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!childId) return
    setLoading(true)
    geofenceApi.getAll(childId).then(r => {
      setZones(r.data)
      if (r.data.length > 0) setSelected(r.data[0]._id)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [childId])

  const toggleActive = async (zone: Zone) => {
    try {
      const updated = await geofenceApi.update(zone._id, { active: !zone.active })
      setZones(prev => prev.map(z => z._id === zone._id ? updated.data : z))
    } catch {}
  }

  const toggleAlert = async (zone: Zone, field: 'alertOnExit' | 'alertOnEnter') => {
    try {
      const updated = await geofenceApi.update(zone._id, { [field]: !zone[field] })
      setZones(prev => prev.map(z => z._id === zone._id ? updated.data : z))
    } catch {}
  }

  const deleteZone = async (id: string) => {
    try {
      await geofenceApi.delete(id)
      setZones(prev => prev.filter(z => z._id !== id))
      if (selected === id) setSelected(null)
    } catch {}
  }

  const addZone = async () => {
    if (!childId || !form.name || !form.latitude || !form.longitude) return
    setSaving(true)
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
      })
      setZones(prev => [...prev, res.data])
      setShowAdd(false)
      setForm(emptyForm)
    } catch {}
    setSaving(false)
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Geofence</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          {activeChild ? `Set safe zones and get alerts for ${activeChild.name}` : 'No child paired'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

        {/* Map placeholder with zone info */}
        <div style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden' }}>
          <div style={{
            height: 400, background: 'linear-gradient(135deg, #0f172a 0%, #1a2540 50%, #0f172a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
          }}>
            <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.08 }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <g key={i}>
                  <line x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="#3b82f6" strokeWidth="1" />
                  <line x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="#3b82f6" strokeWidth="1" />
                </g>
              ))}
            </svg>

            {zones.filter(z => z.active).map((zone, i) => {
              const positions = [{ cx: '38%', cy: '42%' }, { cx: '60%', cy: '35%' }, { cx: '55%', cy: '62%' }, { cx: '30%', cy: '60%' }]
              const pos = positions[i % positions.length]
              const color = typeColors[zone.type]
              return (
                <g key={zone._id} onClick={() => setSelected(zone._id)} style={{ cursor: 'pointer' }}>
                  <circle cx={pos.cx} cy={pos.cy} r={zone.radiusMeters / 5} fill={color + '22'} stroke={color} strokeWidth={selected === zone._id ? 2 : 1} strokeDasharray="4 2" />
                  <circle cx={pos.cx} cy={pos.cy} r={8} fill={color} />
                  <text x={pos.cx} y={`calc(${pos.cy} + 20px)`} textAnchor="middle" fill="white" fontSize="11" fontWeight="600">{zone.name}</text>
                </g>
              )
            })}

            <div style={{ color: '#334155', textAlign: 'center', pointerEvents: 'none', position: 'relative', zIndex: 1 }}>
              <MapPin size={48} style={{ opacity: 0.2 }} />
              <div style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>
                Zone map — add lat/lng coordinates when creating zones
              </div>
            </div>
          </div>

          <div style={{ padding: '14px 20px', display: 'flex', gap: 24, borderTop: '1px solid #334155' }}>
            {[
              { label: 'Active zones', value: zones.filter(z => z.active).length },
              { label: 'Total zones', value: zones.length },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Zones panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <button onClick={() => setShowAdd(v => !v)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px', borderRadius: 10, border: '1px dashed #334155',
            background: 'transparent', color: '#64748b', cursor: 'pointer',
            fontWeight: 600, fontSize: 13, width: '100%'
          }}>
            <Plus size={16} /> Add New Zone
          </button>

          {showAdd && (
            <div style={{ background: '#1e293b', borderRadius: 12, padding: 16, border: '1px solid #334155' }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>New Safe Zone</div>
              {[
                { placeholder: 'Zone name', key: 'name', type: 'text' },
                { placeholder: 'Latitude (e.g. 28.6139)', key: 'latitude', type: 'number' },
                { placeholder: 'Longitude (e.g. 77.2090)', key: 'longitude', type: 'number' },
              ].map(({ placeholder, key, type }) => (
                <input
                  key={key}
                  type={type}
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{
                    width: '100%', marginBottom: 8, padding: '8px 10px', boxSizing: 'border-box',
                    background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
                    color: '#f1f5f9', fontSize: 13, outline: 'none'
                  }}
                />
              ))}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {(['home', 'school', 'custom'] as const).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                    flex: 1, padding: '7px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500, textTransform: 'capitalize',
                    background: form.type === t ? typeColors[t] : '#0f172a',
                    color: form.type === t ? 'white' : '#64748b',
                    border: `1px solid ${form.type === t ? typeColors[t] : '#334155'}`
                  }}>{t}</button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Radius: {form.radiusMeters}m</div>
              <input type="range" min={50} max={1000} value={form.radiusMeters}
                onChange={e => setForm(f => ({ ...f, radiusMeters: Number(e.target.value) }))}
                style={{ width: '100%', marginBottom: 12 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setShowAdd(false); setForm(emptyForm) }} style={{
                  flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #334155',
                  background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 13
                }}>Cancel</button>
                <button onClick={addZone} disabled={saving || !form.name || !form.latitude || !form.longitude} style={{
                  flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                  background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  opacity: saving ? 0.7 : 1
                }}>{saving ? 'Saving...' : 'Add Zone'}</button>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#475569' }}>Loading zones...</div>
          ) : zones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#475569', fontSize: 13 }}>No zones yet. Add one above.</div>
          ) : zones.map(zone => {
            const Icon = typeIcons[zone.type]
            const color = typeColors[zone.type]
            return (
              <div key={zone._id} onClick={() => setSelected(zone._id)} style={{
                background: '#1e293b', borderRadius: 12, padding: 16,
                border: `1px solid ${selected === zone._id ? color + '66' : '#334155'}`,
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{zone.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}</div>
                  </div>
                  <div onClick={e => { e.stopPropagation(); toggleActive(zone) }} style={{
                    width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                    background: zone.active ? '#22c55e' : '#334155', position: 'relative', transition: 'background 0.2s'
                  }}>
                    <div style={{ position: 'absolute', top: 2, left: zone.active ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <div style={{ background: '#0f172a', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#94a3b8' }}>
                    Radius: {zone.radiusMeters}m
                  </div>
                  {zone.alertOnExit && <div style={{ background: '#3f151522', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#ef4444' }}>Alert on exit</div>}
                  {zone.alertOnEnter && <div style={{ background: '#14532d22', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#22c55e' }}>Alert on enter</div>}
                </div>

                {selected === zone._id && (
                  <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #334155', paddingTop: 10 }}>
                    <button onClick={e => { e.stopPropagation(); toggleAlert(zone, 'alertOnExit') }} style={{
                      flex: 1, padding: '6px', borderRadius: 7,
                      border: `1px solid ${zone.alertOnExit ? '#ef444444' : '#334155'}`,
                      background: zone.alertOnExit ? '#3f151533' : 'transparent',
                      color: zone.alertOnExit ? '#ef4444' : '#64748b', cursor: 'pointer', fontSize: 11
                    }}>Exit alert {zone.alertOnExit ? 'ON' : 'OFF'}</button>
                    <button onClick={e => { e.stopPropagation(); toggleAlert(zone, 'alertOnEnter') }} style={{
                      flex: 1, padding: '6px', borderRadius: 7,
                      border: `1px solid ${zone.alertOnEnter ? '#22c55e44' : '#334155'}`,
                      background: zone.alertOnEnter ? '#14532d33' : 'transparent',
                      color: zone.alertOnEnter ? '#22c55e' : '#64748b', cursor: 'pointer', fontSize: 11
                    }}>Enter alert {zone.alertOnEnter ? 'ON' : 'OFF'}</button>
                    <button onClick={e => { e.stopPropagation(); deleteZone(zone._id) }} style={{
                      width: 32, height: 32, borderRadius: 7, border: 'none',
                      background: '#3f151533', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}>
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
