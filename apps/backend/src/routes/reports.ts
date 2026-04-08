import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import ScreenTime from '../models/ScreenTime';
import Alert from '../models/Alert';
import Location from '../models/Location';
import Child from '../models/Child';
import SmsLog from '../models/SmsLog';
import CallLog from '../models/CallLog';

const router = Router();

// GET /api/reports/:childId/weekly — full weekly report for parent dashboard
router.get('/:childId/weekly', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { childId } = req.params;

    // Last 7 days dates
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    // Fetch all data in parallel
    const [screenTimeRecords, alerts, child] = await Promise.all([
      ScreenTime.find({ child: childId, date: { $in: days } }),
      Alert.find({ child: childId, createdAt: { $gte: weekStart } }).sort({ createdAt: -1 }),
      Child.findById(childId),
    ]);

    // Screen time per day
    const screenTimeByDay = days.map(date => {
      const record = screenTimeRecords.find(r => r.date === date);
      return { date, totalMinutes: record?.totalMinutes || 0 };
    });

    const totalScreenMinutes = screenTimeByDay.reduce((sum, d) => sum + d.totalMinutes, 0);
    const avgScreenMinutes = Math.round(totalScreenMinutes / 7);

    // Top apps this week
    const appMap: Record<string, { name: string; category: string; totalMinutes: number }> = {};
    screenTimeRecords.forEach(record => {
      record.apps.forEach(app => {
        if (!appMap[app.packageName]) {
          appMap[app.packageName] = { name: app.appName, category: app.category, totalMinutes: 0 };
        }
        appMap[app.packageName].totalMinutes += app.durationMinutes;
      });
    });
    const topApps = Object.values(appMap).sort((a, b) => b.totalMinutes - a.totalMinutes).slice(0, 5);

    // Alert summary
    const alertSummary = {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
      byType: alerts.reduce((acc: Record<string, number>, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      }, {}),
    };

    // Risk score trend (from child model for now)
    const riskScore = child?.riskScore || 0;

    res.json({
      period: { start: days[0], end: days[6] },
      child: { name: child?.name, age: child?.age, riskScore },
      screenTime: {
        byDay: screenTimeByDay,
        totalMinutes: totalScreenMinutes,
        avgDailyMinutes: avgScreenMinutes,
        limitMinutes: child?.screenTimeLimit || 180,
        topApps,
      },
      alerts: alertSummary,
      recentAlerts: alerts.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/reports/:childId/dashboard — quick stats for dashboard home
router.get('/:childId/dashboard', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { childId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const [screenTime, unreadAlerts, lastLocation, child] = await Promise.all([
      ScreenTime.findOne({ child: childId, date: today }),
      Alert.countDocuments({ child: childId, isRead: false }),
      Location.findOne({ child: childId }).sort({ createdAt: -1 }),
      Child.findById(childId),
    ]);

    res.json({
      riskScore: child?.riskScore || 0,
      isOnline: child?.isOnline || false,
      lastSeen: child?.lastSeen,
      batteryLevel: child?.batteryLevel || 0,
      screenTime: {
        todayMinutes: screenTime?.totalMinutes || 0,
        limitMinutes: child?.screenTimeLimit || 180,
      },
      unreadAlerts,
      lastLocation: lastLocation
        ? { latitude: lastLocation.latitude, longitude: lastLocation.longitude, timestamp: lastLocation.createdAt }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/reports/:childId/monthly?year=2025&month=4 — monthly report
router.get('/:childId/monthly', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { childId } = req.params;
    const year  = parseInt(req.query.year  as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;

    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59); // last day of month

    // Build list of YYYY-MM-DD strings for the month
    const days: string[] = [];
    const d = new Date(start);
    while (d <= end) {
      days.push(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }

    const [screenTimeRecords, alerts, child, smsCount, callCount] = await Promise.all([
      ScreenTime.find({ child: childId, date: { $in: days } }),
      Alert.find({ child: childId, createdAt: { $gte: start, $lte: end } }),
      Child.findById(childId),
      SmsLog.countDocuments({ child: childId, createdAt: { $gte: start, $lte: end } }),
      CallLog.countDocuments({ child: childId, createdAt: { $gte: start, $lte: end } }),
    ]);

    const screenTimeByDay = days.map(date => {
      const rec = screenTimeRecords.find(r => r.date === date);
      return { date, totalMinutes: rec?.totalMinutes || 0 };
    });

    const totalScreenMinutes = screenTimeByDay.reduce((s, d) => s + d.totalMinutes, 0);

    const appMap: Record<string, { name: string; category: string; totalMinutes: number }> = {};
    screenTimeRecords.forEach(rec => {
      rec.apps.forEach(app => {
        if (!appMap[app.packageName]) appMap[app.packageName] = { name: app.appName, category: app.category, totalMinutes: 0 };
        appMap[app.packageName].totalMinutes += app.durationMinutes;
      });
    });
    const topApps = Object.values(appMap).sort((a, b) => b.totalMinutes - a.totalMinutes).slice(0, 10);

    res.json({
      period: { year, month, start: days[0], end: days[days.length - 1] },
      child: { name: child?.name, age: child?.age, riskScore: child?.riskScore },
      screenTime: {
        byDay: screenTimeByDay,
        totalMinutes: totalScreenMinutes,
        avgDailyMinutes: Math.round(totalScreenMinutes / days.length),
        limitMinutes: child?.screenTimeLimit || 180,
        topApps,
      },
      alerts: {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        high:     alerts.filter(a => a.severity === 'high').length,
        medium:   alerts.filter(a => a.severity === 'medium').length,
        low:      alerts.filter(a => a.severity === 'low').length,
        byType:   alerts.reduce((acc: Record<string, number>, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {}),
      },
      communications: { smsCount, callCount },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/reports/:childId/custom?from=2025-03-01&to=2025-03-31 — custom date range
router.get('/:childId/custom', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { childId } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      res.status(400).json({ message: 'from and to query params required (YYYY-MM-DD)' });
      return;
    }

    const start = new Date(from as string);
    const end   = new Date(to as string);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
      return;
    }

    const days: string[] = [];
    const d = new Date(start);
    while (d <= end) {
      days.push(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }

    const [screenTimeRecords, alerts, child] = await Promise.all([
      ScreenTime.find({ child: childId, date: { $in: days } }),
      Alert.find({ child: childId, createdAt: { $gte: start, $lte: end } }).sort({ createdAt: -1 }),
      Child.findById(childId),
    ]);

    const screenTimeByDay = days.map(date => {
      const rec = screenTimeRecords.find(r => r.date === date);
      return { date, totalMinutes: rec?.totalMinutes || 0 };
    });

    res.json({
      period: { from, to, days: days.length },
      child: { name: child?.name, riskScore: child?.riskScore },
      screenTime: {
        byDay: screenTimeByDay,
        totalMinutes: screenTimeByDay.reduce((s, d) => s + d.totalMinutes, 0),
      },
      alerts: {
        total: alerts.length,
        items: alerts.slice(0, 50),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/reports/:childId/export — GDPR data export (JSON)
router.get('/:childId/export', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { childId } = req.params;
    const child = await Child.findOne({ _id: childId, parent: req.parentId });
    if (!child) { res.status(404).json({ message: 'Child not found' }); return; }

    const [locations, alerts, screenTimes, smsLogs, callLogs] = await Promise.all([
      Location.find({ child: childId }).sort({ createdAt: -1 }).limit(5000),
      Alert.find({ child: childId }).sort({ createdAt: -1 }),
      ScreenTime.find({ child: childId }).sort({ date: -1 }),
      SmsLog.find({ child: childId }).sort({ timestamp: -1 }).limit(2000),
      CallLog.find({ child: childId }).sort({ timestamp: -1 }).limit(2000),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      child: {
        id: child._id,
        name: child.name,
        age: child.age,
        deviceModel: child.deviceModel,
        createdAt: child.createdAt,
      },
      locations,
      alerts,
      screenTimes,
      smsLogs,
      callLogs,
    };

    res.setHeader('Content-Disposition', `attachment; filename="safekids-export-${childId}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
