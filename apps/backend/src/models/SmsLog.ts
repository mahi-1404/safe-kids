import mongoose, { Document, Schema } from 'mongoose';

export interface ISmsLog extends Document {
  child: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId;
  contactName?: string;
  phoneNumber: string;
  direction: 'incoming' | 'outgoing';
  body: string;
  timestamp: Date;
  isFlagged: boolean;
  flagReason?: string;
  createdAt: Date;
}

const SmsLogSchema = new Schema<ISmsLog>({
  child:       { type: Schema.Types.ObjectId, ref: 'Child', required: true, index: true },
  parent:      { type: Schema.Types.ObjectId, ref: 'Parent', required: true, index: true },
  contactName: { type: String },
  phoneNumber: { type: String, required: true },
  direction:   { type: String, enum: ['incoming', 'outgoing'], required: true },
  body:        { type: String, required: true },
  timestamp:   { type: Date, required: true },
  isFlagged:   { type: Boolean, default: false },
  flagReason:  { type: String },
}, { timestamps: true });

SmsLogSchema.index({ child: 1, timestamp: -1 });

export default mongoose.model<ISmsLog>('SmsLog', SmsLogSchema);
