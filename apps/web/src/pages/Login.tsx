import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Mail, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../services/api'

type Tab = 'login' | 'register'
type UIState = 'form' | 'email_sent' | 'locked'

export default function Login() {
  const [tab, setTab] = useState<Tab>('login')
  const [uiState, setUIState] = useState<UIState>('form')

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPass, setShowLoginPass] = useState(false)

  // Register fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [showRegPass, setShowRegPass] = useState(false)

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [lockMinutes, setLockMinutes] = useState(0)
  const [lockUntil, setLockUntil] = useState<Date | null>(null)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const { login, loading } = useAuth()
  const navigate = useNavigate()

  // Lock countdown
  useEffect(() => {
    if (!lockUntil) return
    const tick = () => {
      const ms = lockUntil.getTime() - Date.now()
      if (ms <= 0) { setLockUntil(null); setUIState('form'); setError('') }
      else setLockMinutes(Math.ceil(ms / 60000))
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [lockUntil])

  // ─── Login submit ──────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login(loginEmail, loginPassword)
      navigate('/dashboard')
    } catch (err: any) {
      const data = err?.response?.data ?? {}
      if (data.locked) {
        setUIState('locked')
        setLockUntil(data.lockUntil ? new Date(data.lockUntil) : new Date(Date.now() + 15 * 60 * 1000))
      } else if (data.emailNotVerified) {
        setError('Email not verified. Check your inbox for the verification link.')
      } else {
        setError(data.message ?? 'Login failed. Check your credentials.')
      }
    }
  }

  // ─── Register submit ───────────────────────────────────────────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword) {
      setError('All fields are required.')
      return
    }
    if (regPassword !== regConfirm) {
      setError('Passwords do not match.')
      return
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setBusy(true)
    try {
      await authApi.register(regName.trim(), regEmail.trim().toLowerCase(), regPhone.trim(), regPassword)
      setRegisteredEmail(regEmail.trim().toLowerCase())
      setUIState('email_sent')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed. Try again.')
    } finally {
      setBusy(false)
    }
  }

  // ─── Resend verification ───────────────────────────────────────────────────
  async function handleResend() {
    setBusy(true)
    setError('')
    try {
      await authApi.resendVerification(registeredEmail)
      setError('') // clear any error
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not resend. Try again.')
    } finally {
      setBusy(false)
    }
  }

  // ─── Shared card wrapper ───────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: '#1e293b', borderRadius: 16, padding: 32, border: '1px solid #334155'
  }

  // ─── LOCKED ───────────────────────────────────────────────────────────────
  if (uiState === 'locked') {
    return (
      <Page>
        <Header />
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 12 }}>Account Temporarily Locked</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>
            Too many failed login attempts.<br />
            Try again in <strong style={{ color: '#3b82f6' }}>{lockMinutes} minute{lockMinutes !== 1 ? 's' : ''}</strong>.
          </p>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 12 }}>
            A security alert has been sent to your email.
          </p>
          <button
            onClick={() => { setUIState('form'); setError('') }}
            style={{ marginTop: 24, padding: '10px 24px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>
            ← Back
          </button>
        </div>
      </Page>
    )
  }

  // ─── EMAIL SENT ────────────────────────────────────────────────────────────
  if (uiState === 'email_sent') {
    return (
      <Page>
        <Header />
        <div style={{ ...card, textAlign: 'center' }}>
          <CheckCircle size={56} color="#22c55e" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 12 }}>Check Your Email</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 8 }}>
            We sent a verification link to:<br />
            <strong style={{ color: '#f1f5f9' }}>{registeredEmail}</strong>
          </p>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>
            Click the link in the email to activate your account, then come back here to log in.
          </p>
          {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button
            onClick={handleResend}
            disabled={busy}
            style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#3b82f6', cursor: 'pointer', marginBottom: 12 }}>
            {busy ? 'Sending…' : '↻ Resend Verification Email'}
          </button>
          <br />
          <button
            onClick={() => { setUIState('form'); setTab('login'); setError('') }}
            style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
            Go to Login →
          </button>
        </div>
      </Page>
    )
  }

  // ─── FORM ──────────────────────────────────────────────────────────────────
  return (
    <Page>
      <Header />

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#1e293b', borderRadius: 12, padding: 4, marginBottom: 4, border: '1px solid #334155' }}>
        {(['login', 'register'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setError('') }}
            style={{
              flex: 1, padding: '10px', borderRadius: 8, border: 'none',
              background: tab === t ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : 'transparent',
              color: tab === t ? 'white' : '#64748b',
              fontWeight: 700, cursor: 'pointer', fontSize: 14,
              textTransform: 'capitalize',
            }}>
            {t === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#ef444422', border: '1px solid #ef444444', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* ── Login Form ── */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} style={card}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, color: '#f1f5f9' }}>Sign in to your account</h2>

          <FieldRow label="Email">
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
              placeholder="parent@email.com" required style={inputStyle} />
          </FieldRow>

          <FieldRow label="Password">
            <div style={{ position: 'relative' }}>
              <input
                type={showLoginPass ? 'text' : 'password'}
                value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ ...inputStyle, paddingRight: 40 }} />
              <button type="button" onClick={() => setShowLoginPass(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FieldRow>

          <button type="submit" disabled={loading} style={submitBtn(loading)}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      )}

      {/* ── Register Form ── */}
      {tab === 'register' && (
        <form onSubmit={handleRegister} style={card}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, color: '#f1f5f9' }}>Create your account</h2>

          <FieldRow label="Full Name">
            <input type="text" value={regName} onChange={e => setRegName(e.target.value)}
              placeholder="Your full name" required style={inputStyle} />
          </FieldRow>

          <FieldRow label="Email">
            <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
              placeholder="parent@email.com" required style={inputStyle} />
          </FieldRow>

          <FieldRow label="Phone Number">
            <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)}
              placeholder="+91 98765 43210" required style={inputStyle} />
          </FieldRow>

          <FieldRow label="Password">
            <div style={{ position: 'relative' }}>
              <input
                type={showRegPass ? 'text' : 'password'}
                value={regPassword} onChange={e => setRegPassword(e.target.value)}
                placeholder="Min 6 characters" required
                style={{ ...inputStyle, paddingRight: 40 }} />
              <button type="button" onClick={() => setShowRegPass(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                {showRegPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FieldRow>

          <FieldRow label="Confirm Password">
            <input type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
              placeholder="Repeat password" required style={inputStyle} />
          </FieldRow>

          <button type="submit" disabled={busy} style={submitBtn(busy)}>
            {busy ? 'Creating account…' : 'Create Account'}
          </button>

          <p style={{ color: '#64748b', fontSize: 12, marginTop: 12, textAlign: 'center' }}>
            A verification email will be sent after registration.
          </p>
        </form>
      )}
    </Page>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ width: 420, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

function Header() {
  return (
    <div style={{ textAlign: 'center', marginBottom: 8 }}>
      <div style={{
        width: 60, height: 60, borderRadius: 16, margin: '0 auto 16px',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Shield size={30} color="white" />
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4, color: '#f1f5f9' }}>SafeKids</h1>
      <p style={{ color: '#94a3b8', fontSize: 14 }}>Parent Control Dashboard</p>
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  background: '#0f172a', border: '1px solid #334155',
  color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box'
}

function submitBtn(disabled: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '12px', borderRadius: 10, border: 'none',
    background: disabled ? '#334155' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white', fontWeight: 700, fontSize: 15,
    cursor: disabled ? 'not-allowed' : 'pointer', marginTop: 4,
  }
}
