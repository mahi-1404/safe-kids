import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { initSocket } from './config/socket';

// Routes
import authRoutes       from './routes/auth';
import childRoutes      from './routes/child';
import locationRoutes   from './routes/location';
import alertRoutes      from './routes/alert';
import commandRoutes    from './routes/command';
import screentimeRoutes from './routes/screentime';
import geofenceRoutes   from './routes/geofence';
import reportsRoutes    from './routes/reports';
import smslogRoutes     from './routes/smslog';
import calllogRoutes    from './routes/calllog';
import contactRoutes    from './routes/contact';
import appruleRoutes    from './routes/apprule';
import webfilterRoutes  from './routes/webfilter';
import notificationRoutes from './routes/notification';
import streamingRoutes  from './routes/streaming';
import mediaRoutes      from './routes/media';

// Middleware
import { apiLimiter, authLimiter, loginLimiter } from './middleware/rateLimit';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ── Security middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // 10mb for base64 image uploads
app.use(express.urlencoded({ extended: true }));

// ── Global rate limit ──────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',         authLimiter, authRoutes);
// Tighter limiter on login specifically
app.use('/api/auth/login',   loginLimiter);

app.use('/api/child',        childRoutes);
app.use('/api/location',     locationRoutes);
app.use('/api/alert',        alertRoutes);
app.use('/api/command',      commandRoutes);
app.use('/api/screentime',   screentimeRoutes);
app.use('/api/geofence',     geofenceRoutes);
app.use('/api/reports',      reportsRoutes);
app.use('/api/smslog',       smslogRoutes);
app.use('/api/calllog',      calllogRoutes);
app.use('/api/contact',      contactRoutes);
app.use('/api/apprule',      appruleRoutes);
app.use('/api/webfilter',    webfilterRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/streaming',    streamingRoutes);
app.use('/api/media',        mediaRoutes);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'SafeKids backend running', timestamp: new Date().toISOString() });
});

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Socket.io ──────────────────────────────────────────────────────────────
initSocket(server);

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`SafeKids backend running on port ${PORT}`);
  });
});

export default app;
