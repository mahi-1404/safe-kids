import mongoose, { Document, Schema } from 'mongoose';

export interface ICallLog extends Document {
  child: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId;
  contactName?: string;
  phoneNumber: string;
  direction: 'incoming' | 'outgoing' | 'missed';
  durationSeconds: number;
  timestamp: Date;
  isFlagged: boolean;
  flagReason?: string;
  createdAt: Date;
}

const CallLogSchema = new Schema<ICallLog>({
  child:           { type: Schema.Types.ObjectId, ref: 'Child', required: true, index: true },
  parent:          { type: Schema.Types.ObjectId, ref: 'Parent', required: true, index: true },
  contactName:     { type: String },
  phoneNumber:     { type: String, required: true },
  direction:       { type: String, enum: ['incoming', 'outgoing', 'missed'], required: true },
  durationSeconds: { type: Number, default: 0 },
  timestamp:       { type: Date, required: true },
  isFlagged:       { type: Boolean, default: false },
  flagReason:      { type: String },
}, { timestamps: true });

CallLogSchema.index({ child: 1, timestamp: -1 });

export default mongoose.model<ICallLog>('CallLog', CallLogSchema);
