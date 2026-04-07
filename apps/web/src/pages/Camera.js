import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Camera, Mic, MicOff, CameraOff, Monitor, PhoneOff, Volume2, VolumeX, RefreshCw } from 'lucide-react';
export default function CameraPage() {
    const [active, setActive] = useState(false);
    const [mode, setMode] = useState('camera');
    const [micOn, setMicOn] = useState(true);
    const [speakerOn, setSpeakerOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [frontCamera, setFrontCamera] = useState(true);
    const Card = ({ children, style = {} }) => (_jsx("div", { style: { background: '#1e293b', borderRadius: 14, border: '1px solid #334155', ...style }, children: children }));
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { fontSize: 22, fontWeight: 700, marginBottom: 4 }, children: "Live View" }), _jsx("p", { style: { color: '#94a3b8', fontSize: 14 }, children: "Camera, microphone and screen monitoring" })] }), _jsx("div", { style: { display: 'flex', gap: 10, marginBottom: 24 }, children: [['camera', Camera, 'Live Camera'], ['screen', Monitor, 'Screen Share']].map(([m, Icon, label]) => (_jsxs("button", { onClick: () => setMode(m), style: {
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                        background: mode === m ? '#3b82f6' : '#1e293b',
                        color: mode === m ? 'white' : '#94a3b8',
                        fontWeight: 600, fontSize: 14,
                        border: mode === m ? 'none' : '1px solid #334155',
                    }, children: [_jsx(Icon, { size: 16 }), label] }, m))) }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }, children: [_jsxs(Card, { style: { overflow: 'hidden' }, children: [_jsx("div", { style: {
                                    aspectRatio: '16/9', background: '#0f172a',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    position: 'relative'
                                }, children: active ? (_jsxs(_Fragment, { children: [_jsxs("div", { style: {
                                                position: 'absolute', top: 16, left: 16,
                                                background: '#ef4444', borderRadius: 6,
                                                padding: '4px 10px', fontSize: 12, fontWeight: 700,
                                                display: 'flex', alignItems: 'center', gap: 6
                                            }, children: [_jsx("div", { style: { width: 6, height: 6, borderRadius: '50%', background: 'white' } }), "LIVE"] }), !cameraOn && (_jsxs("div", { style: {
                                                position: 'absolute', inset: 0,
                                                background: '#0f172a', display: 'flex',
                                                flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12
                                            }, children: [_jsx(CameraOff, { size: 48, color: "#334155" }), _jsx("span", { style: { color: '#475569', fontSize: 14 }, children: "Camera paused" })] })), cameraOn && (_jsxs("div", { style: { color: '#334155', textAlign: 'center' }, children: [_jsx(Camera, { size: 64, style: { marginBottom: 12 } }), _jsx("div", { style: { fontSize: 13, color: '#475569' }, children: "WebRTC stream active" }), _jsx("div", { style: { fontSize: 11, color: '#334155', marginTop: 4 }, children: mode === 'camera' ? (frontCamera ? 'Front camera' : 'Rear camera') : "Child's screen" })] })), _jsx("div", { style: {
                                                position: 'absolute', bottom: 16, right: 16,
                                                background: '#00000088', borderRadius: 6,
                                                padding: '4px 10px', fontSize: 11, color: '#94a3b8'
                                            }, children: mode === 'camera' ? (frontCamera ? 'Front Camera' : 'Rear Camera') : 'Screen Share' })] })) : (_jsxs("div", { style: { textAlign: 'center' }, children: [mode === 'camera' ? _jsx(Camera, { size: 56, color: "#334155" }) : _jsx(Monitor, { size: 56, color: "#334155" }), _jsx("div", { style: { color: '#475569', fontSize: 14, marginTop: 16 }, children: mode === 'camera' ? 'Camera feed not active' : 'Screen share not active' }), _jsx("div", { style: { color: '#334155', fontSize: 12, marginTop: 6 }, children: "Click Start to begin live view" })] })) }), _jsxs("div", { style: {
                                    padding: '16px 20px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'space-between',
                                    borderTop: '1px solid #334155'
                                }, children: [_jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsx("button", { onClick: () => setMicOn(v => !v), title: "Toggle mic", style: {
                                                    width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                                                    background: micOn ? '#1e3a5f' : '#3f1515',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }, children: micOn ? _jsx(Mic, { size: 18, color: "#3b82f6" }) : _jsx(MicOff, { size: 18, color: "#ef4444" }) }), _jsx("button", { onClick: () => setSpeakerOn(v => !v), title: "Toggle speaker", style: {
                                                    width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                                                    background: speakerOn ? '#1e3a5f' : '#3f1515',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }, children: speakerOn ? _jsx(Volume2, { size: 18, color: "#3b82f6" }) : _jsx(VolumeX, { size: 18, color: "#ef4444" }) }), mode === 'camera' && active && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setCameraOn(v => !v), title: "Toggle camera", style: {
                                                            width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
                                                            background: cameraOn ? '#1e3a5f' : '#3f1515',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }, children: cameraOn ? _jsx(Camera, { size: 18, color: "#3b82f6" }) : _jsx(CameraOff, { size: 18, color: "#ef4444" }) }), _jsx("button", { onClick: () => setFrontCamera(v => !v), title: "Flip camera", style: {
                                                            width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
                                                            background: '#1e293b', border: '1px solid #334155',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }, children: _jsx(RefreshCw, { size: 18, color: "#94a3b8" }) })] }))] }), _jsx("button", { onClick: () => setActive(v => !v), style: {
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                            background: active ? '#ef4444' : '#22c55e',
                                            color: 'white', fontWeight: 700, fontSize: 14
                                        }, children: active ? _jsxs(_Fragment, { children: [_jsx(PhoneOff, { size: 16 }), " End Session"] }) : _jsxs(_Fragment, { children: [_jsx(Camera, { size: 16 }), " Start Live View"] }) })] })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [_jsxs(Card, { style: { padding: 20 }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 14, marginBottom: 16 }, children: "Session Info" }), [
                                        { label: 'Status', value: active ? 'Live' : 'Inactive', color: active ? '#22c55e' : '#94a3b8' },
                                        { label: 'Mode', value: mode === 'camera' ? 'Camera' : 'Screen Share', color: '#f1f5f9' },
                                        { label: 'Connection', value: 'WebRTC P2P', color: '#3b82f6' },
                                        { label: 'Child Device', value: 'Aryan\'s Phone', color: '#f1f5f9' },
                                        { label: 'Microphone', value: micOn ? 'On' : 'Muted', color: micOn ? '#22c55e' : '#ef4444' },
                                        { label: 'Speaker', value: speakerOn ? 'On' : 'Off', color: speakerOn ? '#22c55e' : '#ef4444' },
                                    ].map(({ label, value, color }) => (_jsxs("div", { style: {
                                            display: 'flex', justifyContent: 'space-between',
                                            marginBottom: 10, fontSize: 13
                                        }, children: [_jsx("span", { style: { color: '#64748b' }, children: label }), _jsx("span", { style: { color, fontWeight: 500 }, children: value })] }, label)))] }), _jsxs(Card, { style: { padding: 20 }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 14, marginBottom: 8 }, children: "Two-Way Voice" }), _jsx("div", { style: { color: '#64748b', fontSize: 12, marginBottom: 14 }, children: "Start an audio call with the child without video" }), _jsxs("button", { style: {
                                            width: '100%', padding: '10px', borderRadius: 10,
                                            border: 'none', cursor: 'pointer',
                                            background: '#1e3a5f', color: '#3b82f6',
                                            fontWeight: 600, fontSize: 13,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                        }, children: [_jsx(Mic, { size: 15 }), " Start Voice Call"] })] }), _jsx(Card, { style: { padding: 16 }, children: _jsx("div", { style: { fontSize: 11, color: '#475569', lineHeight: 1.6 }, children: "All sessions are encrypted end-to-end via WebRTC. Recordings require explicit consent under COPPA/GDPR-K. The child's device shows a recording indicator when live view is active." }) })] })] })] }));
}
