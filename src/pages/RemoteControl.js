import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Lock, Unlock, Trash2, Phone, Wifi, MessageSquare, Volume2, Power, Pause, Play, Camera, AlertTriangle } from 'lucide-react';
import { commandApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
const COMMANDS = [
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
];
export default function RemoteControl() {
    const { activeChild } = useAuth();
    const [sending, setSending] = useState(null);
    const [result, setResult] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [showMessageInput, setShowMessageInput] = useState(false);
    const [confirmWipe, setConfirmWipe] = useState(false);
    async function sendCommand(cmd) {
        if (!activeChild)
            return;
        if (cmd.type === 'send_message') {
            if (!showMessageInput) {
                setShowMessageInput(true);
                return;
            }
            if (!messageText.trim())
                return;
        }
        if (cmd.requiresConfirm && !confirmWipe) {
            setConfirmWipe(true);
            return;
        }
        setSending(cmd.type);
        setResult(null);
        try {
            const payload = cmd.payload ? cmd.payload(messageText) : {};
            await commandApi.send(activeChild._id, cmd.type, payload);
            setResult({ label: cmd.label, ok: true });
            setShowMessageInput(false);
            setMessageText('');
            setConfirmWipe(false);
        }
        catch (err) {
            setResult({ label: cmd.label, ok: false });
        }
        finally {
            setSending(null);
        }
    }
    if (!activeChild) {
        return _jsx("div", { style: { color: '#94a3b8', padding: 32 }, children: "No child device selected." });
    }
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Remote Control" }), _jsxs("p", { style: { color: '#94a3b8', fontSize: 14 }, children: ["Send commands to ", activeChild.name, "'s device"] })] }), _jsxs("div", { style: {
                    background: activeChild.isOnline ? '#22c55e22' : '#ef444422',
                    border: `1px solid ${activeChild.isOnline ? '#22c55e44' : '#ef444444'}`,
                    borderRadius: 10, padding: '12px 16px', marginBottom: 24,
                    display: 'flex', alignItems: 'center', gap: 10
                }, children: [_jsx("div", { style: { width: 8, height: 8, borderRadius: '50%', background: activeChild.isOnline ? '#22c55e' : '#ef4444' } }), _jsx("span", { style: { color: activeChild.isOnline ? '#22c55e' : '#ef4444', fontSize: 13, fontWeight: 500 }, children: activeChild.isOnline ? 'Device is online — commands execute instantly' : 'Device is offline — commands will queue' })] }), result && (_jsx("div", { style: {
                    background: result.ok ? '#22c55e22' : '#ef444422',
                    border: `1px solid ${result.ok ? '#22c55e44' : '#ef444444'}`,
                    borderRadius: 8, padding: '10px 16px', marginBottom: 16,
                    color: result.ok ? '#22c55e' : '#ef4444', fontSize: 13
                }, children: result.ok ? `✓ ${result.label} sent` : `✗ ${result.label} failed — try again` })), showMessageInput && (_jsxs("div", { style: { background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #334155' }, children: [_jsx("label", { style: { fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 8 }, children: "Message to show on device" }), _jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsx("input", { value: messageText, onChange: e => setMessageText(e.target.value), placeholder: "e.g. Come home for dinner!", style: {
                                    flex: 1, padding: '10px 14px', borderRadius: 8,
                                    background: '#0f172a', border: '1px solid #334155',
                                    color: '#f1f5f9', fontSize: 14, outline: 'none'
                                } }), _jsx("button", { onClick: () => sendCommand(COMMANDS.find(c => c.type === 'send_message')), style: {
                                    padding: '10px 20px', borderRadius: 8, border: 'none',
                                    background: '#3b82f6', color: 'white', fontWeight: 600, cursor: 'pointer'
                                }, children: "Send" }), _jsx("button", { onClick: () => { setShowMessageInput(false); setMessageText(''); }, style: {
                                    padding: '10px 16px', borderRadius: 8, border: '1px solid #334155',
                                    background: 'transparent', color: '#94a3b8', cursor: 'pointer'
                                }, children: "Cancel" })] })] })), confirmWipe && (_jsxs("div", { style: { background: '#ef444411', border: '1px solid #ef444444', borderRadius: 12, padding: 16, marginBottom: 16 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }, children: [_jsx(AlertTriangle, { size: 18, color: "#ef4444" }), _jsx("span", { style: { color: '#ef4444', fontWeight: 600 }, children: "This will factory reset the device. Are you sure?" })] }), _jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsx("button", { onClick: () => sendCommand(COMMANDS.find(c => c.type === 'wipe_device')), style: {
                                    padding: '8px 20px', borderRadius: 8, border: 'none',
                                    background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer'
                                }, children: "Yes, Wipe Device" }), _jsx("button", { onClick: () => setConfirmWipe(false), style: {
                                    padding: '8px 16px', borderRadius: 8, border: '1px solid #334155',
                                    background: 'transparent', color: '#94a3b8', cursor: 'pointer'
                                }, children: "Cancel" })] })] })), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }, children: COMMANDS.filter(c => c.type !== 'wipe_device').map(cmd => (_jsxs("button", { onClick: () => sendCommand(cmd), disabled: sending === cmd.type, style: {
                        background: '#1e293b', border: '1px solid #334155',
                        borderRadius: 14, padding: 20, cursor: sending ? 'not-allowed' : 'pointer',
                        textAlign: 'left', opacity: sending === cmd.type ? 0.6 : 1
                    }, children: [_jsx("div", { style: {
                                width: 44, height: 44, borderRadius: 10, background: cmd.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14
                            }, children: _jsx(cmd.icon, { size: 22, color: cmd.color }) }), _jsx("div", { style: { fontWeight: 600, fontSize: 14, color: '#f1f5f9', marginBottom: 4 }, children: cmd.label }), _jsx("div", { style: { fontSize: 12, color: '#64748b' }, children: cmd.desc })] }, cmd.type))) }), _jsxs("div", { style: { marginTop: 24, background: '#1e293b', borderRadius: 14, border: '1px solid #ef444444', padding: 20 }, children: [_jsx("div", { style: { fontWeight: 600, color: '#ef4444', marginBottom: 8 }, children: "\u26A0 Danger Zone" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 13, marginBottom: 14 }, children: "Device wipe will factory reset the child's phone. This cannot be undone." }), _jsx("button", { onClick: () => sendCommand(COMMANDS.find(c => c.type === 'wipe_device')), style: {
                            padding: '8px 20px', borderRadius: 8, border: '1px solid #ef444466',
                            background: 'transparent', color: '#ef4444', fontWeight: 600, cursor: 'pointer'
                        }, children: "Wipe Device" })] })] }));
}
