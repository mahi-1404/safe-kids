import { useState } from 'react'
import { Lock, Unlock, Trash2, Phone, Wifi, MessageSquare, Volume2, Power, Pause, Play, Camera, AlertTriangle } from 'lucide-react'
import { commandApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface Command {
  icon: any
  label: string
  desc: string
  color: string
  bg: string
  type: string
  requiresConfirm?: boolean
  payload?: (msg?: string) => Record<string, any>
}

const COMMANDS: Command[] = [
  { icon: Lock, label: 'Lock Device', desc: 'Instantly lock child\'s screen', color: '#ef4444', bg: '#ef444422', type: 'lock_device', payload: () => ({ reason: 'Locked by parent' }) },
  { icon: Unlock, label: 'Unlock Device', desc: 'Unlock the child\'s screen', color: '#22c55e', bg: '#22c55e22', type: 'unlock_device' },
  { icon: Pause, label: 'Pause All Apps', desc: 'Block all apps immediately', color: '#f59e0b', bg: '#f59e0b22', type: 'pause_apps' },
  { icon: Play, label: 'Resume Apps', desc: 'Re-allow all apps', color: '#22c55e', bg: '#22c55e22', type: 'resume_apps' },
  { icon: Volume2, label: 'Ring Device', desc: 'Make device ring to find it', color: '#8b5cf6', bg: '#8b5cf622', type: 'ring_device' },
  { icon: MessageSquare, label: 'Send Message', desc: 'Show popup on child screen', color: '#3b82f6', bg: '#3b82f622', type: 'send_message', payload: (msg) => ({ title: 'Message from Parent', message: msg ?? '' }) },
  { icon: Camera, label: 'Take Screenshot', desc: 'Capture current screen silently', color: '#06b6d4', bg: '#06b6d422', type: 'get_screenshot' },
  { icon: Phone, label: 'Get Installed Apps', desc: 'Fetch list of installed apps', color: '#a855f7', bg: '#a855f722', type: 'get_installed_apps' },
  { icon: Wifi, label: 'Get Location', desc: 'Request fresh GPS location', color: '#0ea5e9', bg: '#0ea5e922', type: 'request_location' },
  { icon: Power, label: 'Restart Device', desc: 'Remotely restart phone', color: '#94a3b8', bg: '#94a3b822', type: 'restart_device' },
  { icon: Trash2, label: 'Wipe Device', desc: 'Factory reset — irreversible', color: '#ef4444', bg: '#ef444422', type: 'wipe_device', requiresConfirm: true },
]

export default function RemoteControl() {
  const { activeChild } = useAuth()
  const [sending, setSending] = useState<string | null>(null)
  const [result, setResult] = useState<{ label: string; ok: boolean } | null>(null)
  const [messageText, setMessageText] = useState('')
  const [showMessageInput, setShowMessageInput] = useState(false)
  const [confirmWipe, setConfirmWipe] = useState(false)

  async function sendCommand(cmd: Command) {
    if (!activeChild) return

    if (cmd.type === 'send_message') {
      if (!showMessageInput) { setShowMessageInput(true); return }
      if (!messageText.trim()) return
    }

    if (cmd.requiresConfirm && !confirmWipe) {
      setConfirmWipe(true)
      return
    }

    setSending(cmd.type)
    setResult(null)
    try {
      const payload = cmd.payload ? cmd.payload(messageText) : {}
      await commandApi.send(activeChild._id, cmd.type, payload)
      setResult({ label: cmd.label, ok: true })
      setShowMessageInput(false)
      setMessageText('')
      setConfirmWipe(false)
    } catch (err: any) {
      setResult({ label: cmd.label, ok: false })
    } finally {
      setSending(null)
    }
  }

  if (!activeChild) {
    return <div style={{ color: '#94a3b8', padding: 32 }}>No child device selected.</div>
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Remote Control</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Send commands to {activeChild.name}'s device</p>
      </div>

      {/* Online status */}
      <div style={{
        background: activeChild.isOnline ? '#22c55e22' : '#ef444422',
        border: `1px solid ${activeChild.isOnline ? '#22c55e44' : '#ef444444'}`,
        borderRadius: 10, padding: '12px 16px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: activeChild.isOnline ? '#22c55e' : '#ef4444' }} />
        <span style={{ color: activeChild.isOnline ? '#22c55e' : '#ef4444', fontSize: 13, fontWeight: 500 }}>
          {activeChild.isOnline ? 'Device is online — commands execute instantly' : 'Device is offline — commands will queue'}
        </span>
      </div>

      {/* Result toast */}
      {result && (
        <div style={{
          background: result.ok ? '#22c55e22' : '#ef444422',
          border: `1px solid ${result.ok ? '#22c55e44' : '#ef444444'}`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 16,
          color: result.ok ? '#22c55e' : '#ef4444', fontSize: 13
        }}>
          {result.ok ? `✓ ${result.label} sent` : `✗ ${result.label} failed — try again`}
        </div>
      )}

      {/* Message input */}
      {showMessageInput && (
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #334155' }}>
          <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 8 }}>Message to show on device</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={messageText} onChange={e => setMessageText(e.target.value)}
              placeholder="e.g. Come home for dinner!"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 8,
                background: '#0f172a', border: '1px solid #334155',
                color: '#f1f5f9', fontSize: 14, outline: 'none'
              }}
            />
            <button onClick={() => sendCommand(COMMANDS.find(c => c.type === 'send_message')!)} style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: '#3b82f6', color: 'white', fontWeight: 600, cursor: 'pointer'
            }}>Send</button>
            <button onClick={() => { setShowMessageInput(false); setMessageText('') }} style={{
              padding: '10px 16px', borderRadius: 8, border: '1px solid #334155',
              background: 'transparent', color: '#94a3b8', cursor: 'pointer'
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Wipe confirm */}
      {confirmWipe && (
        <div style={{ background: '#ef444411', border: '1px solid #ef444444', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <AlertTriangle size={18} color="#ef4444" />
            <span style={{ color: '#ef4444', fontWeight: 600 }}>This will factory reset the device. Are you sure?</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => sendCommand(COMMANDS.find(c => c.type === 'wipe_device')!)} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer'
            }}>Yes, Wipe Device</button>
            <button onClick={() => setConfirmWipe(false)} style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #334155',
              background: 'transparent', color: '#94a3b8', cursor: 'pointer'
            }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {COMMANDS.filter(c => c.type !== 'wipe_device').map(cmd => (
          <button key={cmd.type} onClick={() => sendCommand(cmd)}
            disabled={sending === cmd.type}
            style={{
              background: '#1e293b', border: '1px solid #334155',
              borderRadius: 14, padding: 20, cursor: sending ? 'not-allowed' : 'pointer',
              textAlign: 'left', opacity: sending === cmd.type ? 0.6 : 1
            }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: cmd.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14
            }}>
              <cmd.icon size={22} color={cmd.color} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#f1f5f9', marginBottom: 4 }}>{cmd.label}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{cmd.desc}</div>
          </button>
        ))}
      </div>

      {/* Danger zone */}
      <div style={{ marginTop: 24, background: '#1e293b', borderRadius: 14, border: '1px solid #ef444444', padding: 20 }}>
        <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>⚠ Danger Zone</div>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 14 }}>
          Device wipe will factory reset the child's phone. This cannot be undone.
        </p>
        <button onClick={() => sendCommand(COMMANDS.find(c => c.type === 'wipe_device')!)}
          style={{
            padding: '8px 20px', borderRadius: 8, border: '1px solid #ef444466',
            background: 'transparent', color: '#ef4444', fontWeight: 600, cursor: 'pointer'
          }}>Wipe Device</button>
      </div>
    </div>
  )
}
