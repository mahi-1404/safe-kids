import { useState } from 'react'
import { Globe, Plus, Trash2, Shield, AlertTriangle, Search } from 'lucide-react'

type FilterMode = 'blacklist' | 'whitelist'

interface BlockedSite {
  url: string
  reason: string
  addedOn: string
}

const defaultBlocked: BlockedSite[] = [
  { url: 'pornhub.com', reason: 'Adult content', addedOn: 'Auto-blocked' },
  { url: 'xvideos.com', reason: 'Adult content', addedOn: 'Auto-blocked' },
  { url: 'bet365.com', reason: 'Gambling', addedOn: 'Auto-blocked' },
  { url: 'roblox-hack.com', reason: 'Malware', addedOn: 'Auto-blocked' },
  { url: 'tiktok.com', reason: 'Parent rule', addedOn: 'Mar 10, 2026' },
]

const categories = [
  { name: 'Adult Content', blocked: true, icon: '🔞', count: 12400 },
  { name: 'Gambling', blocked: true, icon: '🎰', count: 3200 },
  { name: 'Violence', blocked: true, icon: '⚠️', count: 5600 },
  { name: 'Drugs & Alcohol', blocked: true, icon: '🚫', count: 1800 },
  { name: 'Social Media', blocked: false, icon: '📱', count: 450 },
  { name: 'Gaming', blocked: false, icon: '🎮', count: 890 },
  { name: 'Streaming', blocked: false, icon: '📺', count: 320 },
  { name: 'Shopping', blocked: false, icon: '🛒', count: 2100 },
]

export default function WebFilter() {
  const [mode, setMode] = useState<FilterMode>('blacklist')
  const [blocked, setBlocked] = useState<BlockedSite[]>(defaultBlocked)
  const [cats, setCats] = useState(categories)
  const [newUrl, setNewUrl] = useState('')
  const [search, setSearch] = useState('')
  const [safeSearch, setSafeSearch] = useState(true)
  const [youtubeKids, setYoutubeKids] = useState(false)

  const addSite = () => {
    if (!newUrl.trim()) return
    setBlocked(prev => [...prev, { url: newUrl.trim(), reason: 'Parent rule', addedOn: 'Just now' }])
    setNewUrl('')
  }

  const removeSite = (url: string) => setBlocked(prev => prev.filter(s => s.url !== url))
  const toggleCategory = (name: string) => setCats(prev => prev.map(c => c.name === name ? { ...c, blocked: !c.blocked } : c))

  const filtered = blocked.filter(s => s.url.includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Web Filter</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Control which websites Aryan can access</p>
      </div>

      {/* Mode toggle */}
      <div style={{
        background: '#1e293b', borderRadius: 12, padding: 4,
        display: 'inline-flex', gap: 2, marginBottom: 24,
        border: '1px solid #334155'
      }}>
        {(['blacklist', 'whitelist'] as FilterMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: mode === m ? '#3b82f6' : 'transparent',
            color: mode === m ? 'white' : '#94a3b8',
            fontWeight: 600, fontSize: 13, textTransform: 'capitalize'
          }}>
            {m === 'blacklist' ? 'Block List' : 'Allow List Only'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Category filters */}
          <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Category Filters</div>
            <div style={{ color: '#64748b', fontSize: 12, marginBottom: 16 }}>
              Block entire categories of websites automatically
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {cats.map(cat => (
                <div key={cat.name} onClick={() => toggleCategory(cat.name)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                  background: cat.blocked ? '#3f151522' : '#0f172a',
                  border: `1px solid ${cat.blocked ? '#ef444433' : '#334155'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{cat.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{cat.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{cat.count.toLocaleString()} sites</div>
                    </div>
                  </div>
                  <div style={{
                    width: 36, height: 20, borderRadius: 10, transition: 'background 0.2s',
                    background: cat.blocked ? '#ef4444' : '#334155', position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute', top: 2, transition: 'left 0.2s',
                      left: cat.blocked ? 18 : 2,
                      width: 16, height: 16, borderRadius: '50%', background: 'white'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blocked sites list */}
          <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>
              {mode === 'blacklist' ? 'Blocked Sites' : 'Allowed Sites Only'} ({blocked.length})
            </div>

            {/* Add site */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Globe size={14} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={newUrl} onChange={e => setNewUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSite()}
                  placeholder="Enter website URL (e.g. example.com)"
                  style={{
                    width: '100%', padding: '10px 12px 10px 34px', boxSizing: 'border-box',
                    background: '#0f172a', border: '1px solid #334155',
                    borderRadius: 9, color: '#f1f5f9', fontSize: 13, outline: 'none'
                  }}
                />
              </div>
              <button onClick={addSite} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                background: '#3b82f6', color: 'white', fontWeight: 600, fontSize: 13
              }}>
                <Plus size={15} /> Add
              </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search blocked sites..."
                style={{
                  width: '100%', padding: '8px 10px 8px 32px', boxSizing: 'border-box',
                  background: '#0f172a', border: '1px solid #334155',
                  borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none'
                }}
              />
            </div>

            {/* List */}
            {filtered.map(site => (
              <div key={site.url} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: '1px solid #0f172a'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: '#3f151533',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Globe size={15} color="#ef4444" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{site.url}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{site.reason} · {site.addedOn}</div>
                  </div>
                </div>
                <button onClick={() => removeSite(site.url)} style={{
                  width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: '#3f151533', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Trash2 size={14} color="#ef4444" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Safe settings */}
          <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Safety Settings</div>
            {[
              { label: 'Safe Search', desc: 'Force safe search on Google/Bing', val: safeSearch, set: setSafeSearch },
              { label: 'YouTube Kids Mode', desc: 'Restrict YouTube to kids content', val: youtubeKids, set: setYoutubeKids },
            ].map(({ label, desc, val, set }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: '1px solid #334155'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{desc}</div>
                </div>
                <div onClick={() => set(v => !v)} style={{
                  width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
                  background: val ? '#3b82f6' : '#334155', position: 'relative', transition: 'background 0.2s'
                }}>
                  <div style={{
                    position: 'absolute', top: 3, left: val ? 20 : 3,
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'white', transition: 'left 0.2s'
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Today's Stats</div>
            {[
              { label: 'Sites visited', value: '47', color: '#3b82f6' },
              { label: 'Blocked attempts', value: '3', color: '#ef4444' },
              { label: 'Categories blocked', value: cats.filter(c => c.blocked).length.toString(), color: '#f59e0b' },
              { label: 'Custom rules', value: blocked.filter(s => s.addedOn !== 'Auto-blocked').length.toString(), color: '#22c55e' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span style={{ color, fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Recent attempts */}
          <div style={{ background: '#1e293b', borderRadius: 14, padding: 20, border: '1px solid #334155' }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Blocked Attempts Today</div>
            {[
              { url: 'tiktok.com', time: '2h ago' },
              { url: 'roblox-hack.com', time: '4h ago' },
              { url: 'bet365.com', time: '6h ago' },
            ].map(({ url, time }) => (
              <div key={url} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <AlertTriangle size={14} color="#ef4444" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{url}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
