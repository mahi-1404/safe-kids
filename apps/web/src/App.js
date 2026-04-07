import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import Alerts from './pages/Alerts';
import ScreenTime from './pages/ScreenTime';
import RemoteControl from './pages/RemoteControl';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Camera from './pages/Camera';
import AppControl from './pages/AppControl';
import WebFilter from './pages/WebFilter';
import Geofence from './pages/Geofence';
import DashboardLayout from './layouts/DashboardLayout';
export default function App() {
    return (_jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsxs(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(DashboardLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/dashboard" }) }), _jsx(Route, { path: "dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "map", element: _jsx(LiveMap, {}) }), _jsx(Route, { path: "geofence", element: _jsx(Geofence, {}) }), _jsx(Route, { path: "alerts", element: _jsx(Alerts, {}) }), _jsx(Route, { path: "screen-time", element: _jsx(ScreenTime, {}) }), _jsx(Route, { path: "app-control", element: _jsx(AppControl, {}) }), _jsx(Route, { path: "web-filter", element: _jsx(WebFilter, {}) }), _jsx(Route, { path: "remote-control", element: _jsx(RemoteControl, {}) }), _jsx(Route, { path: "camera", element: _jsx(Camera, {}) }), _jsx(Route, { path: "reports", element: _jsx(Reports, {}) }), _jsx(Route, { path: "settings", element: _jsx(Settings, {}) })] })] }) }) }));
}
