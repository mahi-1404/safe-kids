import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  child: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId;
  name: string;
  phoneNumbers: string[];
  email?: string;
  isBlocked: boolean;
  isFlagged: boolean;
  flagReason?: string;
  lastSyncedAt: Date;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>({
  child:        { type: Schema.Types.ObjectId, ref: 'Child', required: true, index: true },
  parent:       { type: Schema.Types.ObjectId, ref: 'Parent', required: true, index: true },
  name:         { type: String, required: true },
  phoneNumbers: { type: [String], default: [] },
  email:        { type: String },
  isBlocked:    { type: Boolean, default: false },
  isFlagged:    { type: Boolean, default: false },
  flagReason:   { type: String },
  lastSyncedAt: { type: Date, default: Date.now },
}, { timestamps: true });

ContactSchema.index({ child: 1, name: 1 });

export default mongoose.model<IContact>('Contact', ContactSchema);
