import mongoose, { Document, Schema } from 'mongoose';

export interface IAppRule extends Document {
  child: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId;
  packageName: string;
  appName: string;
  category?: string;
  isBlocked: boolean;
  // Time-based blocking — block only during certain hours (e.g. school hours)
  scheduleEnabled: boolean;
  blockedFrom?: string;  // "HH:MM"
  blockedUntil?: string; // "HH:MM"
  blockedDays?: number[];  // 0=Sun, 1=Mon ... 6=Sat
  dailyLimitMinutes?: number; // 0 = no limit
  createdAt: Date;
  updatedAt: Date;
}

const AppRuleSchema = new Schema<IAppRule>({
  child:              { type: Schema.Types.ObjectId, ref: 'Child', required: true, index: true },
  parent:             { type: Schema.Types.ObjectId, ref: 'Parent', required: true, index: true },
  packageName:        { type: String, required: true },
  appName:            { type: String, required: true },
  category:           { type: String },
  isBlocked:          { type: Boolean, default: false },
  scheduleEnabled:    { type: Boolean, default: false },
  blockedFrom:        { type: String },
  blockedUntil:       { type: String },
  blockedDays:        { type: [Number], default: [] },
  dailyLimitMinutes:  { type: Number, default: 0 },
}, { timestamps: true });

AppRuleSchema.index({ child: 1, packageName: 1 }, { unique: true });

export default mongoose.model<IAppRule>('AppRule', AppRuleSchema);
