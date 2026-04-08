import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationPreference extends Document {
  parent: mongoose.Types.ObjectId;
  // Per-alert-type toggles
  geofence_breach: boolean;
  sos: boolean;
  low_battery: boolean;
  blocked_content: boolean;
  unknown_contact: boolean;
  sim_change: boolean;
  app_install: boolean;
  distress_keyword: boolean;
  cyberbullying: boolean;
  grooming: boolean;
  movement_unusual: boolean;
  screen_time_exceeded: boolean;
  // Minimum severity to send push notification (low | medium | high | critical)
  minPushSeverity: 'low' | 'medium' | 'high' | 'critical';
  // Quiet hours — no push during this window
  quietHoursEnabled: boolean;
  quietFrom: string;  // "HH:MM"
  quietUntil: string; // "HH:MM"
  // Channels
  pushEnabled: boolean;
  emailEnabled: boolean;
  updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>({
  parent:              { type: Schema.Types.ObjectId, ref: 'Parent', required: true, unique: true },
  geofence_breach:     { type: Boolean, default: true },
  sos:                 { type: Boolean, default: true },
  low_battery:         { type: Boolean, default: true },
  blocked_content:     { type: Boolean, default: true },
  unknown_contact:     { type: Boolean, default: true },
  sim_change:          { type: Boolean, default: true },
  app_install:         { type: Boolean, default: false },
  distress_keyword:    { type: Boolean, default: true },
  cyberbullying:       { type: Boolean, default: true },
  grooming:            { type: Boolean, default: true },
  movement_unusual:    { type: Boolean, default: true },
  screen_time_exceeded:{ type: Boolean, default: true },
  minPushSeverity:     { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  quietHoursEnabled:   { type: Boolean, default: false },
  quietFrom:           { type: String, default: '22:00' },
  quietUntil:          { type: String, default: '07:00' },
  pushEnabled:         { type: Boolean, default: true },
  emailEnabled:        { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<INotificationPreference>('NotificationPreference', NotificationPreferenceSchema);
