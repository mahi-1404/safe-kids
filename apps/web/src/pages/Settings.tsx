import { useEffect, useState } from 'react'
import { User, Bell, Shield, Smartphone, Lock, Save, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authApi, childApi, notificationApi } from '../services/api'

const fmt = (min: number) => min < 60 ? `${min}m` : `${Math.floor(min / 60)}h ${min % 60}m`

const NOTIF_KEYS = [
  { key: 'sos',               label: 'SOS alert' },
  { key: 'geofence_breach',   label: 'Geofence breaches' },
  { key: 'distress_keyword',  label: 'Distress keywords in SMS' },
  { key: 'cyberbullying',     label: 'Cyberbullying detected' },
  { key: 'grooming',          label: 'Grooming detected' },
  { key: 'blocked_content',   label: 'Blocked app/site attempts' },
  { key: 'screen_time_exceeded', label: 'Screen time limit reached' },
  { key: 'low_battery',       label: 'Low battery' },
  { key: 'unknown_contact',   label: 'Unknown contact calls' },
  { key: 'app_install',       label: 'New app installed' },
]

export default function Settings() {
  const { parent, activeChild, refreshChildren, logout } = useAuth()

  // Parent profile state
  const [pName, setPName]     = useState(parent?.name ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg]       = useState('')

  // Change password state
  const [curPwd, setCurPwd]   = useState('')
  const [newPwd, setNewPwd]   = useState('')
  const [savingPwd, setSavingPwd]   = useState(false)
  const [pwdMsg, setPwdMsg]         = useState('')

  // Child settings state
  const [childName, setChildName]         = useState(activeChild?.name ?? '')
  const [screenLimit, setScreenLimit]     = useState(String(activeChild?.screenTimeLimit ?? 180))
  const [bedStart, setBedStart]           = useState(activeChild?.bedtimeStart ?? '21:00')
  const [bedEnd, setBedEnd]               = useState(activeChild?.bedtimeEnd ?? '07:00')
  const [agePreset, setAgePreset]         = useState<string>('custom')
  const [savingChild, setSavingChild]     = useState(false)
  const [childMsg, setChildMsg]           = useState('')

  // Notification prefs state
  const [prefs, setPrefs]         = useState<Record<string, boolean>>({})
  const [quietEnabled, setQuietEnabled]   = useState(false)
  const [quietFrom, setQuietFrom]         = useState('22:00')
  const [quietUntil, setQuietUntil]       = useState('07:00')
  const [pushEnabled, setPushEnabled]     = useState(true)
  const [savingPrefs, setSavingPrefs]     = useState(false)
  const [prefsMsg, setPrefsMsg]           = useState('')
  const [loadingPrefs, setLoadingPrefs]   = useState(true)

  // Sync local state when activeChild changes
  useEffect(() => {
    if (activeChild) {
      setChildName(activeChild.name)
      setScreenLimit(String(activeChild.screenTimeLimit ?? 180))
      setBedStart(activeChild.bedtimeStart ?? '21:00')
      setBedEnd(activeChild.bedtimeEnd ?? '07:00')
      setAgePreset('custom')
    }
  }, [activeChild?._id])

  useEffect(() => {
    setLoadingPrefs(true)
    notificationApi.getPrefs().then(r => {
      const d = r.data
      const p: Record<string, boolean> = {}
      NOTIF_KEYS.forEach(({ key }) => { p[key] = d[key] ?? true })
      setPrefs(p)
      setQuietEnabled(d.quietHoursEnabled ?? false)
      setQuietFrom(d.quietFrom ?? '22:00')
      setQuietUntil(d.quietUntil ?? '07:00')
      setPushEnabled(d.pushEnabled ?? true)
    }).catch(() => {}).finally(() => setLoadingPrefs(false))
  }, [])

  const saveProfile = async () => {
    setSavingProfile(true); setProfileMsg('')
    try {
      await authApi.updateProfile({ name: pName })
      setProfileMsg('Profile updated')
    } catch { setProfileMsg('Failed to save') }
    setSavingProfile(false)
    setTimeout(() => setProfileMsg(''), 3000)
  }

  const savePassword = async () => {
    if (!curPwd || !newPwd) { setPwdMsg('Both fields required'); return }
    if (newPwd.length < 8) { setPwdMsg('Min 8 characters'); return }
    setSavingPwd(true); setPwdMsg('')
    try {
      await authApi.changePassword(curPwd, newPwd)
      setCurPwd(''); setNewPwd('')
      setPwdMsg('Password changed')
    } catch (e: any) {
      setPwdMsg(e?.response?.data?.message ?? 'Failed')
    }
    setSavingPwd(false)
    setTimeout(() => setPwdMsg(''), 4000)
  }

  const saveChild = async () => {
    if (!activeChild) return
    setSavingChild(true); setChildMsg('')
    try {
      await childApi.update(activeChild._id, {
        name: childName,
        screenTimeLimit: parseInt(screenLimit),
        bedtimeStart: bedStart,
        bedtimeEnd: bedEnd,
        agePreset,
      })
      await refreshChildren()
      setChildMsg('Saved')
    } catch { setChildMsg('Failed to save') }
    setSavingChild(false)
    setTimeout(() => setChildMsg(''), 3000)
  }

  const savePrefs = async () => {
    setSavingPrefs(true); setPrefsMsg('')
    try {
      await notificationApi.updatePrefs({
        ...prefs,
        quietHoursEnabled: quietEnabled,
        quietFrom, quietUntil, pushEnabled,
      })
      setPrefsMsg('Preferences saved')
    } catch { setPrefsMsg('Failed to save') }
    setSavingPrefs(false)
    setTimeout(() => setPrefsMsg(''), 3000)
  }

  const Card = ({ icon: Icon, iconColor, iconBg, title, children }: {
    icon: any; iconColor: string; iconBg: string; title: string; children: React.ReactNode
  }) => (
    <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #334155' }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} color={iconColor} />
        </div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  )

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', color: '#64748b', fontSize: 12, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )

  const input = (value: string, onChange: (v: string) => void, type = 'text', placeholder = '') => (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: '100%', padding: '10px 12px', boxSizing: 'border-box',
        background: '#0f172a', border: '1px solid #334155',
        borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none',
      }}
    />
  )

  const SaveBtn = ({ onClick, saving, msg }: { onClick: () => void; saving: boolean; msg: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
      <button onClick={onClick} disabled={saving} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
        background: '#3b82f6', color: 'white', fontSize: 13, fontWeight: 600,
        opacity: saving ? 0.6 : 1,
      }}>
        {saving ? <Loader size={14} /> : <Save size={14} />} Save
      </button>
      {msg && <span style={{ fontSize: 12, color: msg.includes('ail') ? '#ef4444' : '#22c55e' }}>{msg}</span>}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Manage your account and child profile</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 620 }}>

        {/* Parent Profile */}
        <Card icon={User} iconColor="#3b82f6" iconBg="#3b82f622" title="Parent Profile">
          <Field label="Name">{input(pName, setPName, 'text', 'Your name')}</Field>
          <Field label="Email">
            <div style={{ padding: '10px 12px', background: '#0f172a', borderRadius: 8, color: '#64748b', fontSize: 14 }}>
              {parent?.email ?? '—'} <span style={{ fontSize: 11, marginLeft: 6 }}>(cannot change)</span>
            </div>
          </Field>
          <SaveBtn onClick={saveProfile} saving={savingProfile} msg={profileMsg} />
        </Card>

        {/* Change Password */}
        <Card icon={Lock} iconColor="#8b5cf6" iconBg="#8b5cf622" title="Change Password">
          <Field label="Current password">{input(curPwd, setCurPwd, 'password', '••••••••')}</Field>
          <Field label="New password">{input(newPwd, setNewPwd, 'password', 'Min 8 characters')}</Field>
          <SaveBtn onClick={savePassword} saving={savingPwd} msg={pwdMsg} />
        </Card>

        {/* Child Settings */}
        {activeChild && (
          <Card icon={Shield} iconColor="#22c55e" iconBg="#22c55e22" title={`Child Settings — ${activeChild.name}`}>
            <Field label="Name">{input(childName, setChildName)}</Field>

            <Field label="Daily screen time limit (minutes)">
              <input type="number" min="30" max="720" value={screenLimit}
                onChange={e => setScreenLimit(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', boxSizing: 'border-box',
                  background: '#0f172a', border: '1px solid #334155',
                  borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none',
                }}
              />
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                = {fmt(parseInt(screenLimit || '180'))} per day
              </div>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Bedtime (start)">{input(bedStart, setBedStart, 'time')}</Field>
              <Field label="Wake-up time">{input(bedEnd, setBedEnd, 'time')}</Field>
            </div>

            <Field label="Age preset">
              <select value={agePreset} onChange={e => setAgePreset(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', boxSizing: 'border-box',
                  background: '#0f172a', border: '1px solid #334155',
                  borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none',
                }}>
                <option value="little_explorer">Little Explorer (3–7)</option>
                <option value="junior_learner">Junior Learner (8–11)</option>
                <option value="preteen">Preteen (11–13)</option>
                <option value="custom">Custom</option>
              </select>
            </Field>

            {/* Read-only device info */}
            {[
              { label: 'Device', value: activeChild.deviceModel ?? 'Unknown' },
              { label: 'Status', value: activeChild.isOnline ? '● Online' : '○ Offline' },
              { label: 'Battery', value: `${activeChild.batteryLevel ?? 0}%` },
              { label: 'Risk Score', value: `${activeChild.riskScore ?? 0} / 100` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{value}</span>
              </div>
            ))}

            <SaveBtn onClick={saveChild} saving={savingChild} msg={childMsg} />
          </Card>
        )}

        {/* Device Info */}
        <Card icon={Smartphone} iconColor="#f59e0b" iconBg="#f59e0b22" title="Device Info">
          {[
            { label: 'Device Model', value: activeChild?.deviceModel ?? 'Unknown' },
            { label: 'Last Seen', value: activeChild?.lastSeen ? new Date(activeChild.lastSeen).toLocaleString() : 'Never' },
            { label: 'Paired', value: activeChild?.isPaired ? 'Yes' : 'No' },
            { label: 'Android', value: (activeChild as any)?.androidVersion ?? 'Unknown' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>{label}</span>
              <span style={{ fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </Card>

        {/* Notification Preferences */}
        <Card icon={Bell} iconColor="#8b5cf6" iconBg="#8b5cf622" title="Alert Notifications">
          {loadingPrefs ? (
            <div style={{ textAlign: 'center', color: '#475569', padding: '16px 0' }}>Loading...</div>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                {NOTIF_KEYS.map(({ key, label }) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
                    <span style={{ fontSize: 13 }}>{label}</span>
                    <div onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))} style={{
                      width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                      background: prefs[key] ? '#22c55e' : '#334155', position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', top: 2, left: prefs[key] ? 18 : 2,
                        width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.15s',
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #334155', paddingTop: 14, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Quiet Hours</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>No push notifications during this window</div>
                  </div>
                  <div onClick={() => setQuietEnabled(v => !v)} style={{
                    width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                    background: quietEnabled ? '#3b82f6' : '#334155', position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', top: 2, left: quietEnabled ? 18 : 2,
                      width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.15s',
                    }} />
                  </div>
                </div>
                {quietEnabled && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Field label="From"><input type="time" value={quietFrom} onChange={e => setQuietFrom(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', boxSizing: 'border-box', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none' }}
                    /></Field>
                    <Field label="Until"><input type="time" value={quietUntil} onChange={e => setQuietUntil(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', boxSizing: 'border-box', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none' }}
                    /></Field>
                  </div>
                )}
              </div>

              <SaveBtn onClick={savePrefs} saving={savingPrefs} msg={prefsMsg} />
            </>
          )}
        </Card>

        {/* Logout */}
        <button onClick={logout} style={{
          padding: '12px', borderRadius: 10, border: '1px solid #ef444444',
          background: 'transparent', color: '#ef4444', fontWeight: 600, fontSize: 14,
          cursor: 'pointer', width: '100%',
        }}>
          Logout
        </button>
      </div>
    </div>
  )
}
