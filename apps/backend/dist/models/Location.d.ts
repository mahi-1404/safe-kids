import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<ILocation, {}, {}, {}, mongoose.Document<unknown, {}, ILocation, {}, mongoose.DefaultSchemaOptions> & ILocation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ILocation>;
export default _default;
