import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { initSocket } from './config/socket';
import authRoutes from './routes/auth';
import childRoutes from './routes/child';
import locationRoutes from './routes/location';
import alertRoutes from './routes/alert';
import commandRoutes from './routes/command';
import screentimeRoutes from './routes/screentime';
import geofenceRoutes from './routes/geofence';
import reportsRoutes from './routes/reports';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/child', childRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/alert', alertRoutes);
app.use('/api/command', commandRoutes);
app.use('/api/screentime', screentimeRoutes);
app.use('/api/geofence', geofenceRoutes);
app.use('/api/reports', reportsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'SafeKids backend running' });
});

// Socket.io for real-time
initSocket(server);

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`SafeKids backend running on port ${PORT}`);
  });
});

export default app;
