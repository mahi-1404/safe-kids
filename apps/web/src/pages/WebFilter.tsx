import { useEffect, useState } from 'react'
import { Globe, Plus, Trash2, Shield, AlertTriangle, Search, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { webFilterApi, alertApi } from '../services/api'

type FilterMode = 'blacklist' | 'whitelist'

const PRESET_CATEGORIES = [
  { name: 'adult',        label: 'Adult Content',   icon: '🔞' },
  { name: 'gambling',     label: 'Gambling',         icon: '🎰' },
  { name: 'violence',     label: 'Violence',         icon: '⚠️' },
  { name: 'drugs',        label: 'Drugs & Alcohol',  icon: '🚫' },
  { name: 'weapons',      label: 'Weapons',          icon: '🔫' },
  { name: 'hate_speech',  label: 'Hate Speech',      icon: '💬' },
  { name: 'dating',       label: 'Dating',           icon: '💔' },
  { name: 'horror',       label: 'Horror',           icon: '👻' },
]

export default function WebFilter() {
  const { activeChild } = useAuth()
  const childId = activeChild?._id

  const [rules, setRules]         = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [newUrl, setNewUrl]       = useState('')
  const [search, setSearch]       = useState('')
  const [mode, setMode]           = useState<FilterMode>('blacklist')
  const [safeSearch, setSafeSearch] = useState(false)
  const [youtubeKids, setYoutubeKids] = useState(false)
  const [applyingPreset, setApplyingPreset] = useState(false)
  const [blockedAttempts, setBlockedAttempts] = useState<any[]>([])

  const urlRules      = rules.filter(r => r.url)
  const categoryRules = rules.filter(r => r.category)

  const isCatBlocked = (cat: string) =>
    categoryRules.some(r => r.category === cat && r.isEnabled)

  const load = async () => {
    if (!childId) return
    setLoading(true)
    try {
      const res = await webFilterApi.getAll(childId)
      const data: any[] = res.data ?? []
      setRules(data)
      // Detect safe-search and youtube-kids as special URL rules
      setSafeSearch(data.some(r => r.url === '__safe_search__' && r.isEnabled))
      setYoutubeKids(data.some(r => r.url === '__youtube_kids__' && r.isEnabled))
      // Mode: if any whitelist rule exists, display in whitelist mode
      if (data.some(r => r.mode === 'whitelist')) setMode('whitelist')
    } catch {}
    setLoading(false)
  }

  // Load blocked content alerts as "blocked attempts"
  const loadAttempts = async () => {
    if (!childId) return
    try {
      const res = await alertApi.getAll({ childId, type: 'blocked_content', limit: 5 })
      setBlockedAttempts(res.data.alerts ?? [])
    } catch {}
  }

  useEffect(() => { load(); loadAttempts() }, [childId])

  const addUrl = async () => {
    if (!newUrl.trim() || !childId) return
    setSaving(true)
    try {
      const res = await webFilterApi.create({ childId, mode, url: newUrl.trim() })
      setRules(prev => [...prev, res.data])
      setNewUrl('')
    } catch {}
    setSaving(false)
  }

  const removeRule = async (id: string) => {
    try {
      await webFilterApi.delete(id)
      setRules(prev => prev.filter(r => r._id !== id))
    } catch {}
  }

  const toggleCategory = async (cat: string) => {
    if (!childId) return
    const existing = categoryRules.find(r => r.category === cat)
    if (existing) {
      // Toggle isEnabled
      try {
        await webFilterApi.update(existing._id, { isEnabled: !existing.isEnabled })
        setRules(prev => prev.map(r => r._id === existing._id ? { ...r, isEnabled: !r.isEnabled } : r))
      } catch {}
    } else {
      // Create new category rule
      try {
        const res = await webFilterApi.create({ childId, mode: 'blacklist', category: cat })
        setRules(prev => [...prev, res.data])
      } catch {}
    }
  }

  const applyPreset = async () => {
    if (!childId) return
    setApplyingPreset(true)
    try {
      await webFilterApi.applyPreset(childId)
      await load()
    } catch {}
    setApplyingPreset(false)
  }

  const toggleSpecial = async (key: '__safe_search__' | '__youtube_kids__', val: boolean) => {
    if (!childId) return
    const existing = rules.find(r => r.url === key)
    if (existing) {
      await webFilterApi.update(existing._id, { isEnabled: val })
      setRules(prev => prev.map(r => r._id === existing._id ? { ...r, isEnabled: val } : r))
    } else if (val) {
      const res = await webFilterApi.create({ childId, mode: 'blacklist', url: key })
      setRules(prev => [...prev, res.data])
    }
    if (key === '__safe_search__') setSafeSearch(val)
    else setYoutubeKids(val)
  }

  const visibleUrlRules = urlRules
    .filter(r => !r.url.startsWith('__'))
    .filter(r => r.url.includes(search.toLowerCase()))

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1) return 'just now'
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Web Filter</h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>
            Control which websites {activeChild?.name ?? 'your child'} can access
          </p>
        </div>
        <button onClick={applyPreset} disabled={applyingPreset || !childId} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: '#3b82f6', color: 'white', fontSize: 13, fontWeight: 600,
          opacity: applyingPreset ? 0.6 : 1,
        }}>
          {applyingPreset ? <Loader size={14} /> : <Shield size={14} />}
          Apply Age Preset
        </button>
      </div>

      {/* Mode toggle */}
      <div style={{
        background: '#1e293b', borderRadius: 12, padding: 4,
        display: 'inline-flex', gap: 2, marginBottom: 24, border: '1px solid #334155',
      }}>
        {(['blacklist', 'whitelist'] as FilterMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: mode === m ? '#3b82f6' : 'transparent',
            color: mode === m ? 'white' : '#94a3b8',
            fontWeight: 600, fontSize: 13, textTransform: 'capitalize',
          }}>
            {m === 'blacklist' ? 'Block List' : 'Allow List Only'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>Loading filter rules...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Category filters */}
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Category Filters</div>
              <div style={{ color: '#64748b', fontSize: 12, marginBottom: 16 }}>
                Block entire categories of websites automatically
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {PRESET_CATEGORIES.map(cat => {
                  const blocked = isCatBlocked(cat.name)
                  return (
                    <div key={cat.name} onClick={() => toggleCategory(cat.name)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                      background: blocked ? '#3f151522' : '#0f172a',
                      border: `1px solid ${blocked ? '#ef444433' : '#334155'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{cat.icon}</span>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{cat.label}</div>
                      </div>
                      <div style={{
                        width: 36, height: 20, borderRadius: 10,
                        background: blocked ? '#ef4444' : '#334155', position: 'relative',
                      }}>
                        <div style={{
                          position: 'absolute', top: 2, left: blocked ? 18 : 2,
                          width: 16, height: 16, borderRadius: '50%', background: 'white',
                          transition: 'left 0.15s',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* URL list */}
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>
                {mode === 'blacklist' ? 'Blocked Sites' : 'Allowed Sites Only'} ({visibleUrlRules.length})
              </div>

              {/* Add */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Globe size={14} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addUrl()}
                    placeholder="Enter website URL (e.g. tiktok.com)"
                    style={{
                      width: '100%', padding: '10px 12px 10px 34px', boxSizing: 'border-box',
                      background: '#0f172a', border: '1px solid #334155',
                      borderRadius: 9, color: '#f1f5f9', fontSize: 13, outline: 'none',
                    }}
                  />
                </div>
                <button onClick={addUrl} disabled={saving || !childId} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: '#3b82f6', color: 'white', fontWeight: 600, fontSize: 13,
                  opacity: saving ? 0.6 : 1,
                }}>
                  {saving ? <Loader size={14} /> : <Plus size={15} />} Add
                </button>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <Search size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                  style={{
                    width: '100%', padding: '8px 10px 8px 32px', boxSizing: 'border-box',
                    background: '#0f172a', border: '1px solid #334155',
                    borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none',
                  }}
                />
              </div>

              {visibleUrlRules.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#475569', padding: '20px 0', fontSize: 13 }}>
                  No URL rules yet. Add a site above.
                </div>
              ) : visibleUrlRules.map(rule => (
                <div key={rule._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid #0f172a',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: '#3f151533',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Globe size={15} color="#ef4444" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{rule.url}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {rule.mode === 'blacklist' ? 'Blocked' : 'Allowed only'} · {rule.isEnabled ? 'Active' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeRule(rule._id)} style={{
                    width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: '#3f151533', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Trash2 size={14} color="#ef4444" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Safety settings */}
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Safety Settings</div>
              {[
                { key: '__safe_search__' as const, label: 'Safe Search', desc: 'Force safe search on Google/Bing', val: safeSearch },
                { key: '__youtube_kids__' as const, label: 'YouTube Kids Mode', desc: 'Restrict YouTube to kids content', val: youtubeKids },
              ].map(({ key, label, desc, val }) => (
                <div key={key} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: '1px solid #334155',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{desc}</div>
                  </div>
                  <div onClick={() => toggleSpecial(key, !val)} style={{
                    width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
                    background: val ? '#3b82f6' : '#334155', position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', top: 3, left: val ? 20 : 3,
                      width: 16, height: 16, borderRadius: '50%',
                      background: 'white', transition: 'left 0.15s',
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Filter Summary</div>
              {[
                { label: 'URL rules', value: String(visibleUrlRules.length), color: '#3b82f6' },
                { label: 'Categories blocked', value: String(categoryRules.filter(r => r.isEnabled).length), color: '#ef4444' },
                { label: 'Mode', value: mode === 'blacklist' ? 'Block list' : 'Allow only', color: '#f59e0b' },
                { label: 'Total rules', value: String(rules.length), color: '#22c55e' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>{label}</span>
                  <span style={{ color, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Recent blocked attempts from alerts */}
            <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Recent Blocked Attempts</div>
              {blockedAttempts.length === 0 ? (
                <div style={{ fontSize: 12, color: '#475569', textAlign: 'center', padding: '10px 0' }}>No blocked attempts recorded</div>
              ) : blockedAttempts.map(a => (
                <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <AlertTriangle size={14} color="#ef4444" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{timeAgo(a.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
