import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IGeofence, {}, {}, {}, mongoose.Document<unknown, {}, IGeofence, {}, mongoose.DefaultSchemaOptions> & IGeofence & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IGeofence>;
export default _default;
