import mongoose, { Document, Schema } from 'mongoose';

export interface IChild extends Document {
  name: string;
  age: number;
  parent: mongoose.Types.ObjectId;
  deviceId?: string;
  deviceModel?: string;
  androidVersion?: string;
  fcmToken?: string;
  isPaired: boolean;
  isOnline: boolean;
  lastSeen: Date;
  batteryLevel: number;
  riskScore: number;
  agePreset: 'little_explorer' | 'junior_learner' | 'preteen' | 'custom';
  screenTimeLimit: number;
  bedtimeStart: string;
  bedtimeEnd: string;
  createdAt: Date;
}

const ChildSchema = new Schema<IChild>({
  name:           { type: String, required: true },
  age:            { type: Number, required: true },
  parent:         { type: Schema.Types.ObjectId, ref: 'Parent', required: true },
  deviceId:       { type: String, unique: true, sparse: true },
  deviceModel:    { type: String },
  androidVersion: { type: String },
  fcmToken:       { type: String },
  isPaired:       { type: Boolean, default: false },
  isOnline:       { type: Boolean, default: false },
  lastSeen:       { type: Date, default: Date.now },
  batteryLevel:   { type: Number, default: 100 },
  riskScore:      { type: Number, default: 0, min: 0, max: 100 },
  agePreset:      { type: String, enum: ['little_explorer', 'junior_learner', 'preteen', 'custom'], default: 'custom' },
  screenTimeLimit:{ type: Number, default: 180 },
  bedtimeStart:   { type: String, default: '21:00' },
  bedtimeEnd:     { type: String, default: '07:00' },
}, { timestamps: true });

export default mongoose.model<IChild>('Child', ChildSchema);
