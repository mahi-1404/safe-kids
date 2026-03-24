import mongoose, { Document, Schema } from 'mongoose';

export type CommandType =
  | 'lock_device'
  | 'unlock_device'
  | 'wipe_device'
  | 'ring_device'
  | 'send_message'
  | 'toggle_wifi'
  | 'restart_device'
  | 'pause_apps'
  | 'resume_apps'
  | 'update_settings';

export interface ICommand extends Document {
  child: mongoose.Types.ObjectId;
  parent: mongoose.Types.ObjectId;
  type: CommandType;
  payload?: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'executed' | 'failed';
  createdAt: Date;
}

const CommandSchema = new Schema<ICommand>({
  child:   { type: Schema.Types.ObjectId, ref: 'Child', required: true },
  parent:  { type: Schema.Types.ObjectId, ref: 'Parent', required: true },
  type:    { type: String, required: true },
  payload: { type: Schema.Types.Mixed },
  status:  { type: String, enum: ['pending', 'delivered', 'executed', 'failed'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model<ICommand>('Command', CommandSchema);
