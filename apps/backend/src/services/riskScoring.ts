import Child from '../models/Child';
import Alert from '../models/Alert';
import SmsLog from '../models/SmsLog';
import CallLog from '../models/CallLog';
import ScreenTime from '../models/ScreenTime';

interface RiskFactors {
  criticalAlerts: number;
  highAlerts: number;
  flaggedSms: number;
  unknownLongCalls: number;
  screenTimeOverrun: number; // minutes over daily limit
  sosAlerts: number;
  grooming: number;
  cyberbullying: number;
  distressKeywords: number;
}

function computeScore(f: RiskFactors): number {
  let score = 0;

  // Immediate danger signals
  score += f.sosAlerts * 40;
  score += f.grooming * 30;
  score += f.cyberbullying * 25;
  score += f.distressKeywords * 20;

  // High/critical general alerts
  score += f.criticalAlerts * 15;
  score += f.highAlerts * 8;

  // Communication anomalies
  score += f.flaggedSms * 10;
  score += f.unknownLongCalls * 5;

  // Screen time overrun (max 10 pts)
  const stPts = Math.min(10, Math.floor(f.screenTimeOverrun / 30) * 2);
  score += stPts;

  return Math.min(100, Math.round(score));
}

/**
 * Recomputes and persists the risk score for a child.
 * Called after every alert, flagged SMS, or screen-time update.
 */
export async function updateRiskScore(childId: string): Promise<number> {
  const lookback = new Date();
  lookback.setDate(lookback.getDate() - 7);

  const today = new Date().toISOString().split('T')[0];

  const [alerts, flaggedSms, unknownCalls, screenTimeDoc, child] = await Promise.all([
    Alert.find({ child: childId, createdAt: { $gte: lookback } }),
    SmsLog.countDocuments({ child: childId, isFlagged: true, createdAt: { $gte: lookback } }),
    CallLog.countDocuments({ child: childId, contactName: null, durationSeconds: { $gt: 300 }, createdAt: { $gte: lookback } }),
    ScreenTime.findOne({ child: childId, date: today }),
    Child.findById(childId),
  ]);

  if (!child) return 0;

  const todayMinutes = screenTimeDoc?.totalMinutes || 0;
  const screenTimeOverrun = Math.max(0, todayMinutes - child.screenTimeLimit);

  const factors: RiskFactors = {
    criticalAlerts:  alerts.filter(a => a.severity === 'critical').length,
    highAlerts:      alerts.filter(a => a.severity === 'high').length,
    flaggedSms,
    unknownLongCalls: unknownCalls,
    screenTimeOverrun,
    sosAlerts:        alerts.filter(a => a.type === 'sos').length,
    grooming:         alerts.filter(a => a.type === 'grooming').length,
    cyberbullying:    alerts.filter(a => a.type === 'cyberbullying').length,
    distressKeywords: alerts.filter(a => a.type === 'distress_keyword').length,
  };

  const score = computeScore(factors);
  await Child.findByIdAndUpdate(childId, { riskScore: score });
  return score;
}
