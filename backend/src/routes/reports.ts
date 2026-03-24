import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import ScreenTime from '../models/ScreenTime';
import Alert from '../models/Alert';
import Location from '../models/Location';
import Child from '../models/Child';

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

export default router;
