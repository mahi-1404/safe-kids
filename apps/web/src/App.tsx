import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LiveMap from './pages/LiveMap'
import Alerts from './pages/Alerts'
import ScreenTime from './pages/ScreenTime'
import RemoteControl from './pages/RemoteControl'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Camera from './pages/Camera'
import AppControl from './pages/AppControl'
import WebFilter from './pages/WebFilter'
import Geofence from './pages/Geofence'
import SmsLogs from './pages/SmsLogs'
import CallLogs from './pages/CallLogs'
import DashboardLayout from './layouts/DashboardLayout'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="map" element={<LiveMap />} />
            <Route path="geofence" element={<Geofence />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="sms-logs" element={<SmsLogs />} />
            <Route path="call-logs" element={<CallLogs />} />
            <Route path="screen-time" element={<ScreenTime />} />
            <Route path="app-control" element={<AppControl />} />
            <Route path="web-filter" element={<WebFilter />} />
            <Route path="remote-control" element={<RemoteControl />} />
            <Route path="camera" element={<Camera />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
