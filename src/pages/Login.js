import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err.response?.data?.message ?? 'Login failed. Check your credentials.');
        }
    }
    return (_jsx("div", { style: {
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: '#0f172a'
        }, children: _jsxs("div", { style: { width: 400 }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: 40 }, children: [_jsx("div", { style: {
                                width: 60, height: 60, borderRadius: 16, margin: '0 auto 16px',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }, children: _jsx(Shield, { size: 30, color: "white" }) }), _jsx("h1", { style: { fontSize: 26, fontWeight: 800, marginBottom: 6 }, children: "SafeKids" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: "Parent Control Dashboard" })] }), _jsxs("form", { onSubmit: handleSubmit, style: {
                        background: '#1e293b', borderRadius: 16, padding: 32, border: '1px solid #334155'
                    }, children: [_jsx("h2", { style: { fontSize: 18, fontWeight: 700, marginBottom: 24 }, children: "Sign in to your account" }), error && (_jsx("div", { style: {
                                background: '#ef444422', border: '1px solid #ef444444',
                                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                                color: '#ef4444', fontSize: 13
                            }, children: error })), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }, children: "Email" }), _jsx("input", { type: "email", value: email, onChange: e => setEmail(e.target.value), placeholder: "parent@email.com", required: true, style: {
                                        width: '100%', padding: '10px 14px', borderRadius: 8,
                                        background: '#0f172a', border: '1px solid #334155',
                                        color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                                    } })] }), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("label", { style: { fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }, children: "Password" }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx("input", { type: show ? 'text' : 'password', value: password, onChange: e => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, style: {
                                                width: '100%', padding: '10px 40px 10px 14px', borderRadius: 8,
                                                background: '#0f172a', border: '1px solid #334155',
                                                color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                                            } }), _jsx("button", { type: "button", onClick: () => setShow(!show), style: {
                                                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'
                                            }, children: show ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }) })] })] }), _jsx("button", { type: "submit", disabled: loading, style: {
                                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                                background: loading ? '#334155' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                color: 'white', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer'
                            }, children: loading ? 'Signing in…' : 'Sign In' })] })] }) }));
}
