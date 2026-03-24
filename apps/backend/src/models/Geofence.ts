import mongoose, { Document, Schema } from 'mongoose';

export interface IGeofence extends Document {
  parent: mongoose.Types.ObjectId;
  child: mongoose.Types.ObjectId;
  name: string;
  type: 'home' | 'school' | 'custom';
  latitude: number;
  longitude: number;
  radiusMeters: number;
  alertOnExit: boolean;
  alertOnEnter: boolean;
  active: boolean;
  createdAt: Date;
}

const GeofenceSchema = new Schema<IGeofence>({
  parent:       { type: Schema.Types.ObjectId, ref: 'Parent', required: true },
  child:        { type: Schema.Types.ObjectId, ref: 'Child', required: true },
  name:         { type: String, required: true },
  type:         { type: String, enum: ['home', 'school', 'custom'], default: 'custom' },
  latitude:     { type: Number, required: true },
  longitude:    { type: Number, required: true },
  radiusMeters: { type: Number, default: 200 },
  alertOnExit:  { type: Boolean, default: true },
  alertOnEnter: { type: Boolean, default: false },
  active:       { type: Boolean, default: true },
}, { timestamps: true });

GeofenceSchema.index({ child: 1, active: 1 });

export default mongoose.model<IGeofence>('Geofence', GeofenceSchema);
