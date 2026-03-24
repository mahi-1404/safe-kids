import mongoose, { Document, Schema } from 'mongoose';

export type AlertType =
  | 'geofence_breach'
  | 'sos'
  | 'low_battery'
  | 'blocked_content'
  | 'unknown_contact'
  | 'sim_change'
  | 'app_install'
  | 'distress_keyword'
  | 'cyberbullying'
  | 'grooming'
  | 'movement_unusual';

export interface IAlert extends Document {
  child: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AlertSchema = new Schema<IAlert>({
  child:    { type: Schema.Types.ObjectId, ref: 'Child', required: true },
  parent:   { type: Schema.Types.ObjectId, ref: 'Parent', required: true },
  type:     { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  title:    { type: String, required: true },
  message:  { type: String, required: true },
  isRead:   { type: Boolean, default: false },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

AlertSchema.index({ parent: 1, isRead: 1, createdAt: -1 });

export default mongoose.model<IAlert>('Alert', AlertSchema);
