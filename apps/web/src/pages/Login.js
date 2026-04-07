import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
export default function Login() {
    const [tab, setTab] = useState('login');
    const [uiState, setUIState] = useState('form');
    // Login fields
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPass, setShowLoginPass] = useState(false);
    // Register fields
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirm, setRegConfirm] = useState('');
    const [showRegPass, setShowRegPass] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [lockMinutes, setLockMinutes] = useState(0);
    const [lockUntil, setLockUntil] = useState(null);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    // Lock countdown
    useEffect(() => {
        if (!lockUntil)
            return;
        const tick = () => {
            const ms = lockUntil.getTime() - Date.now();
            if (ms <= 0) {
                setLockUntil(null);
                setUIState('form');
                setError('');
            }
            else
                setLockMinutes(Math.ceil(ms / 60000));
        };
        tick();
        const id = setInterval(tick, 10000);
        return () => clearInterval(id);
    }, [lockUntil]);
    // ─── Login submit ──────────────────────────────────────────────────────────
    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        try {
            await login(loginEmail, loginPassword);
            navigate('/dashboard');
        }
        catch (err) {
            const data = err?.response?.data ?? {};
            if (data.locked) {
                setUIState('locked');
                setLockUntil(data.lockUntil ? new Date(data.lockUntil) : new Date(Date.now() + 15 * 60 * 1000));
            }
            else if (data.emailNotVerified) {
                setError('Email not verified. Check your inbox for the verification link.');
            }
            else {
                setError(data.message ?? 'Login failed. Check your credentials.');
            }
        }
    }
    // ─── Register submit ───────────────────────────────────────────────────────
    async function handleRegister(e) {
        e.preventDefault();
        setError('');
        if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword) {
            setError('All fields are required.');
            return;
        }
        if (regPassword !== regConfirm) {
            setError('Passwords do not match.');
            return;
        }
        if (regPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setBusy(true);
        try {
            await authApi.register(regName.trim(), regEmail.trim().toLowerCase(), regPhone.trim(), regPassword);
            setRegisteredEmail(regEmail.trim().toLowerCase());
            setUIState('email_sent');
        }
        catch (err) {
            setError(err?.response?.data?.message ?? 'Registration failed. Try again.');
        }
        finally {
            setBusy(false);
        }
    }
    // ─── Resend verification ───────────────────────────────────────────────────
    async function handleResend() {
        setBusy(true);
        setError('');
        try {
            await authApi.resendVerification(registeredEmail);
            setError(''); // clear any error
        }
        catch (err) {
            setError(err?.response?.data?.message ?? 'Could not resend. Try again.');
        }
        finally {
            setBusy(false);
        }
    }
    // ─── Shared card wrapper ───────────────────────────────────────────────────
    const card = {
        background: '#1e293b', borderRadius: 16, padding: 32, border: '1px solid #334155'
    };
    // ─── LOCKED ───────────────────────────────────────────────────────────────
    if (uiState === 'locked') {
        return (_jsxs(Page, { children: [_jsx(Header, {}), _jsxs("div", { style: { ...card, textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 56, marginBottom: 16 }, children: "\uD83D\uDD12" }), _jsx("h2", { style: { fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 12 }, children: "Account Temporarily Locked" }), _jsxs("p", { style: { color: '#94a3b8', lineHeight: 1.7 }, children: ["Too many failed login attempts.", _jsx("br", {}), "Try again in ", _jsxs("strong", { style: { color: '#3b82f6' }, children: [lockMinutes, " minute", lockMinutes !== 1 ? 's' : ''] }), "."] }), _jsx("p", { style: { color: '#64748b', fontSize: 13, marginTop: 12 }, children: "A security alert has been sent to your email." }), _jsx("button", { onClick: () => { setUIState('form'); setError(''); }, style: { marginTop: 24, padding: '10px 24px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }, children: "\u2190 Back" })] })] }));
    }
    // ─── EMAIL SENT ────────────────────────────────────────────────────────────
    if (uiState === 'email_sent') {
        return (_jsxs(Page, { children: [_jsx(Header, {}), _jsxs("div", { style: { ...card, textAlign: 'center' }, children: [_jsx(CheckCircle, { size: 56, color: "#22c55e", style: { marginBottom: 16 } }), _jsx("h2", { style: { fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 12 }, children: "Check Your Email" }), _jsxs("p", { style: { color: '#94a3b8', lineHeight: 1.7, marginBottom: 8 }, children: ["We sent a verification link to:", _jsx("br", {}), _jsx("strong", { style: { color: '#f1f5f9' }, children: registeredEmail })] }), _jsx("p", { style: { color: '#64748b', fontSize: 13, marginBottom: 24 }, children: "Click the link in the email to activate your account, then come back here to log in." }), error && _jsx("p", { style: { color: '#ef4444', fontSize: 13, marginBottom: 12 }, children: error }), _jsx("button", { onClick: handleResend, disabled: busy, style: { padding: '10px 24px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#3b82f6', cursor: 'pointer', marginBottom: 12 }, children: busy ? 'Sending…' : '↻ Resend Verification Email' }), _jsx("br", {}), _jsx("button", { onClick: () => { setUIState('form'); setTab('login'); setError(''); }, style: { padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', cursor: 'pointer', fontWeight: 700 }, children: "Go to Login \u2192" })] })] }));
    }
    // ─── FORM ──────────────────────────────────────────────────────────────────
    return (_jsxs(Page, { children: [_jsx(Header, {}), _jsx("div", { style: { display: 'flex', background: '#1e293b', borderRadius: 12, padding: 4, marginBottom: 4, border: '1px solid #334155' }, children: ['login', 'register'].map(t => (_jsx("button", { onClick: () => { setTab(t); setError(''); }, style: {
                        flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                        background: tab === t ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : 'transparent',
                        color: tab === t ? 'white' : '#64748b',
                        fontWeight: 700, cursor: 'pointer', fontSize: 14,
                        textTransform: 'capitalize',
                    }, children: t === 'login' ? 'Sign In' : 'Create Account' }, t))) }), error && (_jsx("div", { style: { background: '#ef444422', border: '1px solid #ef444444', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13 }, children: error })), tab === 'login' && (_jsxs("form", { onSubmit: handleLogin, style: card, children: [_jsx("h2", { style: { fontSize: 17, fontWeight: 700, marginBottom: 20, color: '#f1f5f9' }, children: "Sign in to your account" }), _jsx(FieldRow, { label: "Email", children: _jsx("input", { type: "email", value: loginEmail, onChange: e => setLoginEmail(e.target.value), placeholder: "parent@email.com", required: true, style: inputStyle }) }), _jsx(FieldRow, { label: "Password", children: _jsxs("div", { style: { position: 'relative' }, children: [_jsx("input", { type: showLoginPass ? 'text' : 'password', value: loginPassword, onChange: e => setLoginPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, style: { ...inputStyle, paddingRight: 40 } }), _jsx("button", { type: "button", onClick: () => setShowLoginPass(v => !v), style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }, children: showLoginPass ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }) })] }) }), _jsx("button", { type: "submit", disabled: loading, style: submitBtn(loading), children: loading ? 'Signing in…' : 'Sign In' })] })), tab === 'register' && (_jsxs("form", { onSubmit: handleRegister, style: card, children: [_jsx("h2", { style: { fontSize: 17, fontWeight: 700, marginBottom: 20, color: '#f1f5f9' }, children: "Create your account" }), _jsx(FieldRow, { label: "Full Name", children: _jsx("input", { type: "text", value: regName, onChange: e => setRegName(e.target.value), placeholder: "Your full name", required: true, style: inputStyle }) }), _jsx(FieldRow, { label: "Email", children: _jsx("input", { type: "email", value: regEmail, onChange: e => setRegEmail(e.target.value), placeholder: "parent@email.com", required: true, style: inputStyle }) }), _jsx(FieldRow, { label: "Phone Number", children: _jsx("input", { type: "tel", value: regPhone, onChange: e => setRegPhone(e.target.value), placeholder: "+91 98765 43210", required: true, style: inputStyle }) }), _jsx(FieldRow, { label: "Password", children: _jsxs("div", { style: { position: 'relative' }, children: [_jsx("input", { type: showRegPass ? 'text' : 'password', value: regPassword, onChange: e => setRegPassword(e.target.value), placeholder: "Min 6 characters", required: true, style: { ...inputStyle, paddingRight: 40 } }), _jsx("button", { type: "button", onClick: () => setShowRegPass(v => !v), style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }, children: showRegPass ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }) })] }) }), _jsx(FieldRow, { label: "Confirm Password", children: _jsx("input", { type: "password", value: regConfirm, onChange: e => setRegConfirm(e.target.value), placeholder: "Repeat password", required: true, style: inputStyle }) }), _jsx("button", { type: "submit", disabled: busy, style: submitBtn(busy), children: busy ? 'Creating account…' : 'Create Account' }), _jsx("p", { style: { color: '#64748b', fontSize: 12, marginTop: 12, textAlign: 'center' }, children: "A verification email will be sent after registration." })] }))] }));
}
// ─── Sub-components ───────────────────────────────────────────────────────────
function Page({ children }) {
    return (_jsx("div", { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }, children: _jsx("div", { style: { width: 420, display: 'flex', flexDirection: 'column', gap: 12 }, children: children }) }));
}
function Header() {
    return (_jsxs("div", { style: { textAlign: 'center', marginBottom: 8 }, children: [_jsx("div", { style: {
                    width: 60, height: 60, borderRadius: 16, margin: '0 auto 16px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }, children: _jsx(Shield, { size: 30, color: "white" }) }), _jsx("h1", { style: { fontSize: 26, fontWeight: 800, marginBottom: 4, color: '#f1f5f9' }, children: "SafeKids" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: "Parent Control Dashboard" })] }));
}
function FieldRow({ label, children }) {
    return (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }, children: label }), children] }));
}
const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    background: '#0f172a', border: '1px solid #334155',
    color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box'
};
function submitBtn(disabled) {
    return {
        width: '100%', padding: '12px', borderRadius: 10, border: 'none',
        background: disabled ? '#334155' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        color: 'white', fontWeight: 700, fontSize: 15,
        cursor: disabled ? 'not-allowed' : 'pointer', marginTop: 4,
    };
}
