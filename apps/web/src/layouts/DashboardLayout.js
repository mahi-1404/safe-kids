import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LayoutDashboard, MapPin, Bell, Clock, Radio, BarChart2, Settings, Shield, LogOut, Camera, AppWindow, Globe, Hexagon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { alertApi } from '../services/api';
import socketService from '../services/socket';
const nav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/map', icon: MapPin, label: 'Live Map' },
    { to: '/geofence', icon: Hexagon, label: 'Geofence' },
    { to: '/alerts', icon: Bell, label: 'Alerts' },
    { to: '/screen-time', icon: Clock, label: 'Screen Time' },
    { to: '/app-control', icon: AppWindow, label: 'App Control' },
    { to: '/web-filter', icon: Globe, label: 'Web Filter' },
    { to: '/remote-control', icon: Radio, label: 'Remote Control' },
    { to: '/camera', icon: Camera, label: 'Live Camera' },
    { to: '/reports', icon: BarChart2, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];
export default function DashboardLayout() {
    const { parent, activeChild, logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    useEffect(() => {
        alertApi.getAll().then(res => {
            setUnreadCount(res.data.filter((a) => !a.isRead).length);
        }).catch(() => { });
    }, []);
    useEffect(() => {
        socketService.on('alert:new', () => {
            setUnreadCount(n => n + 1);
        });
        return () => { socketService.off('alert:new'); };
    }, []);
    const childInitial = activeChild?.name?.[0]?.toUpperCase() ?? '?';
    const parentInitial = parent?.name?.[0]?.toUpperCase() ?? 'P';
    return (_jsxs("div", { style: { display: 'flex', height: '100vh', overflow: 'hidden' }, children: [_jsxs("aside", { style: {
                    width: 240, background: '#1e293b', display: 'flex',
                    flexDirection: 'column', padding: '24px 0', flexShrink: 0,
                    borderRight: '1px solid #334155'
                }, children: [_jsxs("div", { style: { padding: '0 24px 32px', display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("div", { style: {
                                    width: 36, height: 36, borderRadius: 10,
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }, children: _jsx(Shield, { size: 20, color: "white" }) }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 700, fontSize: 16, color: '#f1f5f9' }, children: "SafeKids" }), _jsx("div", { style: { fontSize: 11, color: '#64748b' }, children: "Parent Dashboard" })] })] }), _jsx("div", { style: { padding: '0 16px 24px' }, children: _jsxs("div", { style: {
                                background: '#0f172a', borderRadius: 10, padding: '10px 14px',
                                display: 'flex', alignItems: 'center', gap: 10
                            }, children: [_jsx("div", { style: {
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, fontWeight: 700
                                    }, children: childInitial }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 13, fontWeight: 600 }, children: activeChild?.name ?? 'No child' }), _jsx("div", { style: { fontSize: 11, color: activeChild?.isOnline ? '#22c55e' : '#64748b' }, children: activeChild?.isOnline ? '● Online' : '○ Offline' })] })] }) }), _jsx("nav", { style: { flex: 1, padding: '0 8px' }, children: nav.map(({ to, icon: Icon, label }) => (_jsxs(NavLink, { to: to, style: ({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 16px', borderRadius: 8, marginBottom: 2,
                                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                                color: isActive ? '#f1f5f9' : '#94a3b8',
                                background: isActive ? '#334155' : 'transparent',
                                transition: 'all 0.15s'
                            }), children: [_jsx(Icon, { size: 18 }), label] }, to))) }), _jsx("div", { style: { padding: '16px 8px 0' }, children: _jsxs("button", { onClick: logout, style: {
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 16px', borderRadius: 8, width: '100%',
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                color: '#94a3b8', fontSize: 14, fontWeight: 500
                            }, children: [_jsx(LogOut, { size: 18 }), "Logout"] }) })] }), _jsxs("main", { style: { flex: 1, overflow: 'auto', background: '#0f172a' }, children: [_jsxs("div", { style: {
                            padding: '16px 32px', borderBottom: '1px solid #1e293b',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: '#0f172a', position: 'sticky', top: 0, zIndex: 10
                        }, children: [_jsx("div", { style: { color: '#94a3b8', fontSize: 14 }, children: activeChild ? `Monitoring: ${activeChild.name}` : 'SafeKids Dashboard' }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [_jsxs("div", { style: { position: 'relative', cursor: 'pointer' }, children: [_jsx(Bell, { size: 20, color: "#94a3b8" }), unreadCount > 0 && (_jsx("div", { style: {
                                                    position: 'absolute', top: -4, right: -4,
                                                    background: '#ef4444', borderRadius: '50%',
                                                    width: 16, height: 16, fontSize: 10,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700
                                                }, children: unreadCount > 9 ? '9+' : unreadCount }))] }), _jsx("div", { style: {
                                            width: 32, height: 32, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 13, fontWeight: 700, cursor: 'pointer'
                                        }, children: parentInitial })] })] }), _jsx("div", { style: { padding: '32px' }, children: _jsx(Outlet, {}) })] })] }));
}
