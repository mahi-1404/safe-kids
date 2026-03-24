import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation extends Document {
  child: mongoose.Types.ObjectId;
  latitude: number;
  longitude: number;
  accuracy: number;
  source: 'gps' | 'cell_tower' | 'wifi';
  address?: string;
  isInsideGeofence: boolean;
  createdAt: Date;
}

const LocationSchema = new Schema<ILocation>({
  child:           { type: Schema.Types.ObjectId, ref: 'Child', required: true },
  latitude:        { type: Number, required: true },
  longitude:       { type: Number, required: true },
  accuracy:        { type: Number, default: 0 },
  source:          { type: String, enum: ['gps', 'cell_tower', 'wifi'], default: 'gps' },
  address:         { type: String },
  isInsideGeofence:{ type: Boolean, default: true },
}, { timestamps: true });

LocationSchema.index({ child: 1, createdAt: -1 });

export default mongoose.model<ILocation>('Location', LocationSchema);
