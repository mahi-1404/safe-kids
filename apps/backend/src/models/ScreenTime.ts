import mongoose, { Document, Schema } from 'mongoose';

export interface IAppUsage {
  appName: string;
  packageName: string;
  category: string;
  durationMinutes: number;
}

export interface IScreenTime extends Document {
  child: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  apps: IAppUsage[];
  createdAt: Date;
}

const AppUsageSchema = new Schema<IAppUsage>({
  appName:         { type: String, required: true },
  packageName:     { type: String, required: true },
  category:        { type: String, default: 'Other' },
  durationMinutes: { type: Number, default: 0 },
}, { _id: false });

const ScreenTimeSchema = new Schema<IScreenTime>({
  child:        { type: Schema.Types.ObjectId, ref: 'Child', required: true },
  date:         { type: String, required: true }, // e.g. "2026-03-22"
  totalMinutes: { type: Number, default: 0 },
  apps:         [AppUsageSchema],
}, { timestamps: true });

ScreenTimeSchema.index({ child: 1, date: -1 });

export default mongoose.model<IScreenTime>('ScreenTime', ScreenTimeSchema);
